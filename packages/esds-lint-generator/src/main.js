import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import Listr from 'listr';
import { install, projectInstall } from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);

function copyTemplateFiles(options, linterTemplateDirectory) {
  return copy(`${options.templateDirectory}/${linterTemplateDirectory}`, options.targetDirectory, {
    clobber: true, // cli.js has already confirmed that overwriting is ok
  });
}

export async function createProject(options) {
 options = {
   ...options,
   targetDirectory: options.targetDirectory || `${process.cwd()}`,
 };

 const currentFileUrl = import.meta.url;
 const templateDir = path.resolve(
   new URL(currentFileUrl).pathname,
   '../../templates',
 );
 options.templateDirectory = templateDir;

 try {
   await access(templateDir, fs.constants.R_OK);
 } catch (err) {
   console.error('%s Invalid template name', chalk.red.bold('ERROR'));
   process.exit(1);
 }

 const tasks = new Listr([
  {
    title: 'Copy lint config files',
    task: () => {
      options.linters.forEach(l => {
        copyTemplateFiles(options, l);
      });
    }
  },
  {
    title: 'Installing eslint dependencies',
    task: async () => {
      let eslintDependencies = {
        'eslint': undefined,
        'eslint-plugin-sort-class-members': undefined,
      }
      if (options.linters.prettier) {
        eslintDependencies = { ...eslintDependencies,
          "eslint-config-prettier": undefined,
          "eslint-plugin-prettier": undefined,
          "prettier": undefined,
        }
      }

      const { stdout } = await install(
        eslintDependencies,
        {
          cwd: options.targetDirectory,
          dev: true,
          prefer: 'npm',
        }
      );
      console.log(stdout);
    }
  },
]);

 await tasks.run();

 console.log(`%s Linter installation successful.`, chalk.green.bold('DONE'));
 return true;
}
