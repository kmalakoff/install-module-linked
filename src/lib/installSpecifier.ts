import fs from 'fs';
import path from 'path';
import spawn from 'cross-spawn-cb';
import access from 'fs-access-compat';
import get from 'get-remote';
import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';
import tempSuffix from 'temp-suffix';
import parseInstallString from './parseInstallString.js';

import type { GetScopedSpecifiedCallback } from '../types.js';

interface JSONPackage {
  version: string;
}

export default function installSpecifier(installString: string, _cacheDirectory: string, callback: GetScopedSpecifiedCallback) {
  const { name, version } = parseInstallString(installString);
  if (version) return callback(null, installString);

  get(`https://registry.npmjs.org/${name}/latest`).json((err, res) => {
    if (err) return callback(err);
    const version = (res.body as unknown as JSONPackage).version;
    callback(null, `${name}@${version}`);
  });
}
