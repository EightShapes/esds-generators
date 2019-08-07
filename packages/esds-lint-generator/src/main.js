import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { promisify } from 'util';
import Listr from 'listr';
import nunjucks from 'nunjucks';
import { install } from 'pkg-install';

const nunjucksBasedConfigFiles = ['.eslintrc.js'];
const access = promisify(fs.access);

function copyTemplateFiles(options, linterTemplateDirectory) {
  fs.copySync(
    `${options.templateDirectory}/${linterTemplateDirectory}`,
    options.targetDirectory,
  );
}

function modifyConfigFiles(options) {
  nunjucksBasedConfigFiles.forEach(async f => {
    const filepath = `${options.targetDirectory}/${f}`;
    const fileContents = fs.readFileSync(filepath);
    const interpolatedContent = await nunjucks.renderString(
      fileContents.toString(),
      options,
    );
    fs.writeFileSync(filepath, interpolatedContent, { flag: 'w' });
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
      },
    },
    {
      title: 'Modifying lint config files',
      task: () => modifyConfigFiles(options),
    },
    {
      title: 'Installing eslint dependencies',
      task: async () => {
        let eslintDependencies = {
          eslint: undefined,
        };

        if (options.sortClassMembers) {
          eslintDependencies = {
            ...eslintDependencies,
            'eslint-plugin-sort-class-members': undefined,
          };
        }

        if (options.linters.includes('prettier')) {
          eslintDependencies = {
            ...eslintDependencies,
            'eslint-config-prettier': undefined,
            'eslint-plugin-prettier': undefined,
            prettier: undefined,
          };
        }

        const { stdout } = await install(eslintDependencies, {
          cwd: options.targetDirectory,
          dev: true,
          prefer: 'npm',
        });
        console.log(stdout);
      },
    },
  ]);

  await tasks.run();

  console.log(`%s Linter installation successful.`, chalk.green.bold('DONE'));
  return true;
}
