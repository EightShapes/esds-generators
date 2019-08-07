/*eslint-env node */
require = require('esm')(module); // eslint-disable-line no-global-assign
require('../src/cli').cli(process.argv);
