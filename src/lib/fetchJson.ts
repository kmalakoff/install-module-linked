import https from 'https';

const major = +process.versions.node.split('.')[0];
const minor = +process.versions.node.split('.')[1];
const noHTTPS = major === 0 && (minor <= 8 || minor === 12);

let execPath: string | null = null;
let functionExec = null; // break dependencies
export default function fetchJson(url, callback) {
  if (noHTTPS) {
    // Node 0.8/0.12: delegate to newer Node (same pattern as install.cjs)
    if (!execPath) {
      const { satisfiesSemverSync } = require('node-exec-path');
      execPath = satisfiesSemverSync('>0.12');
      if (!execPath) {
        callback(new Error('fetchJson needs node >0.12 for https'));
        return;
      }
    }
    try {
      if (!functionExec) functionExec = require('function-exec-sync');
      const result = functionExec({ execPath, callbacks: true }, __filename, url);
      callback(null, result);
    } catch (err) {
      callback(err as Error);
    }
    return;
  }

  https
    .get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return fetchJson(res.headers.location, callback);
      }

      // Handle HTTP errors
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return callback(new Error(`HTTP ${res.statusCode}`));
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          callback(null, JSON.parse(data));
        } catch (err) {
          callback(err);
        }
      });
    })
    .on('error', callback);
}
