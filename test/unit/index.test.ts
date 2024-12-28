// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Promise from 'pinkie-promise';

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import url from 'url';
import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';

// @ts-ignore
import installModule from 'install-module-linked';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.resolve(__dirname, '..', '..', '.tmp');
const CACHE_DIR = path.join(TMP_DIR, 'cache');
const NODE_MODULES = path.join(TMP_DIR, 'node_modules');

describe('install-module-linked node', () => {
  (() => {
    // patch and restore promise
    let rootPromise: Promise;
    before(() => {
      rootPromise = global.Promise;
      global.Promise = Promise;
    });
    after(() => {
      global.Promise = rootPromise;
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

    it('install callback (with version)', (done) => {
      installModule('each-package@0.7.1', NODE_MODULES, { cacheDirectory: CACHE_DIR }, (err) => {
        assert.ok(fs.existsSync(path.join(NODE_MODULES, 'each-package')));
        const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'each-package', 'package.json'), 'utf8'));
        assert.equal(packageJSON.name, 'each-package');
        assert.equal(packageJSON.version, '0.7.1');
        done(err);
      });
    });

    it('install callback (no version)', (done) => {
      installModule('each-package', NODE_MODULES, { cacheDirectory: CACHE_DIR }, (err) => {
        assert.ok(fs.existsSync(path.join(NODE_MODULES, 'each-package')));
        const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'each-package', 'package.json'), 'utf8'));
        assert.equal(packageJSON.name, 'each-package');
        assert.ok(packageJSON.version.length);
        done(err);
      });
    });

    it('install (promise)', async () => {
      await installModule('each-package@0.4.2', NODE_MODULES, { cacheDirectory: CACHE_DIR });
      assert.ok(fs.existsSync(path.join(NODE_MODULES, 'each-package')));
      const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'each-package', 'package.json'), 'utf8'));
      assert.equal(packageJSON.name, 'each-package');
      assert.equal(packageJSON.version, '0.4.2');
    });
  });
});
