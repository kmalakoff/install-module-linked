import assert from 'assert';
import installModule from 'install-module-linked';

describe('exports .ts', () => {
  it('exists', () => {
    assert.equal(typeof installModule, 'function');
  });
});
