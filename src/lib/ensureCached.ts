import fs from 'fs';
import path from 'path';
import spawn from 'cross-spawn-cb';
import access from 'fs-access-compat';
import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';
import tempSuffix from 'temp-suffix';
import installSpecifier from './installSpecifier.js';

import type { EnsureCachedCallback } from '../types.js';

export default function ensureCached(installString: string, cacheDirectory: string, callback: EnsureCachedCallback) {
  installSpecifier(installString, cacheDirectory, (_err, specifier) => {
    const cachedAt = path.join(cacheDirectory, specifier);
    access(cachedAt, (err?: Error) => {
      if (!err) return callback(null, cachedAt); // already cached

      const tmp = `${cachedAt}-${tempSuffix()}`;
      const { NODE_OPTIONS, ...env } = process.env;

      const queue = new Queue(1);
      queue.defer(mkdirp.bind(null, tmp));
      queue.defer(fs.writeFile.bind(null, path.join(tmp, 'package.json'), '{}', 'utf8'));
      queue.defer(spawn.bind(null, 'npm', ['install', specifier], { cwd: tmp, env }));
      queue.defer((cb) => fs.rename(tmp, cachedAt, cb.bind(null, null)));
      queue.await((err) => {
        // clean up whether installed or not
        rimraf2(tmp, { disableGlob: true }, () => (err ? callback(err) : callback(null, cachedAt)));
      });
    });
  });
}
