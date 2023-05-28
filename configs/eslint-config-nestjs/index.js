module.exports = {
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'custom',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    '.eslintrc.js', 
    'rollup.config.js', 
    'dist/',
    'node_modules/'
  ],
  rules: {
    "semi": [2, "always"],
    'no-use-before-define': 'off',
    // "@typescript-eslint/naming-convention": [
    //   "error",
    //   {
    //     "selector": "interface",
    //     "format": ["PascalCase"],
    //     "custom": {
    //       "regex": "^[A-Z]",
    //       "match": true
    //     }
    //   }
    // ],
    '@typescript-eslint/no-unused-vars': 1,
    '@typescript-eslint/promise-function-async': 2,
    '@typescript-eslint/explicit-function-return-type': 1,
    '@typescript-eslint/no-explicit-any': 2,
    '@typescript-eslint/no-unsafe-argument': 0,
    '@typescript-eslint/explicit-member-accessibility': 'off',
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      "files": ["*.ts", "*.mts", "*.cts", "*.tsx"],
      "rules": {
        "@typescript-eslint/explicit-member-accessibility": [
          "error",
          {
            accessibility: 'explicit',
            overrides: {
              accessors: 'explicit',
              constructors: 'no-public',
              methods: 'explicit',
              properties: 'off',
              parameterProperties: 'explicit'
            }
          }
        ]
      }
    }
  ]
};
