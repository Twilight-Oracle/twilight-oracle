import { html } from 'htm/preact';

export function QueryDescription({description, count}) {
  return html`
    <p class="query-description">
      <strong class="card-count">${count} cards</strong> where ${description}.
    </p>
  `;
}
