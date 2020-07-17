import { html } from 'htm/preact';

export function QueryDescription({description, count}) {
  return html`
    <p class="query-description">
      <strong>${count} cards</strong> where ${description}.
    </p>
  `;
}
