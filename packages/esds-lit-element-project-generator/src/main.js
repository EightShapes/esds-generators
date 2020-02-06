import chalk from 'chalk';
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
  // TODO: Check if .gitignore is getting copied from template to source
 return copy(options.templateDirectory, options.targetDirectory, {
   clobber: false,
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
   targetDirectory: options.targetDirectory || `${process.cwd()}/${options.normalizedComponentName}`,
 };

 const currentFileUrl = import.meta.url;
 const templateDir = path.resolve(
   new URL(currentFileUrl).pathname,
   '../../templates/component',
 );
 options.templateDirectory = templateDir;

 try {
   await access(templateDir, fs.constants.R_OK);
 } catch (err) {
   console.error('%s Invalid template name', chalk.red.bold('ERROR'));
   process.exit(1);
 }

try {
  // Check if the directory exists in the current directory.
  await access(options.targetDirectory, fs.constants.F_OK);
  console.error(`%s Target directory already exists:\n${options.targetDirectory}`, chalk.red.bold('ERROR'));
  process.exit(1);
} catch (err) {
  // In this case we expect an error, the directoy shouldn't exist. Do nothing.
}

 const tasks = new Listr([
  {
    title: 'Copy project files',
    task: () => copyTemplateFiles(options)
  },
  {
    title: 'Customize project files',
    task: () => injectComponentNameIntoFiles(options)
  },
  {
    title: 'Rename project files',
    task: () => renameCopiedFiles(options)
  },
  {
    title: 'Install dependencies',
    task: () =>
      projectInstall({
        cwd: options.targetDirectory,
      })
  },
  {
    title: 'Compile sample component',
    task: async () => {
      try {
        const {stdout} = await execa.command(`cd ${options.targetDirectory} && npm run build`, {shell: true});
      } catch (err) {
        console.log(err);
      }
    }
  },
]);

 await tasks.run();

 console.log(`%s Project ready. To run:\ncd ${options.normalizedComponentName} && npm start`, chalk.green.bold('DONE'));
 return true;
}
