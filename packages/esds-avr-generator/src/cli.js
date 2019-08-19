import arg from 'arg';
// import { generateAvrConfig } from './main';
import { askAvrQuestions, generateAvrConfig } from './generate.js';
import inquirer from 'inquirer';
import fs from 'fs';
import chalk from 'chalk';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--generate': Boolean,
    },
    {
      argv: rawArgs.slice(2),
    },
  );
  return {
    generate: args['--generate'] || false,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  if (options.generate) {
    // The generator is being run, ask some questions
    const generatorOptions = await askAvrQuestions();
    return await generateAvrConfig(generatorOptions);
  } else {
    console.log(
      "This CLI doesn't do anything else yet. Please run with the '--generate' flag in order to generate an AVR config.",
    );
    // await generateAvrConfig(options);
  }
}
