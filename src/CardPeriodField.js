import { StringPropertyField } from 'crystal-query';
import periodAliases from '../data/cardPeriodStrings.json';

export class CardPeriodField extends StringPropertyField {
  constructor() {
    super('the period', false, 'period', {caseSensitive: false});
  }
  ':'(value) {
    const superField = super[':'](value);
    return {
      status: true,
      describe: superField.describe,
      predicate: (input) => superField.predicate({period: periodAliases[input.period]})
    }
  }
  '='(value) {
    const superField = super['='](value)
    const result = {...superField};
    if (value.length > 1) {
      result.predicate = (input) => superField.predicate({period: periodAliases[input.period]})
    }
    return result;
  }
}
