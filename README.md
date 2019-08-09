# ESDS Generators
These are small cli generators that install features into existing design system projects.

## Available Commands
You can run any of these via `npx`. This way they aren't a dependency of your project. They run, install the necessary configuration, and exit.

### Lit Element Project Generator
Includes rollup for Lit Element Builds, browser sync to run a local dev environment, and a scss compiler.  
```
npx @eightshapes/esds-lit-element-project-generator
```

### Framework Test App Generator
Creates a simple Vue (for now, React & Angular coming) app harness to test vanilla web components.  
```
npx @eightshapes/esds-framework-test-app-generator
```

### Lint Generator
Allows a choice of sass-lint, eslint, and/or prettier. Adds config and installs necessary packages to support linting.  
```
npx @eightshapes/esds-lint-generator
```

### Token compiler
Given a source .yaml file and a token namespace this cli will convert the yaml file to .json and .scss formats and output the results to the specified `dest`  

```
npx @eightshapes/esds-token-compiler --source=path/to/tokens.yaml --dest=path/to/desired/destination --token-namespace=myds --format=scss --format=json
```

Alternatively, install the cli in your project and wire it up to an npm script.
```
npm install @eightshapes/esds-token-compiler
```

```
package.json

{
  "scripts": {
    "compile-tokens": "compile-tokens --source=path/to/tokens.yaml` --dest=path/to/desired/destination --token-namespace=myds"
  }
}
```

Then run in your project via npm:  
`npm run compile-tokens`
