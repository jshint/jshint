/*global Cat */
/*exported isCat, isDog */
/*exported cannotBeExported */

function isCat(obj) {
	var unused,
		isDog;
	return obj instanceof Cat;
}

var isDog = function () {};

function unusedDeclaration() {}
var unusedExpression = function () {};

(function () {
	function cannotBeExported() {}
}());
