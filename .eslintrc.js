// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html',
    'import'
  ],
  // add your custom rules here
  'rules': {
    "space-before-function-paren": [2, { "anonymous": "always", "named": "always", "asyncArrow": "ignore" }],
    "no-unused-vars": [1, { "varsIgnorePattern": "^h$" }],
    "indent": [
      "error",
      4
    ],

    "semi": ["error", "always"],

    "linebreak-style": [
      "error",
      "unix"
    ],

    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}