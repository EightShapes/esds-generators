import { startLocalServerSync, createAvrRuntimeConfig } from './shared.js';
import chalk from 'chalk';
import execa from 'execa';
import Listr from 'listr';
import open from 'open';

export async function runAvrTests(options) {
  const backstopConfig = require(`${process.cwd()}/backstop.js`);
  console.log(options);
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
      title: 'Run AVR Tests',
      task: async () => {
        try {
          const { stdout } = await execa.command(
            `cd ${process.cwd()} && npx backstop test --config=backstop.js ${
              options.docker || backstopConfig.dockerDefault ? ' --docker' : ''
            }${options.filter ? ` --filter=${options.filter}` : ''}`,
            { shell: true },
          );
          console.log(stdout);
        } catch (err) {
          console.log(err);
        }
      },
    },
    {
      title: 'Close Local Server',
      task: () => {
        localEnv.exit();
      },
    },
    {
      title: 'Open Test Report',
      task: () => {
        open(`${process.cwd()}/${backstopConfig.paths.html_report}/index.html`);
      },
    },
  ]);

  await tasks.run();

  console.log(`%s AVR test run successful.`, chalk.green.bold('COMPLETE'));
  return true;
}
