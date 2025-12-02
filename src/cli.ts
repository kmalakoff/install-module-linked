#!/usr/bin/env node

import exit from 'exit';
import fs from 'fs';
import getopts from 'getopts-compat';
import path from 'path';
import url from 'url';
import clear from './lib/clear.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

const ERROR_CODE = 7;

function getVersion(): string {
  const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

function printHelp(name: string): void {
  const version = getVersion();
  console.log(`${name} v${version}`);
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

export default (argv: string[], name?: string): undefined => {
  name = name || 'iml';
  const options = getopts(argv, {
    alias: { version: 'v', help: 'h' },
    boolean: ['version', 'help'],
    stopEarly: true,
  });

  if (options.version) {
    console.log(getVersion());
    exit(0);
    return;
  }

  if (options.help) {
    printHelp(name);
    exit(0);
    return;
  }

  const args = options._;
  if (!args.length) {
    console.log(`Missing command. Example usage: ${name} [command]`);
    console.log(`Run "${name} --help" for more information.`);
    exit(ERROR_CODE);
    return;
  }

  if (args[0] === 'clear') {
    clear();
    exit(0);
    return;
  }

  console.log(`Unrecognized command: ${args[0]}. Example usage: ${name} [command]`);
  console.log(`Run "${name} --help" for more information.`);
  exit(ERROR_CODE);
};
