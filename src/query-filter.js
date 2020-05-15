import queryLang, { sym, getTextDescription } from './query-grammar.js';

// Takes a query string and an array of objects
// Returns status, message, and results
// status: boolean: was the query applied
// message: string: if status, then a text description of the query;
//   if not, a text error message
// results: array of objects: if status, then the filtered input;
//   if not, undefined
export default function queryFilter(query, objects) {
  const ast = queryLang.expression.parse(query);
  if (!ast.status) {
    return ast;
  }
  function traverse(tree, key, fallback=v => v) {
    if (Array.isArray(tree)) {
      const [{[key]: func}, ...children] = tree;
      return func(...children.map(child => traverse(child, key, fallback)));
    } else {
      return fallback(tree);
    }
  }
  // return traverse(ast.value, 'textFunc');
  return getTextDescription(ast.value);
}
