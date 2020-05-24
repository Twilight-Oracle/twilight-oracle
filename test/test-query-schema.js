import Schema, * as fields from '../src/query-schema.js';
import expect from 'expect';

describe('Fields', function () {
  describe('StringField', function () {
    const field = new fields.StringField('str');
    describe('#contains()', function () {
      it('should contain substrings', function () {
        expect(field.contains({str: 'hello world'}, 'llo ')).toBe(true);
      });
      it('should not contain other strings', function () {
        expect(field.contains({str: 'hello world'}, '42')).toBe(false);
      });
    });
    describe('comparison operations', function () {
      it('should compare lexicographically', function () {
        expect(field.lt({str: '10'}, '9')).toBe(true);
      });
    });
  });

  describe('NumberField', function () {
    const field = new fields.NumberField('num');
    describe('#contains()', function () {
      it('should contain equal numbers', function () {
        expect(field.contains({num:'101.0'}, '101')).toBe(true);
      });
      it('should not contain unequal numbers', function () {
        expect(field.contains({num:'101.0'}, '01')).toBe(false);
      });
    });
    describe('comparison operations', function () {
      it('should compare numerically', function () {
        expect(field.lt({num: '10'}, '9')).toBe(false);
      });
    });
  });

  describe('StringArrayField', function () {
    const field = new fields.StringArrayField('arr');
    describe('#contains()', function () {
      it('should contain substrings of its elements', function () {
        expect(field.contains({arr: ['hello', 'world']}, 'orl')).toBe(true);
      });
      it('should not contain other strings', function () {
        expect(field.contains({arr: ['hello', 'world']}, 'low')).toBe(false);
      });
    });
  });
});
