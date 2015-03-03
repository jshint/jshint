// Based on https://gist.github.com/mathiasbynens/6334847 by @mathias
var regenerate = require('regenerate');

// Which Unicode version should be used?
var version = '6.3.0'; // note: also update `package.json` when this changes

// Shorthand function
var get = function(what) {
  return require('unicode-' + version + '/' + what + '/code-points');
};

// Unicode categories needed to construct the ES5 regex
var Lu = get('categories/Lu');
var Ll = get('categories/Ll');
var Lt = get('categories/Lt');
var Lm = get('categories/Lm');
var Lo = get('categories/Lo');
var Nl = get('categories/Nl');
var Mn = get('categories/Mn');
var Mc = get('categories/Mc');
var Nd = get('categories/Nd');
var Pc = get('categories/Pc');

var generateES5Data = function() { // ES 5.1
  // http://mathiasbynens.be/notes/javascript-identifiers#valid-identifier-names
  var identifierStart = regenerate('$', '_')
    .add(Lu, Ll, Lt, Lm, Lo, Nl)
    .removeRange(0x010000, 0x10FFFF) // remove astral symbols
    .removeRange(0x0, 0x7F); // remove ASCII symbols (JSHint-specific)
  var identifierStartCodePoints = identifierStart.toArray();
  var identifierPart = regenerate()
    .add(0x200C, 0x200D, Mn, Mc, Nd, Pc)
    // remove astral symbols
    .removeRange(0x010000, 0x10FFFF)
    // remove ASCII symbols (JSHint-specific)
    .removeRange(0x0, 0x7F)
    // just to make sure no `IdentifierStart` code points are repeated here
    .remove(identifierStartCodePoints);
  return {
    'nonAsciiIdentifierStart': identifierStart.toArray(),
    'nonAsciiIdentifierPart': identifierPart.toArray()
  };
};

var fs = require('fs');
var writeFile = function(fileName, data) {
  var old=data[0], n=1, s="[", c=old;
  for (var i=1;i<data.length;i++){ // encode continuous sequences of numbers into elements of array [number, sequence length]
  	p=data[i];
  	if (old!=p){
  		s=s+"["+c+","+ n +"],";
  		n=1;
  		c=p;
  	} else {
  		n=n+1;
  	}
  	old=p+1;
  }
  s=s+"["+c+","+ n +"]]";
  fs.writeFileSync( // write array of sequences and the decoding algorithm
    fileName,
    [
    'var arr = [], str =  ' + s + ';',
    'for (var i = 0 ; i<str.length ; i++)',
    '  for (var a=0 ; a<str[i][1] ; a++)',
    '    arr.push(str[i][0]+a);', // push starting number plus number in the sequence into resulting array
    'module.exports = arr;'
    ].join('\n')
  );
};

var result = generateES5Data();
writeFile('./data/non-ascii-identifier-start.js', result.nonAsciiIdentifierStart);
writeFile('./data/non-ascii-identifier-part-only.js', result.nonAsciiIdentifierPart);
