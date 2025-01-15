#!/usr/bin/env node

import exit from 'exit';
import getopts from 'getopts-compat';
import clean from './lib/clean';

export default (argv) => {
  const options = getopts(argv, { stopEarly: true });

  const args = options._;
  if (!args.length) {
    console.log('Missing command. Example usage: iml [command]');
    return exit(1);
  }

  if (args[0] === 'clean') {
    clean();
    return exit(0);
  }

  console.log(`Unrecognized command: ${argv[0]}. Example usage: im [command]`);
  return exit(1);
};
