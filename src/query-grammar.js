import parsimmon from 'parsimmon';
import * as nodes from './query-nodes.js';
import schema from './query-schema.js';

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
  field: (l) => parsimmon.seq(l.word, l.separator).chain(([key, sep]) => {
    try {
      return parsimmon.succeed([schema.getField(key), sep]);
    } catch (e) {
      return parsimmon.fail(e.message);
    }
  }),
  fullTerm: (l) => parsimmon.seq(l.field, l.value).map(
    ([[field, sep], value]) => new sep(field, value)
  ),
  term: (l) => parsimmon.alt(
    l.fullTerm,
    l.value.map(value => new nodes.Default(value, schema))
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
