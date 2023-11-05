const typescript = require("@rollup/plugin-typescript");
const commonjs = require("@rollup/plugin-commonjs");

const external = [
  "@grpc/grpc-js",
  "@nestjs/common",
  "@nestjs/core",
  "@nestjs/swagger",
  "@nestjs/microservices",
  "@tsa/utilities",
  "rxjs",
  "node:path",
  "node:fs",
  "node:os",
  "dotenv"
];

module.exports = [
  {
    input: "src/index.ts",
    external,
    output: {
      file: `dist/index.cjs.js`,
      format: "cjs",
      sourcemap: true
    },
    plugins: [commonjs(), typescript()]
  }
];
