/*global Cat, Dog */
/*exported isCat, isDog, cannotBeExported, Dog */

function isCat(obj) {
  var unused;
  var isDog;
  
  return obj instanceof Cat;
}

var isDog = function () {};

function unusedDeclaration() {}
var unusedExpression = function () {};

(function () {
  function cannotBeExported() {}
}());