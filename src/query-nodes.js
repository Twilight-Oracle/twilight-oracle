export class Default {
  constructor(value) {
    this.value = value;
  }
  text(negated=false) {
    return `which ${negated ? 'do not ' : ''}contain ${this.value}`;
  }
  matches(obj) {
    return Object.values(obj).some(v => v.includes && v.includes(this.value));
  }
}

export class Colon {
  constructor(field, value) {
    this.field = field;
    this.value = value;
  }
  text(negated=false) {
    if (negated) {
      return `where ${this.field} does not contain ${this.value}`;
    } else {
      return `where ${this.field} contains ${this.value}`;
    }
  }
  matches(obj) {
    return (
      obj[this.field]
      && obj[this.field].includes
      && obj[this.field].includes(this.value)
    );
  }
}

class Comparator {
  constructor(field, value) {
    this.field = field;
    this.value = value;
  }
  text(negated=false) {
    const verb = negated ? 'is not' : 'is';
    return `where ${this.field} ${verb} ${this.textComp} ${this.value}`;
  }
}

export class GreaterThan extends Comparator {
  constructor(field, value) {
    super(field, value);
    this.textComp = 'greater than';
  }
  matches(obj) {
    return obj[this.field] && obj[this.field] > this.value;
  }
}

export class GreaterOrEqual extends Comparator {
  constructor(field, value) {
    super(field, value);
    this.textComp = 'at least';
  }
  matches(obj) {
    return obj[this.field] && obj[this.field] >= this.value;
  }
}

export class Equal extends Comparator {
  constructor(field, value) {
    super(field, value);
  }
  text(negated=false) {
    if (negated) {
      return `where ${this.field} does not equal ${this.value}`;
    } else {
      return `where ${this.field} equals ${this.value}`;
    }
  }
  matches(obj) {
    return obj[this.field] && obj[this.field] == this.value;
  }
}

export class LessOrEqual extends Comparator {
  constructor(field, value) {
    super(field, value);
    this.textComp = 'at most';
  }
  matches(obj) {
    return obj[this.field] && obj[this.field] <= this.value;
  }
}

export class LessThan extends Comparator {
  constructor(field, value) {
    super(field, value);
    this.textComp = 'less than';
  }
  matches(obj) {
    return obj[this.field] && obj[this.field] < this.value;
  }
}

export class And {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
  text(negated=false) {
    if (negated) {
      return `not (${this.a.text()} and ${this.b.text()}`;
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
      return `not (${this.a.text()} or ${this.b.text()}`;
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
