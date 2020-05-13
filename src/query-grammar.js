import parsimmon from 'parsimmon';

const textOperator = (parser) => (
  // Require whitespace or parentheses after e.g. and, or, not
  // Prevents "nota" from parsing as "not a"
  // Also allow whitespace before and after
  parser.lookahead(parsimmon.regexp(/[()\s]/)).trim(parsimmon.optWhitespace)
);

export const sym = {
  // TODO: how to get human-readable expressions for the comparators?
  colon: {type:'comparator', string:':'},
  gt: {type:'comparator', string:'>'},
  ge: {type:'comparator', string:'>='},
  eq: {type:'comparator', string:'='},
  le: {type:'comparator', string:'<='},
  lt: {type:'comparator', string:'<'},
  and: {type:'operator', arity:2, string:'and', func: (a, b) => a && b},
  or: {type:'operator', arity:2, string:'or', func: (a, b) => a || b},
  // TODO: negation should print differently depending on the operand, i.e.:
  // "key does not contain value", "key is not greater than value", "not
  // (parenthetical)". Can this be resolved at parse time? Probably not without
  // expanding the grammar a bunch; might be worth it though.
  not: {type:'operator', arity:1, string:'not', func: (a) => !a},
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
    l.value
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
