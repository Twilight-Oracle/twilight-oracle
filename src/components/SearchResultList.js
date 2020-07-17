import { html } from 'htm/preact';
import { CardBoxSmall } from './CardBoxSmall.js';

export function SearchResultList({results}) {
  return html`<ul class="card-list">
    ${results.map(
      (cards) => html`<${SearchResult} cards=${cards} />`
    )}
  </ul>`;
}

export function SearchResult({cards}) {
  const oracle = cards.filter(c => c.version === 'oracle')[0];
  const printed = cards.filter(c => c.version === 'printed')[0];
  return html`<li>
    <div class="flex-gutter-wrapper">
      <${CardBoxSmall} card=${oracle} />
      <${CardBoxSmall} card=${printed} />
    </div>
  </li>`;
}
