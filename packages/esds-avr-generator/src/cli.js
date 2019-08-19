import arg from 'arg';
// import { generateAvrConfig } from './main';
import { askAvrQuestions, generateAvrConfig } from './init.js';
import { createReferenceImages } from './reference.js';
import { runAvrTests } from './test.js';
import { approveChanges } from './approve.js';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--init': Boolean,
      '--reference': Boolean,
      '--test': Boolean,
      '--approve': Boolean,
      '--filter': String,
      '--docker': Boolean,
    },
    {
      argv: rawArgs.slice(2),
    },
  );
  return {
    init: args['--init'] || false,
    reference: args['--reference'] || false,
    test: args['--test'] || false,
    approve: args['--approve'] || false,
    filter: args['--filter'],
    docker: args['--docker'],
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
  } else if (options.test) {
    return await runAvrTests(options);
  } else if (options.approve) {
    return await approveChanges(options);
  } else {
    console.log(
      "This CLI must be run with one of the following flags: '--init', '--test', '--reference', '--approve'.",
    );
  }
}
