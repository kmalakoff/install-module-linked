import spawn from 'cross-spawn-cb';
import Module from 'module';
import { spawnOptions } from 'node-version-utils';
import path from 'path';
import url from 'url';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE || '');
const major = +process.versions.node.split('.')[0];

type InstallCallback = (err: Error | null, result?: unknown) => void;

// Worker MUST always load from dist/cjs/ for old Node compatibility
const workerPath = path.join(__dirname, '..', '..', 'cjs', 'lib', 'install.js');

let execPath: string | null = null;
let functionExec = null; // break dependencies
export default function install(specifier: string, dest: string, callback: InstallCallback): void {
  if (major > 0) {
    spawn('npm', ['install', specifier], { cwd: dest }, callback);
    return;
  }

  if (!execPath) {
    const satisfiesSemverSync = _require('node-exec-path').satisfiesSemverSync;
    execPath = satisfiesSemverSync('>0.12'); // must be more than node 0.12
    if (!execPath) {
      callback(new Error('install-module-linked a version of node >0.12 to use npm install'));
      return;
    }
  }

  try {
    if (!functionExec) functionExec = _require('function-exec-sync');
    const installPath = isWindows ? path.join(execPath, '..') : path.join(execPath, '..', '..');
    const options = spawnOptions(installPath, { execPath, callbacks: true } as Parameters<typeof spawnOptions>[1]);
    const res = functionExec(options, workerPath, specifier, dest);
    callback(null, res);
  } catch (err) {
    callback(err as Error);
  }
}
