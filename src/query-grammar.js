import parsimmon from 'parsimmon';

const textOperator = (parser) => (
  // Require whitespace or parentheses after e.g. and, or, not
  // Prevents "nota" from parsing as "not a"
  // Also allow whitespace before and after
  parser.lookahead(parsimmon.regexp(/[()\s]/)).trim(parsimmon.optWhitespace)
);
const parsers = {
  colon: () => parsimmon.string(':'),
  gt: () => parsimmon.string('>'),
  ge: () => parsimmon.string('>='),
  eq: () => parsimmon.string('='),
  le: () => parsimmon.string('<='),
  lt: () => parsimmon.string('<'),
  and: () => textOperator(parsimmon.string('and')),
  or: () => textOperator(parsimmon.string('or')),
  not: () => textOperator(parsimmon.string('not')),
  lparen: () => parsimmon.string('('),
  rparen: () => parsimmon.string(')'),
  word: () => parsimmon.regexp(/[^"<>=:()\s]+/),
  quoted: () => parsimmon.regexp(/"[^"]*"/),
  separator: (l) => parsimmon.alt(l.ge, l.le, l.gt, l.lt, l.eq, l.colon),
  value: (l) => parsimmon.alt(l.word, l.quoted),
  term: (l) => parsimmon.alt(
    parsimmon.seq(l.word, l.separator, l.value),
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
    parsimmon.seq(l.negation, l.and, l.conjunction),
    l.negation
  ),
  disjunction: (l) => parsimmon.alt(
    parsimmon.seq(l.conjunction, l.or, l.disjunction),
    l.conjunction
  ),
  listConjunction: (l) => parsimmon.alt(
    parsimmon.seq(
      l.disjunction,
      parsimmon.of('&').trim(parsimmon.optWhitespace),
      l.listConjunction
    ),
    l.disjunction
  ),
  expression: (l) => l.listConjunction
}

export default parsimmon.createLanguage(parsers);
