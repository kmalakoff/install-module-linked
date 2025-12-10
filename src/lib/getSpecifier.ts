import type { GetScopedSpecifiedCallback } from '../types.ts';
import fetchJson from './fetchJson.ts';
import parseInstallString from './parseInstallString.ts';

interface JSONPackage {
  version: string;
}

export default function getSpecifier(installString: string, callback: GetScopedSpecifiedCallback) {
  const { name, version } = parseInstallString(installString);
  if (version) return callback(null, installString);

  // URL-encode the package name (handles scoped packages: @scope/pkg -> @scope%2Fpkg)
  const encodedName = encodeURIComponent(name).replace(/%40/g, '@');
  fetchJson(`https://registry.npmjs.org/${encodedName}/latest`, (err, data) => {
    if (err) return callback(err);
    callback(null, `${name}@${(data as JSONPackage).version}`);
  });
}
