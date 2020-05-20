import lunr from 'lunr';
import allCards from '../static/all-cards.json';
import jsonIndex from '../static/lunr-index.json';
import queryLang from './query-grammar.js';

// TODO: may no longer need to be async
(async () => {
  // TODO: is DOMContentLoaded needed here
  const idx = lunr.Index.load(jsonIndex);
  console.log(idx);
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
    console.err('failed to parse', parseResult);
  }

  // try {
  //   const results = idx.search(getSearchString());
  //   console.log(results);
  //   for (let result of results) {
  //     const resultElem = createResultElem(result.ref, allCards[result.ref]);
  //     resultsElem.appendChild(resultElem);
  //   }
  // } catch (e) {
  //   if (e instanceof lunr.QueryParseError) {
  //     console.warn('caught a QueryParseError', e);
  //   } else {
  //     throw e;
  //   }
  // }
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
