import lunr from 'lunr';
import queryLang from './query-grammar.js';
import allCards from '../static/all-cards.json';
import jsonIndex from '../static/lunr-index.json';
import queryFilter from './query-filter.js';

function parseSearch(query, cards) {
  console.log(queryLang.expression.parse(getSearchString()));
}
// TODO: may no longer need to be async
(async () => {
  // TODO: is DOMContentLoaded needed here
  const idx = lunr.Index.load(jsonIndex);
  console.log(idx);
  const resultsElem = document.getElementById('search-results');
  parseSearch(getSearchString());
  console.log(queryFilter(getSearchString()));
  try {
    const results = idx.search(getSearchString());
    console.log(results);
    for (let result of results) {
      const resultElem = createResultElem(result.ref, allCards[result.ref]);
      resultsElem.appendChild(resultElem);
    }
  } catch (e) {
    if (e instanceof lunr.QueryParseError) {
      console.warn('caught a QueryParseError', e);
    } else {
      throw e;
    }
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
