import camelcase from 'camelcase';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import jsBeautify from 'js-beautify';
import Listr from 'listr';
import svgo from 'svgo';
import svgSprite from 'svg-sprite';

('use strict');

function addNpmScript(name, script, options) {
  const packageJsonPath = path.join(options.targetDirectory, 'package.json');
  const packageJson = require(packageJsonPath);
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts[name] = script;

  fs.writeFileSync(
    packageJsonPath,
    jsBeautify(JSON.stringify(packageJson), { indent_size: 2 }),
    'UTF-8',
  );
}

// const sourceDir = 'dist/icons'; // output directory for svgo optimized .svg's
// const outDir = 'dist';
// const namespace = 'esds';
// const es6ModuleNames = [];
// const es6ModuleExtension = '.svg.js';
// fs.mkdirpSync(outDir);
//
// const sourceFiles = fs.readdirSync(sourceDir);
// const sourceFileNames = sourceFiles.map(fn => path.parse(fn).name);
//
// const iconNamesFilepath = path.join(outDir, `${namespace}-icon-names.json`);
// fs.writeFileSync(iconNamesFilepath, JSON.stringify(sourceFileNames), 'UTF-8');
//
// sourceFiles.forEach(fn => {
//   const sourceContents = fs.readFileSync(path.join(sourceDir, fn), 'UTF-8');
//   const fileName = path.parse(fn).name;
//   const es6ModuleName = `${camelCase(namespace, {pascalCase: true})}Icon${camelCase(fileName, {pascalCase: true})}`;
//   const outfileContents = `export const ${es6ModuleName} = \`${sourceContents}\`; `;
//   const outfilePath = path.join(outDir, `${es6ModuleName}${es6ModuleExtension}`);
//   fs.writeFileSync(outfilePath, outfileContents, 'UTF-8');
//   es6ModuleNames.push(es6ModuleName);
// });
//
// const es6ManifestFilename = `index.js`;
// const es6ManifestFileContents = es6ModuleNames.map(n => `import { ${n} } from './${outDir}/${n}${es6ModuleExtension}'\nexport { ${n} }`).join('\n');
// const es6ManifestFilepath = path.join(es6ManifestFilename);
// fs.writeFileSync(es6ManifestFilepath, es6ManifestFileContents, 'UTF-8');

export async function compileIcons(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || `${process.cwd()}`,
  };

  const tasks = new Listr([
    {
      title: 'Optimize Icons',
      task: () => {
        addNpmScript(
          'svgo',
          `npx svgo -f ${options.source} -o ${options.dest} --config svgo.config.yml`,
        );
        // TODO: Write svgo.config.yml
      },
    },
    // {
    //   title: 'Create icon sprite',
    //   skip: () => !options.formats.includes('scss'),
    //   task: () => {
    //     tokens.namespace = '"' + options.tokenNamespace + '"';
    //     writeTokensScssFile(tokens, path.basename(sourceFile), options);
    //   },
    // },
    // {
    //   title: 'Generate es6 icon modules',
    //   skip: () => !options.formats.includes('json'),
    //   task: () => {
    //     tokens.namespace = options.tokenNamespace;
    //     writeTokensJsonFile(tokens, path.basename(sourceFile), options);
    //   },
    // },
  ]);

  try {
    await tasks.run();
    console.log(chalk.green('Icons compiled.'), chalk.green.bold('SUCCESS'));
    return true;
  } catch (err) {
    console.log(chalk.red.bold(err));
    if (options.watch) {
      return true; // If --watch was passed, return true to keep the watcher running
    } else {
      process.exit(1);
    }
  }
}
