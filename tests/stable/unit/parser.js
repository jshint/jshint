/**
 * Tests for the parser/tokenizer
 */

"use strict";

var JSHINT	= require('../../../src/stable/jshint.js').JSHINT;
var fs		= require('fs');
var TestRun = require("../helpers/testhelper").setup.testRun;

exports.unsafe = function (test) {
	var code = [
		"var a\u000a = 'Here is a unsafe character';",
	];

	TestRun(test)
		.addError(1, "This character may get silently deleted by one or more browsers.")
		.test(code);

	test.done();
};

exports.other = function (test) {
	var code = [
		"\\",
		"!",
	];

	TestRun(test)
		.addError(1, "Unexpected '\\'.")
		.addError(2, "Unexpected early end of program.")
		.addError(2, "Expected an identifier and instead saw '(end)'.")
		.test(code);

	// GH-818
	TestRun(test)
		.addError(1, "Expected an identifier and instead saw ')'.")
		.test("if (product < ) {}");

	test.done();
};

exports.confusingOps = function (test) {
	var code = [
		"var a = 3 - -3;",
		"var b = 3 + +3;",
		"a = a - --a;",
		"a = b + ++b;",
		"a = a-- - 3;", // this is not confusing?!
		"a = a++ + 3;", // this is not confusing?!
	];

	TestRun(test)
		.addError(1, "Confusing minuses.")
		.addError(2, "Confusing pluses.")
		.addError(3, "Confusing minuses.")
		.addError(4, "Confusing pluses.")
		.test(code);

	test.done();
};


exports.plusplus = function (test) {
	var code = [
		"var a = ++[2];",
		"var b = --(2);",
	];

	TestRun(test)
		.addError(1, "Unexpected use of '++'.")
		.addError(2, "Unexpected use of '--'.")
		.test(code, { plusplus: true });

	TestRun(test)
		.addError(2, "Bad operand.")
		.test(code, { plusplus: false });

	test.done();
};

exports.assignment = function (test) {
	var code = [
		"arguments.length = 2;",
		"a() = 2;",
	];

	TestRun(test)
		.addError(1, "Bad assignment.")
		.addError(2, "Bad assignment.")
		.addError(2, "Expected an assignment or function call and instead saw an expression.")
		.addError(2, "Missing semicolon.")
		.test(code, { plusplus: true });

	test.done();
};

exports.relations = function (test) {
	var code = [
		"var a = 2 === NaN;",
		"var b = NaN == 2;",
		"var c = !2 < 3;",
		"var c = 2 < !3;",
		"var d = (!'x' in obj);",
		"var e = (!a === b);",
		"var f = (a === !'hi');",
		"var g = (!2 === 1);",
		"var h = (![1, 2, 3] === []);",
	];

	TestRun(test)
		.addError(1, "Use the isNaN function to compare with NaN.")
		.addError(2, "Use the isNaN function to compare with NaN.")
		.addError(3, "Confusing use of '!'.", {character : 9})
		.addError(4, "Confusing use of '!'.", {character : 13})
		.addError(5, "Confusing use of '!'.", {character : 10})
		.addError(6, "Confusing use of '!'.", {character : 10})
		.addError(7, "Confusing use of '!'.", {character : 16})
		.addError(8, "Confusing use of '!'.", {character : 10})
		.addError(9, "Confusing use of '!'.", {character : 10})
		.test(code);

	test.done();
};

exports.options = function (test) {
	var code = [
		"/*member a*/",
		"/*members b*/",
		"var x; x.a.b.c();",
		"/*jshint ++ */",
		"/*jslint indent: -2 */",
		"/*jslint indent: 100.4 */",
		"/*jslint maxlen: 200.4 */",
		"/*jslint maxerr: 300.4 */",
		"/*jslint maxerr: 20 */",
		"/*member c:true */",
		"/*jshint d:no */",
		"/*jshint white:no */",
		"/*global xxx*/",
		"xxx = 2;",
	];

	TestRun(test)
		.addError(3, "Unexpected /*member 'c'.")
		.addError(4, "Bad option: '++'.")
		.addError(5, "Expected a small integer and instead saw '-2'.")
		.addError(6, "Expected a small integer and instead saw '100.4'.")
		.addError(7, "Expected a small integer and instead saw '200.4'.")
		.addError(8, "Expected a small integer and instead saw '300.4'.")
		.addError(11, "Bad option: 'd'.")
		.addError(12, "Bad option value.")
		.addError(14, "Read only.")
		.test(code);

	test.done();
};

exports.shebang = function (test) {
	var code = [
		"#!test",
		"var a = 'xxx';",
		"#!test"
	];

	TestRun(test)
		.addError(3, "Expected an identifier and instead saw '#'.")
		.addError(3, "Expected an operator and instead saw '!'.")
		.addError(3, "Expected an assignment or function call and instead saw an expression.")
		.addError(3, "Missing semicolon.")
		.test(code);

	test.done();
};

