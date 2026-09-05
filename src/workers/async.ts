import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';
import tempSuffix from 'temp-suffix';
import cache from '../lib/cache.ts';
import parseInstallString from '../lib/parseInstallString.ts';
import resolveOptions from '../lib/resolveOptions.ts';
import type { InstallCallback, InstallOptions } from '../types.ts';

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE ?? '');
const symlinkType = isWindows ? 'junction' : 'dir';

export default function installModule(installString: string, nodeModulesPath: string, options: InstallOptions, callback: InstallCallback): void {
  const resolved = resolveOptions(options);
  const { name } = parseInstallString(installString);
  const dest = path.join(nodeModulesPath, ...name.split('/'));

  fs.stat(dest, (err) => {
    if (!err) return callback(undefined, dest); // already installed

    cache(installString, resolved.cachePath, resolved, (err, cachedAt) => {
      if (err) {
        console.log(`Could not install: ${installString}. Message: ${err.message}`);
        return callback(err);
      }

      // Use temp symlink + atomic rename to avoid cross-process race conditions
      const tempDest = tempSuffix(dest);
      const queue = new Queue(1);
      queue.defer((cb) => resolved.mkdir(path.dirname(dest), (err) => cb(err)));
      queue.defer((cb) => fs.symlink(cachedAt as string, tempDest, symlinkType, (err) => cb(err)));
      queue.defer((cb) => {
        fs.rename(tempDest, dest, (err) => {
          // If rename fails because dest exists, another process won - that's ok
          if (err && ['EEXIST', 'ENOTEMPTY', 'EPERM'].indexOf(err.code ?? '') >= 0) {
            resolved.rm(tempDest, () => cb());
            return;
          }
          cb(err);
        });
      });
      queue.await((err) => {
        err ? resolved.rm(tempDest, () => callback(err)) : callback(undefined, dest);
      });
    });
  });
}

// Sync worker child entry: workers/sync.ts spawns this file directly with a
// JSON payload as argv[2]; the installed path is written to stdout.
if (typeof require !== 'undefined' && require.main === module) {
  const data = JSON.parse(process.argv[2] ?? '{}') as { installString: string; nodeModulesPath: string; cachePath?: string; workerModule?: string };
  installModule(data.installString, data.nodeModulesPath, { cachePath: data.cachePath, workerModule: data.workerModule }, (err, dest) => {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
    process.stdout.write(`${dest}\n`);
  });
}
