# ESDS Lit Element Project Generator

This opinionated generator assumes:

* You want to create an npm package that contains a single web component
* You want to build that web component using lit-element
* You want to style your component using scss
* You want to export your component as a single<sup>*</sup> JS file that can be dropped into any other application
  * <sup>*</sup> You may want a separate JS file for older browsers, it'll generate that too

Run:

```
npx @eightshapes/esds-lit-element-project-generator
```

Follow the prompts.

👆 This creates a pipeline that:

* Provides lit-element as a base web component
* Configures rollup to bundle your component source into three outputs:
  * [component-name]-web-components.js, es6 consumable w/customElements.define call built-in
  * [component-name].js, es6 consumable w/out customElements.define call
  * [component-name]-legacy.js, es5 consumable suitable for use in IE11
* Wires up browsersync and creates a sandbox for building the component
  * The default sandbox _will_ run in IE11, see the generated `test/html/index.html` file for the syntax
* Creates a default scss file and a sass compilation pipeline that injects CSS into the web-component and generates a standalone CSS file
