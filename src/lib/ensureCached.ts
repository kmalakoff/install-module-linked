import fs from 'fs';
import path from 'path';
import spawn from 'cross-spawn-cb';
import access from 'fs-access-compat';
import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';
import tempSuffix from 'temp-suffix';
import parseInstallString from './parseInstallString.js';

import type { EnsureCachedCallback } from '../types.js';

export default function ensureCached(installString: string, cachedAt: string, callback: EnsureCachedCallback) {
  const { name } = parseInstallString(installString);
  const installedAt = path.join(cachedAt, 'node_modules', ...name.split('/'));

  access(cachedAt, (err?: Error) => {
    if (!err) return callback(null, installedAt); // already cached

    const tmp = `${cachedAt}-${tempSuffix()}`;
    const { NODE_OPTIONS, ...env } = process.env;

    const queue = new Queue(1);
    queue.defer(mkdirp.bind(null, tmp));
    queue.defer(fs.writeFile.bind(null, path.join(tmp, 'package.json'), '{}', 'utf8'));
    queue.defer(spawn.bind(null, 'npm', ['install', installString], { cwd: tmp, env }));
    queue.defer((cb) => fs.rename(tmp, cachedAt, cb.bind(null, null)));
    queue.await((err) => {
      // clean up whether installed or not
      rimraf2(tmp, { disableGlob: true }, () => (err ? callback(err) : callback(null, installedAt)));
    });
  });
}
