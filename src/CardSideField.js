import { StringPropertyField } from 'crystal-query';
import sideAliases from '../data/cardSideStrings.json';

export class CardSideField extends StringPropertyField {
  constructor() {
    super('the side', false, 'side', {caseSensitive: false});
  }
  ':'(value) {
    const superField = super[':'](value);
    return {
      status: true,
      describe: superField.describe,
      predicate: (input) => superField.predicate({side: sideAliases[input.side]})
    }
  }
  '='(value) {
    const superField = super['='](value);
    return {
      status: true,
      describe: superField.describe,
      predicate: (input) => superField.predicate({side: sideAliases[input.side]})
    }
  }
}