exports.numbers = function (test) {
	/*jshint maxlen: 300*/

	var code = [
		"var a = 10e307;",
		"var b = 10e308;",
		"var c = 0.03 + 0.3 + 3.0 + 30.00;",
		"var d = 03;",
		"var e = .3;",
		"var f = 0xAAg;",
		"var g = 0033;",
		"var h = 3.;",
		"var i = 3.7.toString();",
		"var j = 1e-10;" // GH-821
	];

	TestRun(test)
		.addError(2, "Bad number '10e308'.")
		.addError(5, "A leading decimal point can be confused with a dot: '.3'.")
		.addError(6, "Unexpected '0'.")
		.addError(7, "Expected an identifier and instead saw 'var'.")
		.addError(7, "Missing semicolon.")
		.addError(7, "Don't use extra leading zeros '0033'.")
		.addError(8, "A trailing decimal point can be confused with a dot: '3.'.")
		.addError(9, "A dot following a number can be confused with a decimal point.")
		.test(code);

	// Octals are prohibited in strict mode.
	TestRun(test)
		.addError(3, "Octal literals are not allowed in strict mode.")
		.test([
			"(function () {",
			"'use strict';",
			"return 045;",
			"}());"
		]);

	// GitHub #751 - an expression containing a number with a leading decimal point should be parsed in its entirety
	TestRun(test)
		.addError(1, "A leading decimal point can be confused with a dot: '.3'.")
		.addError(2, "A leading decimal point can be confused with a dot: '.3'.")
		.test([
			"var a = .3 + 1;",
			"var b = 1 + .3;",
		]);

	test.done();
};

exports.comments = function (test) {
	var code = [
		"/*",
		"/* nested */",
		"*/",
		"/* unclosed ...",
	];

	TestRun(test)
		.addError(3, "Unbegun comment.")
		.addError(4, "Unclosed comment.")
		.test(code);

	var src = "/* this is a comment /* with nested slash-start */";
	TestRun(test).test(src);
	TestRun(test).test(fs.readFileSync(__dirname + "/fixtures/gruntComment.js", "utf8"));

	test.done();
};

exports.regexp = function (test) {
	var code = [
		"var a1 = /\\\x1f/;",
		"var a2 = /[\\\x1f]/;",
		"var b1 = /\\</;", // only \< is unexpected?!
		"var b2 = /[\\<]/;", // only \< is unexpected?!
		"var c = /(?(a)b)/;",
		"var d = /)[--aa-b-cde-]/;",
		"var e = /[]/;",
		"var f = /[^]/;",
		"var g = /[a^[]/;",

		// FIXME: Firefox doesn't handle [a-\\s] well.
		// See https://bugzilla.mozilla.org/show_bug.cgi?id=813249
		"", // "var h = /[a-\\s-\\w-\\d\\x10-\\x20--]/;",

		"var i = /[/-a1-/]/;",
		"var j = /[a-<<-3]./;",
		"var k = /]}/;",
		"var l = /?(*)(+)({)/;",
		"var m = /a{b}b{2,c}c{3,2}d{4,?}x{30,40}/;",
		"var n = /a??b+?c*?d{3,4}? a?b+c*d{3,4}/;",
		"var o = /a\\/*  [a-^-22-]/;",
		"var p = /(?:(?=a|(?!b)))/;",
		"var q = /=;/;",
		"var r = /(/;",
		"var s = /(((/;",
		"var t = /x/* 2;",
		"var u = /x/;",
		"var v = /dsdg;",
		"var w = v + /s/;",
		"var x = w - /s/;",
		"var y = typeof /[a-z]/;" // GH-657
	];

	TestRun(test)
		.addError(1, "This character may get silently deleted by one or more browsers.")
		.addError(1, "Unexpected control character in regular expression.")
		.addError(2, "This character may get silently deleted by one or more browsers.")
		.addError(2, "Unexpected control character in regular expression.")
		.addError(3, "Unexpected escaped character '<' in regular expression.")
		.addError(4, "Unexpected escaped character '<' in regular expression.")
		.addError(5, "Invalid regular expression.")
		.addError(6, "Invalid regular expression.")
		.addError(11, "Invalid regular expression.")
		.addError(12, "Invalid regular expression.")
		.addError(14, "Invalid regular expression.")
		.addError(15, "Invalid regular expression.")
		.addError(17, "Invalid regular expression.")
		.addError(20, "Invalid regular expression.")
		.addError(21, "Invalid regular expression.")
		.addError(24, "Unclosed regular expression.")
		.test(code);

	TestRun(test)
		.test("var y = Math.sqrt(16) / 180;");

	// GH-803
	TestRun(test)
		.test("var x = [1]; var y = x[0] / 180;");

	test.done();
};

exports.testRegexRegressions = function (test) {
	// GH-536
	TestRun(test)
		.test("str /= 5;", {}, { str: true });

	TestRun(test)
		.test("str = str.replace(/=/g, '');", {}, { str: true });

	TestRun(test)
		.test("str = str.replace(/=abc/g, '');", {}, { str: true });

	// GH-538
	TestRun(test)
		.test("var exp = /function(.*){/gi;");

	test.done();
};

