import { stringRepr } from './string-utils.js';

/*
  interface Node: {
    text(negated: boolean): string,
    matches(obj: object): boollean
  }
*/

export class Default {
  constructor(schema, value) {
    this.value = value;
    this.schema = schema;
  }
  text(negated=false) {
    const value = stringRepr(this.value);
    return `the card ${negated ? 'does not contain' : 'contains'} ${value}`;
  }
  matches(obj) {
    return this.schema.defaultContains(obj, this.value);
  }
}

export class Colon {
  constructor(field, value) {
    this.field = field;
    this.value = value;
  }
  text(negated=false) {
    const value = stringRepr(this.value);
    if (negated) {
      return `${this.field.text} does not contain ${value}`;
    } else {
      return `${this.field.text} contains ${value}`;
    }
  }
  matches(obj) {
    return this.field.contains(obj, this.value);
  }
}

// An abstract base class, kinda
class Comparator {
  constructor(field, value) {
    this.field = field;
    this.value = value;
  }
  text(negated=false) {
    const value = stringRepr(this.value);
    const verb = negated ? 'is not' : 'is';
    return `${this.field.text} ${verb} ${this.textComp} ${value}`;
  }
}

export class GreaterThan extends Comparator {
  constructor(field, value) {
    super(field, value);
    this.textComp = 'greater than';
  }
  matches(obj) {
    return this.field.gt(obj, this.value);
  }
}

export class GreaterOrEqual extends Comparator {
  constructor(field, value) {
    super(field, value);
    this.textComp = 'at least';
  }
  matches(obj) {
    return this.field.ge(obj, this.value);
  }
}

export class Equal extends Comparator {
  constructor(field, value) {
    super(field, value);
  }
  text(negated=false) {
    if (negated) {
      return `${this.field.text} is not "${this.value}"`;
    } else {
      return `${this.field.text} is "${this.value}"`;
    }
  }
  matches(obj) {
    return this.field.eq(obj, this.value);
  }
}

export class LessOrEqual extends Comparator {
  constructor(field, value) {
    super(field, value);
    this.textComp = 'at most';
  }
  matches(obj) {
    return this.field.le(obj, this.value);
  }
}

export class LessThan extends Comparator {
  constructor(field, value) {
    super(field, value);
    this.textComp = 'less than';
  }
  matches(obj) {
    return this.field.lt(obj, this.value);
  }
}

export class And {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
  text(negated=false) {
    if (negated) {
      // TODO: due to operator precedence, this _should_ be unreachable
      return `not (${this.a.text()} and ${this.b.text()})`;
    } else {
      return `${this.a.text()} and ${this.b.text()}`;
    }
  }
  matches(obj) {
    return this.a.matches(obj) && this.b.matches(obj);
  }
}

export class Or {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
  text(negated=false) {
    if (negated) {
      // TODO: due to operator precedence, this _should_ be unreachable
      return `not (${this.a.text()} or ${this.b.text()})`;
    } else {
      return `${this.a.text()} or ${this.b.text()}`;
    }
  }
  matches(obj) {
    return this.a.matches(obj) && this.b.matches(obj);
  }
}

export class Not {
  constructor(a) {
    this.a = a;
  }
  text(negated=false) {
    return this.a.text(!negated);
  }
  matches(obj) {
    return !this.a.matches(obj);
  }
}

export class Parenthetical {
  constructor(a) {
    this.a = a;
  }
  text(negated=false) {
    return `${negated ? 'not ': ''}(${this.a.text()})`;
  }
  matches(obj) {
    return this.a.matches(obj);
  }
}

// TODO: alternatively, instead of being always false, Empty could 'not affect'
// any logical construct it's in. So, X and Empty is X, X or Empty is X, not
// Empty is Empty. This would make "not ()" somewhat more intuitive. Or, ()
// could just be a parse error.
export class Empty {
  text(negated=false) {
    return negated ? 'not ()' : '()';
  }
  matches(obj) {
    return false;
  }
}
