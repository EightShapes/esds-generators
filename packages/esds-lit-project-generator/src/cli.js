import chalk from 'chalk';
import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';
const camelCase = require('camelcase');

async function getProjectOptions(options) {
 const questions = [];
 questions.push({
   type: 'text',
   name: 'componentName',
   message: `What is the name of the web component you're creating?`,
 });

 questions.push({
   type: 'text',
   name: 'componentNamespace',
   message: `Would you like to namespace your component?\nFor example, a "myds" namespace would result in a custom element named: <myds-component-name>\nLeave blank if you don't want to use a namespace.`,
 });

 const answers = await inquirer.prompt(questions);
 return {
   ...answers
 };
}

function normalizeName(name) {
  return name.toLowerCase().replace(/\s|_/g, '-');
}

function formatNamespace(namespace) {
  if (namespace.trim().length > 0) {
    return `${namespace.toLowerCase().replace(/\s|_/g, '-')}-`;
  } else {
    return '';
  }
}

export async function cli(args) {
  const options = await getProjectOptions();
  let componentDirectoryName = normalizeName(options.componentName);
  let normalizedComponentName = `${formatNamespace(options.componentNamespace)}${normalizeName(options.componentName)}`;
  if (normalizedComponentName.includes('-')) {
    const pascalCaseComponentName = camelCase(normalizedComponentName, {pascalCase: true});
    await createProject({...options, normalizedComponentName, pascalCaseComponentName, componentDirectoryName});
  } else {
    console.log(`%s The component name must contain a hyphen. Consider including a namespace.\nThe name "${normalizedComponentName}" does not contain a hyphen`, chalk.red.bold('ERROR'));
  }
}
