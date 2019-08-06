import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import Listr from 'listr';
import { projectInstall } from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);
const rename = promisify(fs.rename);

function copyTemplateFiles(options) {
 return copy(options.templateDirectory, options.targetDirectory, {
   clobber: false,
 });
}

function customizeTemplateFiles(options) {
  const customizableTemplateFiles = [
    'index.html',
    'browser-sync-config.js',
  ];
  customizableTemplateFiles.forEach((f) => {
    const filepath = `${options.targetDirectory}/${f}`;
    let fileContents = fs.readFileSync(filepath);
    fileContents = fileContents.toString().replace(/\[component-source-file\]/g, `${options.componentSourceFile}`);
    fileContents = fileContents.toString().replace(/\[custom-element-name\]/g, `${options.customElementName}`);
    fileContents = fileContents.toString().replace(/\[framework-name\]/g, `${options.framework.toLowerCase()}`);
    fs.writeFileSync(filepath, fileContents, 'utf-8');
  });
}

async function confirmFileCreation(fileList) {
  const questions = [];

  questions.push({
    type: 'confirm',
    name: 'confirmFileCreation',
    message: `The following files will be created:\n${fileList}\n. Is this OK?`,
  });

  const answers = await inquirer.prompt(questions);
  return {
    ...answers
  };
}

export async function createProject(options) {
  const framework = options.framework.toLowerCase();
 options = {
   ...options,
   targetDirectory: options.targetDirectory || `${process.cwd()}/test/${framework}`,
 };


 const currentFileUrl = import.meta.url;
 const templateDir = path.resolve(
   new URL(currentFileUrl).pathname,
   `../../templates/${framework}`,
 );
 options.templateDirectory = templateDir;

 try {
   await access(templateDir, fs.constants.R_OK);
 } catch (err) {
   console.error('%s Invalid template name', chalk.red.bold('ERROR'));
   process.exit(1);
 }

 const fileList = fs.readdirSync(options.templateDirectory).map(f => `/test/${framework}/${f}`).join('\n');

 const fileConfirm = await confirmFileCreation(fileList);
 if (!fileConfirm.confirmFileCreation) {
   console.error('%s Template Creation Aborted', chalk.red.bold('ERROR'));
   process.exit(1);
 }

 const tasks = new Listr([
  {
    title: 'Copy project files',
    task: () => copyTemplateFiles(options)
  },
  {
    title: 'Customize project files',
    task: () => customizeTemplateFiles(options)
  },
  {
    title: 'Install dependencies',
    task: () =>
      projectInstall({
        cwd: options.targetDirectory,
      })
  },
]);

 await tasks.run();

 console.log(`%s Project ready. To run:\ncd test/${framework} && npm start`, chalk.green.bold('DONE'));
 return true;
}
