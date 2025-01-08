import workerAsync from './workers/async';
import workerSync from './workers/sync.cjs';

import type { InstallCallback, InstallOptions } from './types';

export type * from './types';
export { default as clean } from './lib/clean';
export { default as parseInstallString } from './lib/parseInstallString';

export default function installModule(installString: string, nodeModulesPath: string, options: InstallOptions | InstallCallback, callback?: InstallCallback): undefined | Promise<string> {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof callback === 'function') return workerAsync(installString, nodeModulesPath, options, callback) as undefined;
  return new Promise((resolve, reject) => workerAsync(installString, nodeModulesPath, options, (err, dest) => (err ? reject(err) : resolve(dest))));
}

export function sync(installString: string, nodeModulesPath: string, options: InstallOptions): string | undefined {
  return workerSync(installString, nodeModulesPath, options);
}
