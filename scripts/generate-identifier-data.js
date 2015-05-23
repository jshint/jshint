// Based on https://gist.github.com/mathiasbynens/6334847 by @mathias

'use strict';

var regenerate = require('regenerate');

// Which Unicode version should be used?
var version = '6.3.0'; // note: also update `package.json` when this changes

// Shorthand function
var get = function(what) {
  return require('unicode-' + version + '/' + what + '/code-points');
};

var zipArray = function(arr) {
  var result = [];
  var i;
  for (i = 0; i < arr.length; i++) {
    if (arr[i] + 1 === arr[i + 1]) {
      var start = arr[i];
      var n = 0;
      while (arr[i] + 1 === arr[i + 1]) {
        n++;
        i++;
      }
      result.push(start.toString(36) + "-" + n.toString(36));
    } else {
      result.push(arr[i].toString(36));
    }
  }
  return result;
};

// Unicode properties needed to construct the valid code points list
var ID_Start = get('properties/ID_Start');
var Other_ID_Start = get('properties/Other_ID_Start');
var ID_Continue = get('properties/ID_Continue');
var Other_ID_Continue = get('properties/Other_ID_Continue');

var generateData = function() {
  var ascii = regenerate().addRange(0x0, 0x7F);
  var astral = regenerate().addRange(0x10000, 0x10FFFF);

  var identifierStart = regenerate(ID_Start, Other_ID_Start)
    .remove(ascii);
  var identifierPart = regenerate(0x200c, 0x200d, ID_Continue, Other_ID_Continue)
    .remove(ascii);

  // BMP: Basic Multilingual Plane -> Code points from 0x0000 to 0xFFFF
  // Supported by ES5 and ES6 using the \uXXXX
  var identifierStartBMP = identifierStart.clone()
    .remove(astral);
  var identifierPartBMP = identifierPart.clone()
    .remove(astral).remove(identifierStartBMP);

  // astral -> Code points from 0x10000 to 0x10FFFF
  // Suppertd by ES6 using the \u{XXXXXX} notation.
  var identifierStartAstral = identifierStart.clone()
    .intersection(astral);
  var identifierPartAstral = identifierPart.clone()
    .intersection(astral).remove(identifierStartAstral);

  return {
    start: {
      BMP: identifierStartBMP.toArray(),
      astral: identifierStartAstral.toArray()
    },
    part: {
      BMP: identifierPartBMP.toArray(),
      astral: identifierPartAstral.toArray()
    }
  };
};

var fs = require('fs');
var writeFile = function(fileName, data) {
  fs.writeFileSync(
    fileName,
    [
      'var data = {',
      '  BMP: \'' + zipArray(data.BMP).join(',') + '\',',
      '  astral: \'' + zipArray(data.astral).join(',') + '\'',
      '};',
      'function toArray(data) {',
      '  var result = [];',
      '  data.split(\',\').forEach(function (ch) {',
      '    var range = ch.split(\'-\');',
      '    if (range.length === 1) {',
      '      result.push(parseInt(ch, 36));',
      '    } else {',
      '      var from = parseInt(range[0], 36);',
      '      var to = from + parseInt(range[1], 36);',
      '      while (from <= to) {',
      '        result.push(from);',
      '        from++;',
      '      }',
      '    }',
      '  });',
      '  return result;',
      '}',
      'exports.BMP = toArray(data.BMP);',
      'exports.astral = toArray(data.astral);'
    ].join('\n')
  );
};

var data = generateData();
writeFile('./data/non-ascii-identifier-start.js', data.start);
writeFile('./data/non-ascii-identifier-part-only.js', data.part);
