import arg from 'arg';
import { compileTokens } from './main';
import chokidar from 'chokidar';
import fs from 'fs';
import chalk from 'chalk';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--src': String,
      '--dest': String,
      '--format': [String],
      '--token-namespace': String,
      '--watch': Boolean,
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
    watch: args['--watch'] || false,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  // TODO: Throw helpful errors if insufficient args are passed
  const sourceFile = `${process.cwd()}/${options.source}`;
  if (fs.existsSync(sourceFile)) {
    options.sourceFile = sourceFile;
    if (options.watch) {
      const targetTokensFile = `${process.cwd()}/${options.source}`;
      const tokenWatcher = chokidar
        .watch(targetTokensFile)
        .on('all', async () => {
          const compileSuccess = await compileTokens(options);
          if (!compileSuccess) {
            tokenWatcher.close();
          }
        });
    } else {
      await compileTokens(options);
    }
  } else {
    console.error(
      `%s No tokens file found at ${sourceFile}`,
      chalk.red.bold('ERROR'),
    );
    process.exit(1);
  }
}
