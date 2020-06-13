import periodAliases from '../data/cardPeriodStrings.json';
import sideAliases from '../data/cardSideStrings.json';
import * as strUtils from './string-utils.js';
import * as utils from './utils.js';

/*
  Goal:

  interface Field {
    contains(query: string, obj: object): match[]|false,
    gt, ge, eq, le, lt similarly
  }

  interface match {
    // needs field, location within field,
    // just true is good enough for e.g. Numbers, though
  }
*/

export class Field {
  constructor(ref, {names=[ref], text=`the ${names[0]}`, ...options}={}) {
    this.ref = ref;
    this.names = names;
    this.text = text;
    this.default = options.default;
  }
}
for (let op of ['contains', 'gt', 'ge', 'eq', 'le', 'lt']) {
  const delegate = '_' + op;
  Field.prototype[op] = function (obj, query) {
    const value = this.ref in obj ? obj[this.ref] : this.default;
    if (value === undefined) {
      return false;
    } else {
      return this[delegate](value, query);
    }
  }
  Field.prototype[delegate] = function (value, query) {
    return false;
  }
}

export class ComparableField extends Field {
  _compare(value, query) {
    return NaN;
  }
  _gt(value, query) {
    return this._compare(value, query) > 0;
  }
  _ge(value, query) {
    return this._compare(value, query) >= 0;
  }
  _eq(value, query) {
    return this._compare(value, query) === 0;
  }
  _le(value, query) {
    return this._compare(value, query) <= 0;
  }
  _lt(value, query) {
    return this._compare(value, query) < 0;
  }
}

export class StringField extends ComparableField {
  _contains(value, query) {
    return strUtils.includes(value, query);
  }
  _compare(value, query) {
    return strUtils.compare(value, query);
  }
}

// TODO: could use Intl.Collator's 'numeric' options here... overkill probably
export class NumberField extends ComparableField {
  _contains(value, query) {
    return Number(value) === Number(query);
  }
  _compare(value, query) {
    return Number(value) - Number(query);
  }
}

// TODO: Allow for explicitly, checkably unsupported operations on Fields?
// Currently, they just return false always.

export class StringArrayField extends Field {
  _contains(value, query) {
    return value.some(str => strUtils.includes(str, query));
  }
}

export class CardTypeField {
  constructor(ref, names=[ref], text=`the ${names[0]}`) {
    this.ref = ref;
    this.names = names;
    this.text = text;
    this.wrapped = new StringArrayField('types');
  }
  contains(object, query) {
    return this.wrapped.contains({
      types: utils.renderTypes(object)
    }, query);
  }
}
for (let op of ['gt', 'ge', 'eq', 'le', 'lt']) {
  CardTypeField.prototype[op] = (object, query) => false;
}

export class CardPeriodField extends StringField {
  _contains(value, query) {
    return super._contains(periodAliases[value], query);
  }
  // TODO: what should war periods compare to, if anything?
  _compare(value, query) {
    return NaN;
  }
}

export class CardSideField extends StringField {
  _contains(value, query) {
    if (!(value in sideAliases)) {
      console.log(value);
    }
    return super._contains(sideAliases[value], query);
  }
}

// TODO: class MarkdownField extends StringField {}

export default class Schema {
  constructor(fields, defaults) {
    this.fieldsByRef = {};
    this.fieldsByName = {};
    for (let field of fields) {
      this.fieldsByRef[field.ref] = field;
      for (let name of field.names) {
        this.fieldsByName[name] = field;
      }
    }
    this.defaultFields = defaults.map(ref => this.fieldsByRef[ref]);
  }
  getFieldByPrefix(prefix) {
    return Object.keys(this.fieldsByName)
      .filter(name => name.startsWith(prefix))
      .map(name => this.fieldsByName[name]);
  }
  getFieldByRef(ref) {
    return this.fieldsByRef[ref];
  }
  defaultContains(obj, query) {
    return this.defaultFields.some(field => field.contains(obj, query));
  }
}
