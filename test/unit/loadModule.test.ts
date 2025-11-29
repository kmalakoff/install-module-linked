import assert from 'assert';
import { loadModule } from 'install-module-linked';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import rimraf2 from 'rimraf2';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp', 'loadModule');
const CACHE_DIR = path.join(TMP_DIR, 'cache');
const NODE_MODULES = path.join(TMP_DIR, 'node_modules');

describe('loadModule', () => {
  before((done) => {
    rimraf2(TMP_DIR, { disableGlob: true }, () => {
      mkdirp(NODE_MODULES, done);
    });
  });
  after((done) => {
    rimraf2(TMP_DIR, { disableGlob: true }, done);
  });

  describe('callback', () => {
    it('install and load module with version', (done) => {
      loadModule('is-promise@4.0.0', NODE_MODULES, { cachePath: CACHE_DIR }, (err, mod) => {
        assert.ok(!err, err?.message);
        assert.ok(mod);
        const isPromise = mod.default ?? mod;
        assert.equal(typeof isPromise, 'function');
        done();
      });
    });

    it('install and load module without version', (done) => {
      loadModule('is-error', NODE_MODULES, { cachePath: CACHE_DIR }, (err, mod) => {
        assert.ok(!err, err?.message);
        assert.ok(mod);
        const isError = mod.default ?? mod;
        assert.equal(typeof isError, 'function');
        done();
      });
    });

    it('load already installed module', (done) => {
      loadModule('is-promise', NODE_MODULES, { cachePath: CACHE_DIR }, (err, mod) => {
        assert.ok(!err, err?.message);
        assert.ok(mod);
        done();
      });
    });

    it('handles missing options parameter', (done) => {
      loadModule('is-promise', NODE_MODULES, (err, mod) => {
        assert.ok(!err, err?.message);
        assert.ok(mod);
        done();
      });
    });
  });

  describe('promise', () => {
    // Skip on old Node versions without native Promise support
    const hasPromise = typeof Promise !== 'undefined';

    it('install and load module (promise)', function (done) {
      if (!hasPromise) return this.skip();
      loadModule('queue-cb', NODE_MODULES, { cachePath: CACHE_DIR })
        .then((mod) => {
          assert.ok(mod);
          const Queue = mod.default ?? mod;
          assert.equal(typeof Queue, 'function');
          done();
        })
        .catch(done);
    });
  });
});
