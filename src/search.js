import allCards from '../static/all-cards.json';
import queryLang from './query-grammar.js';
import { render } from 'preact';
import { html } from 'htm/preact';
import { listJoin } from './string-utils.js';

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
    console.warn(`Expected ${parseResult.expected}`, parseResult);
    render(html`<${ErrorDescription} query=${query} error=${parseResult} />`, resultsElem);
  }
})();
function getSearchString() {
  return new URLSearchParams(location.search).get('q');
}

function ErrorDescription({query, error: {expected, index: {offset}}}) {
  if (offset >= query.length) {
    query += '\u00a0'; // Non-breaking figure space // TODO: how does htm interact with entities?
  }
  return html`
    <div>
      <style>
        .query-segment {
          white-space: pre;
        }
        #parse-error-location {
          background-color: red;
        }
      </style>
      <span class="query-segment">${query.slice(0, offset)}</span>
      <span class="query-segment" id="parse-error-location">${query[offset]}</span>
      <span class="query-segment">${query.slice(offset + 1)}</span>
    </div>
    <div>Expected ${listJoin(expected)}.</div>
  `;
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
