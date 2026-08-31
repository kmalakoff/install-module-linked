import assert from 'assert';
import Module from 'module';
import os from 'os';
import path from 'path';
import resolveOptions from '../../src/lib/resolveOptions.ts';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

describe('resolveOptions', () => {
  it('falls back to the floor defaults', () => {
    const resolved = resolveOptions({});
    assert.equal(resolved.cachePath, path.join(os.homedir(), '.iml'));
    assert.equal(typeof resolved.spawn, 'function');
    assert.equal(typeof resolved.fetchText, 'function');
    assert.equal(typeof resolved.rm, 'function');
    assert.equal(typeof resolved.rmSync, 'function');
    assert.equal(typeof resolved.mkdir, 'function');
    assert.equal(typeof resolved.homedir, 'function');
    assert.equal(typeof resolved.syncExec, 'function');
  });

  it('prefers the caller options', () => {
    const homedir = () => '/custom/home';
    const resolved = resolveOptions({ cachePath: '/custom/cache', homedir });
    assert.equal(resolved.cachePath, '/custom/cache');
    assert.equal(resolved.homedir, homedir);
  });

  it('fills gaps from the workerModule before the defaults', () => {
    const workerModule = path.join(__dirname, '..', 'data', 'worker-module.cjs');
    const fixture = _require(workerModule) as { mkdir: unknown };
    const resolved = resolveOptions({ workerModule });
    assert.equal(resolved.mkdir, fixture.mkdir);
    // A gap the workerModule does not fill still falls back to the default.
    assert.equal(typeof resolved.fetchText, 'function');
  });
});
