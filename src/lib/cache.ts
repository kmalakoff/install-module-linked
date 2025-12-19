import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import lockfile from 'lockfile';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Queue from 'queue-cb';
import tempSuffix from 'temp-suffix';
import type { EnsureCachedCallback } from '../types.ts';
import getSpecifier from './getSpecifier.ts';
import install from './install.ts';
import parse from './parseInstallString.ts';
import renameWithFallback from './renameWithFallback.ts';

const LOCK_OPTIONS = {
  wait: 600000, // Wait up to 10 minutes for lock (npm installs can be slow)
  pollPeriod: 100, // Check every 100ms
  stale: 660000, // Consider locks stale after 11 minutes (must be > wait)
  retries: 3, // Retry 3 times on transient errors
};

export default function ensureCached(installString: string, cachePath: string, callback: EnsureCachedCallback) {
  getSpecifier(installString, (err, specifier) => {
    if (err) return callback(err);
    const cachedAt = path.join(cachePath, specifier);
    const lockPath = `${cachedAt}.lock`;
    const readyPath = path.join(cachedAt, '.ready');
    const { name } = parse(installString);

    // Check if already cached AND complete (fast path, no lock needed)
    fs.stat(readyPath, (readyErr?: Error) => {
      if (!readyErr) return callback(null, cachedAt); // Valid cache

      // Not cached or incomplete - acquire lock and install
      doLockedInstall();
    });

    function doLockedInstall() {
      // Ensure lock file's parent directory exists (handles scoped packages like @scope/pkg)
      mkdirp(path.dirname(lockPath), (mkdirErr) => {
        if (mkdirErr) return callback(mkdirErr);

        const startTime = Date.now();

        // Retry loop for Windows EPERM - treat it like EEXIST (lock held by another process)
        function tryLock(cb: (err?: Error | null) => void) {
          lockfile.lock(lockPath, LOCK_OPTIONS, (lockErr) => {
            if (lockErr && (lockErr as NodeJS.ErrnoException).code === 'EPERM' && Date.now() - startTime < LOCK_OPTIONS.wait) {
              setTimeout(() => tryLock(cb), LOCK_OPTIONS.pollPeriod);
              return;
            }
            cb(lockErr);
          });
        }

        tryLock((lockErr) => {
          if (lockErr) return callback(lockErr);

          // Single exit point - always unlock before calling back
          function done(err?: Error) {
            lockfile.unlock(lockPath, () => callback(err, err ? undefined : cachedAt));
          }

          // Re-check cache (another process may have completed while we waited for lock)
          fs.stat(readyPath, (readyErr?: Error) => {
            if (!readyErr) return done(); // Cache appeared while we waited

            // Clean up any incomplete cache before installing
            safeRm(cachedAt, (rmErr) => {
              if (rmErr) return done(rmErr);
              doInstall(done);
            });
          });
        });
      });
    }

    function doInstall(cb: (err?: Error) => void) {
      const tmp = `${cachedAt}-${tempSuffix()}`;
      const tmpModulePath = path.join(tmp, 'node_modules', ...name.split('/'));

      const queue = new Queue(1);
      queue.defer(mkdirp.bind(null, tmp));
      queue.defer(fs.writeFile.bind(null, path.join(tmp, 'package.json'), '{}', 'utf8'));
      queue.defer(install.bind(null, specifier, tmp));
      queue.defer((qcb) => {
        // Verify npm actually created the package directory - npm may silently skip
        // installation (exit 0) when platform doesn't match (os/cpu/libc fields)
        fs.stat(tmpModulePath, (statErr) => {
          if (statErr) return qcb(new Error(`Package directory not created by npm. This may happen when the package has platform restrictions (os/cpu/libc) that don't match the current system: ${tmpModulePath}`));
          qcb();
        });
      });
      queue.defer(renameWithFallback.bind(null, tmpModulePath, cachedAt));
      queue.defer(renameWithFallback.bind(null, path.join(tmp, 'node_modules'), path.join(cachedAt, 'node_modules')));
      // Write .ready marker after both renames succeed
      queue.defer(fs.writeFile.bind(null, readyPath, '', 'utf8'));
      queue.await((queueErr) => {
        // Clean up temp directory whether installed or not
        safeRm(tmp, () => cb(queueErr));
      });
    }
  });
}
