// semver stays on 6.x (ES5): install-module-linked-compat loads this module on Node 0.8, where semver 7 and
// npm-pick-manifest cannot parse; pickVersion follows npm-pick-manifest's documented selection order.
import semver from 'semver';
import type { FetchTextFn, GetScopedSpecifiedCallback } from '../types.ts';
import parseInstallString from './parseInstallString.ts';

interface JSONPackage {
  version: string;
}

interface JSONPackument {
  'dist-tags'?: Record<string, string>;
  versions?: Record<string, { deprecated?: string }>;
}

function pickVersion(packument: JSONPackument, wanted: string): string | null {
  const distTags = packument['dist-tags'] || {};
  if (distTags[wanted]) return distTags[wanted];
  if (!semver.validRange(wanted)) return null;
  if (distTags.latest && semver.satisfies(distTags.latest, wanted)) return distTags.latest;
  const versions = packument.versions || {};
  const matching = Object.keys(versions).filter((v) => semver.satisfies(v, wanted));
  const current = matching.filter((v) => !versions[v].deprecated);
  return semver.maxSatisfying(current.length ? current : matching, wanted);
}

// The cache is keyed by the returned specifier, so a range or dist-tag resolves to the exact version npm would
// install; used verbatim, the first resolution would be frozen and `<>|` are invalid filenames on Windows.
export default function getSpecifier(installString: string, fetchText: FetchTextFn, callback: GetScopedSpecifiedCallback) {
  const { name, version } = parseInstallString(installString);
  if (version && semver.valid(version)) return callback(undefined, installString);

  // URL-encode the package name (handles scoped packages: @scope/pkg -> @scope%2Fpkg)
  const encodedName = encodeURIComponent(name).replace(/%40/g, '@');
  if (!version) {
    fetchText(`https://registry.npmjs.org/${encodedName}/latest`, (err, text) => {
      if (err) return callback(err);
      try {
        const json = JSON.parse(text ?? 'null');
        callback(undefined, `${name}@${(json as JSONPackage).version}`);
      } catch (err) {
        callback(err as Error);
      }
    });
    return;
  }

  fetchText(`https://registry.npmjs.org/${encodedName}`, (err, text) => {
    if (err) return callback(err);
    let picked: string | null;
    try {
      picked = pickVersion((JSON.parse(text ?? 'null') || {}) as JSONPackument, version);
    } catch (err) {
      return callback(err as Error);
    }
    if (!picked) return callback(new Error(`No matching version found for ${name}@${version}`));
    callback(undefined, `${name}@${picked}`);
  });
}
