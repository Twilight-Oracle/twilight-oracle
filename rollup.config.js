import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: 'src/search.js',
  output: {
    file: 'static/search.js',
    format: 'iife'
  },
  plugins: [
    nodeResolve(), commonjs(), json() 
  ]
}
