import arg from 'arg';
import { compileTokens } from './main';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--src': String,
      '--dest': String,
      '--format': [String],
      '--token-namespace': String,
    },
    {
      argv: rawArgs.slice(2),
    },
  );
  // TODO: Add --watch flag
  return {
    source: args['--src'] || 'tokens/tokens.yaml',
    tokenNamespace: args['--token-namespace'] || 'esds',
    dest: args['--dest'] || 'tokens',
    formats: args['--format'] || ['scss', 'json'],
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  // TODO: Throw helpful errors if insufficient args are passed
  await compileTokens(options);
}
