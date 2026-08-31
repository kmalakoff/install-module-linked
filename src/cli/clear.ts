import clearCache from '../lib/clear.ts';
import type { Ctx } from './types.ts';

export default function clear(ctx: Ctx): void {
  if (ctx.rest.length > 0) {
    ctx.usageError(`clear takes no arguments. Run ${ctx.name} --help for usage.`);
  }
  clearCache();
}
