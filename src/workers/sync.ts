import Module from 'module';
import path from 'path';
import url from 'url';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

// Worker MUST always load from dist/cjs/ for old Node compatibility (works from both cjs and esm)
const workerPath = path.join(__dirname, '..', '..', 'cjs', 'workers', 'async.js');

export default function installModuleSync(installString: string, nodeModulesPath: string, options?: object): string | undefined {
  return _require('function-exec-sync')({ callbacks: true }, workerPath, installString, nodeModulesPath, options) as string | undefined;
}
