import Module from 'module';
import path from 'path';
import type { InstallOptions } from '../types.ts';
import installModuleWorker from '../workers/async.ts';
import parseInstallString from './parseInstallString.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

// biome-ignore lint/suspicious/noExplicitAny: module type is unknown at compile time
export type LoadCallback = (err: Error | null, mod: any) => void;

function tryLoadFromPath(modulePath: string, callback: LoadCallback): void {
  try {
    callback(null, _require(modulePath));
  } catch (err) {
    // If require fails because it's an ESM module, use dynamic import
    if ((err as NodeJS.ErrnoException).code === 'ERR_REQUIRE_ESM') {
      import(modulePath).then((mod) => callback(null, mod)).catch((importErr) => callback(importErr, null));
      return;
    }
    callback(err as Error, null);
  }
}

// biome-ignore lint/suspicious/noExplicitAny: module type is unknown at compile time
export default function loadModule(moduleName: string, nodeModulesPath: string, options?: InstallOptions | LoadCallback, callback?: LoadCallback): undefined | Promise<any> {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  const { name } = parseInstallString(moduleName);
  const modulePath = path.join(nodeModulesPath, ...name.split('/'));

  function worker(cb: LoadCallback): void {
    // Try loading from the specific local path first
    tryLoadFromPath(modulePath, (err, mod) => {
      if (!err) return cb(null, mod);

      // Not found locally - install it (creates symlink to ~/.iml cache)
      installModuleWorker(moduleName, nodeModulesPath, options as InstallOptions, (installErr) => {
        if (installErr) return cb(installErr, null);
        // Load from the installed path
        tryLoadFromPath(modulePath, cb);
      });
    });
  }

  if (typeof callback === 'function') {
    worker(callback);
    return undefined;
  }
  return new Promise((resolve, reject) => {
    worker((err, mod) => (err ? reject(err) : resolve(mod)));
  });
}
