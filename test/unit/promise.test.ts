import assert from 'assert';
import fs from 'fs';
import installModule from 'install-module-linked';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Pinkie from 'pinkie-promise';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp');
const CACHE_DIR = path.join(TMP_DIR, 'cache');
const NODE_MODULES = path.join(TMP_DIR, 'installed', 'node_modules');
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
      queue.defer(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));
      queue.defer(mkdirp.bind(null, NODE_MODULES));
      queue.await(cb);
    });
    after(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));

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
  });
});
