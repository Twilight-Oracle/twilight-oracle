import allCards from '../static/all-cards.json';
import queryLang from './query-grammar.js';
import { render } from 'preact';
import { html } from 'htm/preact';
import { listJoin } from './string-utils.js';
import typeAliases from '../data/cardTypeStrings.json';

// TODO: may no longer need to be async
(async () => {
  // TODO: is DOMContentLoaded needed here
  const resultsElem = document.getElementById('search-results');
  const query = getSearchString();
  const parseResult = queryLang.query.parse(query);
  if (parseResult.status) {
    const ast = parseResult.value;
    let results = [];
    for (let id of Object.keys(allCards)) {
      const matchingVersions = Object.keys(allCards[id]).filter(
        (version) => ast.matches(allCards[id][version])
      );
      if (matchingVersions.length) {
        results.push([id, matchingVersions]);
      }
    }
    results = results.sort(([id1], [id2]) => id1 - id2);
    render(html`
      <${QueryDescription} text=${ast.text()} count=${results.length} />
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

function QueryDescription({text, count}) {
  return html`<div id="query-interpretation">${count} cards where ${text}.</div>`;
}

function SearchResultList({results}) {
  return html`<ul>
    ${results.map(
      ([id, versions]) => html`<${SearchResult} id=${id} matches=${versions} />`
    )}
  </ul>`;
}

function TitleLink({version, id, match}) {
  console.log(id, version ,match);
  const card = allCards[id][version];
  if (card === undefined) {
    return html`[version missing] (${version})`;
  }
  const link = html`<a href=${card.permalink}>${card.title}</a> (${version})`;
  if (match) {
    return html`<strong>${link}</strong>`;
  } else {
    return link;
  }
}

function SearchResult({id, matches}) {
  const oracle = allCards[id].oracle;
  const printed = allCards[id].printed;
  const descriptor = `${oracle.number.toString().padStart(3, '0')}${oracle.period[0]}`;
  const ops = oracle.ops ? `${oracle.ops} Ops ` : '';
  const typelist = oracle.types
    ? ' – ' + oracle.types.map(type => typeAliases[type]).join(', ')
    : '';
  const titleLine = html`
    <${TitleLink} version="oracle" id=${id} match=${matches.includes('oracle')} />
    <span> / </span>
    <${TitleLink} version="printed" id=${id} match=${matches.includes('printed')} />
  `;
  return html`<li>
    <p>${titleLine}</p>
    <p>${ops}${oracle.side} Event${typelist}</p>
  </li>`;
}
