import assert from 'assert';
import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import { sync as installModuleSync } from 'install-module-linked';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Queue from 'queue-cb';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp', 'sync');
const CACHE_DIR = path.join(TMP_DIR, 'cache');
const NODE_MODULES = path.join(TMP_DIR, 'node_modules');

describe('install-module-linked (sync)', () => {
  describe('setup tests', () => {
    beforeEach((cb) => {
      const queue = new Queue();
      queue.defer((cb) => safeRm(TMP_DIR, cb));
      queue.defer(mkdirp.bind(null, NODE_MODULES));
      queue.await(cb);
    });
    after((cb) => safeRm(TMP_DIR, cb));

    it('install with version', () => {
      installModuleSync('resolve-once@1.0.0', NODE_MODULES, { cachePath: CACHE_DIR });
      const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'resolve-once', 'package.json'), 'utf8'));
      assert.equal(packageJSON.name, 'resolve-once');
      assert.equal(packageJSON.version, '1.0.0');
    });

    it('install no version', () => {
      installModuleSync('resolve-once', NODE_MODULES, { cachePath: CACHE_DIR });
      const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'resolve-once', 'package.json'), 'utf8'));
      assert.equal(packageJSON.name, 'resolve-once');
      assert.ok(packageJSON.version.length);
    });
  });
});
