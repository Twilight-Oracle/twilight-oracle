import typeAliases from '../data/cardTypeStrings.json';

export function renderTypes(types) {
  return types.map(type => typeAliases[type]).join(', ');
}

export function groupBy(fn, iterable) {
  const groups = new Map();
  for (let item of iterable) {
    const key = fn(item);
    if (groups.has(key)) {
      groups.get(key).push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return [...groups.values()];
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
