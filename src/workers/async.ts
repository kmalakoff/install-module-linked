import fs from 'fs';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';
import tempSuffix from 'temp-suffix';
import { DEFAULT_CACHE_PATH } from '../constants.ts';
import cache from '../lib/cache.ts';
import parseInstallString from '../lib/parseInstallString.ts';

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const symlinkType = isWindows ? 'junction' : 'dir';

import type { InstallCallback, InstallOptions } from '../types.ts';

export default function installModule(installString: string, nodeModulesPath: string, options: InstallOptions, callback: InstallCallback): void {
  const cachePath = options.cachePath || DEFAULT_CACHE_PATH;
  const { name } = parseInstallString(installString);
  const dest = path.join(nodeModulesPath, ...name.split('/'));

  fs.stat(dest, (err) => {
    if (!err) return callback(null, dest); // already installed

    cache(installString, cachePath, (err, cachedAt) => {
      if (err) {
        console.log(`Could not install: ${installString}. Message: ${err.message}`);
        return callback();
      }

      // Use temp symlink + atomic rename to avoid cross-process race conditions
      const tempDest = tempSuffix(dest);
      const queue = new Queue(1);
      queue.defer(mkdirp.bind(null, path.dirname(dest)));
      queue.defer(fs.symlink.bind(null, cachedAt, tempDest, symlinkType));
      queue.defer((cb) => {
        fs.rename(tempDest, dest, (err) => {
          // If rename fails because dest exists, another process won - that's ok
          if (err && (err.code === 'EEXIST' || err.code === 'ENOTEMPTY')) {
            rimraf2(tempDest, { disableGlob: true }, () => cb());
            return;
          }
          cb(err);
        });
      });
      queue.await((err) => {
        if (err) {
          rimraf2(tempDest, { disableGlob: true }, () => callback(err));
          return;
        }
        callback(null, dest);
      });
    });
  });
}
