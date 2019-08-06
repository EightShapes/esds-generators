import chalk from 'chalk';
import arg from 'arg';
import inquirer from 'inquirer';
import fs from 'fs';
import { promisify } from 'util';
import { createProject } from './main';
const camelCase = require('camelcase');

const access = promisify(fs.access);
const readdir = promisify(fs.readdirSync);


function getPotentialComponentSourceFile() {
  // Look in a ./dist directory for any .js files and use those at the prompt
  const distDir = `${process.cwd()}/dist`;
  let distJsFiles = [];

  try {
    fs.accessSync(distDir, fs.constants.F_OK);
    distJsFiles = fs.readdirSync(distDir).filter(f => !f.endsWith('-legacy.js') && f.endsWith('.js')).map(f => `/dist/${f}`);
  } catch (err) {
    // No dist dir found, no big deal
  }

  return distJsFiles;
}

async function getComponentName(componentSourceFile) {
  const fileContents = fs.readFileSync(`${process.cwd()}${componentSourceFile}`);
  const customElementDefinitionRegex = /customElements.define\(['|"](.*)['|"]/gm;
  const customElementNames = [];
  let m;

  while ((m = customElementDefinitionRegex.exec(fileContents)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === customElementDefinitionRegex.lastIndex) {
          customElementDefinitionRegex.lastIndex++;
      }

      customElementNames.push(m[1]);
  }

  if (customElementNames.length > 0) {
    const questions = [];
    questions.push({
      type: 'list',
      name: 'customElementName',
      message: `What is the name of the component you'd like to test?`,
      choices: customElementNames
    });

    const answers = await inquirer.prompt(questions);
    return {
      ...answers
    };
  } else {
    return;
  }
}

async function getProjectOptions(options) {
 const questions = [];
 const distJsFiles = getPotentialComponentSourceFile();
 distJsFiles.push({name: "I'll wire up the component source file myself.", value: false});

 questions.push({
   type: 'list',
   name: 'framework',
   message: `What type of test app do you need to create?`,
   choices: ['Vue', 'React', 'Angular'],
 });

 questions.push({
   type: 'list',
   name: 'componentSourceFile',
   message: `Where is the component source file you'd like to test?`,
   choices: distJsFiles
 });

 const answers = await inquirer.prompt(questions);
 return {
   ...answers
 };
}

// function normalizeName(name) {
//   return name.toLowerCase().replace(/\s|_/g, '-');
// }
//
// function formatNamespace(namespace) {
//   if (namespace.trim().length > 0) {
//     return `${namespace.toLowerCase().replace(/\s|_/g, '-')}-`;
//   } else {
//     return '';
//   }
// }

export async function cli(args) {
  const options = await getProjectOptions();
  let additionalOptions = {};
  if (options.componentSourceFile) {
    additionalOptions = await getComponentName(options.componentSourceFile);
  }
  // let componentDirectoryName = normalizeName(options.componentName);
  // let normalizedComponentName = `${formatNamespace(options.componentNamespace)}${normalizeName(options.componentName)}`;
  // if (normalizedComponentName.includes('-')) {
    // const pascalCaseComponentName = camelCase(normalizedComponentName, {pascalCase: true});
    await createProject({...options, ...additionalOptions});
  // } else {
    // console.log(`%s The component name must contain a hyphen. Consider including a namespace.\nThe name "${normalizedComponentName}" does not contain a hyphen`, chalk.red.bold('ERROR'));
  // }
}
