import get from 'get-remote';
import type { GetScopedSpecifiedCallback } from '../types.ts';
import parseInstallString from './parseInstallString.ts';

interface JSONPackage {
  version: string;
}

export default function getSpecifier(installString: string, callback: GetScopedSpecifiedCallback) {
  const { name, version } = parseInstallString(installString);
  if (version) return callback(null, installString);

  get(`https://registry.npmjs.org/${name}/latest`).json((err, res) => {
    if (err) return callback(err);
    const version = (res.body as unknown as JSONPackage).version;
    callback(null, `${name}@${version}`);
  });
}
