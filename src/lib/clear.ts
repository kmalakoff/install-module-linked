import rimraf2 from 'rimraf2';
import { DEFAULT_CACHE_PATH } from '../constants.js';

import type { CleanOptions } from '../types.js';

export default function clear(_options?: CleanOptions) {
  rimraf2.sync(DEFAULT_CACHE_PATH, { disableGlob: true });
  console.log(`Cleaned ${DEFAULT_CACHE_PATH}`);
}
