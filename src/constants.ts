import path from 'path';

import { homedir } from './compat.ts';

export const DEFAULT_CACHE_PATH = path.join(homedir(), '.iml') as string;
