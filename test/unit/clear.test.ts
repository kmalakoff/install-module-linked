import assert from 'assert';
import { clear } from 'install-module-linked';
import os from 'os';
import path from 'path';

const DEFAULT_CACHE_PATH = path.join(os.homedir(), '.iml');

describe('clear', () => {
  it('removes the default cache path', () => {
    const removed: string[] = [];
    clear({ rmSync: (p) => removed.push(p) });
    assert.deepEqual(removed, [DEFAULT_CACHE_PATH]);
  });

  it('prefers the injected homedir', () => {
    const removed: string[] = [];
    clear({ rmSync: (p) => removed.push(p), homedir: () => '/custom/home' });
    assert.deepEqual(removed, [path.join('/custom/home', '.iml')]);
  });

  it('reports the cleaned path', () => {
    const lines: string[] = [];
    const originalLog = console.log;
    console.log = (message: unknown) => lines.push(String(message));
    try {
      clear({ rmSync: () => undefined });
    } finally {
      console.log = originalLog;
    }
    assert.deepEqual(lines, [`Cleaned ${DEFAULT_CACHE_PATH}`]);
  });
});
