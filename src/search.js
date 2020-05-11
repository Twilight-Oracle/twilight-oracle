import lunr from 'lunr';
import parsimmon from 'parsimmon';

async function loadIndex() {
  // TODO: handle fetch errors
  return lunr.Index.load(await (await fetch('/lunr-index.json')).json());
}
function parseSearch(query, cards) {
  const parsers = {
    colon: () => parsimmon.string(':'),
    gt: () => parsimmon.string('>'),
    ge: () => parsimmon.string('>='),
    eq: () => parsimmon.string('='),
    le: () => parsimmon.string('<='),
    lt: () => parsimmon.string('<'),
    and: () => parsimmon.string('and'),
    or: () => parsimmon.string('or'),
    word: () => parsimmon.regexp(/[^"<>=:\s]+/),
    quoted: () => parsimmon.regexp(/"[^"]*"/),
    separator: (l) => parsimmon.alt(l.ge, l.le, l.gt, l.lt, l.eq, l.colon),
    value: (l) => parsimmon.alt(l.word, l.quoted),
    term: (l) => parsimmon.alt(
      parsimmon.seq(l.word, l.separator, l.value),
      l.value
    ),
    list: (l) => l.term.sepBy(parsimmon.whitespace)
  }

  console.log(parsimmon.createLanguage(parsers).list.parse(getSearchString()));
}
(async () => {
  const [idx, allCards] = await Promise.all([loadIndex(), fetch('/all-cards.json').then(r => r.json())]);
  // TODO: is DOMContentLoaded needed here
  const resultsElem = document.getElementById('search-results');
  parseSearch(getSearchString());
  try {
    const results = idx.search(getSearchString());
    console.log(results);
    for (let result of results) {
      const resultElem = createResultElem(result.ref, allCards[result.ref]);
      resultsElem.appendChild(resultElem);
    }
  } catch (e) {
    if (e instanceof lunr.QueryParseError) {
      console.warn('caught a QueryParseError', e);
    } else {
      throw e;
    }
  }
})();
function getSearchString() {
  return new URLSearchParams(location.search).get('q');
}
function createResultElem(url, card) {
  if (card === undefined) console.log(url);
  const resultElem = document.getElementById('search-result-template').content.cloneNode(true);
  resultElem.querySelector('a').href = url;
  resultElem.querySelector('a').textContent = card.title;
  return resultElem;
}