exports.strings = function (test) {
	var code = [
		"var a = '\u0012\\r';",
		"var b = \'\\g\';",
		"var c = '\\u0022\\u0070\\u005C';",
		"var e = '\\x6b..\\x6e';",
		"var f = 'ax"
	];

	TestRun(test)
		.addError(1, "Control character in string: <non-printable>.", {character: 10})
		.addError(1, "This character may get silently deleted by one or more browsers.")
		.addError(2, "Bad or unnecessary escaping.")
		.addError(5, "Unclosed string.")
		.addError(5, "Missing semicolon.")
		.test(code);

	test.done();
};

exports.ownProperty = function (test) {
	var code = [
		"var obj = { hasOwnProperty: false };",
		"obj.hasOwnProperty = true;",
		"obj['hasOwnProperty'] = true;",
		"function test() { var hasOwnProperty = {}.hasOwnProperty; }"
	];

	TestRun(test)
		.addError(1, "'hasOwnProperty' is a really bad name.")
		.addError(2, "'hasOwnProperty' is a really bad name.")
		.addError(3, "'hasOwnProperty' is a really bad name.")
		.addError(3, "['hasOwnProperty'] is better written in dot notation.")
		.test(code);

	test.done();
};

exports.jsonMode = function (test) {
	var code = [
		'{',
		'	a: 2,',
		'	\'b\': "hallo\\"\\v\\x12\\\'world",',
		'	"c\\"\\v\\x12": \'4\',',
		'	"d": "4\\',
		'	",',
		'	"e": 0x332,',
		'	"x": 0',
		'}',
	];

	TestRun(test)
		.addError(2, "Expected a string and instead saw a.")
		.addError(3, "Strings must use doublequote.")
		.addError(3, "Avoid \\v.")
		.addError(3, "Avoid \\x-.")
		.addError(3, "Avoid \\'.")
		.addError(4, "Avoid \\v.")
		.addError(4, "Avoid \\x-.")
		.addError(4, "Strings must use doublequote.")
		.addError(5, "Avoid EOL escaping.")
		.addError(7, "Avoid 0x-.")
		.test(code, {multistr: true});

	test.done();
};

exports.comma = function (test) {
	var src = fs.readFileSync(__dirname + "/fixtures/comma.js", "utf8");

	TestRun(test)
		.addError(6, "Expected a conditional expression and instead saw an assignment.")
		.addError(6, "Expected \';\' and instead saw \',\'.")
		.addError(6, "Expected \')\' to match \'(\' from line 6 and instead saw \';\'.")
		.addError(6, "Missing semicolon.")
		.addError(6, "Expected an identifier and instead saw \')\'.")
		.addError(6, "Expected an assignment or function call and instead saw an expression.")
		.addError(6, "Missing semicolon.")
		.addError(6, "Expected an assignment or function call and instead saw an expression.")
		.addError(6, "Missing semicolon.")
		.addError(15, "Expected an assignment or function call and instead saw an expression.")
		.addError(15, "Missing semicolon.")
		.addError(20, "Expected an assignment or function call and instead saw an expression.")
		.addError(30, "Expected an assignment or function call and instead saw an expression.")
		.addError(36, "Unexpected 'if'.")
		.addError(44, "Unexpected '}'.")
		.test(src);

	// Regression test (GH-56)
	TestRun(test)
		.addError(4, "Expected an assignment or function call and instead saw an expression.")
		.test(fs.readFileSync(__dirname + "/fixtures/gh56.js", "utf8"));

	// Regression test (GH-363)
	TestRun(test)
		.addError(1, "Extra comma. (it breaks older versions of IE)")
		.test("var f = [1,];");

	test.done();
};

exports.withStatement = function (test) {
	var src = fs.readFileSync(__dirname + "/fixtures/with.js", "utf8");

	TestRun(test)
		.addError(5, "Don't use 'with'.")
		.addError(5, "Missing space after 'with'.")
		.addError(5, "Unexpected space after '('.")
		.addError(13, "'with' is not allowed in strict mode.")
		.addError(13, "Missing space after ')'.")
		.addError(13, "Unexpected space after '2'.")
		.test(src, {white: true});

	TestRun(test)
		.addError(5, "Missing space after 'with'.")
		.addError(5, "Unexpected space after '('.")
		.addError(13, "'with' is not allowed in strict mode.")
		.addError(13, "Missing space after ')'.")
		.addError(13, "Unexpected space after '2'.")
		.test(src, {white: true, withstmt: true});

	test.done();
};

exports.blocks = function (test) {
	var src = fs.readFileSync(__dirname + "/fixtures/blocks.js", "utf8");

	TestRun(test)
		.addError(29, "Unmatched \'{\'.")
		.addError(31, "Unmatched \'{\'.")
		.test(src);

	test.done();
};

exports.functionCharacterLocation = function (test) {
	var i;
	var src = fs.readFileSync(__dirname + "/fixtures/nestedFunctions.js", "utf8");
	var locations = JSON.parse(
		fs.readFileSync(
			__dirname + "/fixtures/nestedFunctions-locations.js", "utf8"
		)
	);
	JSHINT(src);
	var report = JSHINT.data().functions;

	test.equal(locations.length, report.length);
	for (i = 0; i < locations.length; i += 1) {
		test.equal(locations[i].name, report[i].name);
		test.equal(locations[i].line, report[i].line);
		test.equal(locations[i].character, report[i].character);
		test.equal(locations[i].last, report[i].last);
		test.equal(locations[i].lastcharacter, report[i].lastcharacter);
	}

	test.done();
};

