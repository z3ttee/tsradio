module.exports = {
  root: true,
  ignorePatterns: [
    "projects/**/*",
    "environment/**/*",
    "dist/**/*",
    "node_modules/**/*"
  ],
  env: {
    "es6": true
  },
  overrides: [
    {
      parserOptions: {
        ecmaVersion: "latest",
        project: [
          "tsconfig.json",
          "projects/*/tsconfig.json"
        ]
      },
      files: [
        "*.ts"
      ],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      rules: {
        "semi": [2, "always"],
        'no-use-before-define': 'off',
      }
    },
    {
      files: [
        "*.html"
      ],
      extends: [
        "plugin:@angular-eslint/template/recommended"
      ],
      rules: {}
    }
  ]
};
