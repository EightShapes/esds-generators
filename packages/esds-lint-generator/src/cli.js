import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import inquirer from 'inquirer';
import { createProject } from './main';

function checkForExistingFiles(filesToBeWritten) {
  filesToBeWritten.map(f => {
    if (fs.existsSync(`${process.cwd()}${f.filepath}`)) {
      f.exists = true;
    }
    return f;
  });

  return filesToBeWritten;
}

async function getFileChangePreview(templateDirectories) {
  const currentFileUrl = import.meta.url;
  const templateDir = path.resolve(
    new URL(currentFileUrl).pathname,
    '../../templates',
  );
  let filesToBeWritten = [];

  const getAllFiles = function(src) {
    return glob.sync(src + '/**/*', { dot: true });
  };

  templateDirectories.forEach(d => {
    const templateFiles = getAllFiles(`${templateDir}/${d}`);
    templateFiles.forEach(pathString => {
      const pathData = path.parse(pathString);
      const normalizedFilepath = pathString.replace(`${templateDir}/${d}`, '');
      if (pathData.ext) {
        filesToBeWritten.push({ filepath: normalizedFilepath });
      }
    });
  });

  filesToBeWritten = checkForExistingFiles(filesToBeWritten);
  return filesToBeWritten;
}

async function getProjectOptions() {
  let questions = [];

  questions.push({
    type: 'checkbox',
    name: 'linters',
    message: `What linters would you like to install?`,
    choices: ['sass-lint', 'eslint'],
  });

  const answers = await inquirer.prompt(questions);

  if (answers.linters.includes('eslint')) {
    // Ask if prettier should be wired up to be used with eslint
    questions = [
      {
        type: 'confirm',
        name: 'prettier',
        message: 'Would you like to use prettier with eslint?',
      },
      {
        type: 'confirm',
        name: 'sortClassMembers',
        message:
          'Would you like to enforce method order within JS classes via eslint?',
      },
    ];

    let eslintDetails = await inquirer.prompt(questions);
    if (eslintDetails.prettier) {
      // Add prettier to the list of desired linters
      answers.linters.push('prettier');
      answers.prettier = true;
    }

    if (eslintDetails.sortClassMembers) {
      answers.sortClassMembers = true;
    }
  }

  const fileChangePreview = await getFileChangePreview(answers.linters);
  questions = [
    {
      type: 'confirm',
      name: 'confirmOverwrite',
      message: `The following files will be added or overwritten if you proceed:\n${fileChangePreview
        .map(f => {
          if (f.exists) {
            return `${f.filepath} - WARNING: existing file will be overwritten`;
          } else {
            return f.filepath;
          }
        })
        .join('\n')}\nProceed?`,
    },
  ];

  let overwriteAnswer = await inquirer.prompt(questions);
  if (!overwriteAnswer.confirmOverwrite) {
    console.error(
      `%s Generation of lint config was aborted.`,
      chalk.red.bold('ERROR'),
    );
    process.exit(1);
  }

  return {
    ...answers,
  };
}

export async function cli() {
  const options = await getProjectOptions();
  await createProject({ ...options });
}
