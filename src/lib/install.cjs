const spawn = require('cross-spawn-cb');

const major = +process.versions.node.split('.')[0];

module.exports = function install(specifier, dest, callback) {
  if (major > 0) return spawn('npm', ['install', specifier], { cwd: dest }, callback);

  try {
    const res = require('node-version-call')({ version: 'stable', callbacks: true }, __filename, specifier, dest);
    callback(null, res);
  } catch (err) {
    callback(err);
  }
};
