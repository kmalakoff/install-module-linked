import assert from 'assert';
import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import installModule from 'install-module-linked';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Pinkie from 'pinkie-promise';
import Queue from 'queue-cb';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp', 'promise');
const CACHE_DIR = path.join(TMP_DIR, 'cache');
const NODE_MODULES = path.join(TMP_DIR, 'node_modules');
const STRESS_COUNT = 10;

describe('install-module-linked (promise)', () => {
  (() => {
    // patch and restore promise
    if (typeof global === 'undefined') return;
    const globalPromise = global.Promise;
    before(() => {
      global.Promise = Pinkie;
    });
    after(() => {
      global.Promise = globalPromise;
    });
  })();

  describe('setup tests', () => {
    beforeEach((cb) => {
      const queue = new Queue();
      queue.defer((cb) => safeRm(TMP_DIR, cb));
      queue.defer(mkdirp.bind(null, NODE_MODULES));
      queue.await(cb);
    });
    after((cb) => safeRm(TMP_DIR, cb));

    it('install with version', async () => {
      await installModule('resolve-once@1.0.0', NODE_MODULES, { cachePath: CACHE_DIR });
      assert.ok(fs.existsSync(path.join(NODE_MODULES, 'resolve-once')));
      const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'resolve-once', 'package.json'), 'utf8'));
      assert.equal(packageJSON.name, 'resolve-once');
      assert.equal(packageJSON.version, '1.0.0');
    });

    it('install no version', async () => {
      await installModule('resolve-once', NODE_MODULES, { cachePath: CACHE_DIR });
      assert.ok(fs.existsSync(path.join(NODE_MODULES, 'resolve-once')));
      const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'resolve-once', 'package.json'), 'utf8'));
      assert.equal(packageJSON.name, 'resolve-once');
      assert.ok(packageJSON.version.length);
    });

    it('link multiple (serial)', async () => {
      for (let counter = 0; counter < STRESS_COUNT; counter++) {
        await installModule('resolve-once', NODE_MODULES, { cachePath: CACHE_DIR });
      }
      assert.ok(fs.existsSync(path.join(NODE_MODULES, 'resolve-once')));
      const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'resolve-once', 'package.json'), 'utf8'));
      assert.equal(packageJSON.name, 'resolve-once');
      assert.ok(packageJSON.version.length);
    });

    it('link multiple (parallel)', async () => {
      await Promise.all([...Array(STRESS_COUNT)].map((_) => installModule('resolve-once', NODE_MODULES, { cachePath: CACHE_DIR })));
      assert.ok(fs.existsSync(path.join(NODE_MODULES, 'resolve-once')));
      const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'resolve-once', 'package.json'), 'utf8'));
      assert.equal(packageJSON.name, 'resolve-once');
      assert.ok(packageJSON.version.length);
    });

    it('link multiple (parallel) - cleans up temp directories', async () => {
      await Promise.all([...Array(STRESS_COUNT)].map((_) => installModule('resolve-once', NODE_MODULES, { cachePath: CACHE_DIR })));

      // Check that no temp directories remain (they have a numeric suffix like module@version-123456)
      const cacheEntries = fs.readdirSync(CACHE_DIR);
      const tempDirs = cacheEntries.filter((entry) => /-\d+$/.test(entry));
      assert.deepEqual(tempDirs, [], `Temp directories should be cleaned up, but found: ${tempDirs.join(', ')}`);
    });
  });
});
