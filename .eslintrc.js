module.exports = {
  "extends": ["ash-nazg/sauron-node"],
  parser: 'babel-eslint',
  "settings": {
      "polyfills": [
          "Array.isArray",
          "console",
          "Date.now",
          "document.head",
          "document.querySelector",
          "JSON",
          "Object.keys",
          'Object.values',
          "XMLHttpRequest"
      ]
  },
  "overrides": [
      {
          "files": ["src/jsonpath.js", "test-helpers/node-env.js"],
          // Apparent bug with `overrides` necessitating this
          "globals": {
              "require": "readonly",
              "run": "readonly",
              "module": "readonly"
          },
          rules: {
              "node/no-unsupported-features/es-syntax": ["error", {
                  ignores: ['regexpNamedCaptureGroups', 'modules', 'dynamicImport']
              }]
          }
      },
      {
          "files": ["*.md"],
          "rules": {
              "import/unambiguous": 0,
              "import/no-commonjs": 0,
              "import/no-unresolved": ["error", {"ignore": ["jsonpath-plus"]}],
              "no-undef": 0,
              "no-unused-vars": ["error", {
                  "varsIgnorePattern": "json|result"
              }],
              "node/no-missing-require": ["error", {
                  "allowModules": ["jsonpath-plus"]
              }],
              "node/no-missing-import": ["error", {
                  "allowModules": ["jsonpath-plus"]
              }]
          }
      },
      {
          "files": ["test/**"],
          "extends": [
              "plugin:chai-expect/recommended",
              "plugin:chai-friendly/recommended"
          ],
          "globals": {
              "assert": "readonly",
              "expect": "readonly",
              "jsonpath": "readonly"
          },
          "env": {"mocha": true},
          "rules": {
              "quotes": 0,
              "import/unambiguous": 0,
              // Todo: Reenable
              "max-len": 0
          }
      }
  ],
  "rules": {
    "indent": ["error", 4, {"outerIIFEBody": 0}],
    "promise/prefer-await-to-callbacks": 0,
    "quote-props": 0,
    "require-jsdoc": 0,
    // Reenable when no longer having problems
    "unicorn/no-unsafe-regex": 0
  }
};
