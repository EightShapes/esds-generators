# Token compiler
Given a source .yaml file and a token namespace this cli will convert the yaml file to .json and .scss formats and output the results to the specified `dest`.

## Features
* In addition to the generation of scss variables a complete sass map structure of all the tokens will be generated.  
* String interpolation of yaml variables is possible (enhancement of default YAML parsing)
  * Example, note the `!{}` syntax used to denote token string interpolation:  

```
  border :
    selected :
      width : &border-selected-width 5px
      on-white : "solid !{*border-selected-width} !{*color-teal-30}"
```

## Usage
Call directly using `npx`:
```
npx @eightshapes/esds-token-compiler --src=path/to/tokens.yaml --dest=path/to/desired/destination --token-namespace=myds --format=scss --format=json
```

Alternatively, install the cli in your project and wire it up to an npm script:
```
npm install @eightshapes/esds-token-compiler
```

```
package.json

{
  "scripts": {
    "compile-tokens": "compile-tokens --watch --src=path/to/tokens.yaml` --dest=path/to/desired/destination --token-namespace=myds --format=json --format=scss"
  }
}
```

Then run in your project via npm:  
`npm run compile-tokens`

### CLI Parameters
| Parameter | Default | Description |
| --- | --- | --- |
| `--src` | `tokens/tokens.yaml` | The path to the source yaml file containing tokens to be compiled. |
| `--dest` | `tokens` - The defaults will write compiled tokens to the same directory as the source yaml file. | The path to a directory where compiled tokens should be created. The generator will create this directory if it does not exist. |
| `--token-namespace` | `esds` | The prefix to be added to all tokens. For example a value of `mds` will result in scss variable names like `$mds-color-black`, and `$mds-font-size-1x`. |
| `--format` | `['scss', 'json']` | The desired output formats for tokens. `--format` can be specified multiple times to generate multiple formats. By default JSON and SCSS outputs will be created. |
| `--watch` | `false` | If provided, the source yaml file will be watched and changes to that file will re-trigger the compilation process.  |
| `--scssOutputFilename` | `false` | If provided, this is the name of the compiled `.scss` file. This will be combined with the `--dest` arg to generate the full output filepath. By default the name of the `--src` file will be used as the name for the compiled `.scss` file |
| `--jsonOutputFilename` | `false` | If provided, this is the name of the compiled `.json` file. This will be combined with the `--dest` arg to generate the full output filepath. By default the name of the `--src` file will be used as the name for the output `.json` file |

#### CLI Usage Examples
To watch a source file and generate only scss:

```
compile-tokens --watch --format=scss --src=/my/tokens-directory/mytokens.yaml --dest=/my/tokens-directory
```

Generating JSON, no watching with a namespace of "zds".

```
compile-tokens --format=json --src=tokens.yaml --dest=./ --token-namespace=zds
```

## Source file format and output
Given a `--token-namespace=esds` arg and a `tokens.yaml` file like this:

```
color :
  white : &color-white "#FFFFFF"
  black : &color-black "#000000"
  orange :
    82 : &color-orange-82 "#D24B00"
    91 : &color-orange-91 "#E85200"
    93 : &color-orange-93 "#EEAC8D"
  neutral :
    05 : &color-neutral-05 "#0D0D0D"
    15 : &color-neutral-15 "#262626"
    25 : &color-neutral-25 "#404040"
    42 : &color-neutral-42 "#6B6B6B"
    53 : &color-neutral-53 "#888888"
    70 : &color-neutral-70 "#B3B1B1"
    80 : &color-neutral-80 "#CCCACA"
    90 : &color-neutral-90 "#E6E3E3"
    95 : &color-neutral-95 "#F3F1F1"

text-color :
  brand : *color-orange-91
  primary :
    on-white : *color-neutral-05
    on-dark : *color-white
  secondary :
    on-white : *color-neutral-53
    on-dark : *color-neutral-53
```

The compiler will create this scss file:

```
// DO NOT EDIT: This file is automatically generated by a build task

$esds-color-white: #FFFFFF !default;
$esds-color-black: #000000 !default;
$esds-color-orange-82: #D24B00 !default;
$esds-color-orange-91: #E85200 !default;
$esds-color-orange-93: #EEAC8D !default;
$esds-color-neutral-5: #0D0D0D !default;
$esds-color-neutral-15: #262626 !default;
$esds-color-neutral-25: #404040 !default;
$esds-color-neutral-42: #6B6B6B !default;
$esds-color-neutral-53: #888888 !default;
$esds-color-neutral-70: #B3B1B1 !default;
$esds-color-neutral-80: #CCCACA !default;
$esds-color-neutral-90: #E6E3E3 !default;
$esds-color-neutral-95: #F3F1F1 !default;

$esds-text-color-brand: #E85200 !default;
$esds-text-color-primary-on-white: #0D0D0D !default;
$esds-text-color-primary-on-dark: #FFFFFF !default;
$esds-text-color-secondary-on-white: #888888 !default;
$esds-text-color-secondary-on-dark: #888888 !default;

$esds-namespace: "esds" !default;
$esds-tokens: (
    'color': (
        'white': $esds-color-white,
        'black': $esds-color-black,
        'orange': (
            '82': $esds-color-orange-82,
            '91': $esds-color-orange-91,
            '93': $esds-color-orange-93
        ),
        'neutral': (
            '5': $esds-color-neutral-5,
            '15': $esds-color-neutral-15,
            '25': $esds-color-neutral-25,
            '42': $esds-color-neutral-42,
            '53': $esds-color-neutral-53,
            '70': $esds-color-neutral-70,
            '80': $esds-color-neutral-80,
            '90': $esds-color-neutral-90,
            '95': $esds-color-neutral-95
        )
    ),
    'text-color': (
        'brand': $esds-text-color-brand,
        'primary': (
            'on-white': $esds-text-color-primary-on-white,
            'on-dark': $esds-text-color-primary-on-dark
        ),
        'secondary': (
            'on-white': $esds-text-color-secondary-on-white,
            'on-dark': $esds-text-color-secondary-on-dark
        )
    ),
    'namespace': $esds-namespace
);

@function esds-token($keys...) {
    $map: $esds-tokens;
    @each $key in $keys {
        $map: map-get($map, $key);
    }
    @return $map;
}
```

And this JSON file:

```
{
    "esds_tokens": {
        "color": {
            "white": "#FFFFFF",
            "black": "#000000",
            "orange": {
                "82": "#D24B00",
                "91": "#E85200",
                "93": "#EEAC8D"
            },
            "neutral": {
                "5": "#0D0D0D",
                "15": "#262626",
                "25": "#404040",
                "42": "#6B6B6B",
                "53": "#888888",
                "70": "#B3B1B1",
                "80": "#CCCACA",
                "90": "#E6E3E3",
                "95": "#F3F1F1"
            }
        },
        "text-color": {
            "brand": "#E85200",
            "primary": {
                "on-white": "#0D0D0D",
                "on-dark": "#FFFFFF"
            },
            "secondary": {
                "on-white": "#888888",
                "on-dark": "#888888"
            }
        },
        "namespace": "esds"
    }
}
```
