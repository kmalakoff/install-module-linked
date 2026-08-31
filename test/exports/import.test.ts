import assert from 'assert';
import installModule, { clear, install, parseInstallString, sync } from 'install-module-linked';

describe('exports .ts', () => {
  it('exists', () => {
    assert.equal(typeof installModule, 'function');
    assert.equal(typeof clear, 'function');
    assert.equal(typeof install, 'function');
    assert.equal(typeof parseInstallString, 'function');
    assert.equal(typeof sync, 'function');
  });
});
