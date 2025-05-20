const path = require('path');
const spawn = require('cross-spawn-cb');
const { spawnOptions } = require('node-version-utils');

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const major = +process.versions.node.split('.')[0];

let execPath = null;
module.exports = function install(specifier, dest, callback) {
  if (major > 0) return spawn('npm', ['install', specifier], { cwd: dest }, callback);

  if (!execPath) {
    const satisfiesSemverSync = require('node-exec-path').satisfiesSemverSync;
    execPath = satisfiesSemverSync('>0.12'); // must be more than node 0.12
    if (!execPath) return callback(new Error('install-module-linked a version of node >0.12 to use npm install'));
  }

  try {
    const installPath = isWindows ? path.join(execPath, '..') : path.join(execPath, '..', '..');
    const options = spawnOptions(installPath, { execPath, callbacks: true });
    const res = require('function-exec-sync')(options, __filename, specifier, dest);
    callback(null, res);
  } catch (err) {
    callback(err);
  }
};
