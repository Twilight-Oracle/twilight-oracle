import { messages } from 'crystal-query';

export class AnyField {
  constructor(name, plural, fields, {
    operators = [':', '>', '>=', '=', '<=', '<'],
    descriptors = {},
    defaultOperator = ':'
  } = {}) {
    this.name = name;
    this.plural = plural;
    this.fields = fields;
    descriptors = Object.assign({
      ':': messages.fieldContains,
      '>': messages.fieldGreaterThan,
      '>=': messages.fieldGreaterOrEqual,
      '=': messages.fieldEquals,
      '<=': messages.fieldLessOrEqual,
      '<': messages.fieldLessThan
    }, descriptors);
    for (let operator of operators) {
      this[operator] = function (value) {
        const results = [];
        for (let field of this.fields) {
          if (operator in field) {
            const result = field[operator](value);
            if (result.status) {
              results.push(result);
            }
          }
        }
        return {
          status: true,
          describe: (negated) =>
            descriptors[operator](this.makeMessageArg({value, negated})),
          predicate: (input) => results.some(({predicate}) => predicate(input))
        };
      }
    }
    if (defaultOperator !== false) {
      this[''] = this[defaultOperator];
    }
  }
  makeMessageArg({value, negated}) {
    return {name: this.name, plural: this.plural, negated, value: `"${value}"`}
  }
}
