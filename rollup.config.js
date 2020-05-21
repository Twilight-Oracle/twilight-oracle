import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/search.js',
  output: {
    file: 'static/search.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    nodeResolve(), commonjs(), json(), terser()
  ]
}