exports.exported = function (test) {
	var src = fs.readFileSync(__dirname + "/fixtures/exported.js", "utf8");

	TestRun(test)
		.addError(5, "'unused' is defined but never used.")
		.addError(6, "'isDog' is defined but never used.")
		.addError(13, "'unusedDeclaration' is defined but never used.")
		.addError(14, "'unusedExpression' is defined but never used.")
		.addError(17, "'cannotBeExported' is defined but never used.")
		.test(src, { unused: true });

	test.done();
};

exports.testIdentifiers = function (test) {
	var src = fs.readFileSync(__dirname + "/fixtures/identifiers.js", "utf8");

	TestRun(test).test(src);
	TestRun(test)
		.addError(1, "'ascii' is defined but never used.")
		.addError(2, "'num1' is defined but never used.")
		.addError(3, "'lifé' is defined but never used.")
		.addError(4, "'π' is defined but never used.")
		.addError(5, "'привет' is defined but never used.")
		.addError(6, "'\\u1d44' is defined but never used.")
		.addError(7, "'encoded\\u1d44' is defined but never used.")
		.test(src, { unused: true });

	test.done();
};

exports["regression for GH-878"] = function (test) {
	var src = fs.readFileSync(__dirname + "/fixtures/gh878.js", "utf8");

	TestRun(test).test(src);

	test.done();
};

exports["regression for GH-910"] = function (test) {
	var src = "(function () { if (true) { foo.bar + } })();";
	TestRun(test)
		.addError(1, "Expected an identifier and instead saw '}'.")
		.addError(1, "Expected an assignment or function call and instead saw an expression.")
		.addError(1, "Missing semicolon.")
		.addError(1, "Expected an identifier and instead saw ')'.")
		.addError(1, "Expected an operator and instead saw '('.")
		.addError(1, "Unmatched '{'.")
		.addError(1, "Unmatched '('.")
		.addError(1, "Expected an assignment or function call and instead saw an expression.")
		.addError(1, "Missing semicolon.")
		.test(src, { nonew: true });
	test.done();
};

exports.testDestructuringVarFuncScope = function (test) {
	var code = [
		"function foobar() {",
		"	var [ a, b, c ] = [ 1, 2, 3 ];",
		"	var [ a ] = [ 1 ];",
		"	var [ a ] = [ z ];",
		"	var [ h, w ] = [ 'hello', 'world' ]; ",
		"	var [ o ] = [ { o : 1 } ];",
		"	var [ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
		"	var { foo : bar } = { foo : 1 };",
		"	var [ a, { foo : bar } ] = [ 2, { foo : 1 } ];",
		"	var [ 1 ] = [ a ];",
		"	var [ a, b; c ] = [ 1, 2, 3 ];",
		"	var [ a, b, c ] = [ 1, 2; 3 ];",
		"}"
	];

	TestRun(test)
		.addError(1,  "'foobar' is defined but never used.")
		.addError(3,  "'a' is already defined.")
		.addError(4,  "'a' is already defined.")
		.addError(7,  "'a' is already defined.")
		.addError(7,  "'b' is already defined.")
		.addError(7,  "'c' is already defined.")
		.addError(9,  "'a' is already defined.")
		.addError(9,  "'bar' is already defined.")
		.addError(10,  "Expected an identifier and instead saw '1'.")
		.addError(10,  "Expected ',' and instead saw '1'.")
		.addError(10,  "Expected an identifier and instead saw ']'.")
		.addError(11, "Expected ',' and instead saw ';'.")
		.addError(11, "'a' is already defined.")
		.addError(11, "'b' is already defined.")
		.addError(11, "'c' is already defined.")
		.addError(12, "'a' is already defined.")
		.addError(12, "'b' is already defined.")
		.addError(12, "'c' is already defined.")
		.addError(12, "Expected ']' to match '[' from line 12 and instead saw ';'.")
		.addError(12, "Missing semicolon.")
		.addError(12, "Expected an assignment or function call and instead saw an expression.")
		.addError(12, "Missing semicolon.")
		.addError(12, "Expected an identifier and instead saw ']'.")
		.addError(12, "Expected an assignment or function call and instead saw an expression.")
		.addError(4,  "'z' is not defined.")
		.addError(12, "'a' is defined but never used.")
		.addError(12, "'b' is defined but never used.")
		.addError(12, "'c' is defined but never used.")
		.addError(5,  "'h' is defined but never used.")
		.addError(5,  "'w' is defined but never used.")
		.addError(6,  "'o' is defined but never used.")
		.addError(7,  "'d' is defined but never used.")
		.addError(9,  "'bar' is defined but never used.")
		.test(code, {esnext: true, unused: true, undef: true});

	test.done();
};

