import arg from 'arg';
import { generateAvrConfig } from './main';
import fs from 'fs';
import chalk from 'chalk';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--config': String,
    },
    {
      argv: rawArgs.slice(2),
    },
  );
  return {
    source: args['--config'] || 'backstop.config.js',
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  await generateAvrConfig(options);
}
