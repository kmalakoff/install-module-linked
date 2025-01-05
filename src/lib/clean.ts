import rimraf2 from 'rimraf2';
import { DEFAULT_CACHE_PATH } from '../constants';

export default function clean() {
  rimraf2.sync(DEFAULT_CACHE_PATH, { disableGlob: true });
  console.log(`Cleaned ${DEFAULT_CACHE_PATH}`);
}
