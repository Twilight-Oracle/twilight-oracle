import queryLang from '../src/query-grammar.js';
import expect from 'expect';

describe('query grammar', function () {
  const cases = {
    'a': true,
    'abc': true,
    'ab:cd': true,
    '"a"': true,
    '"abc"': true,
    'ab:"cd"': true,
    '"ab":cd': false,
    '(a)': true,
    'a b c': true,
    '(a b) c': true,
    'a"b"': false,
    'a and b': true, // TODO: more precise check
    'a or b': true,
    'not a': true,
    '(a)(b)': true,
    '(a)not(b)': true, // TODO: is this the desired syntax?
    ':': false,
    '":"': true,
    'a:":"': true,
    'a":"': false
  }

  for (let [input, expectation] of Object.entries(cases)) {
    it(`should ${expectation ? 'accept' : 'reject'} ${input}`, function () {
      const result = queryLang.expression.parse(input);
      expect(result).toHaveProperty('status', expectation);
    });
  }
});
