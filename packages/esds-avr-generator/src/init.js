import arg from 'arg';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import glob from 'glob';
import nunjucks from 'nunjucks';
import Listr from 'listr';
import { install } from 'pkg-install';
import { js as jsBeautify } from 'js-beautify';


function checkForExistingFiles(filesToBeWritten) {
  filesToBeWritten.map(f => {
    if (fs.existsSync(`${process.cwd()}${f.filepath}`)) {
      f.exists = true;
    }
    return f;
  });

  return filesToBeWritten;
}

async function getFileChangePreview() {
  const currentFileUrl = import.meta.url;
  const templateDir = path.resolve(
    new URL(currentFileUrl).pathname,
    '../../templates/generate',
  );
  let filesToBeWritten = [];

  const templateFiles = glob.sync(`${templateDir}/**/*`);
  templateFiles.forEach(pathString => {
    const pathData = path.parse(pathString);
    const normalizedFilepath = pathString.replace(`${templateDir}`, '');
    if (pathData.ext) {
      filesToBeWritten.push({ filepath: normalizedFilepath });
    }
  });

  filesToBeWritten = checkForExistingFiles(filesToBeWritten);
  return filesToBeWritten;
}

export async function askAvrQuestions() {
  let questions = [
    {
      type: 'input',
      name: 'testLocation',
      message: `Where is your test file or test directory, relative to your current working directory? (Leave blank if you want to configure this later)`,
    },
    {
      type: 'input',
      name: 'testSelectors',
      message: `Enter a CSS selector used to 'wrap' each of your AVR examples on your test page. (Leave blank if you prefer to test the entire test page as one image)`,
    },
    {
      type: 'confirm',
      name: 'docker',
      message: `Would you like to run your tests in a Docker instance? (requires Docker (free) to be installed locally)`,
      default: false,
    },
  ];

  const answers = await inquirer.prompt(questions);

  if (answers.testLocation.length > 0) {
    const testLocation = answers.testLocation;
    const localizedTestLocation = path.join(process.cwd(), testLocation);
    // Determine if test location is a single file or a directory
    if (fs.existsSync(localizedTestLocation)) {
      if (fs.lstatSync(localizedTestLocation).isDirectory()) {
        // It's a directory, grab all the .html files within it, don't include files within node_modules
        const testFiles = glob.sync(
          `${localizedTestLocation}/**!(node_modules)/*.html`,
        );
        answers.testPaths = testFiles.map(p => p.replace(process.cwd(), ''));
        answers.testDirectory = answers.testLocation;
      } else {
        // It's a single file, make sure it's an .html file
        const fileData = path.parse(localizedTestLocation);
        if (fileData.ext !== '.html') {
          console.warn(
            chalk.yellow.bold(
              `The test file specified: ${localizedTestLocation} is not an .html file. Backstop config will still be generated.`,
            ),
          );
        } else {
          answers.testPaths = [localizedTestLocation.replace(process.cwd(), '')];
          answers.testDirectory = path.resolve(localizedTestLocation).replace(process.cwd(), '');
        }
      }
    } else {
      console.warn(
        chalk.yellow.bold(
          `No test file(s) found at ${localizedTestLocation}. Backstop config will still be generated.`,
        ),
      );
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


// GENERATE CONFIG *******************************

const nunjucksBasedConfigFiles = ['backstop.js'];


function copyTemplateFiles(options) {
  fs.copySync(
    options.templateDirectory,
    options.targetDirectory,
  );
}

function modifyTemplateFiles(options) {
  nunjucksBasedConfigFiles.forEach(async f => {
    const filepath = `${options.targetDirectory}/${f}`;
    const fileContents = fs.readFileSync(filepath, 'UTF-8');
    const interpolatedContent = await nunjucks.renderString(
      fileContents.toString(),
      options,
    );
    fs.writeFileSync(filepath, interpolatedContent, { flag: 'w' });
  });
}

function addAvrFilesToGitignore(options) {
  const gitIgnoreFilePath = path.join(process.cwd(), '.gitignore');
  let gitIgnoreContents = '';

  if (fs.existsSync(gitIgnoreFilePath)) {
    gitIgnoreContents = fs.readFileSync(gitIgnoreFilePath, 'UTF-8');
  }

  const gitIgnoreRegexes = [
    {
      filename: 'backstop-runtime-config.json',
      regex: /^backstop-runtime-config\.json/gm
    },
    { filename: `${options.testDirectory}/backstop_data/bitmaps_test`,
      regex: new RegExp(`^${options.testDirectory}\/backstop_data\/bitmaps_test$`, 'gm')
    },
    { filename: `${options.testDirectory}/backstop_data/json_report`,
      regex: new RegExp(`^${options.testDirectory}\/backstop_data\/json_report$`, 'gm')
    },
    { filename: `${options.testDirectory}/backstop_data/html_report`,
      regex: new RegExp(`^${options.testDirectory}\/backstop_data\/html_report$`, 'gm')
    },
  ];

  gitIgnoreRegexes.forEach(r => {
    if (!gitIgnoreContents.match(r.regex)) {
      gitIgnoreContents += `\n${r.filename}`;
    }
  });

  fs.writeFileSync(gitIgnoreFilePath, gitIgnoreContents, 'UTF-8');
}

function addNpmScriptShortcuts(options) {
  const packageJsonPath = path.join(options.targetDirectory, 'package.json');
  const packageJson = require(packageJsonPath);
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts['avr-test'] = 'npx esds-avr --test';
  packageJson.scripts['avr-reference'] = 'npx esds-avr --reference';
  packageJson.scripts['avr-approve'] = 'npx esds-avr --approve';

  fs.writeFileSync(packageJsonPath, jsBeautify(JSON.stringify(packageJson), { indent_size: 2 }), 'UTF-8');
}

export async function generateAvrConfig(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || `${process.cwd()}`,
  };

  const currentFileUrl = import.meta.url;
  const templateDir = path.resolve(
    new URL(currentFileUrl).pathname,
    '../../templates/generate',
  );
  options.templateDirectory = templateDir;

  try {
    fs.existsSync(templateDir);
  } catch (err) {
    console.error(`%s Invalid template name: ${templateDir}`, chalk.red.bold('ERROR'));
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: 'Copy AVR config files',
      task: () => copyTemplateFiles(options),
    },
    {
      title: 'Modify AVR config files',
      task: () => modifyTemplateFiles(options),
    },
    {
      title: 'Update .gitignore',
      task: () => addAvrFilesToGitignore(options)
    },
    {
      title: 'Install AVR dependencies',
      task: async () => {
        let avrDependencies = {
          backstopjs: '^4.1.12', // Version locking until this issue is reopened and resolved: https://github.com/garris/BackstopJS/issues/1059
        };

        const { stdout } = await install(avrDependencies, {
          cwd: options.targetDirectory,
          dev: true,
          prefer: 'npm',
        });
        console.log(stdout);
      },
    },
    {
      title: 'Add NPM script shortcuts',
      task: async() => addNpmScriptShortcuts(options)
    }
  ]);

  await tasks.run();

  // TODO: Add instructions - if Docker, install Docker Desktop
  // Run --reference to generate initial baseline Images
  // Run --test to test

  console.log(`%s AVR config generation successful.`, chalk.green.bold('DONE'));
  return true;
}
