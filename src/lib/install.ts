import path from 'path';
import { spawn } from '../compat.ts';
import type { InstallCallback, InstallOptions, SpawnFn } from '../types.ts';

// npm names and version/range specifiers never contain anything outside this
// set; the Windows spawn path goes through a shell, so reject anything else
// before it can reach cmd.exe.
const SAFE_SPECIFIER = /^[a-zA-Z0-9@/._^~<>=+\-| ]+$/;

export function run(specifier: string, dest: string, callback: InstallCallback, spawnFn: SpawnFn): void {
  if (!SAFE_SPECIFIER.test(specifier)) {
    return callback(new Error(`Invalid install string: ${specifier}`));
  }
  spawnFn('npm', ['install', specifier], { cwd: dest }, (err) => {
    err ? callback(err) : callback(undefined, path.join(dest, ...specifier.split('/')));
  });
}

export default function install(specifier: string, dest: string, options: InstallOptions, callback: InstallCallback): void {
  run(specifier, dest, callback, options?.spawn ?? spawn);
}
