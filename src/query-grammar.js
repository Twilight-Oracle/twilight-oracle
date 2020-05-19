import parsimmon from 'parsimmon';

const textOperator = (parser) => (
  // Require whitespace or parentheses after e.g. and, or, not
  // Prevents "nota" from parsing as "not a"
  // Also allow whitespace before and after
  parser.lookahead(parsimmon.regexp(/[()\s]/)).trim(parsimmon.optWhitespace)
);

function comparatorText(relation) {
  return (a, b, neg=false) => `where ${t(a)} is ${neg ? 'not' : ''}${relation} ${t(b)}`;
}

export function getTextDescription(tree, neg=false) {
  if (Array.isArray(tree)) {
    const [node, ...children] = tree;
    return node.textFunc(...children, neg);
  } else {
    return tree;
  }
}
const t = getTextDescription;

export function applyFilter(tree, obj) {
  if (Array.isArray(tree)) {
    const [node, ...children] = tree;
    return node.valueFunc(...children, obj);
  } else {
    throw new Error(`tried to apply a non-ast ${JSON.stringify(tree)}`);
  }
}
const v = applyFilter;

(obj) => obj[field] && obj.field > expectation

export const sym = {
  default: {
    type:'comparator', string:'',
    textFunc: (a, neg=false) => `${neg ? 'not ' : ''}containing ${t(a)}`,
    valueFunc: (value, obj) => Object.values(obj).some(v => v.includes && v.includes(value))
  },
  colon: {
    type:'comparator', string:':',
    textFunc: (a, b, neg=false) => `where ${t(a)} ${neg ? 'does not contain' : 'contains'} ${t(b)}`,
    valueFunc: (key, value, obj) => obj[key] && obj[key].includes && obj[key].includes(value)
  },
  gt: {
    type:'comparator', string:'>',
    textFunc: comparatorText('greater than'),
    valueFunc: (key, value, obj) => obj[key] && obj[key] > value
  },
  ge: {
    type:'comparator', string:'>=',
    textFunc: comparatorText('at least'),
    valueFunc: (key, value, obj) => obj[key] && obj[key] >= value
  },
  eq: {
    type:'comparator', string:'=',
    textFunc: (a, b, neg=false) => `where ${t(a)} ${neg ? 'does not equal' : 'equals'} ${t(b)}`,
    // Use of == here is intentional; some type coercion is desired
    // Could specify the coercion more exactly?
    // Note that the other relational comparison operators also coerce
    valueFunc: (key, value, obj) => obj[key] && obj[key] == value
  },
  le: {
    type:'comparator', string:'<=',
    textFunc: comparatorText('at most'),
    valueFunc: (key, value, obj) => obj[key] && obj[key] <= value
  },
  lt: {
    type:'comparator', string:'<',
    textFunc: comparatorText('less than'),
    valueFunc: (key, value, obj) => obj[key] && obj[key] < value
  },
  and: {
    type:'operator', arity:2, string:'and',
    valueFunc: (a, b, obj) => v(a, obj) && v(b, obj),
    textFunc: (a, b, neg=false) => neg ? `not (${t(a)} and ${t(b)})` : `${t(a)} and ${t(b)}`
  },
  or: {
    type:'operator', arity:2, string:'or',
    valueFunc: (a, b, obj) => v(a, obj) || v(b, obj),
    textFunc: (a, b, neg=false) => neg ? `not (${t(a)} or ${t(b)})` : `either ${t(a)} or ${t(b)}`
  },
  not: {
    type:'operator', arity:1, string:'not',
    valueFunc: (a, obj) => !v(a, obj),
    textFunc: (a, neg=false) => t(a, !neg)
  }
}

const parsers = {
  colon: () => parsimmon.string(':').result(sym.colon),
  gt: () => parsimmon.string('>').result(sym.gt),
  ge: () => parsimmon.string('>=').result(sym.ge),
  eq: () => parsimmon.string('=').result(sym.eq),
  le: () => parsimmon.string('<=').result(sym.le),
  lt: () => parsimmon.string('<').result(sym.lt),
  and: () => textOperator(parsimmon.string('and')).result(sym.and),
  or: () => textOperator(parsimmon.string('or')).result(sym.or),
  not: () => textOperator(parsimmon.string('not')).result(sym.not),
  lparen: () => parsimmon.string('('),
  rparen: () => parsimmon.string(')'),
  word: () => parsimmon.regexp(/[^"<>=:()\s]+/),
  quoted: () => parsimmon.regexp(/[^"]*/).trim(parsimmon.string('"')),
  separator: (l) => parsimmon.alt(l.ge, l.le, l.gt, l.lt, l.eq, l.colon),
  value: (l) => parsimmon.alt(l.word, l.quoted),
  term: (l) => parsimmon.alt(
    parsimmon.seq(l.word, l.separator, l.value).map(
      ([key, sep, value]) => [sep, key, value]
    ),
    l.value.map(value => [sym.default, value])
  ),
  basic: (l) => parsimmon.alt(
    l.term,
    l.expression.wrap(l.lparen, l.rparen)
  ),
  negation: (l) => parsimmon.alt(
    parsimmon.seq(l.not, l.negation),
    l.basic
  ),
  conjunction: (l) => parsimmon.alt(
    parsimmon.seq(l.negation, l.and, l.conjunction).map(
      ([a, op, b]) => [op, a, b]
    ),
    l.negation
  ),
  disjunction: (l) => parsimmon.alt(
    parsimmon.seq(l.conjunction, l.or, l.disjunction).map(
      ([a, op, b]) => [op, a, b]
    ),
    l.conjunction
  ),
  listConjunction: (l) => parsimmon.alt(
    parsimmon.seq(
      l.disjunction.skip(parsimmon.optWhitespace),
      l.listConjunction
    ).map(
      ([a, b]) => [sym.and, a, b]
    ),
    l.disjunction
  ),
  expression: (l) => l.listConjunction
}

export default parsimmon.createLanguage(parsers);
