import fs from 'fs';
import path from 'path';
import access from 'fs-access-compat';
import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';
import ensureCached from './cache/ensure';
import { DEFAULT_CACHE_PATH } from './constants';
import parseInstallString from './lib/parseInstallString';

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const symlinkType = isWindows ? 'junction' : 'dir';

import type { InstallCallback, InstallOptions } from './types';

export default function installModule(installString: string, nodeModulesPath: string, options: InstallOptions, callback: InstallCallback): void {
  const cachePath = options.cachePath || DEFAULT_CACHE_PATH;
  const { name } = parseInstallString(installString);
  const dest = path.join(nodeModulesPath, ...name.split('/'));

  access(dest, (err) => {
    if (!err) return callback(null, dest); // already installed

    ensureCached(installString, cachePath, (err, cachedAt) => {
      if (err) {
        console.log(`Could not install: ${installString}. Message: ${err.message}`);
        return callback();
      }
      const queue = new Queue(1);
      queue.defer(mkdirp.bind(null, path.dirname(dest)));
      queue.defer(rimraf2.bind(null, dest, { disableGlob: true }));
      queue.defer(fs.symlink.bind(null, cachedAt, dest, symlinkType));
      queue.defer(access.bind(null, dest));
      queue.await((err) => {
        err ? callback(err) : callback(null, dest);
      });
    });
  });
}
