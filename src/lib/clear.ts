import { rmSync } from 'fs-remove-compat';
import { DEFAULT_CACHE_PATH } from '../constants.ts';

import type { CleanOptions } from '../types.ts';

export default function clear(_options?: CleanOptions) {
  rmSync(DEFAULT_CACHE_PATH);
  console.log(`Cleaned ${DEFAULT_CACHE_PATH}`);
}
