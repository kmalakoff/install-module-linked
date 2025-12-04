import fs from 'fs';
import { rm } from 'fs-remove-compat';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Queue from 'queue-cb';
import tempSuffix from 'temp-suffix';
import type { EnsureCachedCallback } from '../types.ts';
import getSpecifier from './getSpecifier.ts';
import install from './install.cjs';
import parse from './parseInstallString.ts';

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
      queue.defer((cb) => fs.rename(tmpModulePath, cachedAt, cb.bind(null, null)));
      queue.defer((cb) => fs.rename(path.join(tmp, 'node_modules'), path.join(cachedAt, 'node_modules'), cb.bind(null, null)));
      queue.await((err) => {
        // clear up whether installed or not
        rm(tmp, () => (err ? callback(err) : callback(null, cachedAt)));
      });
    });
  });
}
