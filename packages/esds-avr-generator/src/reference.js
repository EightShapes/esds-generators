import { startLocalServerSync, createAvrRuntimeConfig } from './shared.js';
import chalk from 'chalk';
import execa from 'execa';
import Listr from 'listr';

export async function createReferenceImages(options) {
  const backstopConfig = require(`${process.cwd()}/backstop.js`);
  let localEnv;
  const tasks = new Listr([
    {
      title: 'Start Local Server',
      task: async () => {
        localEnv = await startLocalServerSync();
      },
    },
    {
      title: 'Create AVR Runtime Config',
      task: () => createAvrRuntimeConfig(localEnv, options),
    },
    {
      title: 'Create AVR Reference Images',
      task: async () => {
        try {
          const { stdout } = await execa.command(
            `cd ${process.cwd()} && npx backstop reference --config=backstop.js${
              options.docker || backstopConfig.dockerDefault ? ' --docker' : ''
            }${options.filter ? ` --filter=${options.filter}` : ''}`,
            { shell: true },
          );
          console.log(stdout);
        } catch (err) {
          // console.log(err);
          localEnv.exit();
          throw new Error(err.stderr);
        }
      },
    },
    {
      title: 'Close Local Server',
      task: async () => {
        localEnv.exit();
      },
    },
  ]);

  await tasks.run();

  console.log(`%s AVR config generation successful.`, chalk.green.bold('DONE'));
  return true;
}
