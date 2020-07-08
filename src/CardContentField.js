import { StringPropertyField } from 'crystal-query';

export class CardContentField extends StringPropertyField {
  constructor(name, plural, property, version, {caseSensitive=true}={}) {
    super(name, plural, property, {caseSensitive});
    this.version = version;
  }
  ':'(value) {
    const superField = super[':'](value);
    return {
      status: true,
      describe: superField.describe,
      predicate: (input) => (input.version === this.version && superField.predicate(input))
    }
  }
  '='(value) {
    const superField = super['='](value);
    return {
      status: true,
      describe: superField.describe,
      predicate: (input) => (input.version === this.version && superField.predicate(input))
    }
  }
}
