import chalk from 'chalk';
import execa from 'execa';
import Listr from 'listr';

export async function approveChanges() {
  const tasks = new Listr([
    {
      title: 'Promote New AVR Reference Images',
      task: async () => {
        try {
          const { stdout } = await execa.command(
            `cd ${process.cwd()} && npx backstop approve --config=backstop.js`,
            { shell: true },
          );
          console.log(stdout);
        } catch (err) {
          console.log(err);
        }
      },
    },
  ]);

  await tasks.run();

  console.log(`%s AVR Reference images promoted.`, chalk.green.bold('DONE'));
  return true;
}
