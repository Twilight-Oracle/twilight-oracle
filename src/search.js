import lunr from 'lunr';
import queryLang from './query-grammar.js';

async function loadIndex() {
  // TODO: handle fetch errors
  return lunr.Index.load(await (await fetch('/lunr-index.json')).json());
}
function parseSearch(query, cards) {
  console.log(queryLang.expression.parse(getSearchString()));
}
(async () => {
  const [idx, allCards] = await Promise.all([loadIndex(), fetch('/all-cards.json').then(r => r.json())]);
  // TODO: is DOMContentLoaded needed here
  const resultsElem = document.getElementById('search-results');
  parseSearch(getSearchString());
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
