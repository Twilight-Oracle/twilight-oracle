import parsimmon from 'parsimmon';
import * as nodes from './query-nodes.js';
import Schema, * as fields from './query-schema.js';
import { listJoin } from './string-utils.js';

const schema = new Schema([
  new fields.StringField('name', {names: ['title', 'name']}),
  new fields.NumberField('number'),
  new fields.CardTypeField('types'),
  new fields.NumberField('ops', {names: ['operations', 'ops'], text: 'the ops value'}),
  new fields.CardPeriodField('period'),
  // TODO: differentiate between oracle and printed text and names
  new fields.StringField('content', {names: ['text'], text: 'the text'}),
  new fields.CardSideField('side')
], [
  'name',
  'content',
  'types'
]);

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
  word: () => parsimmon.regexp(/[^"<>=:()\s]+/).desc('a word'),
  quote: () => parsimmon.string('"'),
  phrase: () => parsimmon.alt(
    parsimmon.string('\\"').result('"'),
    parsimmon.regexp(/[^"]/)
  ).many().tie(),
  quoted: (l) => l.phrase.trim(l.quote),
  separator: (l) => parsimmon.alt(l.ge, l.le, l.gt, l.lt, l.eq, l.colon),
  nil: (l) => parsimmon.seq(l.lparen, l.rparen),
  value: (l) => parsimmon.alt(l.word, l.quoted),
  field: (l) => parsimmon.seq(l.word, l.separator).chain(([key, sep]) => {
    const options = schema.getFieldByPrefix(key);
    if (options.length > 1) {
      const names = options.map(field => field.names[0]);
      return parsimmon.fail(`a valid field name (perhaps ${listJoin(names)})`);
    } else if (options.length === 1) {
      return parsimmon.succeed([options[0], sep]);
    } else {
      return parsimmon.fail(`a valid field name`);
    }
  }),
  fullTerm: (l) => parsimmon.seq(l.field, l.value).map(
    ([[field, sep], value]) => new sep(field, value)
  ),
  term: (l) => parsimmon.alt(
    l.fullTerm,
    l.value.map(value => new nodes.Default(schema, value)),
    l.nil.map(() => new nodes.Empty())
  ),
  basic: (l) => parsimmon.alt(
    l.term,
    l.expression.wrap(l.lparen, l.rparen).map(a => new nodes.Parenthetical(a))
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
  expression: (l) => parsimmon.alt(
    l.listConjunction,
    parsimmon.optWhitespace.map(() => new nodes.Empty())
  ),
  query: (l) => l.expression
}

export default parsimmon.createLanguage(parsers);
