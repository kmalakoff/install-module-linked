import path from 'path';
import url from 'url';
import type { ResolvedOptions } from '../lib/resolveOptions.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

// Worker MUST always load from dist/cjs/ for old Node compatibility (works from both cjs and esm)
const workerPath = path.join(__dirname, '..', '..', 'cjs', 'workers', 'async.js');

export default function installModuleSync(installString: string, nodeModulesPath: string, options: ResolvedOptions): string | undefined {
  const data = JSON.stringify({
    installString,
    nodeModulesPath,
    cachePath: options.cachePath,
    workerModule: options.workerModule,
  });
  return options.syncExec(workerPath, data);
}
