import fs from 'fs';
import path from 'path';
import access from 'fs-access-compat';
import homedir from 'homedir-polyfill';
import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';
import ensureCached from './ensureCached.js';
import parseInstallString from './parseInstallString.js';

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const symlinkType = isWindows ? 'junction' : 'dir';
const CACHE_DIR_DEFAULT = path.join(homedir(), '.im', 'cache');

import type { InstallCallback, InstallOptions } from '../types.js';

export default function installModule(installString: string, nodeModulesPath: string, options: InstallOptions, callback: InstallCallback): void {
  const cacheDirectory = options.cacheDirectory || CACHE_DIR_DEFAULT;
  const { name } = parseInstallString(installString);
  const dest = path.join(nodeModulesPath, ...name.split('/'));

  access(dest, (err) => {
    if (!err) return callback(null, dest); // already installed

    ensureCached(installString, cacheDirectory, (err, cachedAt) => {
      if (err) {
        console.log(`Could not install: ${installString}. Message: ${err.message}`);
        return callback();
      }
      const cachedPath = path.join(cachedAt, 'node_modules', ...name.split('/'));

      const queue = new Queue(1);
      queue.defer(mkdirp.bind(null, path.dirname(dest)));
      queue.defer(rimraf2.bind(null, dest, { disableGlob: true }));
      queue.defer(fs.symlink.bind(null, cachedPath, dest, symlinkType));
      queue.defer(access.bind(null, dest));
      queue.await((err) => {
        err ? callback(err) : callback(null, dest);
      });
    });
  });
}
