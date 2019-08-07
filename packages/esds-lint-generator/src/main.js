import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import Listr from 'listr';
import { projectInstall } from 'pkg-install';
import { install } from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);
const rename = promisify(fs.rename);

function copyTemplateFiles(options) {
  return copy(options.templateDirectory, options.targetDirectory, {
    clobber: true, // cli.js has already confirmed that overwriting is ok
  });
}

function injectComponentNameIntoFiles(options) {
  const injectableTemplateFiles = [
    'src/component-entry-legacy.js',
    'src/component-entry.js',
    'src/component.js',
    'src/component.scss',
    'rollup.config.ie.js',
    'rollup.config.js',
    'package.json',
    'test/html/index.html'
  ];
  injectableTemplateFiles.forEach((f) => {
    const filepath = `${options.targetDirectory}/${f}`;
    let fileContents = fs.readFileSync(filepath);
    fileContents = fileContents.toString().replace(/\[component-name\]/g, options.normalizedComponentName);
    fileContents = fileContents.toString().replace(/\[ComponentName\]/g, options.pascalCaseComponentName);
    fs.writeFileSync(filepath, fileContents, 'utf-8');
  });
}

function renameCopiedFiles(options) {
  const renamableTemplateFiles = [
    'src/component-entry-legacy.js',
    'src/component-entry.js',
    'src/component.js',
    'src/component.scss'
  ];
  renamableTemplateFiles.forEach(f => {
    const oldPath = `${options.targetDirectory}/${f}`;
    const newPath = oldPath.replace('src/component', `src/${options.normalizedComponentName}`);
    rename(oldPath, newPath);
  })
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
        options.templateDirectory += `/${l}`;
        copyTemplateFiles(options);
      });
    }
  }
]);

 await tasks.run();

 console.log(`%s Linter installation successful.`, chalk.green.bold('DONE'));
 return true;
}
