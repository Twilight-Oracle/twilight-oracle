import queryLang from './query-grammar.js';
import { render } from 'preact';
import { html } from 'htm/preact';
import { listJoin } from './string-utils.js';
import sideAliases from '../data/cardSideStrings.json';
import * as utils from './utils.js';

(async () => {
  // TODO: is DOMContentLoaded needed here
  const resultsElem = document.getElementById('search-results');
  const query = getSearchString();
  const parseResult = queryLang.query.parse(query);
  if (parseResult.status) {
    const ast = parseResult.value;
    let cards = await fetch('/cards/index.json').then(resp => resp.json());
    cards = cards.map(card => { card.match = ast.matches(card); return card; });
    let groups = utils.groupBy(card => card.number, cards);
    let results = groups.filter(group => group.some(card => card.match));
    results = results.sort((a, b) => a[0].number - b[0].number);
    const cardCount = results.length;
    const versionCount = cards.filter(card => card.match).length;
    render(html`
      <${QueryDescription} text=${ast.text()} cardCount=${cardCount} versionCount=${versionCount} />
      <${SearchResultList} results=${results} />
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

function QueryDescription({text, cardCount, versionCount}) {
  return html`<div id="query-interpretation">${cardCount} cards (${versionCount} versions) where ${text}.</div>`;
}

function SearchResultList({results}) {
  console.log('SearchResultList', results);
  return html`<ul>
    ${results.map(
      (cards) => html`<${SearchResult} cards=${cards} />`
    )}
  </ul>`;
}

function TitleLink({card}) {
  const link = html`<a href=${card.permalink}>${card.name}</a> (${card.version})`;
  if (card.match) {
    return html`<strong>${link}</strong>`;
  } else {
    return link;
  }
}

function SearchResult({cards}) {
  console.log(cards);
  const oracle = cards.filter(c => c.version === 'oracle')[0];
  const printed = cards.filter(c => c.version === 'printed')[0];
  console.log(oracle, printed);
  const descriptor = `${oracle.number.toString().padStart(3, '0')}${oracle.period[0]}`;
  const ops = oracle.ops ? `${oracle.ops} Ops ` : '';
  const types = utils.renderTypes(oracle);
  const typelist = types.length > 0
    ? ' – ' + types.join(', ')
    : '';
  const titleLine = html`
    <${TitleLink} card=${oracle} />
    <span> / </span>
    <${TitleLink} card=${printed} />
  `;
  return html`<li>
    <p>${titleLine}</p>
    <p>${ops}${sideAliases[oracle.side]} Event${typelist}</p>
  </li>`;
}
