import rimraf2 from 'rimraf2';

import { DEFAULT_CACHE_PATH } from '../constants';

export default function clean(options, callback) {
  const cachePath = options.cachePath || DEFAULT_CACHE_PATH;
  rimraf2(cachePath, { disableGlob: true }, callback);
}
