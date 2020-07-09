import { Schema, FieldTermHandler, NumberPropertyField, StringPropertyField } from 'crystal-query';
import { render } from 'preact';
import { html } from 'htm/preact';
import sideAliases from '../data/cardSideStrings.json';
import * as utils from './utils.js';
import { CardTypeField } from './fields/CardTypeField.js';
import { CardContentField } from './fields/CardContentField.js';
import { CardSideField } from './fields/CardSideField.js';
import { CardPeriodField } from './fields/CardPeriodField.js';
import { AnyField } from './fields/AnyField.js';
import { CardBoxSmall } from './components/CardBoxSmall.js';

const fields = {
  number: new NumberPropertyField('the card number', false, 'number'),
  name: new StringPropertyField('the name', false, 'name', {caseSensitive: false}),
  version: new StringPropertyField('the version', false, 'version', {caseSensitive: false}),
  ops: new NumberPropertyField('the operations value', false, 'ops'),
  types: new CardTypeField(),
  oracle: new CardContentField('the oracle text', false, 'plainContent', 'oracle', {caseSensitive: false}),
  printed: new CardContentField('the printed text', false, 'plainContent', 'printed', {caseSensitive: false}),
  side: new CardSideField(),
  period: new CardPeriodField()
};
fields[''] = new AnyField('any field', false, Object.values(fields));

const schema = new Schema({
  termHandler: new FieldTermHandler(fields)
});

(async () => {
  // TODO: is DOMContentLoaded needed here
  const resultsElem = document.getElementById('search-results');
  const query = getSearchString();
  const {status, description, predicate, errors} = schema.query(query);
  console.log(status, description, predicate, errors);
  if (status) {
    let cards = await fetch('/cards/index.json').then(resp => resp.json());
    cards = cards.map(card => { card.match = predicate(card); return card; });
    let groups = utils.groupBy(card => card.number, cards);
    let results = groups.filter(group => group.some(card => card.match));
    results = results.sort((a, b) => a[0].number - b[0].number);
    const cardCount = results.length;
    const versionCount = cards.filter(card => card.match).length;
    render(html`
      <${QueryDescription} text=${description} cardCount=${cardCount} versionCount=${versionCount} />
      <${SearchResultList} results=${results} />
      `, resultsElem);
  } else {
    console.warn(`Errors ${errors}`);
    render(html`<p>${errors.join(', ')}</p>`, resultsElem);
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
    <div>Expected ${utils.listJoin(expected)}.</div>
  `;
}

function QueryDescription({text, cardCount, versionCount}) {
  return html`<div id="query-interpretation">${cardCount} cards (${versionCount} versions) where ${text}.</div>`;
}

function SearchResultList({results}) {
  console.log('SearchResultList', results);
  return html`<ul class="card-list">
    ${results.map(
      (cards) => html`<${SearchResult} cards=${cards} />`
    )}
  </ul>`;
}

function SearchResult({cards}) {
  console.log(cards);
  const oracle = cards.filter(c => c.version === 'oracle')[0];
  const printed = cards.filter(c => c.version === 'printed')[0];
  console.log(oracle, printed);
  return html`<li>
    <div class="flex-gutter-wrapper">
      <${CardBoxSmall} card=${oracle} />
      <${CardBoxSmall} card=${printed} />
    </div>
  </li>`;
}
