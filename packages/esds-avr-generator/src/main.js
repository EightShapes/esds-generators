import { flatten } from 'flat';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Listr from 'listr';

export async function generateAvrConfig(options) {
  // esds-avr --generate
  // Questions:
  // U want docker?
  // Where is your test file/directory?
  // What is your test wrapper selector?

  // Based on questions:
  // Generate backstop.config.js w/scenarios based on test wrapper, test file/directory
  // Generate three npm scripts, each calling esds-avr
  // The first, no flags - runs tests based on backstop.config
  // The second, --reference - creates reference images
  // The third, --approve - approves reference images
  //
  // Installations needed:
  // backstopJS
  // browsersync
  // At the end:
  // Notify config has been built
  // Message heavily that Docker needs to be installed if they want to use Docker
  console.log('woop woop');
  // process.exit(1); // Failure
}
