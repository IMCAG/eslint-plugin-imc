# eslint-plugin-ifelse-brace-style

Analyzes an if/else construct on its complexity and allows less line breaks (simple if/else) or requires more (if/else/if).

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-ifelse-brace-style`:

```
$ npm install git+https://github.com/IMCAG/eslint-plugin-imc.git
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-ifelse-brace-style` globally.

## Usage

Add `eslint-plugin-imc` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "eslint-plugin-imc"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "eslint-plugin-imc/ifelse-brace-style": 0
    }
}
```

## Supported Rules

* Fill in provided rules here





