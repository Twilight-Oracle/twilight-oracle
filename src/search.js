import allCards from '../static/all-cards.json';
import queryLang from './query-grammar.js';

// TODO: may no longer need to be async
(async () => {
  // TODO: is DOMContentLoaded needed here
  const resultsElem = document.getElementById('search-results');
  const parseResult = queryLang.expression.parse(getSearchString());
  if (parseResult.status) {
    const ast = parseResult.value;
    console.log(ast.text());
    const results = Object.entries(allCards).filter(([path, card]) => ast.matches(card));
    for (let [path, card] of results) {
      const resultElem = createResultElem(path, card);
      resultsElem.appendChild(resultElem);
    }
  } else {
    console.error('failed to parse', parseResult);
  }
})();
function getSearchString() {
  return new URLSearchParams(location.search).get('q');
}
function createResultElem(url, card) {
  if (card === undefined) console.log(url);
  const resultElem = document.getElementById('search-result-template').content.cloneNode(true);
  resultElem.querySelector('a').href = url;
  resultElem.querySelector('a').textContent = card.title;
  return resultElem;
}
