import spawn from 'cross-spawn-cb';
import { bind } from 'node-version-call-local';
import path from 'path';
import url from 'url';
import type { InstallCallback } from '../types.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const major = +process.versions.node.split('.')[0];
const workerPath = path.join(__dirname, '..', '..', 'cjs', 'lib', 'install.js');

function run(specifier: string, dest: string, callback: InstallCallback): void {
  spawn('npm', ['install', specifier], { cwd: dest }, (err) => {
    err ? callback(err) : callback(null, path.join(dest, ...specifier.split('/')));
  });
}

type installFunction = (specifier: string, dest: string, callback: InstallCallback) => void;

const worker = (major > 0 ? run : bind('>0.12', workerPath, { callbacks: true })) as installFunction;

export default function install(specifier: string, dest: string, callback: InstallCallback): void {
  worker(specifier, dest, callback);
}
