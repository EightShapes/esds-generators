const runtimeConfig = require('./backstop-runtime-config.json');
const packageConfig = require('./package.json');
const urlBase = `http://${runtimeConfig.hostUrl}:${runtimeConfig.testingPort}`;
const testPaths = ['{{ testPaths | join ("', '") | safe if testPaths }}'];

const scenarios = testPaths.map(p => ({
  label: p,
  url: `${urlBase}${p}`,
  misMatchThreshold: 0, // Intentionally strict threshold so false positives don't pass
  requireSameDimensions: true,
  selectors: ['{{ testSelectors }}'],
  selectorExpansion: true,
}));

const localConfig = {
  id: packageConfig.name,
  viewports: [
    {
      label: '',
      width: 1024,
      height: 100000, // Intentionally tall to include selectors at the bottom of long test pages
    },
  ],
  scenarios: scenarios,
  paths: {
    bitmaps_reference: '{{ testDirectory }}/backstop_data/bitmaps_reference',
    bitmaps_test: '{{ testDirectory }}/backstop_data/bitmaps_test',
    engine_scripts: '{{ testDirectory }}/backstop_data/engine_scripts',
    html_report: '{{ testDirectory }}/backstop_data/html_report',
    json_report: '{{ testDirectory }}/backstop_data/json_report',
    ci_report: '{{ testDirectory }}/backstop_data/ci_report',
  },
  report: ['html', 'json'],
  engine: 'chrome',
  engineOptions: {
    args: ['--no-sandbox']
  },
  asyncCaptureLimit: 1, // Intentionally low to prevent capture errors. Increase at your own risk.
  asyncCompareLimit: 50,
  dockerCommandTemplate:
    'docker run --shm-size=2gb --rm -i --mount type=bind,source="{cwd}",target=/src backstopjs/backstopjs:{version} {backstopCommand} {args}',
};

module.exports = { ...localConfig, dockerDefault: {{ docker }} };
