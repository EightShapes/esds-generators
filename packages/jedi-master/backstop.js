const runtimeConfig = require('./backstop-runtime-config.json');
const packageConfig = require('./package.json');
const urlBase = `http://${runtimeConfig.hostUrl}:${runtimeConfig.testingPort}`;
const testPaths = ['/test/html/index.html', '/test/vue/index.html'];

const scenarios = testPaths.map(p => ({
  label: p,
  url: `${urlBase}${p}`,
  misMatchThreshold: 0, // Intentionally strict threshold so false positives don't pass
  requireSameDimensions: true,
  selectors: ['.avr'],
  selectorExpansion: true,
}));

const localConfig = {
  id: packageConfig.name,
  viewports: [
    {
      label: '',
      width: 1024,
      height: 768,
    },
  ],
  scenarios: scenarios,
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test: 'backstop_data/bitmaps_test',
    engine_scripts: 'backstop_data/engine_scripts',
    html_report: 'backstop_data/html_report',
    ci_report: 'backstop_data/ci_report',
  },
  report: ['browser', 'json'],
  engine: 'chrome',
  dockerCommandTemplate:
    'docker run --shm-size=2gb --rm -it --mount type=bind,source="{cwd}",target=/src backstopjs/backstopjs:{version} {backstopCommand} {args}',
};

module.exports = { ...runtimeConfig.baseConfig, ...localConfig };
