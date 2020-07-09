import { html } from 'htm/preact';
import { renderTypes } from '../utils.js';
import sideAliases from '../../data/cardSideStrings.json';

export function CardTypeLine({card}) {
  return html`
    ${card.ops !== null && html`<span class="card-ops">${card.ops} OPS</span>`}
    ${' '}
    <span class="card-side">${sideAliases[card.side]}</span>
    ${' '}
    Event
    ${card.types.length > 0 && html` – <span class="card-types">
      ${renderTypes(card.types)}
    </span>`}
  `;
}
