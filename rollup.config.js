import analyze from "rollup-plugin-analyzer";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

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
    nodeResolve({ preferBuiltins: true, exportConditions: ["node"] }),
    json({ compact: true, preferConst: true }), // Allow requiring JSON files, e. g. const json = require('JSON')
    commonjs(),
    typescript(),
    production && terser({ ecma: 2020, format: { comments: false } }), // minify, but only in production
    production && analyze({ summaryOnly: true }),
  ],
};
