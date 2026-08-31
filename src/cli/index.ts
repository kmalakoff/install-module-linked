import type { Ctx } from './types.ts';

// Lazy registry: a command's dependencies load only when the command runs.
export const COMMANDS: Record<string, () => Promise<{ default: (ctx: Ctx) => void | Promise<void> }>> = {
  clear: () => import('./clear.ts'),
};
