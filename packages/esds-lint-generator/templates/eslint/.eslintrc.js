module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['eslint:recommended'{{ ", 'plugin:prettier/recommended'" | safe if prettier }}],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [{{ "'sort-class-members', " | safe if sortClassMembers }}{{ "'prettier', " | safe if prettier }}],
  rules: {
    'linebreak-style': ['error', 'unix'],
    {%- if sortClassMembers %}
    'sort-class-members/sort-class-members': [
      2,
      {
        order: [
          '[static-methods]',
          'constructor',
          'connectedCallback',
          'disconnectedCallback',
          'createRenderRoot',
          'firstUpdated',
          'updated',
          'updateComplete',
          'setEventListeners',
          '[event-handlers]',
          '[alpha-getters]',
          '[alpha-private-methods]',
          '[alpha-methods]',
          '[custom-event-triggers]',
          '[render-methods]',
          'render'
        ],
        groups: {
          'event-handlers': [
            { name: '/on.+/', type: 'method', sort: 'alphabetical' },
          ],
          'alpha-getters': [
            { kind: 'get', type: 'method', sort: 'alphabetical' },
          ],
          'alpha-private-methods': [
            { name: '/_.+/', type: 'method', sort: 'alphabetical' },
          ],
          'alpha-methods': [
            { type: 'method', sort: 'alphabetical' },
          ],
          'custom-event-triggers': [
            { name: '/trigger.+Event/', type: 'method', sort: 'alphabetical' }
          ],
          'render-methods': [
            { name: '/render[A-Z].+/', type: 'method', sort: 'alphabetical' }
          ]
        },
        accessorPairPositioning: 'getThenSet',
      },
    ],
    {%- endif -%}
  },
};
