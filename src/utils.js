import typeAliases from '../data/cardTypeStrings.json';

export function renderTypes(card) {
  return Object.entries(card).flatMap(
    ([k, v]) => ((k in typeAliases) && v) ? [typeAliases[k]] : []
  );
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
