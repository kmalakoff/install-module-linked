// Parsing and dispatch only. Commands live in src/cli/, one file each,
// lazy-loaded — nothing dependency-heavy may be imported at the top of this file.
import fs from 'fs';
import path from 'path';
import url from 'url';
import { COMMANDS } from './cli/index.ts';
import type { Ctx } from './cli/types.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const ERROR_CODE = 25;

function getVersion(): string {
  try {
    const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as { version?: string };
    return packageJson.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function printHelp(name: string): void {
  console.log(`${name} v${getVersion()}`);
  console.log('');
  console.log(`Usage: ${name} [options] [command]`);
  console.log('');
  console.log('Commands:');
  console.log('  clear    Clear the module cache');
  console.log('');
  console.log('Options:');
  console.log('  -v, --version    Print version number');
  console.log('  -h, --help       Print this help message');
}

export default async function cli(argv: string[], name = 'iml'): Promise<void> {
  if (argv[0] === '--version' || argv[0] === '-v') {
    console.log(getVersion());
    return;
  }
  if (argv.length === 0) {
    console.error(`Missing command. Example usage: ${name} [command]`);
    console.error(`Run "${name} --help" for more information.`);
    process.exit(ERROR_CODE);
  }
  if (argv[0] === '--help' || argv[0] === '-h') {
    printHelp(name);
    return;
  }

  const ctx: Ctx = {
    name,
    rest: argv.slice(1),
    usageError(message) {
      console.error(message);
      process.exit(ERROR_CODE);
    },
    errorCode: ERROR_CODE,
  };

  try {
    const load = COMMANDS[argv[0]];
    if (!load) {
      console.error(`Unrecognized command: ${argv[0]}. Example usage: ${name} [command]`);
      console.error(`Run "${name} --help" for more information.`);
      process.exit(ERROR_CODE);
    }
    await (await load()).default(ctx);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(ERROR_CODE);
  }
}
