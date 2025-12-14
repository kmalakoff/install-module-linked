import os from 'os';

const hasHomedir = typeof os.homedir === 'function';
export function homedir(): string {
  if (hasHomedir) return os.homedir();
  const home = require('homedir-polyfill');
  return home();
}
