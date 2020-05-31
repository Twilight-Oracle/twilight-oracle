// This is an attempt to abstract out certain string functions, so that
// different implementations can be swapped in the future, after testing for
// e.g. unicode compatibility, performance.

export function indexOf(string, substring, first=0) {
  [string, substring] = [string.toUpperCase(), substring.toUpperCase()];
  return string.indexOf(substring, first);
}

export function* indicesIterator(string, substring) {
  let index;
  while (index !== -1) {
    index = indexOf(string, substring, index);
    yield index;
  }
}

export function allIndices(string, substring) {
  return [...indicesIterator(string, substring)];
}

export function compare(string1, string2) {
  [string1, string2] = [string1.toUpperCase(), string2.toUpperCase()];
  if (string1 < string2) {
    return -1;
  } else if (string1 > string2) {
    return 1;
  } else {
    return 0;
  }
}

export function includes(string, substring) {
  return indexOf(string, substring) !== -1;
}

export function stringEscape(string) {
  return string.replace(/"/g, '\\"');
}

export function stringRepr(string) {
  console.log(string);
  return `"${stringEscape(string)}"`;
}

export function listJoin(strings) {
  if (strings.length < 2) {
    return strings.join('');
  } else if (strings.length == 2) {
    return strings.join(' or ');
  } else {
    return (
      strings.slice(0, -1).join(', ')
      + ', or '
      + strings[strings.length - 1]
    );
  }
}