exports.testDestructuringVar = function (test) {
	var code = [
		"var [ a, b, c ] = [ 1, 2, 3 ];",
		"var [ a ] = [ 1 ];",
		"var [ a ] = [ z ];",
		"var [ h, w ] = [ 'hello', 'world' ]; ",
		"var [ o ] = [ { o : 1 } ];",
		"var [ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
		"var { foo : bar } = { foo : 1 };",
		"var [ a, { foo : bar } ] = [ 2, { foo : 1 } ];",
		"var [ 1 ] = [ a ];",
		"var [ a, b; c ] = [ 1, 2, 3 ];",
		"var [ a, b, c ] = [ 1, 2; 3 ];"
	];

	TestRun(test)
		.addError(9,  "Expected an identifier and instead saw '1'.")
		.addError(9,  "Expected ',' and instead saw '1'.")
		.addError(9,  "Expected an identifier and instead saw ']'.")
		.addError(10, "Expected ',' and instead saw ';'.")
		.addError(11, "Expected ']' to match '[' from line 11 and instead saw ';'.")
		.addError(11, "Missing semicolon.")
		.addError(11, "Expected an assignment or function call and instead saw an expression.")
		.addError(11, "Missing semicolon.")
		.addError(11, "Expected an identifier and instead saw ']'.")
		.addError(11, "Expected an assignment or function call and instead saw an expression.")
		.addError(3,  "'z' is not defined.")
		.addError(11, "'a' is defined but never used.")
		.addError(11, "'b' is defined but never used.")
		.addError(11, "'c' is defined but never used.")
		.addError(4,  "'h' is defined but never used.")
		.addError(4,  "'w' is defined but never used.")
		.addError(5,  "'o' is defined but never used.")
		.addError(6,  "'d' is defined but never used.")
		.addError(8,  "'bar' is defined but never used.")
		.test(code, {esnext: true, unused: true, undef: true});

	test.done();
};

exports.testDestructuringConst = function (test) {
	var code = [
		"const [ a, b, c ] = [ 1, 2, 3 ];",
		"const [ d ] = [ 1 ];",
		"const [ e ] = [ z ];",
		"const [ hel, wor ] = [ 'hello', 'world' ]; ",
		"const [ o ] = [ { o : 1 } ];",
		"const [ f, [ [ [ g ], h ], i ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
		"const { foo : bar } = { foo : 1 };",
		"const [ j, { foo : foobar } ] = [ 2, { foo : 1 } ];",
		"const [ a, b, c ] = [ 1, 2, 3 ];",
		"const [ 1 ] = [ a ];",
		"const [ k, l; m ] = [ 1, 2, 3 ];",
		"const [ n, o, p ] = [ 1, 2; 3 ];"
	];

	TestRun(test)
		.addError(9, "const 'a' has already been declared.")
		.addError(9, "const 'b' has already been declared.")
		.addError(9, "const 'c' has already been declared.")
		.addError(10, "Expected an identifier and instead saw '1'.")
		.addError(10, "Expected ',' and instead saw '1'.")
		.addError(10, "Expected an identifier and instead saw ']'.")
		.addError(11, "Expected ',' and instead saw ';'.")
		.addError(12, "const 'o' has already been declared.")
		.addError(12, "Expected ']' to match '[' from line 12 and instead saw ';'.")
		.addError(12, "Missing semicolon.")
		.addError(12, "Expected an assignment or function call and instead saw an expression.")
		.addError(12, "Missing semicolon.")
		.addError(12, "Expected an identifier and instead saw ']'.")
		.addError(12, "Expected an assignment or function call and instead saw an expression.")
		.addError(12, "Missing semicolon.")
		.addError(3, "'z' is not defined.")
		.test(code, {esnext: true, unused: true, undef: true});

	test.done();
};

exports.testDestructuringGlobals = function (test) {
	var code = [
		"var a, b, c, d, h, w, o;",
		"[ a, b, c ] = [ 1, 2, 3 ];",
		"[ a ] = [ 1 ];",
		"[ a ] = [ z ];",
		"[ h, w ] = [ 'hello', 'world' ]; ",
		"[ o ] = [ { o : 1 } ];",
		"[ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
		"[ a, { foo : b } ] = [ 2, { foo : 1 } ];",
		"[ 1 ] = [ a ];",
		"[ a, b; c ] = [ 1, 2, 3 ];",
		"[ a, b, c ] = [ 1, 2; 3 ];"
	];

	TestRun(test)
		.addError(10, "Expected ']' to match '[' from line 10 and instead saw ';'.")
		.addError(10, "Expected an assignment or function call and instead saw an expression.")
		.addError(10, "Missing semicolon.")
		.addError(10, "Expected an assignment or function call and instead saw an expression.")
		.addError(10, "Missing semicolon.")
		.addError(10, "Expected an identifier and instead saw ']'.")
		.addError(10, "Expected an operator and instead saw '='.")
		.addError(10, "Expected an operator and instead saw '['.")
		.addError(10, "Expected an assignment or function call and instead saw an expression.")
		.addError(10, "Missing semicolon.")
		.addError(10, "Expected an assignment or function call and instead saw an expression.")
		.addError(10, "Expected an assignment or function call and instead saw an expression.")
		.addError(10, "Missing semicolon.")
		.addError(10, "Expected an identifier and instead saw ']'.")
		.addError(10, "Expected an assignment or function call and instead saw an expression.")
		.addError(11, "Expected ']' to match '[' from line 11 and instead saw ';'.")
		.addError(11, "Missing semicolon.")
		.addError(11, "Expected an assignment or function call and instead saw an expression.")
		.addError(11, "Missing semicolon.")
		.addError(11, "Expected an identifier and instead saw ']'.")
		.addError(11, "Expected an assignment or function call and instead saw an expression.")
		.addError(4,  "'z' is not defined.")
		.test(code, {esnext: true, unused: true, undef: true});

	test.done();
};

