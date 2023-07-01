import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

// `npm run build` -> `production` is true
// `npm run watch` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    json(), // Allow requiring JSON files, e. g. const json = require('JSON')
    typescript(),
    production && terser({ format: { comments: false } }), // minify, but only in production
  ],
};
