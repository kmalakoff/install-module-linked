import assert from 'assert';
import installModule from 'install-module-linked';

describe('exports .mjs', () => {
  it('exists', () => {
    assert.equal(typeof installModule, 'function');
  });
});
