import assert from 'assert';
import fs from 'fs';
import installModule from 'install-module-linked';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp');
const CACHE_DIR = path.join(TMP_DIR, 'cache');
const NODE_MODULES = path.join(TMP_DIR, 'installed', 'node_modules');

describe('install-module-linked (callback)', () => {
  describe('setup tests', () => {
    beforeEach((cb) => {
      const queue = new Queue();
      queue.defer(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));
      queue.defer(mkdirp.bind(null, NODE_MODULES));
      queue.await(cb);
    });
    after(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));

    it('install with version', (done) => {
      installModule('resolve-once@1.0.0', NODE_MODULES, { cachePath: CACHE_DIR }, (err) => {
        assert.ok(fs.existsSync(path.join(NODE_MODULES, 'resolve-once')));
        const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'resolve-once', 'package.json'), 'utf8'));
        assert.equal(packageJSON.name, 'resolve-once');
        assert.equal(packageJSON.version, '1.0.0');
        done(err);
      });
    });

    it('install no version', (done) => {
      installModule('resolve-once', NODE_MODULES, { cachePath: CACHE_DIR }, (err) => {
        assert.ok(fs.existsSync(path.join(NODE_MODULES, 'resolve-once')));
        const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'resolve-once', 'package.json'), 'utf8'));
        assert.equal(packageJSON.name, 'resolve-once');
        assert.ok(packageJSON.version.length);
        done(err);
      });
    });
  });
});
