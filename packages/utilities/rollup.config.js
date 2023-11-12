const typescript = require("@rollup/plugin-typescript");
const commonjs = require("@rollup/plugin-commonjs");

module.exports = [
  {
    input: "src/index.ts",
    external: ["rxjs"],
    output: {
      file: `dist/index.esm.js`,
      format: "es",
      sourcemap: true
    },
    plugins: [commonjs(), typescript()]
  },
  {
    input: "src/index.ts",
    external: ["rxjs"],
    output: {
      file: `dist/index.cjs.js`,
      format: "cjs",
      sourcemap: true
    },
    plugins: [commonjs(), typescript()]
  }
];
