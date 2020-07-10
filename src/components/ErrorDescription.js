import { html } from 'htm/preact';

export function ErrorDescription({error}) {
  if (error.type === 'field') {
    return FieldError({...error});
  } else if (error.type === 'syntax') {
    return SyntaxError({...error});
  } else {
    console.error('unknown type of query error', error);
    return false;
  }
}

export function FieldError({start, end, value, message}) {
  return html`
    <p class="query-error error-type-field">
      Malformed field '${value}': ${message}
    </p>
  `;
}

export function SyntaxError({subtype, index: {offset, line, column}, expected}) {
  return html`
    <p class="query-error error-type-field">
      Syntax error: ${subtype}
    </p>
  `;
}
