import os from 'os';

export function homedir(): string {
  return typeof os.homedir === 'function' ? os.homedir() : require('homedir-polyfill')();
}
