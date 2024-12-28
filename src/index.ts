import install from './lib/install.js';

import type { InstallCallback, InstallOptions } from './types.js';

export * from './types.js';
export { default as parseInstallString } from './lib/parseInstallString.js';

export default function installModule(installString: string, nodeModulesPath: string, options: InstallOptions | InstallCallback, callback?: InstallCallback): undefined | Promise<string> {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // choose between promise and callback API
  if (typeof callback === 'function') {
    return install(installString, nodeModulesPath, options, callback) as undefined;
  }
  return new Promise((resolve, reject) => {
    install(installString, nodeModulesPath, options, (err, dest) => {
      err ? reject(err) : resolve(dest);
    });
  });
}
