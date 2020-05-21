import typeAliases from '../data/cardTypeStrings.json';

class Field {
  constructor(ref, names=[ref], text='the '+names[0]) {
    this.ref = ref;
    this.names = names;
    this.text = text;
  }
  queryTransform(query) {
    return query;
  }
  valueTransform(value) {
    return value;
  }
  contains(query, obj) {
    return (
      obj[this.ref]
      && this.valueTransform(obj[this.ref]).includes
      && this.valueTransform(obj[this.ref]).includes(this.queryTransform(query))
    );
  }
  gt(query, obj) {
    return (obj[this.ref] && this.valueTransform(obj[this.ref]) > this.queryTransform(query));
  }
  ge(query, obj) {
    return (obj[this.ref] && this.valueTransform(obj[this.ref]) >= this.queryTransform(query));
  }
  eq(query, obj) {
    return (obj[this.ref] && this.valueTransform(obj[this.ref]) == this.queryTransform(query));
  }
  le(query, obj) {
    return (obj[this.ref] && this.valueTransform(obj[this.ref]) <= this.queryTransform(query));
  }
  lt(query, obj) {
    return (obj[this.ref] && this.valueTransform(obj[this.ref]) < this.queryTransform(query));
  }
}

class StringField extends Field {
  queryTransform(query) {
    return query.toLowerCase();
  }
  valueTransform(value) {
    return value.toLowerCase();
  }
}

class NumberField extends Field {
  queryTransform(query) {
    return Number(query);
  }
  valueTransform(value) {
    return Number(value);
  }
}

class UnsupportedOperationError extends Error {}

function unsupportedOperation() {
  throw new UnsupportedOperationError();
}

class StringArrayField extends Field {
  queryTransform(query) {
    return query.toLowerCase();
  }
  valueTransform(value) {
    return value.map(str => str.toLowerCase());
  }
  contains(query, obj) {
    if (obj[this.ref]) {
      query = this.queryTransform(query);
      const value = this.valueTransform(obj[this.ref]);
      return value.some(str => str.includes(query));
    }
  }
  gt = unsupportedOperation
  ge = unsupportedOperation
  eq = unsupportedOperation
  le = unsupportedOperation
  lt = unsupportedOperation
}

class CardTypeField extends StringArrayField {
  valueTransform(value) {
    return super.valueTransform(value.flatMap(str => [str, typeAliases[str]]));
  }
}

class ArrayField extends Field {
  constructor(wrappedField) {
    super(wrappedField.ref, wrappedField.names);
    this.wrappedField = wrappedField;
  }
  queryTransform(query) {
    return wrappedField.queryTransform(query);
  }
  valueTransform(value) {
    return value.map(item => wrappedField.valueTransform(item));
  }
  contains(query, obj) {
    if (obj[this.ref]) {
      query = this.queryTransform(query);
      const value = this.valueTransform(obj[this.ref]);
      // TODO: Awkward
      return value.some(value => wrappedField.contains(query, {[this.ref]: value}));
    }
  }
  gt = unsupportedOperation
  ge = unsupportedOperation
  eq = unsupportedOperation
  le = unsupportedOperation
  lt = unsupportedOperation
}

class CardPeriodField extends StringField {
  valueTransform(value) {
    return super.valueTransform(value + ' War');
  }
}

// TODO: class MarkdownField extends StringField {}

class Schema {
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

export default new Schema([
  new StringField('title', ['title', 'name']),
  new NumberField('number'),
  new CardTypeField('types', ['types']),
  new NumberField('ops', ['operations', 'ops']),
  new CardPeriodField('period'),
  // TODO: differentiate between oracle and printed text and names
  new StringField('contents', ['oracle', 'printed', 'contents'], 'the text')
], [
  'title',
  'contents',
  'types'
]);
