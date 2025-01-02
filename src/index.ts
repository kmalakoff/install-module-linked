import worker from './lib/worker';

import type { InstallCallback, InstallOptions } from './types';

export type * from './types';
export { default as parseInstallString } from './lib/parseInstallString';

export default function installModule(installString: string, nodeModulesPath: string, options: InstallOptions | InstallCallback, callback?: InstallCallback): undefined | Promise<string> {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof callback === 'function') return worker(installString, nodeModulesPath, options, callback) as undefined;
  return new Promise((resolve, reject) => worker(installString, nodeModulesPath, options, (err, dest) => (err ? reject(err) : resolve(dest))));
}