exports.testDestructuringEmptyValues = function (test) {
	var code = [
		"var [ a ] = [ 1, 2 ];",
		"var [ c, d ] = [ 1 ];",
		"var [ e, , f ] = [ 3, , 4 ];"
	];

	TestRun(test)
		.addError(1, "'a' is defined but never used.")
		.addError(2, "'c' is defined but never used.")
		.addError(2, "'d' is defined but never used.")
		.addError(3, "'e' is defined but never used.")
		.addError(3, "'f' is defined but never used.")
		.test(code, {esnext: true, es5: true, unused: true, undef: true});

	test.done();
};
exports.testLetStmt = function (test) {
	var code = [
		"let x = 1;",
		"{",
		"	let y = 3 ;",
		"	{",
		"		let z = 2;",
		"		print(x + ' ' + y + ' ' + z);",
		"	}",
		"	print(x + ' ' + y);",
		"}",
		"print(x);"
	];

	TestRun(test)
		.test(code, {esnext: true, es5: true, unused: true, undef: true, predef: ["print"]});

	test.done();
};

exports.testLetStmtOutOfScope = function (test) {
	var code = [
		"let x = 1;",
		"{",
		"	let y = 3 ;",
		"	{",
		"		let z = 2;",
		"	}",
		"	print(z);",
		"}",
		"print(y);",
	];

	TestRun(test)
		.addError(5, "'z' is defined but never used.")
		.addError(3, "'y' is defined but never used.")
		.addError(7, "'z' is not defined.")
		.addError(9, "'y' is not defined.")
		.test(code, {esnext: true, es5: true, unused: true, undef: true, predef: ["print"]});

	test.done();
};

exports.testLetStmtInFunctions = function (test) {
	var code = [
		"let x = 1;",
		"function foo() {",
		"	let y = 3 ;",
		"	function bar() {",
		"		let z = 2;",
		"		print(x);",
		"		print(z);",
		"	}",
		"	print(y);",
		"	bar();",
		"}",
		"foo();"
	];

	TestRun(test)
		.test(code, {esnext: true, es5: true, unused: true, undef: true, predef: ["print"]});

	test.done();
};

exports.testLetStmtInFunctionsOutOfScope = function (test) {
	var code = [
		"let x = 1;",
		"function foo() {",
		"	let y = 3 ;",
		"	let bar = function () {",
		"		print(x);",
		"		let z = 2;",
		"	};",
		"	print(z);",
		"}",
		"print(y);",
		"bar();",
		"foo();",
	];

	TestRun(test)
		.addError(6, "'z' is defined but never used.")
		.addError(3, "'y' is defined but never used.")
		.addError(4, "'bar' is defined but never used.")
		.addError(8, "'z' is not defined.")
		.addError(10, "'y' is not defined.")
		.addError(11, "'bar' is not defined.")
		.test(code, {esnext: true, es5: true, unused: true, undef: true, predef: ["print"]});

	test.done();
};

exports.testLetStmtInForLoop = function (test) {
	var code = [
		"var obj={foo: 'bar', bar: 'foo'};",
		"for ( let [n, v] in Iterator(obj) ) {",
		"	print('Name: ' + n + ', Value: ' + v);",
		"}",
		"for (let i in [1, 2, 3, 4]) {",
		"	print(i);",
		"}",
		"for (let i in [1, 2, 3, 4]) {",
		"	print(i);",
		"}",
		"for (let i = 0; i<15; ++i) {",
		"	print(i);",
		"}",
		"for (let i=i ; i < 10 ; i++ ) {",
		"print(i);",
		"}"
	];

	TestRun(test)
		.test(code, {esnext: true, es5: true, unused: true,
					 undef: true, predef: ["print", "Iterator"]});

	test.done();
};

exports.testLetStmtInForLoopDEStmt = function (test) {
	// example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
	var code = [
		"var people = [",
		"{",
		"	name: 'Mike Smith',",
		"	family: {",
		"	mother: 'Jane Smith',",
		"	father: 'Harry Smith',",
		"	sister: 'Samantha Smith'",
		"	},",
		"	age: 35",
		"},",
		"{",
		"	name: 'Tom Jones',",
		"	family: {",
		"	mother: 'Norah Jones',",
		"	father: 'Richard Jones',",
		"	brother: 'Howard Jones'",
		"	},",
		"	age: 25",
		"}",
		"];",
		"for (let {name: n, family: { father: f } } in people) {",
		"print('Name: ' + n + ', Father: ' + f);",
		"}"
	];

	TestRun(test)
		.test(code, {esnext: true, es5: true, unused: true,
					 undef: true, predef: ["print", "Iterator"]});

	test.done();
};

