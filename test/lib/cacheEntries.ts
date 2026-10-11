import fs from 'fs';

// Finished cache entries, without the lock files written beside them.
export default function cacheEntries(cachePath: string): string[] {
  return fs.readdirSync(cachePath).filter((entry) => !/\.lock$/.test(entry));
}
