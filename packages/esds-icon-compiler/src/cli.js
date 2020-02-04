import arg from 'arg';
import { compileIcons } from './main';
import chokidar from 'chokidar';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--src': String,
      '--dest': String,
      '--format': [String],
      '--namespace': String,
      '--watch': Boolean,
    },
    {
      argv: rawArgs.slice(2),
    },
  );
  return {
    source: args['--src'] || 'src/*.svg',
    namespace: args['--namespace'] || 'esds',
    dest: args['--dest'] || 'dist',
    formats: args['--format'] || ['sprite', 'es6'],
    watch: args['--watch'] || false,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  // TODO: Throw helpful errors if insufficient args are passed
  if (options.watch) {
    const source = `${process.cwd()}/${options.source}`;
    const watcher = chokidar.watch(source).on('all', async () => {
      const compileSuccess = await compileIcons(options);
      if (!compileSuccess) {
        watcher.close();
      }
    });
  } else {
    await compileIcons(options);
  }
}
