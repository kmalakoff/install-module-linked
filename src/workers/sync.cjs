const path = require('path');

const workerPath = path.join(__dirname, '..', '..', 'cjs', 'workers', 'async.js');

module.exports = function installModuleSync(installString, nodeModulesPath, options) {
  return require('function-exec-sync')({ callbacks: true }, workerPath, installString, nodeModulesPath, options);
};
