import { StringArrayPropertyField } from 'crystal-query';
import typeAliases from '../../data/cardTypeStrings.json';

export class CardTypeField extends StringArrayPropertyField {
  constructor() {
    super('the types', true, 'types', {caseSensitive: false});
  }
  ':'(value) {
    const superField = super[':'](value);
    return {
      status: true,
      describe: superField.describe,
      predicate: (input) => superField.predicate({
        types: input.types.map(type => typeAliases[type])
      })
    };
  }
}
