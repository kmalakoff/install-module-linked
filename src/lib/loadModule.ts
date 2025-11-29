import Module from 'module';
import path from 'path';
import url from 'url';
import type { InstallOptions } from '../types.ts';
import installModuleWorker from '../workers/async.ts';
import parseInstallString from './parseInstallString.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const _dirname = path.dirname(typeof __dirname !== 'undefined' ? __dirname : url.fileURLToPath(import.meta.url));
const isESM = typeof __dirname === 'undefined';

// biome-ignore lint/suspicious/noExplicitAny: module type is unknown at compile time
export type LoadCallback = (err: Error | null, mod: any) => void;

function tryLoad(moduleName: string, callback: LoadCallback): void {
  if (isESM) {
    import(moduleName).then((mod) => callback(null, mod)).catch((err) => callback(err, null));
  } else {
    try {
      callback(null, _require(moduleName));
    } catch (err) {
      callback(err as Error, null);
    }
  }
}

function tryLoadFromPath(modulePath: string, callback: LoadCallback): void {
  if (isESM) {
    // ESM requires importing the actual entry file, not a directory
    // Read package.json to find the entry point
    import('fs').then((fs) => {
      const pkgPath = path.join(modulePath, 'package.json');
      fs.promises
        .readFile(pkgPath, 'utf8')
        .then((content) => {
          const pkg = JSON.parse(content);
          // Try exports, then module, then main, then index.js
          let entry = pkg.exports?.['.']?.import ?? pkg.exports?.['.'] ?? pkg.module ?? pkg.main ?? 'index.js';
          if (typeof entry === 'object') entry = entry.import ?? entry.default ?? 'index.js';
          const entryPath = path.join(modulePath, entry);
          import(url.pathToFileURL(entryPath).href).then((mod) => callback(null, mod)).catch((err) => callback(err, null));
        })
        .catch((err) => callback(err, null));
    });
  } else {
    try {
      callback(null, _require(modulePath));
    } catch (err) {
      callback(err as Error, null);
    }
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
    // First try standard resolution (module might be in node_modules already)
    tryLoad(moduleName, (err, mod) => {
      if (!err) return cb(null, mod);

      // Try loading from the specific path (might already be installed there)
      tryLoadFromPath(modulePath, (err, mod) => {
        if (!err) return cb(null, mod);

        // Not found - install it
        installModuleWorker(moduleName, nodeModulesPath, options as InstallOptions, (installErr) => {
          if (installErr) return cb(installErr, null);
          // Load from the installed path
          tryLoadFromPath(modulePath, cb);
        });
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
