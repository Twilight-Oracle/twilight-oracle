const metalsmith = require('metalsmith');
const assert = require('assert');
const path = require('path');
const yaml = require('yaml');

metalsmith(__dirname)
  .source('new-card-data')
  .ignore('000*')
  .destination('content/cards')
  .clean(true)
  .use(normalizeWhitespace)
  // .use(log('contents'))
  .use(splitCards)
  // .use(log('metadata', 'printed', 'oracle'))
  .use(parseFields)
  // .use(log('oracle'))
  .use(normalizeFields)
  // .use(log('metadata', 'printed', 'oracle'))
  .use(splitVersions)
  .use(renderMetadata)
  .build((err) => {
    if (err) throw err;
  })

function log(...fields) {
  return function (files, metalsmith, callback) {
    for (let [path, file] of Object.entries(files)) {
      console.log(path);
      for (let field of fields) {
        console.log(`${field}:`, file[field]);
      }
    }
    setImmediate(callback);
  };
}

function normalizeWhitespace(files, metalsmith, callback) {
  for (let [path, {contents}] of Object.entries(files)) {
    contents = contents.toString();
    contents = contents.replace(/[^\S\n\r]+/g, ' ');
    contents = contents.replace(/[^\S\n\r]*\r?\n/g, '\n');
    files[path].contents = contents;
  }
  setImmediate(callback);
}

function splitCards(files, metalsmith, callback) {
  for (let [path, {contents}] of Object.entries(files)) {
    contents = contents.toString();
    const printIndex = contents.search(/^[^\S\n]+print:.*$/m);
    const oracleIndex = contents.search(/^[^\S\n]+oracle:.*$/m);
    assert(printIndex < oracleIndex, `oracle (${oracleIndex}) before print (${printIndex}) in ${path}`);
    files[path].metadata = contents.substring(0, printIndex);
    files[path].printed = contents.substring(printIndex, oracleIndex);
    files[path].oracle = contents.substring(oracleIndex);
  }
  setImmediate(callback);
}

function parseFields(files, metalsmith, callback) {
  for (let [path, {metadata, printed, oracle}] of Object.entries(files)) {
    let parsedMetadata = {};
    for (let line of metadata.split('\n')) {
      parsedMetadata = {...parsedMetadata, ...parseField(line)};
    }
    const [printField, printContent] = splitFirstLine(printed);
    const [oracleField, oracleContent] = splitFirstLine(oracle);
    parsedMetadata = {
      ...parsedMetadata,
      ...parseField(printField),
      ...parseField(oracleField)
    };
    files[path].metadata = parsedMetadata;
    files[path].printed = printContent.trim() + '\n';
    files[path].oracle = oracleContent.trim() + '\n';
  }
  setImmediate(callback);
}

function splitFirstLine(string) {
  const newlineIndex = string.indexOf('\n');
  if (newlineIndex === -1) {
    return [string, ''];
  } else {
    return [string.substring(0, newlineIndex), string.substring(newlineIndex + 1)];
  }
}

function parseField(string) {
  const separator = string.indexOf(':');
  if (separator === -1) {
    return {};
  } else {
    const name = string.substring(0, separator).trim();
    const value = string.substring(separator + 1).trim();
    return {[name]: value};
  }
}

function normalizeFields(files, metalsmith, callback) {
  for (let [path, {metadata, printed, oracle}] of Object.entries(files)) {
    function getDefault(object, property, bad, def) {
      return bad.includes(object[property]) ? def : object[property];
    }
    function toBoolean(string) {
      return string === 'true';
    }
    const normalized = {};
    normalized.metadata = {
      number: Number(metadata.number),
      period: metadata.period,
      side: metadata.side,
      ops: ['-', ''].includes(metadata.OPS) ? null : Number(metadata.OPS),
      scoring: toBoolean(metadata.scoring),
      war: toBoolean(metadata.war),
      unique: toBoolean(metadata.unique),
      continuous: toBoolean(metadata.continuous)
    }
    normalized.printed = {
      name: metadata.name,
      image: metadata.print,
      contents: printed
    };
    normalized.oracle = {
      name: getDefault(metadata, '^name', ['-', ''], normalized.printed.name),
      image: getDefault(metadata, '^src', ['-', ''], normalized.printed.image),
      contents: oracle
    }
    files[path] = normalized;
  }
  setImmediate(callback);
}

function splitVersions(files, metalsmith, callback) {
  for (let [filepath, {metadata, printed, oracle}] of Object.entries(files)) {
    delete files[filepath];
    const basename = slug(metadata.number, metadata.period, printed.name);
    files[path.join(basename, 'printed.md')] = {...metadata, ...printed};
    files[path.join(basename, 'oracle.md')] = {...metadata, ...oracle};
  }
  setImmediate(callback);
}

function slug(number, period, name) {
  number = number.toString().padStart(3, '0');
  period = period.toLowerCase();
  name = name.toLowerCase()
    .replace(/^[^a-z]*/, '')
    .replace(/[^a-z]*$/, '')
    .replace(/[^a-z]+/g, '-');
  return `${number}`;
}

function renderMetadata(files, metalsmith, callback) {
  for (let [filepath, file] of Object.entries(files)) {
    const meta = {...file};
    delete meta.contents;
    file.contents = `---\n${yaml.stringify(meta)}---\n${file.contents}`;
  }
  setImmediate(callback);
}
