import arg from 'arg';
// import { generateAvrConfig } from './main';
import { askAvrQuestions, generateAvrConfig } from './init.js';
import { createReferenceImages } from './reference.js';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--init': Boolean,
      '--reference': Boolean,
      '--scope': String,
      '--docker': Boolean,
    },
    {
      argv: rawArgs.slice(2),
    },
  );
  return {
    init: args['--init'] || false,
    reference: args['--reference'] || false,
    scope: args['--scope'],
    docker: args['--docker'] || false,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  if (options.init) {
    // The generator is being run, ask some questions
    const generatorOptions = await askAvrQuestions();
    return await generateAvrConfig(generatorOptions);
  } else if (options.reference) {
    return await createReferenceImages(options);
  } else {
    console.log(
      "This CLI doesn't do anything else yet. Please run with the '--init' flag in order to generate an AVR config.",
    );
    // await generateAvrConfig(options);
  }
}
