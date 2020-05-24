import * as utils from '../src/string-utils.js';
import expect from 'expect';

describe('indexOf()', function () {
  context('on ascii strings', function () {
    it('should return the first index of the substring', function () {
      const index = utils.indexOf('hello world', 'lo');
      expect(index).toBe(3);
    });
    it('should return -1 when the substring is not present', function () {
      const index = utils.indexOf('hello world', 'a');
      expect(index).toBe(-1);
    });
  });
  context('on strings containing astral code points', function () {
    it('should return the first index of the substring', function () {
      const index = utils.indexOf('some 💩 like js unicode', '💩');
      expect(index).toBe(5);
    });
  });
  context('on strings containing combining characters', function () {

  });
  context('on strings containing diacritics etc', function () {

  });
});
