import { html } from 'htm/preact';
import { CardTypeLine } from './CardTypeLine.js';

function initialCaptial(word) {
  return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
}

export function CardBoxSmall({card}) {
  return html`
  <a href=${card.permalink} class="card small ${card.version}${card.match ? ' match' : ''}">
    <h2 class="card-titleline">
      <span class="card-number">${String(card.number).padStart(3, '0')}</span>
      -
      <span class="card-period">${card.period}</span>
      ${' '}
      <span class="card-title">${card.name}</span>
      ${' '}
      <span class="card-version">(${initialCaptial(card.version)})</span>
    </h2>
    <p class="card-typeline">
      <${CardTypeLine} card=${card} />
    </p>
    <!-- TODO: find a way to render html from a string without
    dangerouslySetInnerHTML. htm unfortunately does not unescape html entities
    -->
     <!-- TODO: can we at least check subresource integrity on the fetched card
     index? -->
    <div class="card-text" dangerouslySetInnerHTML=${{__html: card.htmlContent}}>
    </div>
  </a>
  `;
}
