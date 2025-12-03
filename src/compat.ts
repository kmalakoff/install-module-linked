import os from 'os';

var hasHomedir = typeof os.homedir === 'function';

export function homedir(): string {
  if (hasHomedir) {
    return os.homedir();
  }
  var home = require('homedir-polyfill');
  return home();
}
