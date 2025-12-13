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
  const startTime = Date.now();
  console.log(`[DIAGNOSTIC] install called for ${specifier} in ${dest} at ${new Date().toISOString()}`);
  if (major > 0) {
    console.log(`[DIAGNOSTIC] Using npm spawn path for Node ${process.versions.node} after ${Date.now() - startTime}ms`);
    // Add diagnostic logging for npm install issues
    spawn('npm', ['install', specifier], { cwd: dest }, (err, result) => {
      console.log(`[DIAGNOSTIC] npm spawn completed after ${Date.now() - startTime}ms with error: ${!!err}`);
      if (err) {
        console.log(`[DIAGNOSTIC] npm install failed for ${specifier} in ${dest}:`, err.message);
        if (result) {
          console.log('[DIAGNOSTIC] npm install result:', typeof result === 'object' ? JSON.stringify(result) : String(result));
        }
      }
      callback(err, result);
    });
    return;
  }

  if (!execPath) {
    console.log(`[DIAGNOSTIC] Checking execPath for Node ${process.versions.node} after ${Date.now() - startTime}ms`);
    const satisfiesSemverSync = _require('node-exec-path').satisfiesSemverSync;
    execPath = satisfiesSemverSync('>0.12'); // must be more than node 0.12
    console.log(`[DIAGNOSTIC] execPath result after ${Date.now() - startTime}ms: ${execPath}`);
    if (!execPath) {
      const error = new Error('install-module-linked requires a version of node >0.12 to use npm install');
      console.log(`[DIAGNOSTIC] execPath not found after ${Date.now() - startTime}ms, returning error:`, error.message);
      callback(error);
      return;
    }
  }

  try {
    console.log(`[DIAGNOSTIC] Using function-exec-sync path for Node ${process.versions.node}`);
    if (!functionExec) {
      console.log(`[DIAGNOSTIC] Loading function-exec-sync`);
      functionExec = _require('function-exec-sync');
    }
    const installPath = isWindows ? path.join(execPath, '..') : path.join(execPath, '..', '..');
    console.log(`[DIAGNOSTIC] installPath: ${installPath}`);
    const options = spawnOptions(installPath, { execPath, callbacks: true } as Parameters<typeof spawnOptions>[1]);
    console.log(`[DIAGNOSTIC] spawnOptions result:`, JSON.stringify(options));
    const res = functionExec(options, workerPath, specifier, dest);
    console.log(`[DIAGNOSTIC] functionExec completed after ${Date.now() - startTime}ms, result:`, typeof res === 'object' ? JSON.stringify(res) : String(res));
    callback(null, res);
  } catch (err) {
    console.log(`[DIAGNOSTIC] functionExec error after ${Date.now() - startTime}ms:`, (err as Error).message);
    callback(err as Error);
  }
}
