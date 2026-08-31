import path from 'path';
import { homedir, rmSync } from '../compat.ts';
import type { CleanOptions } from '../types.ts';

export default function clear(options?: CleanOptions) {
  const cachePath = path.join((options?.homedir ?? homedir)(), '.iml');
  (options?.rmSync ?? rmSync)(cachePath);
  console.log(`Cleaned ${cachePath}`);
}
