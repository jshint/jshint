// Based on https://gist.github.com/mathiasbynens/6334847 by @mathias

'use strict';

var regenerate = require('regenerate');

// Which Unicode version should be used?
var pkg = require('../package.json');
var dependencies = Object.keys(pkg.devDependencies);
var unicodeVersion = dependencies.find((name) => /^unicode-\d/.test(name));
var oldUnicodeVersion = 'unicode-5.2.0';

// Shorthand functions.
var get = function(what) {
  return require(unicodeVersion + '/' + what + '/code-points.js');
};
var getOld = function(what) {
  return require(oldUnicodeVersion + '/' + what + '/code-points.js');
};

// Get the Unicode properties needed to construct the ES6 regex.
var ID_Start = get('Binary_Property/ID_Start');
var ID_Continue = get('Binary_Property/ID_Continue');
var Other_ID_Start = get('Binary_Property/Other_ID_Start');

// Get the Unicode categories needed to construct the ES5 regex.
var Lu = getOld('General_Category/Uppercase_Letter');
var Ll = getOld('General_Category/Lowercase_Letter');
var Lt = getOld('General_Category/Titlecase_Letter');
var Lm = getOld('General_Category/Modifier_Letter');
var Lo = getOld('General_Category/Other_Letter');
var Nl = getOld('General_Category/Letter_Number');
var Mn = getOld('General_Category/Nonspacing_Mark');
var Mc = getOld('General_Category/Spacing_Mark');
var Nd = getOld('General_Category/Decimal_Number');
var Pc = getOld('General_Category/Connector_Punctuation');

var generateData = function() { // ES2015+ with latest Unicode
  // http://mathiasbynens.be/notes/javascript-identifiers#valid-identifier-names
  var identifierStart = regenerate(ID_Start)
    .add('$', '_')
    // remove astral symbols (JSHint-specific; lex.js needs updating)
    .removeRange(0x010000, 0x10FFFF)
    .removeRange(0x0, 0x7F); // remove ASCII symbols (JSHint-specific)
  var identifierPart = regenerate(ID_Continue)
    .add('$', '_', '\u200C', '\u200D')
    // remove ASCII symbols (JSHint-specific)
    .removeRange(0x0, 0x7F)
    // remove astral symbols (JSHint-specific; lex.js needs updating)
    .removeRange(0x010000, 0x10FFFF)
    // just to make sure no `IdentifierStart` code points are repeated here
    .remove(identifierStart);
  return {
    'nonAsciiIdentifierStart': identifierStart.toArray(),
    'nonAsciiIdentifierPart': identifierPart.toArray()
  };
};

// Adapted from https://gist.github.com/mathiasbynens/6334847
var generateES5Regex = function() { // ES 5.1 + Unicode v5.2.0
  // https://mathiasbynens.be/notes/javascript-identifiers#valid-identifier-names
  var identifierStart = regenerate('$', '_')
    .add(Lu, Ll, Lt, Lm, Lo, Nl)
    .removeRange(0x010000, 0x10FFFF); // Remove astral symbols.
  var identifierPart = identifierStart.clone()
    .add('\u200C', '\u200D', Mn, Mc, Nd, Pc)
    .removeRange(0x010000, 0x10FFFF); // Remove astral symbols.

  return '/^(?:' + identifierStart.toString() + ')' +
    '(?:' + identifierPart.toString() + ')*$/';
};

var fs = require('fs');
var writeFile = function(fileName, data) {
  fs.writeFileSync(
    fileName,
    [
    'var str = \'' + data.join(',') + '\';',
    'var arr = str.split(\',\').map(function(code) {',
    '  return parseInt(code, 10);',
    '});',
    'module.exports = arr;'
    ].join('\n')
  );
};

var result = generateData();
writeFile('./data/non-ascii-identifier-start.js', result.nonAsciiIdentifierStart);
writeFile('./data/non-ascii-identifier-part-only.js', result.nonAsciiIdentifierPart);
fs.writeFileSync(
  './data/es5-identifier-names.js',
  'module.exports = ' + generateES5Regex() + ';'
);
