import assert from 'assert';
import fs from 'fs';
// @ts-ignore
import { sync as installModuleSync } from 'install-module-linked';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp');
const CACHE_DIR = path.join(TMP_DIR, 'cache');
const NODE_MODULES = path.join(TMP_DIR, 'installed', 'node_modules');

describe('install-module-linked (sync)', () => {
  describe('setup tests', () => {
    beforeEach((cb) => {
      const queue = new Queue();
      queue.defer(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));
      queue.defer(mkdirp.bind(null, NODE_MODULES));
      queue.await(cb);
    });
    after(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));

    it('install with version', () => {
      installModuleSync('each-package@0.7.1', NODE_MODULES, { cachePath: CACHE_DIR });
      const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'each-package', 'package.json'), 'utf8'));
      assert.equal(packageJSON.name, 'each-package');
      assert.equal(packageJSON.version, '0.7.1');
    });

    it('install no version', () => {
      installModuleSync('each-package', NODE_MODULES, { cachePath: CACHE_DIR });
      const packageJSON = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'each-package', 'package.json'), 'utf8'));
      assert.equal(packageJSON.name, 'each-package');
      assert.ok(packageJSON.version.length);
    });
  });
});
