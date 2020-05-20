import parsimmon from 'parsimmon';
import * as nodes from './query-nodes.js';

const textOperator = (parser) => (
  // Require whitespace or parentheses after e.g. and, or, not
  // Prevents "nota" from parsing as "not a"
  // Also allow whitespace before and after
  parser.lookahead(parsimmon.regexp(/[()\s]/)).trim(parsimmon.optWhitespace)
);

const parsers = {
  colon: () => parsimmon.string(':').result(nodes.Colon),
  gt: () => parsimmon.string('>').result(nodes.GreaterThan),
  ge: () => parsimmon.string('>=').result(nodes.GreaterOrEqual),
  eq: () => parsimmon.string('=').result(nodes.Equal),
  le: () => parsimmon.string('<=').result(nodes.LessOrEqual),
  lt: () => parsimmon.string('<').result(nodes.LessThan),
  and: () => textOperator(parsimmon.string('and')).result(nodes.And),
  or: () => textOperator(parsimmon.string('or')).result(nodes.Or),
  not: () => textOperator(parsimmon.string('not')).result(nodes.Not),
  lparen: () => parsimmon.string('('),
  rparen: () => parsimmon.string(')'),
  word: () => parsimmon.regexp(/[^"<>=:()\s]+/),
  quoted: () => parsimmon.regexp(/[^"]*/).trim(parsimmon.string('"')),
  separator: (l) => parsimmon.alt(l.ge, l.le, l.gt, l.lt, l.eq, l.colon),
  value: (l) => parsimmon.alt(l.word, l.quoted),
  term: (l) => parsimmon.alt(
    parsimmon.seq(l.word, l.separator, l.value).map(
      ([key, sep, value]) => new sep(key, value)
    ),
    l.value.map(value => new nodes.Default(value))
  ),
  basic: (l) => parsimmon.alt(
    l.term,
    l.expression.wrap(l.lparen, l.rparen)
  ),
  negation: (l) => parsimmon.alt(
    parsimmon.seq(l.not, l.negation).map(
      ([op, child]) => new op(child)
    ),
    l.basic
  ),
  conjunction: (l) => parsimmon.alt(
    parsimmon.seq(l.negation, l.and, l.conjunction).map(
      ([a, op, b]) => new op(a, b)
    ),
    l.negation
  ),
  disjunction: (l) => parsimmon.alt(
    parsimmon.seq(l.conjunction, l.or, l.disjunction).map(
      ([a, op, b]) => new op(a, b)
    ),
    l.conjunction
  ),
  listConjunction: (l) => parsimmon.alt(
    parsimmon.seq(
      l.disjunction.skip(parsimmon.optWhitespace),
      l.listConjunction
    ).map(
      ([a, b]) => new nodes.And(a, b)
    ),
    l.disjunction
  ),
  expression: (l) => l.listConjunction
}

export default parsimmon.createLanguage(parsers);
