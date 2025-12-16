import { getContent } from 'get-file-compat';
import type { GetScopedSpecifiedCallback } from '../types.ts';
import parseInstallString from './parseInstallString.ts';

interface JSONPackage {
  version: string;
}

export default function getSpecifier(installString: string, callback: GetScopedSpecifiedCallback) {
  const { name, version } = parseInstallString(installString);
  if (version) return callback(null, installString);

  // URL-encode the package name (handles scoped packages: @scope/pkg -> @scope%2Fpkg)
  const encodedName = encodeURIComponent(name).replace(/%40/g, '@');
  getContent(`https://registry.npmjs.org/${encodedName}/latest`, 'utf8', (err, res) => {
    if (err) return callback(err);
    try {
      const json = JSON.parse(res.content);
      callback(null, `${name}@${(json as JSONPackage).version}`);
    } catch (err) {
      callback(err as Error);
    }
  });
}
