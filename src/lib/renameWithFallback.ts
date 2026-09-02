import fs from 'fs';

export default function renameWithFallback(src: string, dest: string, callback: (err?: Error) => void): void {
  fs.rename(src, dest, (err) => {
    if (!err) return callback();

    // Another process may have already created dest - check if it exists
    if (err.code === 'EEXIST' || err.code === 'ENOTEMPTY') {
      fs.stat(dest, (statErr) => {
        if (!statErr) return callback(); // dest exists, race was won by another process
        callback(err); // dest doesn't exist, actual error
      });
      return;
    }

    callback(err);
  });
}
