import type { InstallCallback, InstallOptions } from './types.ts';
import worker from './workers/async.ts';
import workerSync from './workers/sync.ts';

export { default as clear } from './lib/clear.ts';
export { default as install } from './lib/install.ts';
export { default as parseInstallString } from './lib/parseInstallString.ts';
export type * from './types.ts';

export default function installModule(installString: string, nodeModulesPath: string, callback: InstallCallback): void;
export default function installModule(installString: string, nodeModulesPath: string, options: InstallOptions, callback: InstallCallback): void;
export default function installModule(installString: string, nodeModulesPath: string, options?: InstallOptions): Promise<string>;
export default function installModule(installString: string, nodeModulesPath: string, options?: InstallOptions | InstallCallback, callback?: InstallCallback): void | Promise<string> {
  if (typeof options === 'function') {
    callback = options as InstallCallback;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return worker(installString, nodeModulesPath, options, callback);
  return new Promise((resolve, reject) => worker(installString, nodeModulesPath, options as InstallOptions, (err, dest) => (err ? reject(err) : resolve(dest))));
}

export function sync(installString: string, nodeModulesPath: string, options?: InstallOptions): string | undefined {
  options = options || {};
  return workerSync(installString, nodeModulesPath, options);
}
