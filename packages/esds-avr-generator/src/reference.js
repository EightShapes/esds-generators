import { startLocalServerSync, createAvrRuntimeConfig } from './startServer.js';
import chalk from 'chalk';
import execa from 'execa';
import Listr from 'listr';

export async function createReferenceImages(options) {
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
            `cd ${process.cwd()} && npx backstop reference --config=backstop.js`,
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
      task: async () => {
        localEnv.exit();
      },
    },
    // {
    //   title: 'Install AVR dependencies',
    //   task: async () => {
    //     let avrDependencies = {
    //       backstopjs: undefined,
    //       'browser-sync': undefined,
    //     };
    //
    //     const { stdout } = await install(avrDependencies, {
    //       cwd: options.targetDirectory,
    //       dev: true,
    //       prefer: 'npm',
    //     });
    //     console.log(stdout);
    //   },
    // },
  ]);

  await tasks.run();

  console.log(`%s AVR config generation successful.`, chalk.green.bold('DONE'));
  return true;
}
