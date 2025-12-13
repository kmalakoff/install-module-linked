import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Queue from 'queue-cb';
import tempSuffix from 'temp-suffix';
import type { EnsureCachedCallback } from '../types.ts';
import getSpecifier from './getSpecifier.ts';
import install from './install.ts';
import parse from './parseInstallString.ts';
import renameWithFallback from './renameWithFallback.ts';

export default function ensureCached(installString: string, cachePath: string, callback: EnsureCachedCallback) {
  getSpecifier(installString, (err, specifier) => {
    if (err) return callback(err);
    const cachedAt = path.join(cachePath, specifier);
    const { name } = parse(installString);

    fs.stat(cachedAt, (err?: Error) => {
      if (!err) return callback(null, cachedAt); // already cached

      const tmp = `${cachedAt}-${tempSuffix()}`;
      const tmpModulePath = path.join(tmp, 'node_modules', ...name.split('/'));

      const queue = new Queue(1);
      queue.defer(mkdirp.bind(null, tmp));
      queue.defer(fs.writeFile.bind(null, path.join(tmp, 'package.json'), '{}', 'utf8'));
      queue.defer(install.bind(null, specifier, tmp));
      queue.defer((cb) => {
        // Add diagnostic logging for rename issues in Node 6.x
        renameWithFallback(tmpModulePath, cachedAt, (err) => {
          if (err) {
            console.log(`[DIAGNOSTIC] renameWithFallback failed for ${tmpModulePath} -> ${cachedAt}:`, err.message);
            console.log('[DIAGNOSTIC] Source exists:', fs.existsSync(tmpModulePath));
            console.log('[DIAGNOSTIC] Dest exists:', fs.existsSync(cachedAt));
            console.log('[DIAGNOSTIC] tmp dir contents:', fs.readdirSync(tmp).join(', '));
            if (fs.existsSync(path.join(tmp, 'node_modules'))) {
              console.log('[DIAGNOSTIC] node_modules contents:', fs.readdirSync(path.join(tmp, 'node_modules')).join(', '));
            }
          }
          cb(err);
        });
      });
      queue.defer((cb) => {
        // Add diagnostic logging for node_modules rename
        renameWithFallback(path.join(tmp, 'node_modules'), path.join(cachedAt, 'node_modules'), (err) => {
          if (err) {
            console.log('[DIAGNOSTIC] renameWithFallback failed for node_modules:', err.message);
          }
          cb(err);
        });
      });
      queue.await((err) => {
        // clear up whether installed or not
        safeRm(tmp, () => (err ? callback(err) : callback(null, cachedAt)));
      });
    });
  });
}