exports.testLetStmtJetPack = function (test) {
	// Example taken from jetpack/addons sdk library from Mozilla project
	var code = [
		"const { Cc, Ci } = require('chrome');",
		"// add a text/unicode flavor (html converted to plain text)",
		"let (str = Cc['@mozilla.org/supports-string;1'].",
		"            createInstance(Ci.nsISupportsString),",
		"    converter = Cc['@mozilla.org/feed-textconstruct;1'].",
		"                createInstance(Ci.nsIFeedTextConstruct))",
		"{",
		"converter.type = 'html';",
		"converter.text = options.data;",
		"str.data = converter.plainText();",
		"xferable.addDataFlavor('text/unicode');",
		"xferable.setTransferData('text/unicode', str, str.data.length * 2);",
		"}"
	];

	TestRun(test)
		.test(code, {moz: true, es5: true, unused: true,
					 undef: true, predef: ["require", "xferable", "options"]});
	test.done();
};

exports.testLetStmtLetExpr = function (test) {
	// Example taken from jetpack/addons sdk library from Mozilla project
	var code = [
		"let (x=1, y=2, z=3)",
		"{",
		"	let(t=4) print(x, y, z, t);",
		"	print(let(u=4) u,x);",
		"}"
	];

	TestRun(test)
		.test(code, {moz: true, esnext: true, es5: true, unused: true,
					 undef: true, predef: ["print"]});
	test.done();
};


exports.testDestructuringFunction = function (test) {
	// Example from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
	var code = [
		"function userId({id}) {",
		"	return id;",
		"}",

		"function whois({displayName: displayName, fullName: {firstName: name}}) {",
		"	print(displayName + ' is ' + name);",
		"}",

		"var user = {id: 42, displayName: 'jdoe', fullName: {firstName: 'John', lastName: 'Doe'}};",

		"print('userId: ' + userId(user));",
		"whois(user);"
	];
	TestRun(test)
		.test(code, {esnext: true, es5: true, unused: true, undef: true, predef: ["print"]});

	test.done();
};

exports.testForEachError = function (test) {
	// example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
	var code = [
		"for each (let i = 0; i<15; ++i) {",
		"	print(i);",
		"}"
	];

	TestRun(test)
		.addError(1, "Invalid for each loop.")
		.test(code, {moz: true, es5: true, unused: true,
						undef: true, predef: ["print", "Iterator"]});

	test.done();
};

exports.testGenerator = function (test) {
	// example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
	var code = [
		"function fib() {",
		"	var i = 0, j = 1;",
		"	while (true) {",
		"		yield i;",
		"		[i, j] = [j, i + j];",
		"	}",
		"}",

		"var g = fib();",
		"for (let i = 0; i < 10; i++)",
		"	print(g.next());"
	];
	TestRun(test)
		.test(code, {moz: true, esnext: true, es5: true, unused: true,
						undef: true, predef: ["print", "Iterator"]});

	test.done();
};

exports.testArrayComprehension = function (test) {
	// example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
	var code = [
		"function range(begin, end) {",
		"	for (let i = begin; i < end; ++i) {",
		"		yield i;",
		"	}",
		"}",
		"var ten_squares = [i * i for each (i in range(0, 10))];",
		"var evens = [i for each (i in range(0, 21)) if (i % 2 === 0)];",
		"print('squares:', ten_squares);",
		"print('evens:', evens);"
	];
	TestRun(test)
		// .addError(6, "'for each' is only available in JavaScript 1.7.")
		// .addError(7, "'for each' is only available in JavaScript 1.7.")
		.test(code, {moz: true, es5: true, unused: true, undef: true,
						predef: ["print"]});

	test.done();
};
exports.testESNextOverridesMoz = function (test) {
	var code = [
		"[i * i for each (i in [1, 2, 3, 4, 5])];"
	];
	TestRun(test)
		.addError(1, "'for each' is only available in JavaScript 1.7.")
		.addError(1, "Expected '(' and instead saw 'each'.")
		.addError(1, "Expected ')' and instead saw ']'.")
		.addError(1, "Expected ']' and instead saw ';'.")
		.addError(1, "Expected an assignment or function call and instead saw an expression.")
		.addError(1, "Missing semicolon.")
		.test(code, {moz: true, esnext: true, es5: true, unused: true, undef: true,
						predef: ["print"]});

	test.done();
};


exports.testArrayComprehensionWithDestArray = function (test) {
	// example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
	var code = [
		"function range(begin, end) {",
		"	for (let i = begin; i < end; ++i) {",
		"		yield i;",
		"	}",
		"}",
		"var ten_squares = [i * i for each (i in range(0, 10))];",
		"var evens = [i for each (i in range(0, 21)) if (i % 2 === 0)];",
		"print('squares:', ten_squares);",
		"print('evens:', evens);"
	];
	TestRun(test)
		.test(code, {moz: true, es5: true, unused: true, undef: true,
						predef: ["print", "Iterator"]});

	test.done();
};

