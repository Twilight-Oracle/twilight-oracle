import typeAliases from '../data/cardTypeStrings.json';
import * as strUtils from './string-utils.js';

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
    Field.prototype[delegate] = function (value, query) {
      return false;
    }
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

export class CardTypeField extends StringArrayField {
  _contains(value, query) {
    return super._contains(value.flatMap(s => [s, typeAliases[s]], query));
  }
}

export class CardPeriodField extends StringField {
  _contains(value, query) {
    return super._contains(value + ' War', query);
  }
  // TODO: what should war periods compare to, if anything?
  _compare(value, query) {
    return NaN;
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
  getField(prefix) {
    const options = Object.keys(this.fieldsByName).filter(name => name.startsWith(prefix));
    if (options.length === 1) {
      return this.fieldsByName[options[0]];
    } else if (options.length > 1){
      throw new Error(`Ambiguous field name: ${prefix} could be any of ${options}`);
    } else {
      throw new Error(`No such field as ${prefix}`);
    }
  }
  defaultContains(query, obj) {
    return this.defaultFields.some(field => field.contains(query, obj));
  }
}
