import typeAliases from '../data/cardTypeStrings.json';

export function renderTypes(card) {
  return Object.entries(card).flatMap(
    ([k, v]) => ((k in typeAliases) && v) ? [typeAliases[k]] : []
  );
}
