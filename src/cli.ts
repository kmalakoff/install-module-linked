#!/usr/bin/env node

import exit from 'exit';
import getopts from 'getopts-compat';
import rimraf2 from 'rimraf2';
import { DEFAULT_CACHE_PATH } from './constants';

export default (argv) => {
  const options = getopts(argv, { stopEarly: true });

  const args = options._;
  if (!args.length) {
    console.log('Missing command. Example usage: iml [command]');
    return exit(-1);
  }

  if (args[0] === 'clean') {
    try {
      rimraf2.sync(DEFAULT_CACHE_PATH, { disableGlob: true });
      console.log(`Cleaned ${DEFAULT_CACHE_PATH}`);
    } catch (_) {
      console.log(`Nothing ti clean at ${DEFAULT_CACHE_PATH}`);
    }
    return exit(0);
  }

  console.log(`Unrecognized command: ${argv[0]}. Example usage: im [command]`);
  return exit(-1);
};
