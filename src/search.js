import { Schema, FieldTermHandler, NumberPropertyField, StringPropertyField } from 'crystal-query';
import { render } from 'preact';
import { html } from 'htm/preact';
import sideAliases from '../data/cardSideStrings.json';
import * as utils from './utils.js';
import { CardTypeField } from './fields/CardTypeField.js';
import { CardSideField } from './fields/CardSideField.js';
import { CardPeriodField } from './fields/CardPeriodField.js';
import { AnyField } from './fields/AnyField.js';
import { ErrorDescription } from './components/ErrorDescription.js';
import { QueryDescription } from './components/QueryDescription.js';
import { SearchResultList } from './components/SearchResultList.js';

const fields = {
  number: new NumberPropertyField('the card number', false, 'number'),
  name: new StringPropertyField('the name', false, 'name', {caseSensitive: false}),
  version: new StringPropertyField('the version', false, 'version', {caseSensitive: false}),
  ops: new NumberPropertyField('the operations value', false, 'ops'),
  types: new CardTypeField(),
  text: new StringPropertyField('the text', false, 'plainContent', {caseSensitive: false}),
  side: new CardSideField(),
  period: new CardPeriodField()
};
fields[''] = new AnyField('any field', false, Object.values(fields));

const schema = new Schema({
  termHandler: new FieldTermHandler(fields)
});

function showSyntax() {
  document.getElementById('search-syntax').style.display = 'block';
}

function getSearchString() {
  return new URLSearchParams(location.search).get('q');
}

const resultsElem = document.getElementById('search-results');
const searchInput = document.getElementById('search-text-input');
const query = getSearchString();

if (query === null) {
  showSyntax();
} else {
  searchInput.value = query;
  const cardsP = fetch('/cards/index.json').then(resp => resp.json());
  const {status, description, predicate, errors} = schema.query(query);
  if (!status) {
    render(
      html`${errors.map(error => ErrorDescription({error}))}`,
      resultsElem
    );
    showSyntax();
  } else {
    (async () => {
      const cards = (await cardsP).map(card => {
        card.match = predicate(card);
        return card;
      });
      const groups = utils.groupBy(card => card.number, cards);
      const results = groups
        .filter(group => group.some(card => card.match))
        .sort((a, b) => a[0].number - b[0].number);
      const count = results.length;
      render(
        html`
          <${QueryDescription} description=${description} count=${count} />
          <${SearchResultList} results=${results} />
        `,
        resultsElem
      );
    })();
  }
}
