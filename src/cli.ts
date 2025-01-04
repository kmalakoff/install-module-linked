#!/usr/bin/env node

import exit from 'exit';
import getopts from 'getopts-compat';
import clean from './cache/clean';

export default (argv) => {
  const options = getopts(argv, { stopEarly: true });

  const args = options._;
  if (!args.length) {
    console.log('Missing command. Example usage: im [command]');
    return exit(-1);
  }

  switch (args[0]) {
    case 'clean': {
      return clean({}, (err) => {
        if (err) {
          console.log(err.message);
          return exit(err.code || -1);
        }
        console.log(`Clean ${err ? `failed: ${err.message}` : 'succeeded'}`);
        return exit(err ? -1 : 0);
      });
    }
    default: {
      console.log(`Unrecognized command: ${argv[0]}. Example usage: im [command]`);
      return exit(-1);
    }
  }
};
