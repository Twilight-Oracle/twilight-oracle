import allCards from '../static/all-cards.json';
import queryLang from './query-grammar.js';
import { render } from 'preact';
import { html } from 'htm/preact';

// TODO: may no longer need to be async
(async () => {
  // TODO: is DOMContentLoaded needed here
  const resultsElem = document.getElementById('search-results');
  const query = getSearchString();
  const parseResult = queryLang.query.parse(query);
  if (parseResult.status) {
    const ast = parseResult.value;
    const results = Object.entries(allCards).filter(
      ([path, card]) => ast.matches(card)
    );
    render(html`
      <${QueryDescription} text=${ast.text()} count=${results.length} />
      <${SearchResultList} cards=${results} />
      `, resultsElem);
  } else {
    console.error(`Expected ${parseResult.expected}`, parseResult);
  }
})();
function getSearchString() {
  return new URLSearchParams(location.search).get('q');
}

function QueryDescription({text, count}) {
  return html`<div id="query-interpretation">${count} cards where ${text}.</div>`;
}

function SearchResultList({cards}) {
  return html`<ul>
    ${cards.map(
      ([path, card]) => html`<${SearchResult} path=${path} card=${card} />`
    )}
  </ul>`;
}
function SearchResult({path, card}) {
  return html`<li><a href="${path}">${card.title}</a></li>`;
}
