import homedir from 'homedir-polyfill';
import path from 'path';

export const DEFAULT_CACHE_PATH = path.join(homedir(), '.iml') as string;
