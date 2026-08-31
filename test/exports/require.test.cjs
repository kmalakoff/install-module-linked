const assert = require('assert');
const installModule = require('install-module-linked');
const { clear, install, parseInstallString, sync } = installModule;

describe('exports .cjs', () => {
  it('exists', () => {
    assert.equal(typeof installModule, 'function');
    assert.equal(typeof clear, 'function');
    assert.equal(typeof install, 'function');
    assert.equal(typeof parseInstallString, 'function');
    assert.equal(typeof sync, 'function');
  });
});