exports.testArrayComprehensionWithDestArrayGlobScope = function (test) {
	var code = [
		"[ [i, j] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
		"var destarray_comparray_1 = [ [i, [j, j] ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
		"var destarray_comparray_2 = [ [i, {i: [i, j]} ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
	];
	TestRun(test)
		.addError(1, "Expected an assignment or function call and instead saw an expression.")
		.test(code, {moz: true, es5: true, undef: true,
						predef: ["print", "Iterator"]});

	test.done();
};

exports.testArrayComprehensionImbricationWithDestArray = function (test) {
	var code = [
		"[ [i, j] for each ([i, j] in [[a, b] for each ([a, b] in [[2,2], [3,4]])]) ];"

	];
	TestRun(test)
		.addError(1, "Expected an assignment or function call and instead saw an expression.")
		.test(code, {moz: true, es5: true, undef: true,
						predef: ["print", "Iterator"]});

	test.done();
};

exports.testTryCatchFilter = function (test) {
	var code = [
		"try {",
		"	throw {name: 'foo', message: 'bar'};",
		"}",
		"catch (e if e.name === 'foo') {",
		"	print (e.message);",
		"}"
	];
	TestRun(test)
		.test(code, {moz: true, es5: true, undef: true,
						predef: ["print"]});

	test.done();
};
exports.testESNextOverridesTryCatchFilter = function (test) {
	var code = [
		"try {",
		"	throw {name: 'foo', message: 'bar'};",
		"}",
		"catch (e if e.name === 'foo') {}"
	];
	TestRun(test)
		.addError(4, "'catch filter' is only available in JavaScript 1.7.")
		.addError(4, "Expected ')' and instead saw 'if'.")
		.addError(4, "Expected '{' and instead saw 'e'.")
		.addError(4, "Expected an assignment or function call and instead saw an expression.")
		.addError(4, "Missing semicolon.")
		.addError(4, "Expected an identifier and instead saw ')'.")
		.addError(4, "Expected an assignment or function call and instead saw an expression.")
		.addError(4, "Missing semicolon.")
		.addError(4, "'e' is not defined.")
		.test(code, {moz: true, esnext: true, es5: true, undef: true});

	test.done();
};

exports.testArrayComprehensionDetection = function (test) {
	var code = [
		"var foo = []; for each (let i in [1,2,3]) { print(i); }"
	];
	TestRun(test)
		.test(code, {moz: true, es5: true, undef: true,
						predef: ["print"]});

	test.done();
};


exports.testESNextOverridesArrayComprehensionDetection = function (test) {
	var code = [
		"var foo = []; for each (let i in [1,2,3]) {}"
	];
	TestRun(test)
		.addError(1, "'for each' is only available in JavaScript 1.7.")
		.addError(1, "Expected '(' and instead saw 'each'.")
		.addError(1, "Creating global 'for' variable. Should be 'for (var ( ...'.")
		.addError(1, "Expected 'in' and instead saw 'let'.")
		.addError(1, "'i' is not defined.")
		.test(code, {moz: true, esnext: true, es5: true, undef: true });

	test.done();
};

exports.testFunctionExpressionClosure = function (test) {
	var code = [
		"let (arr = [1,2,3]) {",
		"	arr.every(function (o) o instanceof Object);",
		"}"
	];
	TestRun(test)
		.test(code, {moz: true, esnext: true, es5: true, undef: true});

	test.done();
};

exports.testForOf = function (test) {
	var code = [
		"for (let x of [1,2,3,4]) {",
		"    print(x);",
		"}",
		"for (let x of [1,2,3,4]) print(x);"
	];
	TestRun(test)
		.test(code, {esnext: true, es5: true, undef: true, predef: ["print"]});

	test.done();
};

exports.testTryMultiCatch = function (test) {
	var code = [
		"try {",
		"    print('X');",
		"} catch (err) {",
		"    print(err);",
		"} catch (err) {",
		"    print(err);",
		"} finally {",
		"    print('Z');",
		"}"
	];
	TestRun(test)
		.test(code, {moz: true, es5: true, undef: true, predef: ["print"]});

	test.done();
};

exports.testESNextOverridesTryMultiCatch = function (test) {
	var code = [
		"try {",
		"    print('X');",
		"} catch (err) {",
		"    print(err);",
		"} catch (err) {",
		"    print(err);",
		"} finally {",
		"    print('Z');",
		"}"
	];
	TestRun(test)
		.addError(5, "Expected an identifier and instead saw 'catch'.")
		.addError(5, "Expected an operator and instead saw '('.")
		.addError(5, "Expected an assignment or function call and instead saw an expression.")
		.addError(5, "Missing semicolon.")
		.addError(5, "Expected an assignment or function call and instead saw an expression.")
		.addError(5, "Missing semicolon.")
		.addError(5, "Expected an identifier and instead saw ')'.")
		.addError(5, "Expected an assignment or function call and instead saw an expression.")
		.addError(5, "Missing semicolon.")
		.addError(7, "Expected an identifier and instead saw 'finally'.")
		.addError(7, "Expected an assignment or function call and instead saw an expression.")
		.addError(7, "Missing semicolon.")
		.addError(5, "'err' is not defined.")
		.addError(6, "'err' is not defined.")
		.test(code, {moz: true, esnext: true, es5: true, undef: true, predef: ["print"]});

	test.done();
};
