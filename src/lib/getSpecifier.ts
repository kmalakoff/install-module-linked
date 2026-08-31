import type { FetchTextFn, GetScopedSpecifiedCallback } from '../types.ts';
import parseInstallString from './parseInstallString.ts';

interface JSONPackage {
  version: string;
}

export default function getSpecifier(installString: string, fetchText: FetchTextFn, callback: GetScopedSpecifiedCallback) {
  const { name, version } = parseInstallString(installString);
  if (version) return callback(undefined, installString);

  // URL-encode the package name (handles scoped packages: @scope/pkg -> @scope%2Fpkg)
  const encodedName = encodeURIComponent(name).replace(/%40/g, '@');
  fetchText(`https://registry.npmjs.org/${encodedName}/latest`, (err, text) => {
    if (err) return callback(err);
    try {
      const json = JSON.parse(text ?? 'null');
      callback(undefined, `${name}@${(json as JSONPackage).version}`);
    } catch (err) {
      callback(err as Error);
    }
  });
}
