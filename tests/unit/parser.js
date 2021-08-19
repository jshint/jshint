/**
 * Tests for the parser/tokenizer
 */

"use strict";

var JSHINT  = require("../..").JSHINT;
var fs    = require('fs');
var TestRun = require("../helpers/testhelper").setup.testRun;
var path    = require("path");

/**
 * The warning for this input was intentionally disabled after research into
 * its justification produced no results.
 */
exports.unsafe = function (test) {
  var code = [
    "var a\u000a = 'Here is a unsafe character';",
  ];

  TestRun(test)
    .test(code, {es3: true});

  test.done();
};

exports.peekOverDirectives = function (test) {
  var code = fs.readFileSync(__dirname + "/fixtures/peek-over-directives.js", "utf8");

  TestRun(test)
    // Within object literal
    .addError(18, 14, "Unexpected control character in regular expression.")
    .addError(19, 14, "Unexpected escaped character '<' in regular expression.")
    .addError(20, 81, "Line is too long.")
    .addError(21, 15, "Control character in string: <non-printable>.")
    .addError(22, 14, "'Octal integer literal' is only available in ES6 (use 'esversion: 6').")
    .addError(23, 14, "'Binary integer literal' is only available in ES6 (use 'esversion: 6').")
    .addError(24, 14, "'template literal syntax' is only available in ES6 (use 'esversion: 6').")
    .addError(25, 14, "'Sticky RegExp flag' is only available in ES6 (use 'esversion: 6').")

    // Within array literal:
    .addError(44, 3, "Unexpected control character in regular expression.")
    .addError(45, 3, "Unexpected escaped character '<' in regular expression.")
    .addError(46, 81, "Line is too long.")
    .addError(47, 4, "Control character in string: <non-printable>.")
    .addError(48, 3, "'Octal integer literal' is only available in ES6 (use 'esversion: 6').")
    .addError(49, 3, "'Binary integer literal' is only available in ES6 (use 'esversion: 6').")
    .addError(50, 3, "'template literal syntax' is only available in ES6 (use 'esversion: 6').")
    .addError(51, 3, "'Sticky RegExp flag' is only available in ES6 (use 'esversion: 6').")

    // Within grouping operator:
    .addError(70, 3, "Unexpected control character in regular expression.")
    .addError(71, 3, "Unexpected escaped character '<' in regular expression.")
    .addError(72, 81, "Line is too long.")
    .addError(73, 4, "Control character in string: <non-printable>.")
    .addError(74, 3, "'Octal integer literal' is only available in ES6 (use 'esversion: 6').")
    .addError(75, 3, "'Binary integer literal' is only available in ES6 (use 'esversion: 6').")
    .addError(76, 3, "'template literal syntax' is only available in ES6 (use 'esversion: 6').")
    .addError(77, 3, "'Sticky RegExp flag' is only available in ES6 (use 'esversion: 6').")
    .test(code);

  test.done();
};

exports.other = function (test) {
  var code = [
    "\\",
    "!",
  ];

  TestRun(test)
    .addError(1, 1, "Unexpected '\\'.")
    .addError(2, 1, "Unexpected early end of program.")
    .addError(2, 1, "Unrecoverable syntax error. (100% scanned).")
    .test(code, {es3: true});

  // GH-818
  TestRun(test)
    .addError(1, 15, "Expected an identifier and instead saw ')'.")
    .addError(1, 15, "Unrecoverable syntax error. (100% scanned).")
    .test("if (product < ) {}", {es3: true});

  // GH-2506
  TestRun(test)
    .addError(1, 7, "Expected an identifier and instead saw ';'.")
    .addError(1, 1, "Unrecoverable syntax error. (100% scanned).")
    .test("typeof;");

  TestRun(test)
    .addError(1, 1, "Unrecoverable syntax error. (0% scanned).")
    .test("}");

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

  var run = TestRun(test, "AdditiveExpressions")
    .addError(1, 13, "Confusing minuses.")
    .addError(2, 13, "Confusing plusses.")
    .addError(3, 9, "Confusing minuses.")
    .addError(4, 9, "Confusing plusses.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  TestRun(test, "UnaryExpressions")
    .addError(1, 8, "Confusing minuses.")
    .addError(2, 8, "Confusing minuses.")
    .addError(3, 8, "Confusing plusses.")
    .addError(4, 8, "Confusing plusses.")
    .test([
      "void - -x;",
      "void - --x;",
      "void + +x;",
      "void + ++x;"
    ]);

  test.done();
};

exports.division = function (test) {
  var run;
  var code = [
    'var a=4,b=4,i=2;',
    'a/=b+2;',
    'a/=b/2;',
    'a/=b/i;',
    '/*jshint expr:true*/',
    '/=b/i;' // valid standalone RegExp expression
  ];

  run = TestRun(test);
  run.test(code);

  test.done();
};

exports.plusplus = function (test) {
  var run;
  var code = [
    "var a = ++[2];",
    "var b = --(2);",
    "var c = [2]++;",
    "var d = (2)--;",
  ];

  run = TestRun(test)
    .addError(1, 9, "Unexpected use of '++'.")
    .addError(1, 9, "Bad assignment.")
    .addError(2, 9, "Unexpected use of '--'.")
    .addError(2, 9, "Bad assignment.")
    .addError(3, 12, "Unexpected use of '++'.")
    .addError(3, 12, "Bad assignment.")
    .addError(4, 12, "Unexpected use of '--'.")
    .addError(4, 12, "Bad assignment.");
  run.test(code, { plusplus: true, es3: true });
  run.test(code, { plusplus: true }); // es5
  run.test(code, { plusplus: true, esnext: true });
  run.test(code, { plusplus: true, moz: true });

  run = TestRun(test)
    .addError(1, 9, "Bad assignment.")
    .addError(2, 9, "Bad assignment.")
    .addError(3, 12, "Bad assignment.")
    .addError(4, 12, "Bad assignment.");
  run.test(code, { plusplus: false, es3: true });
  run.test(code, { plusplus: false }); // es5
  run.test(code, { plusplus: false, esnext: true });
  run.test(code, { plusplus: false, moz: true });

  test.done();
};

exports.assignment = function (test) {
  var code = [
    "function test() {",
    "  arguments.length = 2;",
    "  arguments[0] = 3;",
    "  arguments.length &= 2;",
    "  arguments[0] >>= 3;",
    "}",
    "function test2() {",
    "  \"use strict\";",
    "  arguments.length = 2;",
    "  arguments[0] = 3;",
    "  arguments.length &= 2;",
    "  arguments[0] >>= 3;",
    "}",
    "a() = 2;",
  ];

  var run = TestRun(test)
    .addError(2, 20, "Assignment to properties of a mapped arguments object may cause unexpected changes to formal parameters.")
    .addError(3, 16, "Assignment to properties of a mapped arguments object may cause unexpected changes to formal parameters.")
    .addError(4, 20, "Assignment to properties of a mapped arguments object may cause unexpected changes to formal parameters.")
    .addError(5, 16, "Assignment to properties of a mapped arguments object may cause unexpected changes to formal parameters.")
    .addError(14, 5, "Bad assignment.");

  run.test(code, { plusplus: true, es3: true });
  run.test(code, { plusplus: true }); // es5
  run.test(code, { plusplus: true, esnext: true });
  run.test(code, { plusplus: true, moz: true });

  TestRun(test, "assignment to `eval` outside of strict mode code")
    .test([
      "(function() {",
      "  var eval = 3;",
      "}());"
    ]);

  TestRun(test, "assignment to `eval` within strict mode code")
    .addError(5, 10, "Bad assignment.")
    .test([
      "(function() {",
      "  var eval;",
      "  (function() {",
      "    'use strict';",
      "    eval = 3;",
      "  }());",
      "}());"
    ]);

  TestRun(test, "assignment to `arguments` outside of strict mode code")
    .addError(2, 13, "Assignment to properties of a mapped arguments object may cause unexpected changes to formal parameters.")
    .test([
      "(function() {",
      "  arguments = 3;",
      "}());"
    ]);

  TestRun(test, "assignment to `arguments` within strict mode code")
    .addError(3, 13, "Bad assignment.")
    .test([
      "(function() {",
      "  'use strict';",
      "  arguments = 3;",
      "}());"
    ]);

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
    "var i = (!([]) instanceof Array);"
  ];

  var run = TestRun(test)
    .addError(1, 11, "Use the isNaN function to compare with NaN.")
    .addError(2, 13, "Use the isNaN function to compare with NaN.")
    .addError(3, 9, "Confusing use of '!'.")
    .addError(4, 13, "Confusing use of '!'.")
    .addError(5, 10, "Confusing use of '!'.")
    .addError(6, 10, "Confusing use of '!'.")
    .addError(7, 16, "Confusing use of '!'.")
    .addError(8, 10, "Confusing use of '!'.")
    .addError(9, 10, "Confusing use of '!'.")
    .addError(10, 10, "Confusing use of '!'.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  TestRun(test, "No suitable expression following logical NOT.")
    .addError(1, 7, "Expected an identifier and instead saw ';'.")
    .addError(1, 6, "Unrecoverable syntax error. (100% scanned).")
    .test("void !;");

  TestRun(test, "Logical NOT in combination with 'infix' operators.")
    .addError(3, 6, "Confusing use of '!'.")
    .addError(4, 6, "Confusing use of '!'.")
    .addError(5, 6, "Confusing use of '!'.")
    .addError(6, 6, "Confusing use of '!'.")
    .addError(7, 6, "Confusing use of '!'.")
    .addError(8, 6, "Confusing use of '!'.")
    .addError(9, 6, "Confusing use of '!'.")
    .addError(10, 6, "Confusing use of '!'.")
    .addError(11, 6, "Confusing use of '!'.")
    .addError(12, 6, "Confusing use of '!'.")
    .addError(13, 6, "Confusing use of '!'.")
    .addError(14, 6, "Confusing use of '!'.")
    .addError(15, 6, "Confusing use of '!'.")
    .test([
      "void !'-';",
      "void !'+';",
      "void !(0 < 0);",
      "void !(0 <= 0);",
      "void !(0 == 0);",
      "void !(0 === 0);",
      "void !(0 !== 0);",
      "void !(0 != 0);",
      "void !(0 > 0);",
      "void !(0 >= 0);",
      "void !(0 + 0);",
      "void !(0 - 0);",
      "void !(0 * 0);",
      "void !(0 / 0);",
      "void !(0 % 0);",
    ]);

  TestRun(test, "Logical NOT in combination with other unary operators.")
    .addError(3, 6, "Confusing use of '!'.")
    .addError(4, 6, "Confusing use of '!'.")
    .test([
      "void !'-';",
      "void !'+';",
      "void !+0;",
      "void !-0;"
    ]);

  test.done();
};

exports.options = function (test) {
  var code = [
    "/*member a*/",
    "/*members b*/",
    "var x; x.a.b.c();",
    "/*jshint ++ */",
    "/*jslint indent: 0 */",
    "/*jslint indent: -2 */",
    "/*jslint indent: 100.4 */",
    "/*jslint maxlen: 200.4 */",
    "/*jslint maxerr: 300.4 */",
    "/*jslint maxerr: 0 */",
    "/*jslint maxerr: 20 */",
    "/*member c:true */",
    "/*jshint d:no */",
    "/*global xxx*/",
    "xxx = 2;",
    "/*jshint relaxing: true */",
    "/*jshint toString: true */",
  ];

  var run = TestRun(test)
    .addError(3, 14, "Unexpected /*member 'c'.")
    .addError(4, 1, "Bad option: '++'.")
    .addError(5, 1, "Expected a small integer or 'false' and instead saw '0'.")
    .addError(6, 1, "Expected a small integer or 'false' and instead saw '-2'.")
    .addError(7, 1, "Expected a small integer or 'false' and instead saw '100.4'.")
    .addError(8, 1, "Expected a small integer or 'false' and instead saw '200.4'.")
    .addError(9, 1, "Expected a small integer or 'false' and instead saw '300.4'.")
    .addError(10, 1, "Expected a small integer or 'false' and instead saw '0'.")
    .addError(13, 1, "Bad option: 'd'.")
    .addError(15, 1, "Read only.")
    .addError(16, 1, "Bad option: 'relaxing'.")
    .addError(17, 1, "Bad option: 'toString'.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  TestRun(test).test(fs.readFileSync(__dirname + "/fixtures/gh988.js", "utf8"));

  test.done();
};

exports.emptyDirectives = function (test) {
  TestRun(test)
    .addError(1, 1, "Bad option value.")
    .test('/* global */');

  TestRun(test)
    .addError(1, 1, "Bad option value.")
    .test('/* global : */');

  TestRun(test)
    .addError(1, 1, "Bad option value.")
    .test('/* global -: */');

  TestRun(test)
    .test('/* global foo, bar, baz, */');

  TestRun(test)
    .addError(1, 1, "Bad option value.")
    .test('/* globals */');

  TestRun(test)
    .addError(1, 1, "Bad option value.")
    .test('/* globals : */');

  TestRun(test)
    .addError(1, 1, "Bad option value.")
    .test('/* globals -: */');

  TestRun(test)
    .test('/* globals foo, bar, baz, */');

  TestRun(test)
    .addError(1, 1, "Bad option value.")
    .test('/* exported */');

  TestRun(test)
    .test('/* exported foo, bar, baz, */');

  test.done();
};

exports["jshint option comments single line"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/gh1768-1.js", "utf8");

  TestRun(test).test(src);

  test.done();
};

exports["jshint option comments single line, leading and trailing space"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/gh1768-2.js", "utf8");

  TestRun(test).test(src);

  test.done();
};

exports["jshint option comments multi line"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/gh1768-3.js", "utf8");

  TestRun(test).test(src);

  test.done();
};

exports["jshint option comments multi line, leading and trailing space"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/gh1768-4.js", "utf8");

  TestRun(test)
    .addError(4, 1, "'foo' is not defined.")
    .test(src);

  test.done();
};

exports["jshint option comments multi line/option"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/gh1768-5.js", "utf8");

  TestRun(test)
    .addError(3, 1, "'foo' is not defined.")
    .test(src);

  test.done();
};

exports["jshint option comments multi line/option, leading and trailing space"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/gh1768-6.js", "utf8");

  TestRun(test)
    .addError(4, 1, "'foo' is not defined.")
    .test(src);

  test.done();
};

exports["jshint option inline comments, leading and trailing tabs and spaces"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/inline-tabs-spaces.js", "utf8");

  TestRun(test)
    .addError(3, 9, "'x' is defined but never used.")
    .addError(10, 9, "'y' is defined but never used.")
    .addError(17, 9, "'z' is defined but never used.")
    .test(src);

  test.done();
};

exports.shebang = function (test) {
  var code = [
    "#!test",
    "var a = 'xxx';",
    "#!test"
  ];

  var run = TestRun(test)
    .addError(3, 1, "Expected an identifier and instead saw '#'.")
    .addError(3, 2, "Expected an operator and instead saw '!'.")
    .addError(3, 2, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 3, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 3, "Missing semicolon.")
    .addError(3, 7, "Missing semicolon.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  test.done();
};

exports.shebangImpliesNode = function (test) {
  var code = [
    "#!usr/bin/env node",
    "require('module');",
  ];

  TestRun(test).test(code);
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
    "var j = 1e-10;", // GH-821
    "var k = 0o1234567;",
    "var l = 0b101;",
    "var m = 0x;",
    "var n = 09;",
    "var o = 1e-A;",
    "var p = 1/;",
    "var q = 1x;"
  ];

  TestRun(test)
    .addError(2, 15, "Value described by numeric literal cannot be accurately represented with a number value: '10e308'.")
    .addError(5, 11, "A leading decimal point can be confused with a dot: '.3'.")
    .addError(6, 9, "Unexpected '0'.")
    .addError(7, 1, "Expected an identifier and instead saw 'var'.")
    .addError(7, 4, "Missing semicolon.")
    .addError(7, 13, "Don't use extra leading zeros '0033'.")
    .addError(8, 11, "A trailing decimal point can be confused with a dot: '3.'.")
    .addError(9, 9, "A dot following a number can be confused with a decimal point.")
    .addError(11, 9, "'Octal integer literal' is only available in ES6 (use 'esversion: 6').")
    .addError(12, 9, "'Binary integer literal' is only available in ES6 (use 'esversion: 6').")
    .addError(13, 11, "Malformed numeric literal: '0x'.")
    .addError(15, 9, "Unexpected '1'.")
    .addError(16, 11, "Expected an identifier and instead saw ';'.")
    .addError(16, 1, "Expected an identifier and instead saw 'var'.")
    .addError(16, 4, "Missing semicolon.")
    .addError(16, 12, "Missing semicolon.")
    .addError(17, 9, "Unexpected '1'.")
    .addError(17, 7, "Unexpected early end of program.")
    .addError(17, 9, "Unrecoverable syntax error. (100% scanned).")
    .test(code, {es3: true});

  // Octals are prohibited in strict mode.
  TestRun(test)
    .addError(3, 11, "Octal literals are not allowed in strict mode.")
    .test([
      "(function () {",
      "'use strict';",
      "return 045;",
      "}());"
    ]);

  TestRun(test)
    .test([
      "void 08;",
      "void 0181;"
    ]);

  TestRun(test)
    .addError(3, 10, "Decimals with leading zeros are not allowed in strict mode.")
    .test([
      "(function () {",
      "'use strict';",
      "return 08;",
      "}());"
    ]);

  TestRun(test)
    .addError(3, 12, "Decimals with leading zeros are not allowed in strict mode.")
    .test([
      "(function () {",
      "'use strict';",
      "return 0181;",
      "}());"
    ]);

  // GitHub #751 - an expression containing a number with a leading decimal point should be parsed in its entirety
  TestRun(test)
    .addError(1, 11, "A leading decimal point can be confused with a dot: '.3'.")
    .addError(2, 15, "A leading decimal point can be confused with a dot: '.3'.")
    .test([
      "var a = .3 + 1;",
      "var b = 1 + .3;",
    ]);

  TestRun(test)
    .addError(5, 18, "Missing semicolon.")
    .addError(5, 18, "Expected an assignment or function call and instead saw an expression.")
    .addError(6, 14, "Missing semicolon.")
    .addError(6, 14, "Expected an assignment or function call and instead saw an expression.")
    .test([
      "var a = 0o1234567;",
      "var b = 0O1234567;",
      "var c = 0b101;",
      "var d = 0B101;",
      "var e = 0o12345678;",
      "var f = 0b1012;",
    ], {esnext: true});

  TestRun(test)
    .test([
      "// jshint esnext: true",
      "var a = 0b0 + 0o0;"
    ]);

  test.done();
};

exports.comments = function (test) {
  var code = [
    "/*",
    "/* nested */",
    "*/",
    "/* unclosed ..",
  ];

  var run = TestRun(test)
    .addError(3, 1, "Unbegun comment.")
    .addError(4, 1, "Unclosed comment.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  var src = "/* this is a comment /* with nested slash-start */";
  TestRun(test).test(src);
  TestRun(test).test(fs.readFileSync(__dirname + "/fixtures/gruntComment.js", "utf8"));

  TestRun(test)
    .addError(1, 2, "Unmatched '{'.")
    .addError(1, 2, "Unrecoverable syntax error. (100% scanned).")
    .test("({");

  test.done();
};

exports.regexp = {};

exports.regexp.basic = function (test) {
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
    "var w = v + /s/;",
    "var x = w - /s/;",
    "var y = typeof /[a-z]/;", // GH-657
    "var z = /a/ instanceof /a/.constructor;", // GH-2773
    "void /./;",
    "var v = /dsdg;"
  ];

  var run = TestRun(test)
    .addError(1, 10, "Unexpected control character in regular expression.")
    .addError(2, 10, "Unexpected control character in regular expression.")
    .addError(3, 10, "Unexpected escaped character '<' in regular expression.")
    .addError(4, 10, "Unexpected escaped character '<' in regular expression.")
    .addError(5, 9, "Invalid regular expression.")
    .addError(6, 9, "Invalid regular expression.")
    .addError(11, 9, "Invalid regular expression.")
    .addError(12, 9, "Invalid regular expression.")
    .addError(14, 9, "Invalid regular expression.")
    .addError(15, 9, "Invalid regular expression.")
    .addError(17, 9, "Invalid regular expression.")
    .addError(20, 9, "Invalid regular expression.")
    .addError(21, 9, "Invalid regular expression.")
    .addError(29, 9, "Unclosed regular expression.")
    .addError(29, 9, "Unrecoverable syntax error. (100% scanned).");

  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  TestRun(test).test("var a = `${/./}${/./}`;", { esversion: 6 });


  // Pre Regular Expression Punctuation
  //  (See: token method, create function in lex.js)
  //
  // "."
  TestRun(test)
    .addError(1, 12, "A trailing decimal point can be confused with a dot: '10.'.")
    .test("var y = 10. / 1;", {es3: true});
  TestRun(test)
    .addError(1, 12, "A trailing decimal point can be confused with a dot: '10.'.")
    .test("var y = 10. / 1;", {}); // es5
  TestRun(test)
    .addError(1, 12, "A trailing decimal point can be confused with a dot: '10.'.")
    .test("var y = 10. / 1;", {esnext: true});
  TestRun(test)
    .addError(1, 12, "A trailing decimal point can be confused with a dot: '10.'.")
    .test("var y = 10. / 1;", {moz: true});

  // ")"
  TestRun(test).test("var y = Math.sqrt(16) / 180;", {es3: true});
  TestRun(test).test("var y = Math.sqrt(16) / 180;", {}); // es5
  TestRun(test).test("var y = Math.sqrt(16) / 180;", {esnext: true});
  TestRun(test).test("var y = Math.sqrt(16) / 180;", {moz: true});

  // "~"
  TestRun(test).test("var y = ~16 / 180;", {es3: true});
  TestRun(test).test("var y = ~16 / 180;", {}); // es5
  TestRun(test).test("var y = ~16 / 180;", {esnext: true});
  TestRun(test).test("var y = ~16 / 180;", {moz: true});


  // "]" (GH-803)
  TestRun(test).test("var x = [1]; var y = x[0] / 180;", {es3: true});
  TestRun(test).test("var x = [1]; var y = x[0] / 180;", {}); // es5
  TestRun(test).test("var x = [1]; var y = x[0] / 180;", {esnext: true});
  TestRun(test).test("var x = [1]; var y = x[0] / 180;", {moz: true});

  // "++" (GH-1787)
  TestRun(test).test("var a = 1; var b = a++ / 10;", {es3: true});
  TestRun(test).test("var a = 1; var b = a++ / 10;", {}); // es5
  TestRun(test).test("var a = 1; var b = a++ / 10;", {esnext: true});
  TestRun(test).test("var a = 1; var b = a++ / 10;", {moz: true});

  // "--" (GH-1787)
  TestRun(test).test("var a = 1; var b = a-- / 10;", {es3: true});
  TestRun(test).test("var a = 1; var b = a-- / 10;", {}); // es5
  TestRun(test).test("var a = 1; var b = a-- / 10;", {esnext: true});
  TestRun(test).test("var a = 1; var b = a-- / 10;", {moz: true});


  TestRun(test, "gh-3308").test("void (function() {} / 0);");

  TestRun(test)
    .addError(1, 9, "Invalid regular expression.")
    .test("var a = /.*/ii;");

  TestRun(test, "Invalid Decimal Escape Sequence tolerated without `u` flag")
    .test([
      "void /\\00/;",
      "void /\\01/;",
      "void /\\02/;",
      "void /\\03/;",
      "void /\\04/;",
      "void /\\05/;",
      "void /\\06/;",
      "void /\\07/;",
      "void /\\08/;",
      "void /\\09/;"
    ]);

  TestRun(test, "following `new`")
    .addError(1, 5, "Bad constructor.")
    .addError(1, 5, "Missing '()' invoking a constructor.")
    .test("new /./;");

  TestRun(test, "following `delete`")
    .addError(1, 11, "Variables should not be deleted.")
    .test("delete /./;");

  TestRun(test, "following `extends`")
    .test("class R extends /./ {}", {esversion: 6});

  TestRun(test, "following `default`")
    .test("export default /./;", {esversion: 6, module: true});

  test.done();
};

exports.regexp.uFlag = function (test) {
  // Flag validity
  TestRun(test)
    .addError(1, 9, "'Unicode RegExp flag' is only available in ES6 (use 'esversion: 6').")
    .test("var a = /.*/u;");

  TestRun(test)
    .test("var a = /.*/u;", { esversion: 6 });

  // Hexidecimal limits
  TestRun(test)
    .addError(3, 5, "Invalid regular expression.")
    .test([
      "var a = /\\u{0}/u;",
      "a = /\\u{10FFFF}/u;",
      "a = /\\u{110000}/u;"
    ], { esnext: true });

  TestRun(test, "Guard against regression from escape sequence substitution")
    .test("void /\\u{3f}/u;", { esversion: 6 });

  // Hexidecimal in range patterns
  TestRun(test)
    .addError(3, 5, "Invalid regular expression.")
    .addError(4, 5, "Invalid regular expression.")
    .test([
      "var a = /[\\u{61}-b]/u;",
      "a = /[\\u{061}-b]/u;",
      "a = /[\\u{63}-b]/u;",
      "a = /[\\u{0063}-b]/u;",
    ], { esnext: true });

  TestRun(test)
    .test("var x = /[\uD834\uDF06-\uD834\uDF08a-z]/u;", { esversion: 6 });

  TestRun(test)
    .addError(1, 6, "Invalid regular expression.")
    .test("void /.{}/u;", { esversion: 6 });

  TestRun(test)
    .test([
      "void /.{0}/;",
      "void /.{0}/u;",
      "void /.{9}/;",
      "void /.{9}/u;",
      "void /.{23}/;",
      "void /.{23}/u;"
    ], { esversion: 6 });

  TestRun(test)
    .addError(1, 6, "Invalid regular expression.")
    .test("void /.{,2}/u;", { esversion: 6 });

  TestRun(test)
    .addError(1, 6, "Invalid regular expression.")
    .test("void /.{2,1}/u;", { esversion: 6 });

  TestRun(test, "Invalid group reference")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /(.)(.)\\3/u;", { esversion: 6 });

  TestRun(test, "Valid group reference - multiple digits")
    .test([
      "void /(.)(.)(.)(.)(.)(.)(.)(.)(.)(.)\\10/u;",
      "void /(.)(.)(.)(.)(.)(.)(.)(.)(.)(.)\\10a/u;",
      "void /(.)(.)(.)(.)(.)(.)(.)(.)(.)(.)(.)\\11/u;",
      "void /(.)(.)(.)(.)(.)(.)(.)(.)(.)(.)(.)\\11a/u;"
    ], { esversion: 6 });

  // A negative syntax test is the only way to verify JSHint is interpeting the
  // adjacent digits as one reference as opposed to a reference followed by a
  // literal digit.
  TestRun(test, "Invalid group reference - two digits")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /(.)\\10/u;", { esversion: 6 });

  TestRun(test, "Invalid group reference - three digits")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /(.)(.)(.)(.)(.)(.)(.)(.)(.)(.)\\100/u;", { esversion: 6 });

  TestRun(test, "Invalid group reference (permitted without flag)")
    .test("void /(.)(.)\\3/;", { esversion: 6 });

  TestRun(test, "Invalid unicode escape sequence")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\u{123,}/u;", { esversion: 6 });

  TestRun(test, "Invalid unicode escape sequence (permitted without flag)")
    .test("void /\\u{123,}/;", { esversion: 6 });

  TestRun(test, "Invalid character escape")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\m/u;", { esversion: 6 });

  TestRun(test, "Invalid character escape (permitted without flag)")
    .test("void /\\m/;", { esversion: 6 });

  TestRun(test, "Invalid quantifed group")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /(?=.)?/u;", { esversion: 6 });

  TestRun(test, "Invalid quantifed group (permitted without flag)")
    .test("void /(?=.)?/;", { esversion: 6 });

  TestRun(test, "Invalid quantifier - unclosed")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /.{1/u;", { esversion: 6 });

  TestRun(test, "Invalid quantifier - unclosed (permitted without flag)")
    .test("void /.{1/;", { esversion: 6 });

  TestRun(test, "Invalid quantifier - unclosed with comma")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /.{1,/u;", { esversion: 6 });

  TestRun(test, "Invalid quantifier - unclosed with comma (permitted without flag)")
    .test("void /.{1,/;", { esversion: 6 });

  TestRun(test, "Invalid quantifier - unclosed with upper bound")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /.{1,2/u;", { esversion: 6 });

  TestRun(test, "Invalid quantifier - unclosed with upper bound (permitted without flag)")
    .test("void /.{1,2/;", { esversion: 6 });

  TestRun(test, "Character class in lower bound of range (permitted without flag)")
    .test('void /[\\s-1]/;', { esversion: 6 });

  TestRun(test, "Character class in lower bound of range")
    .addError(1, 6, "Invalid regular expression.")
    .test('void /[\\s-1]/u;', { esversion: 6 });

  TestRun(test, "Character class in upper bound of range (permitted without flag)")
    .test('void /[1-\\W]/;', { esversion: 6 });

  TestRun(test, "Character class in upper bound of range")
    .addError(1, 6, "Invalid regular expression.")
    .test('void /[1-\\W]/u;', { esversion: 6 });

  TestRun(test)
    .test('void /[\\s0-1\\s2-3\\s]/u;', { esversion: 6 });

  TestRun(test, "Null CharacterEscape")
    .test([
      "void /\\0/u;",
      "void /\\0a/u;"
    ], { esversion: 6 });

  TestRun(test)
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\00/u;", { esversion: 6 });

  TestRun(test)
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\01/u;", { esversion: 6 });

  TestRun(test, "ControlEscape")
    .test([
      "void /\\f/u;",
      "void /\\n/u;",
      "void /\\r/u;",
      "void /\\t/u;",
      "void /\\v/u;"
    ], { esversion: 6 });

  test.done();
};

exports.regexp.yFlag = function (test) {
  // Flag validity
  TestRun(test)
    .addError(1, 9, "'Sticky RegExp flag' is only available in ES6 (use 'esversion: 6').")
    .test("var a = /.*/y;");

  TestRun(test)
    .test("var a = /.*/y;", { esversion: 6 });

  TestRun(test)
    .addError(1, 9, "Invalid regular expression.")
    .test("var a = /.*/yiy;", { esversion: 6 });

  test.done();
};

exports.regexp.dotAll = function (test) {
  TestRun(test, "flag presence - disallowed in editions prior to 2018")
    .addError(1, 6, "'DotAll RegExp flag' is only available in ES9 (use 'esversion: 9').")
    .addError(2, 6, "'DotAll RegExp flag' is only available in ES9 (use 'esversion: 9').")
    .addError(3, 6, "'DotAll RegExp flag' is only available in ES9 (use 'esversion: 9').")
    .test([
      "void /./s;",
      "void /./gs;",
      "void /./sg;"
    ], { esversion: 8 });

  TestRun(test, "flag presence - allowed in 2018")
    .test([
      "void /./s;",
      "void /./gs;",
      "void /./sg;"
    ], { esversion: 9 });

  TestRun(test, "duplicate flag")
    .addError(1, 6, "Invalid regular expression.")
    .addError(2, 6, "Invalid regular expression.")
    .test([
      "void /./ss;",
      "void /./sgs;"
    ], { esversion: 9 });

  TestRun(test, "missing dot")
    .addError(1, 6, "Unnecessary RegExp 's' flag.")
    .addError(2, 6, "Unnecessary RegExp 's' flag.")
    .addError(3, 6, "Unnecessary RegExp 's' flag.")
    .addError(4, 6, "Unnecessary RegExp 's' flag.")
    .addError(5, 6, "Unnecessary RegExp 's' flag.")
    .test([
      "void /dotall flag without dot/s;",
      "void /literal period \\./s;",
      "void /\\. literal period/s;",
      "void /literal period \\\\\\./s;",
      "void /\\\\\\. literal period/s;"
    ], { esversion: 9 });

  TestRun(test, "dot following escape")
    .test([
      "void /RegExp dot \\\\./s;",
      "void /\\\\. RegExp dot/s;",
      "void /RegExp dot \\\\\\\\\./s;",
      "void /\\\\\\\\\. RegExp dot/s;"
    ], { esversion: 9 });

  test.done();
};

exports.regexp.unicodePropertyEscape = function (test) {
  TestRun(test, "requires `esversion: 9`")
    .addError(1, 6, "'Unicode property escape' is only available in ES9 (use 'esversion: 9').")
    .test("void /\\p{Any}/u;", { esversion: 8 });

  TestRun(test, "restricted in character class ranges")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /[--\\p{Any}]/u;", { esversion: 9 });

  TestRun(test, "rejects missing delimiter")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\p /u;", { esversion: 9 });

  TestRun(test, "rejects omitted sequence")
    .addError(1, 6, "Unclosed regular expression.")
    .addError(1, 6, "Unrecoverable syntax error. (100% scanned).")
    .test("void /\\p{Any/u;", { esversion: 9 });

  TestRun(test, "rejects unterminated sequence")
    .addError(1, 6, "Unclosed regular expression.")
    .addError(1, 6, "Unrecoverable syntax error. (100% scanned).")
    .test("void /\\p{Any/u;", { esversion: 9 });

  TestRun(test, "rejects invalid General_Category values")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\p{General_Category=Adlam}/u;", { esversion: 9 });

  TestRun(test, "rejects invalid Script values")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\p{Script=Cased_Letter}/u;", { esversion: 9 });

  TestRun(test, "rejects invalid Script_Extensions values")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\p{Script_Extensions=Cased_Letter}/u;", { esversion: 9 });

  TestRun(test, "rejects Script values as shorthand")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\p{Adlam}/u;", { esversion: 9 });

  TestRun(test, "rejects invalid names")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\p{hasOwnProperty=Cased_Letter}/u;", { esversion: 9 });

  TestRun(test, "rejects invalid values")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\p{hasOwnProperty}/u;", { esversion: 9 });

  TestRun(test, "rejects invalid values")
    .addError(1, 6, "Invalid regular expression.")
    .test("void /\\p{General_Category=hasOwnProperty}/u;", { esversion: 9 });

  TestRun(test, "tolerates errors without `u` flag")
    .test([
      "void /\\p/;",
      "void /\\p{}/;"
    ], { esversion: 9 });

  TestRun(test, "accepts valid binary aliases")
    .test([
      "void /\\p{ASCII}/u;",
      "void /\\P{ASCII}/u;",
    ], { esversion: 9 });

  TestRun(test, "accepts valid General_Category values")
    .test([
      "void /\\p{General_Category=Cased_Letter}/u;",
      "void /\\p{gc=Cased_Letter}/u;",
      "void /\\P{General_Category=Cased_Letter}/u;",
      "void /\\P{gc=Cased_Letter}/u;"
    ], { esversion: 9 });

  TestRun(test, "accepts General_Category values shorthand")
    .test([
      "void /\\p{Cased_Letter}/u;",
      "void /\\P{Cased_Letter}/u;"
    ], { esversion: 9 });

  TestRun(test, "accepts valid Script values")
    .test([
      "void /\\p{Script=Adlam}/u;",
      "void /\\p{sc=Adlam}/u;",
      "void /\\P{Script=Adlam}/u;",
      "void /\\P{sc=Adlam}/u;"
    ], { esversion: 9 });

  TestRun(test, "accepts valid Script_Extensions values")
    .test([
      "void /\\p{Script_Extensions=Adlam}/u;",
      "void /\\p{scx=Adlam}/u;",
      "void /\\P{Script_Extensions=Adlam}/u;",
      "void /\\P{scx=Adlam}/u;"
    ], { esversion: 9 });

  test.done();
};

exports.regexp.regressions = function (test) {
  // GH-536
  TestRun(test).test("str /= 5;", {es3: true}, { str: true });
  TestRun(test).test("str /= 5;", {}, { str: true }); // es5
  TestRun(test).test("str /= 5;", {esnext: true}, { str: true });
  TestRun(test).test("str /= 5;", {moz: true}, { str: true });

  TestRun(test).test("str = str.replace(/=/g, '');",  {es3: true}, { str: true });
  TestRun(test).test("str = str.replace(/=/g, '');", {}, { str: true }); // es5
  TestRun(test).test("str = str.replace(/=/g, '');", {esnext: true}, { str: true });
  TestRun(test).test("str = str.replace(/=/g, '');", {moz: true}, { str: true });

  TestRun(test).test("str = str.replace(/=abc/g, '');", {es3: true}, { str: true });
  TestRun(test).test("str = str.replace(/=abc/g, '');", {}, { str: true }); // es5
  TestRun(test).test("str = str.replace(/=abc/g, '');", {esnext: true}, { str: true });
  TestRun(test).test("str = str.replace(/=abc/g, '');", {moz: true}, { str: true });

  // GH-538
  TestRun(test).test("var exp = /function(.*){/gi;", {es3: true});
  TestRun(test).test("var exp = /function(.*){/gi;", {}); // es5
  TestRun(test).test("var exp = /function(.*){/gi;", {esnext: true});
  TestRun(test).test("var exp = /function(.*){/gi;", {moz: true});

  TestRun(test).test("var exp = /\\[\\]/;", {es3: true});
  TestRun(test).test("var exp = /\\[\\]/;", {}); // es5
  TestRun(test).test("var exp = /\\[\\]/;", {esnext: true});
  TestRun(test).test("var exp = /\\[\\]/;", {moz: true});

  // GH-3356
  TestRun(test).test("void /[/]/;");
  TestRun(test).test("void /[{]/u;", {esversion: 6});
  TestRun(test).test("void /[(?=)*]/u;", {esversion: 6});
  TestRun(test).test("void /[(?!)+]/u;", {esversion: 6});

  test.done();
};

exports.regexpSticky = function (test) {
 TestRun(test)
   .addError(1, 11, "'Sticky RegExp flag' is only available in ES6 (use 'esversion: 6').")
   .test("var exp = /./y;", { esversion: 5 });

 TestRun(test).test("var exp = /./y;", { esversion: 6 });
 TestRun(test).test("var exp = /./gy;", { esversion: 6 });
 TestRun(test).test("var exp = /./yg;", { esversion: 6 });

 TestRun(test, "Invalid due to repetition")
   .addError(1, 11, "Invalid regular expression.")
   .addError(2, 11, "Invalid regular expression.")
   .test([
      "var exp = /./yy;",
      "var exp = /./ygy;"
      ], { esversion: 6 });

 TestRun(test, "Invalid due to other conditions")
   .addError(1, 11, "Invalid regular expression.")
   .addError(2, 11, "Invalid regular expression.")
   .test([
     "var exp = /./gyg;",
     "var exp = /?/y;"
     ] , { esversion: 6 });

 test.done();
};

exports.strings = function (test) {
  var code = [
    "var a = '\u0012\\r';",
    "var b = \'\\g\';",
    "var c = '\\u0022\\u0070\\u005C';",
    "var d = '\\\\';",
    "var e = '\\x6b..\\x6e';",
    "var f = '\\b\\f\\n\\/';",
    "var g = 'ax",
  ];

  var run = TestRun(test)
    .addError(1, 10, "Control character in string: <non-printable>.")
    .addError(7, 12, "Unclosed string.")
    .addError(7, 12, "Missing semicolon.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  test.done();
};

exports.badStrings = function (test) {
  var code = [
    "var a = '\\uNOTHEX';",
    "void '\\u0000';",
    "void '\\ug000';",
    "void '\\u0g00';",
    "void '\\u00g0';",
    "void '\\u000g';"
  ];

  var run = TestRun(test)
    .addError(1, 11, "Unexpected 'uNOTH'.")
    .addError(3, 8, "Unexpected 'ug000'.")
    .addError(4, 8, "Unexpected 'u0g00'.")
    .addError(5, 8, "Unexpected 'u00g0'.")
    .addError(6, 8, "Unexpected 'u000g'.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  test.done();
};

exports.ownProperty = function (test) {
  var code = [
    "var obj = { hasOwnProperty: false };",
    "obj.hasOwnProperty = true;",
    "obj['hasOwnProperty'] = true;",
    "function test() { var hasOwnProperty = {}.hasOwnProperty; }"
  ];

  var run = TestRun(test)
    .addError(1, 27, "'hasOwnProperty' is a really bad name.")
    .addError(2, 20, "'hasOwnProperty' is a really bad name.")
    .addError(3, 23, "'hasOwnProperty' is a really bad name.")
    .addError(3, 4, "['hasOwnProperty'] is better written in dot notation.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  test.done();
};

exports.json = {};
exports.json.dflt = function (test) {
  var code = [
    '{',
    '  a: 2,',
    '  \'b\': "hallo\\"\\v\\x12\\\'world",',
    '  "c\\"\\v\\x12": \'4\',',
    '  "d": "4\\',
    '  ",',
    '  "e": 0x332,',
    '  "x": 0',
    '}',
  ];

  var run = TestRun(test)
    .addError(2, 3, "Expected a string and instead saw a.")
    .addError(3, 3, "Strings must use doublequote.")
    .addError(3, 17, "Avoid \\v.")
    .addError(3, 19, "Avoid \\x-.")
    .addError(3, 23, "Avoid \\'.")
    .addError(4, 8, "Avoid \\v.")
    .addError(4, 10, "Avoid \\x-.")
    .addError(4, 16, "Strings must use doublequote.")
    .addError(5, 11, "Avoid EOL escaping.")
    .addError(7, 13, "Avoid 0x-.");
  run.test(code, {multistr: true, es3: true});
  run.test(code, {multistr: true}); // es5
  run.test(code, {multistr: true, esnext: true});
  run.test(code, {multistr: true, moz: true});

  test.done();
};

exports.json.deep = function (test) {
  var code = [
    '{',
    '  "key" : {',
    '    "deep" : [',
    '      "value",',
    '      { "num" : 123, "array": [] }',
    '    ]',
    '  },',
    '  "single": ["x"],',
    '  "negative": -1.23e2',
    '}'
  ];

  var run = TestRun(test);

  run.test(code, {multistr: true, es3: true});
  run.test(code, {multistr: true}); // es5
  run.test(code, {multistr: true, esnext: true});
  run.test(code, {multistr: true, moz: true});

  test.done();
}

exports.json.errors = function (test) {
  var objTrailingComma = [
    '{ "key" : "value", }',
  ];

  var run1 = TestRun(test)
    .addError(1, 18, "Unexpected comma.");

  run1.test(objTrailingComma, {multistr: true, es3: true});
  run1.test(objTrailingComma, {multistr: true}); // es5
  run1.test(objTrailingComma, {multistr: true, esnext: true});
  run1.test(objTrailingComma, {multistr: true, moz: true});

  var arrayTrailingComma = [
    '{ "key" : [,] }',
  ];

  var run2 = TestRun(test)
    .addError(1, 12, "Illegal comma.")
    .addError(1, 12, "Expected a JSON value.")
    .addError(1, 12, "Unexpected comma.");

  run2.test(arrayTrailingComma, {multistr: true, es3: true});
  run2.test(arrayTrailingComma, {multistr: true}); // es5
  run2.test(arrayTrailingComma, {multistr: true, esnext: true});
  run2.test(arrayTrailingComma, {multistr: true, moz: true});

  var objMissingComma = [
    '{ "k1":"v1" "k2":"v2" }',
  ];

  var run3 = TestRun(test)
    .addError(1, 13, "Expected '}' and instead saw 'k2'.")
    .addError(1, 13, "Unrecoverable syntax error. (100% scanned).");

  run3.test(objMissingComma, {multistr: true, es3: true});
  run3.test(objMissingComma, {multistr: true}); // es5
  run3.test(objMissingComma, {multistr: true, esnext: true});
  run3.test(objMissingComma, {multistr: true, moz: true});

  var arrayMissingComma = [
    '[ "v1" "v2" ]',
  ];

  var run4 = TestRun(test)
    .addError(1, 8, "Expected ']' and instead saw 'v2'.")
    .addError(1, 8, "Unrecoverable syntax error. (100% scanned).");

  run4.test(arrayMissingComma, {multistr: true, es3: true});
  run4.test(arrayMissingComma, {multistr: true}); // es5
  run4.test(arrayMissingComma, {multistr: true, esnext: true});
  run4.test(arrayMissingComma, {multistr: true, moz: true});

  var objDoubleComma = [
    '{ "k1":"v1",, "k2":"v2" }',
  ];

  var run5 = TestRun(test)
    .addError(1, 13, "Illegal comma.")
    .addError(1, 15, "Expected ':' and instead saw 'k2'.")
    .addError(1, 19, "Expected a JSON value.")
    .addError(1, 19, "Expected '}' and instead saw ':'.")
    .addError(1, 19, "Unrecoverable syntax error. (100% scanned).");

  run5.test(objDoubleComma, {multistr: true, es3: true});
  run5.test(objDoubleComma, {multistr: true}); // es5
  run5.test(objDoubleComma, {multistr: true, esnext: true});
  run5.test(objDoubleComma, {multistr: true, moz: true});

  var arrayDoubleComma = [
    '[ "v1",, "v2" ]',
  ];

  var run6 = TestRun(test)
    .addError(1, 8, "Illegal comma.")
    .addError(1, 8, "Expected a JSON value.");

  run6.test(arrayDoubleComma, {multistr: true, es3: true});
  run6.test(arrayDoubleComma, {multistr: true}); // es5
  run6.test(arrayDoubleComma, {multistr: true, esnext: true});
  run6.test(arrayDoubleComma, {multistr: true, moz: true});

  var objUnclosed = [
    '{ "k1":"v1"',
  ];

  var run7 = TestRun(test)
    .addError(1, 8, "Expected '}' and instead saw ''.")
    .addError(1, 8, "Unrecoverable syntax error. (100% scanned).");

  run7.test(objUnclosed, {multistr: true, es3: true});
  run7.test(objUnclosed, {multistr: true}); // es5
  run7.test(objUnclosed, {multistr: true, esnext: true});
  run7.test(objUnclosed, {multistr: true, moz: true});

  var arrayUnclosed = [
    '[ "v1"',
  ];

  var run8 = TestRun(test)
    .addError(1, 3, "Expected ']' and instead saw ''.")
    .addError(1, 3, "Unrecoverable syntax error. (100% scanned).");

  run8.test(arrayUnclosed, {multistr: true, es3: true});
  run8.test(arrayUnclosed, {multistr: true}); // es5
  run8.test(arrayUnclosed, {multistr: true, esnext: true});
  run8.test(arrayUnclosed, {multistr: true, moz: true});

  var objUnclosed2 = [
    '{',
  ];

  var run9 = TestRun(test)
    .addError(1, 1, "Missing '}' to match '{' from line 1.")
    .addError(1, 1, "Unrecoverable syntax error. (100% scanned).");

  run9.test(objUnclosed2, {multistr: true, es3: true});
  run9.test(objUnclosed2, {multistr: true}); // es5
  run9.test(objUnclosed2, {multistr: true, esnext: true});
  run9.test(objUnclosed2, {multistr: true, moz: true});

  var arrayUnclosed2 = [
    '[',
  ];

  var run10 = TestRun(test)
    .addError(1, 1, "Missing ']' to match '[' from line 1.")
    .addError(1, 1, "Expected a JSON value.")
    .addError(1, 1, "Expected ']' and instead saw ''.")
    .addError(1, 1, "Unrecoverable syntax error. (100% scanned).");

  run10.test(arrayUnclosed2, {multistr: true, es3: true});
  run10.test(arrayUnclosed2, {multistr: true}); // es5
  run10.test(arrayUnclosed2, {multistr: true, esnext: true});
  run10.test(arrayUnclosed2, {multistr: true, moz: true});

  var objDupKeys = [
    '{ "k1":"v1", "k1":"v1" }',
  ];

  var run11 = TestRun(test)
    .addError(1, 14, "Duplicate key 'k1'.");

  run11.test(objDupKeys, {multistr: true, es3: true});
  run11.test(objDupKeys, {multistr: true}); // es5
  run11.test(objDupKeys, {multistr: true, esnext: true});
  run11.test(objDupKeys, {multistr: true, moz: true});

  var objBadKey = [
    '{ k1:"v1" }',
  ];

  var run12 = TestRun(test)
    .addError(1, 3, "Expected a string and instead saw k1.");

  run12.test(objBadKey, {multistr: true, es3: true});
  run12.test(objBadKey, {multistr: true}); // es5
  run12.test(objBadKey, {multistr: true, esnext: true});
  run12.test(objBadKey, {multistr: true, moz: true});

  var objBadValue = [
    '{ "noRegexpInJSON": /$^/ }',
  ];

  var run13 = TestRun(test)
    .addError(1, 21, "Expected a JSON value.")
    .addError(1, 21, "Expected '}' and instead saw '/$^/'.")
    .addError(1, 21, "Unrecoverable syntax error. (100% scanned).");

  run13.test(objBadValue, {multistr: true, es3: true});
  run13.test(objBadValue, {multistr: true}); // es5
  run13.test(objBadValue, {multistr: true, esnext: true});
  run13.test(objBadValue, {multistr: true, moz: true});

  test.done();
}

// Regression test for gh-2488
exports.json.semicolon = function (test) {
  TestRun(test)
    .test("{ \"attr\": \";\" }");

  TestRun(test)
    .test("[\";\"]");

  test.done();
};

exports.comma = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/comma.js", "utf8");

  TestRun(test)
    .addError(2, 92, "Expected an assignment or function call and instead saw an expression.")
    .addError(15, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(15, 5, "Missing semicolon.")
    .addError(15, 6, "Expected an assignment or function call and instead saw an expression.")
    .addError(15, 10, "Missing semicolon.")
    .addError(15, 29, "Missing semicolon.")
    .addError(20, 45, "Expected an assignment or function call and instead saw an expression.")
    .addError(30, 69, "Expected an assignment or function call and instead saw an expression.")
    .addError(35, 8, "Expected an assignment or function call and instead saw an expression.")
    .addError(35, 9, "Missing semicolon.")
    .addError(36, 3, "Unexpected 'if'.")
    .addError(43, 10, "Expected an assignment or function call and instead saw an expression.")
    .addError(43, 11, "Missing semicolon.")
    .addError(44, 1, "Unexpected '}'.")
    .test(src, {es3: true});

  // Regression test (GH-56)
  TestRun(test)
    .addError(4, 65, "Expected an assignment or function call and instead saw an expression.")
    .test(fs.readFileSync(__dirname + "/fixtures/gh56.js", "utf8"));

  // Regression test (GH-363)
  TestRun(test)
    .addError(1, 11, "Extra comma. (it breaks older versions of IE)")
    .test("var f = [1,];", {es3: true});

  TestRun(test)
    .addError(3, 6, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 7, "Missing semicolon.")
    .addError(3, 8, "Unexpected 'break'.")
    .test([
      "var a;",
      "while(true) {",
      "  a=1, break;",
      "}"
    ], { });

  TestRun(test, "within MemberExpression")
    .test("void [][0, 0];")

  test.done();
};

exports["gh-2587"] = function (test) {

  TestRun(test)
    .addError(1, 9, "Expected an identifier and instead saw 'if'.")
    .addError(1, 9, "Unrecoverable syntax error. (100% scanned).")
    .addError(1, 8, "Expected '===' and instead saw '=='.")
    .test([
    "true == if"
  ], {eqeqeq: true, eqnull: true});

  TestRun(test)
    .addError(1, 9, "Expected an identifier and instead saw 'if'.")
    .addError(1, 9, "Unrecoverable syntax error. (100% scanned).")
    .addError(1, 8, "Expected '!==' and instead saw '!='.")
    .test([
    "true != if"
  ], {eqeqeq: true, eqnull: true});

  TestRun(test)
    .addError(1, 9, "Expected an identifier and instead saw 'if'.")
    .addError(1, 9, "Unrecoverable syntax error. (100% scanned).")
    .test([
    "true == if"
  ], {});

  TestRun(test)
    .addError(1, 9, "Expected an identifier and instead saw 'if'.")
    .addError(1, 9, "Unrecoverable syntax error. (100% scanned).")
    .test([
    "true != if"
  ], {});

  TestRun(test)
    .addError(1, 10, "Expected an identifier and instead saw 'if'.")
    .addError(1, 10, "Unrecoverable syntax error. (100% scanned).")
    .test([
    "true === if"
  ], {});

  TestRun(test)
    .addError(1, 10, "Expected an identifier and instead saw 'if'.")
    .addError(1, 10, "Unrecoverable syntax error. (100% scanned).")
    .test([
    "true !== if"
  ], {});

  TestRun(test)
    .addError(1, 8, "Expected an identifier and instead saw 'if'.")
    .addError(1, 8, "Unrecoverable syntax error. (100% scanned).")
    .test([
    "true > if"
  ], {});

  TestRun(test)
    .addError(1, 8, "Expected an identifier and instead saw 'if'.")
    .addError(1, 8, "Unrecoverable syntax error. (100% scanned).")
    .test([
    "true < if"
  ], {});

  TestRun(test)
    .addError(1, 9, "Expected an identifier and instead saw 'if'.")
    .addError(1, 9, "Unrecoverable syntax error. (100% scanned).")
    .test([
    "true >= if"
  ], {});

  TestRun(test)
    .addError(1, 9, "Expected an identifier and instead saw 'if'.")
    .addError(1, 9, "Unrecoverable syntax error. (100% scanned).")
    .test([
    "true <= if"
  ], {});

  test.done();
};

exports.badAssignments = function (test) {
  TestRun(test)
    .addError(1, 5, "Bad assignment.")
    .test([
      "a() = 1;"
    ], { });

  TestRun(test)
    .addError(1, 7, "Bad assignment.")
    .test([
      "a.a() = 1;"
    ], { });

  TestRun(test)
    .addError(1, 16, "Bad assignment.")
    .test([
      "(function(){}) = 1;"
    ], { });

  TestRun(test)
    .addError(1, 7, "Bad assignment.")
    .test([
      "a.a() &= 1;"
    ], { });

  test.done();
};

exports.withStatement = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/with.js", "utf8");
  var run;

  run = TestRun(test)
    .addError(5, 1, "Don't use 'with'.")
    .addError(13, 5, "'with' is not allowed in strict mode.");
  run.test(src, {es3: true});
  run.test(src); // es5
  run.test(src, {esnext: true});
  run.test(src, {moz: true});

  run = TestRun(test)
    .addError(13, 5, "'with' is not allowed in strict mode.");
  run.test(src, {withstmt: true, es3: true});
  run.test(src, {withstmt: true}); // es5
  run.test(src, {withstmt: true, esnext: true});
  run.test(src, {withstmt: true, moz: true});

  test.done();
};

exports.blocks = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/blocks.js", "utf8");

  var run = TestRun(test)
    .addError(31, 5, "Unmatched \'{\'.")
    .addError(32, 1, "Unrecoverable syntax error. (100% scanned).");
  run.test(src, {es3: true});
  run.test(src, {}); // es5
  run.test(src, {esnext: true});
  run.test(src, {moz: true});

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

  var run = TestRun(test)
    .addError(5, 7, "'unused' is defined but never used.")
    .addError(6, 7, "'isDog' is defined but never used.")
    .addError(13, 10, "'unusedDeclaration' is defined but never used.")
    .addError(14, 5, "'unusedExpression' is defined but never used.")
    .addError(17, 12, "'cannotBeExported' is defined but never used.");

  run.test(src, {es3: true, unused: true });
  run.test(src, {unused: true }); // es5
  run.test(src, {esnext: true, unused: true });
  run.test(src, {moz: true, unused: true });
  run.test(src, {unused: true, latedef: true});

  TestRun(test)
    .addError(1, 5, "'unused' is defined but never used.")
    .test("var unused = 1; var used = 2;", {exported: ["used"], unused: true});

  TestRun(test, "exported vars aren't used before definition")
    .test("var a;", {exported:["a"], latedef: true});

  var code = [
    "/* exported a, b */",
    "if (true) {",
    "  /* exported c, d */",
    "  let a, c, e, g;",
    "  const [b, d, f, h] = [];",
    "  /* exported e, f */",
    "}",
    "/* exported g, h */"
  ];
  TestRun(test, "blockscoped variables")
    .addError(4, 7, "'a' is defined but never used.")
    .addError(4, 10, "'c' is defined but never used.")
    .addError(4, 13, "'e' is defined but never used.")
    .addError(4, 16, "'g' is defined but never used.")
    .addError(5, 10, "'b' is defined but never used.")
    .addError(5, 13, "'d' is defined but never used.")
    .addError(5, 16, "'f' is defined but never used.")
    .addError(5, 19, "'h' is defined but never used.")
    .test(code, {esversion: 6, unused: true});

  TestRun(test, "Does not export bindings which are not accessible on the top level.")
    .addError(2, 7, "'Moo' is defined but never used.")
    .test([
      "(function() {",
      "  var Moo;",
      "  /* exported Moo */",
      "})();"
    ], {unused: true});

  test.done();
};

exports.testIdentifiers = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/identifiers.js", "utf8");

  TestRun(test).test(src, {es3: true});
  var run = TestRun(test)
    .addError(1, 5, "'ascii' is defined but never used.")
    .addError(2, 5, "'num1' is defined but never used.")
    .addError(3, 5, "'lifé' is defined but never used.")
    .addError(4, 5, "'π' is defined but never used.")
    .addError(5, 5, "'привет' is defined but never used.")
    .addError(6, 5, "'\\u1d44' is defined but never used.")
    .addError(7, 5, "'encoded\\u1d44' is defined but never used.")
    .addError(8, 5, "'\\uFF38' is defined but never used.")
    .addError(9, 5, "'\\uFF58' is defined but never used.")
    .addError(10, 5, "'\\u1FBC' is defined but never used.")
    .addError(11, 5, "'\\uFF70' is defined but never used.")
    .addError(12, 5, "'\\u4DB3' is defined but never used.")
    .addError(13, 5, "'\\u97CA' is defined but never used.")
    .addError(14, 5, "'\\uD7A1' is defined but never used.")
    .addError(15, 5, "'\\uFFDA' is defined but never used.")
    .addError(16, 5, "'\\uA6ED' is defined but never used.")
    .addError(17, 5, "'\\u0024' is defined but never used.")
    .addError(18, 5, "'\\u005F' is defined but never used.")
    .addError(19, 5, "'\\u0024\\uFF38' is defined but never used.")
    .addError(20, 5, "'\\u0024\\uFF58' is defined but never used.")
    .addError(21, 5, "'\\u0024\\u1FBC' is defined but never used.")
    .addError(22, 5, "'\\u0024\\uFF70' is defined but never used.")
    .addError(23, 5, "'\\u0024\\u4DB3' is defined but never used.")
    .addError(24, 5, "'\\u0024\\u97CA' is defined but never used.")
    .addError(25, 5, "'\\u0024\\uD7A1' is defined but never used.")
    .addError(26, 5, "'\\u0024\\uFFDA' is defined but never used.")
    .addError(27, 5, "'\\u0024\\uA6ED' is defined but never used.")
    .addError(28, 5, "'\\u0024\\uFE24' is defined but never used.")
    .addError(29, 5, "'\\u0024\\uABE9' is defined but never used.")
    .addError(30, 5, "'\\u0024\\uFF17' is defined but never used.")
    .addError(31, 5, "'\\u0024\\uFE4E' is defined but never used.")
    .addError(32, 5, "'\\u0024\\u200C' is defined but never used.")
    .addError(33, 5, "'\\u0024\\u200D' is defined but never used.")
    .addError(34, 5, "'\\u0024\\u0024' is defined but never used.")
    .addError(35, 5, "'\\u0024\\u005F' is defined but never used.");
  run.test(src, {es3: true, unused: true });
  run.test(src, {unused: true }); // es5
  run.test(src, {esnext: true, unused: true });
  run.test(src, {moz: true, unused: true });

  test.done();
};

exports.badIdentifiers = function (test) {
  var badUnicode = [
    "var \\uNOTHEX;"
  ];

  var run = TestRun(test)
    .addError(1, 5, "Unexpected '\\'.")
    .addError(1, 1, "Expected an identifier and instead saw ''.")
    .addError(1, 5, "Unrecoverable syntax error. (100% scanned).");
  run.test(badUnicode, {es3: true});
  run.test(badUnicode, {}); // es5
  run.test(badUnicode, {esnext: true});
  run.test(badUnicode, {moz: true});

  var invalidUnicodeIdent = [
    "var \\u0000;"
  ];

  var run = TestRun(test)
    .addError(1, 5, "Unexpected '\\'.")
    .addError(1, 1, "Expected an identifier and instead saw ''.")
    .addError(1, 5, "Unrecoverable syntax error. (100% scanned).");
  run.test(invalidUnicodeIdent, {es3: true});
  run.test(invalidUnicodeIdent, {}); // es5
  run.test(invalidUnicodeIdent, {esnext: true});
  run.test(invalidUnicodeIdent, {moz: true});

  test.done();
};

exports["regression for GH-878"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/gh878.js", "utf8");

  TestRun(test).test(src, {es3: true});

  test.done();
};

exports["regression for GH-910"] = function (test) {
  var src = "(function () { if (true) { foo.bar + } })();";
  TestRun(test)
    .addError(1, 38, "Expected an identifier and instead saw '}'.")
    .addError(1, 38, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 39, "Missing semicolon.")
    .addError(1, 41, "Expected an identifier and instead saw ')'.")
    .addError(1, 42, "Expected an operator and instead saw '('.")
    .addError(1, 42, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 43, "Missing semicolon.")
    .addError(1, 43, "Expected an identifier and instead saw ')'.")
    .addError(1, 43, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 14, "Unmatched '{'.")
    .addError(1, 44, "Unrecoverable syntax error. (100% scanned).")
    .test(src, { es3: true, nonew: true });
  test.done();
};

exports.testHtml = function (test) {
  var html = "<html><body>Hello World</body></html>";
  TestRun(test)
    .addError(1, 1, "Expected an identifier and instead saw '<'.")
    .addError(1, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 2, "Missing semicolon.")
    .addError(1, 7, "Expected an identifier and instead saw '<'.")
    .addError(1, 7, "Unrecoverable syntax error. (100% scanned).")
    .test(html, {});
  test.done();
};

exports["destructuring var in function scope"] = function (test) {
  var code = [
    "function foobar() {",
    "  var [ a, b, c ] = [ 1, 2, 3 ];",
    "  var [ a ] = [ 1 ];",
    "  var [ a ] = [ z ];",
    "  var [ h, w ] = [ 'hello', 'world' ]; ",
    "  var [ o ] = [ { o : 1 } ];",
    "  var [ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "  var { foo : bar } = { foo : 1 };",
    "  var [ a, { foo : bar } ] = [ 2, { foo : 1 } ];",
    "  var [ 1 ] = [ a ];",
    "  var [ a, b; c ] = [ 1, 2, 3 ];",
    "  var [ a, b, c ] = [ 1, 2; 3 ];",
    "}"
  ];

  TestRun(test)
    .addError(1, 10,  "'foobar' is defined but never used.")
    .addError(3, 9,  "'a' is already defined.")
    .addError(4, 9,  "'a' is already defined.")
    .addError(7, 9,  "'a' is already defined.")
    .addError(7, 18,  "'b' is already defined.")
    .addError(7, 23,  "'c' is already defined.")
    .addError(9, 9,  "'a' is already defined.")
    .addError(9, 20,  "'bar' is already defined.")
    .addError(10, 9,  "Expected an identifier and instead saw '1'.")
    .addError(11, 13, "Expected ',' and instead saw ';'.")
    .addError(11, 9, "'a' is already defined.")
    .addError(11, 12, "'b' is already defined.")
    .addError(11, 15, "'c' is already defined.")
    .addError(12, 9, "'a' is already defined.")
    .addError(12, 12, "'b' is already defined.")
    .addError(12, 15, "'c' is already defined.")
    .addError(12, 27, "Expected ']' to match '[' from line 12 and instead saw ';'.")
    .addError(12, 28, "Missing semicolon.")
    .addError(12, 29, "Expected an assignment or function call and instead saw an expression.")
    .addError(12, 30, "Missing semicolon.")
    .addError(12, 31, "Expected an identifier and instead saw ']'.")
    .addError(12, 31, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 17,  "'z' is not defined.")
    .addError(12, 12, "'b' is defined but never used.")
    .addError(12, 15, "'c' is defined but never used.")
    .addError(5, 9,  "'h' is defined but never used.")
    .addError(5, 12,  "'w' is defined but never used.")
    .addError(6, 9,  "'o' is defined but never used.")
    .addError(7, 28,  "'d' is defined but never used.")
    .addError(9, 20,  "'bar' is defined but never used.")
    .test(code, {esnext: true, unused: true, undef: true});

  test.done();
};

exports["destructuring var as moz"] = function (test) {
  var code = [
    "var [ a, b, c ] = [ 1, 2, 3 ];",
    "var [ a ] = [ 1 ];",
    "var [ a ] = [ z ];",
    "var [ h, w ] = [ 'hello', 'world' ]; ",
    "var [ o ] = [ { o : 1 } ];",
    "var [ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "var { foo : bar } = { foo : 1 };",
    "var [ a, { foo : bar } ] = [ 2, { foo : 1 } ];",
  ];

  TestRun(test)
    .addError(3, 15,  "'z' is not defined.")
    .addError(8, 7,  "'a' is defined but never used.")
    .addError(6, 16,  "'b' is defined but never used.")
    .addError(6, 21,  "'c' is defined but never used.")
    .addError(4, 7,  "'h' is defined but never used.")
    .addError(4, 10,  "'w' is defined but never used.")
    .addError(5, 7,  "'o' is defined but never used.")
    .addError(6, 26,  "'d' is defined but never used.")
    .addError(8, 18,  "'bar' is defined but never used.")
    .test(code, {moz: true, unused: true, undef: true});

  test.done();
};

exports["destructuring var as esnext"] = function (test) {
  var code = [
    "var [ a, b, c ] = [ 1, 2, 3 ];",
    "var [ a ] = [ 1 ];",
    "var [ a ] = [ z ];",
    "var [ h, w ] = [ 'hello', 'world' ]; ",
    "var [ o ] = [ { o : 1 } ];",
    "var [ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "var { foo : bar } = { foo : 1 };",
    "var [ a, { foo : bar } ] = [ 2, { foo : 1 } ];",
  ];

  TestRun(test)
    .addError(3, 15,  "'z' is not defined.")
    .addError(8, 7,  "'a' is defined but never used.")
    .addError(6, 16,  "'b' is defined but never used.")
    .addError(6, 21,  "'c' is defined but never used.")
    .addError(4, 7,  "'h' is defined but never used.")
    .addError(4, 10,  "'w' is defined but never used.")
    .addError(5, 7,  "'o' is defined but never used.")
    .addError(6, 26,  "'d' is defined but never used.")
    .addError(8, 18,  "'bar' is defined but never used.")
    .test(code, {esnext: true, unused: true, undef: true});

  test.done();
};

exports["destructuring var as es5"] = function (test) {
  var code = [
    "var [ a, b, c ] = [ 1, 2, 3 ];",
    "var [ a ] = [ 1 ];",
    "var [ a ] = [ z ];",
    "var [ h, w ] = [ 'hello', 'world' ]; ",
    "var [ o ] = [ { o : 1 } ];",
    "var [ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "var { foo : bar } = { foo : 1 };",
    "var [ a, { foo : bar } ] = [ 2, { foo : 1 } ];",
  ];

  TestRun(test)
    .addError(1, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 15,  "'z' is not defined.")
    .addError(8, 7,  "'a' is defined but never used.")
    .addError(6, 16,  "'b' is defined but never used.")
    .addError(6, 21,  "'c' is defined but never used.")
    .addError(4, 7,  "'h' is defined but never used.")
    .addError(4, 10,  "'w' is defined but never used.")
    .addError(5, 7,  "'o' is defined but never used.")
    .addError(6, 26,  "'d' is defined but never used.")
    .addError(8, 18,  "'bar' is defined but never used.")
    .test(code, {unused: true, undef: true}); // es5

  test.done();
};

exports["destructuring var as legacy JS"] = function (test) {
  var code = [
    "var [ a, b, c ] = [ 1, 2, 3 ];",
    "var [ a ] = [ 1 ];",
    "var [ a ] = [ z ];",
    "var [ h, w ] = [ 'hello', 'world' ]; ",
    "var [ o ] = [ { o : 1 } ];",
    "var [ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "var { foo : bar } = { foo : 1 };",
    "var [ a, { foo : bar } ] = [ 2, { foo : 1 } ];",
  ];

  TestRun(test)
    .addError(1, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 15,  "'z' is not defined.")
    .addError(8, 7,  "'a' is defined but never used.")
    .addError(6, 16,  "'b' is defined but never used.")
    .addError(6, 21,  "'c' is defined but never used.")
    .addError(4, 7,  "'h' is defined but never used.")
    .addError(4, 10,  "'w' is defined but never used.")
    .addError(5, 7,  "'o' is defined but never used.")
    .addError(6, 26,  "'d' is defined but never used.")
    .addError(8, 18,  "'bar' is defined but never used.")
    .test(code, {es3: true, unused: true, undef: true});

  test.done();
};

exports["destructuring var errors"] = function (test) {
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
    .addError(9, 7,  "Expected an identifier and instead saw '1'.")
    .addError(10, 11, "Expected ',' and instead saw ';'.")
    .addError(11, 25, "Expected ']' to match '[' from line 11 and instead saw ';'.")
    .addError(11, 26, "Missing semicolon.")
    .addError(11, 27, "Expected an assignment or function call and instead saw an expression.")
    .addError(11, 28, "Missing semicolon.")
    .addError(11, 29, "Expected an identifier and instead saw ']'.")
    .addError(11, 29, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 15,  "'z' is not defined.")
    .addError(11, 10, "'b' is defined but never used.")
    .addError(11, 13, "'c' is defined but never used.")
    .addError(4, 7,  "'h' is defined but never used.")
    .addError(4, 10,  "'w' is defined but never used.")
    .addError(5, 7,  "'o' is defined but never used.")
    .addError(6, 26,  "'d' is defined but never used.")
    .addError(8, 18,  "'bar' is defined but never used.")
    .test(code, {esnext: true, unused: true, undef: true});

  test.done();
};

exports["destructuring const as moz"] = function (test) {
  var code = [
    "const [ a, b, c ] = [ 1, 2, 3 ];",
    "const [ d ] = [ 1 ];",
    "const [ e ] = [ z ];",
    "const [ hel, wor ] = [ 'hello', 'world' ]; ",
    "const [ o ] = [ { o : 1 } ];",
    "const [ f, [ [ [ g ], h ], i ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "const { foo : bar } = { foo : 1 };",
    "const [ j, { foo : foobar } ] = [ 2, { foo : 1 } ];",
    "const [ aa, bb ] = yield func();"
  ];

  TestRun(test)
    .addError(1, 9, "'a' is defined but never used.")
    .addError(1, 12, "'b' is defined but never used.")
    .addError(1, 15, "'c' is defined but never used.")
    .addError(2, 9, "'d' is defined but never used.")
    .addError(3, 9, "'e' is defined but never used.")
    .addError(4, 9, "'hel' is defined but never used.")
    .addError(4, 14, "'wor' is defined but never used.")
    .addError(5, 9, "'o' is defined but never used.")
    .addError(6, 9, "'f' is defined but never used.")
    .addError(6, 18, "'g' is defined but never used.")
    .addError(6, 23, "'h' is defined but never used.")
    .addError(6, 28, "'i' is defined but never used.")
    .addError(7, 15, "'bar' is defined but never used.")
    .addError(8, 9, "'j' is defined but never used.")
    .addError(8, 20, "'foobar' is defined but never used.")
    .addError(9, 9, "'aa' is defined but never used.")
    .addError(9, 13, "'bb' is defined but never used.")
    .addError(3, 17, "'z' is not defined.")
    .addError(9, 26, "'func' is not defined.")
    .test(code, {moz: true, unused: true, undef: true});

  test.done();
};

exports["destructuring const as esnext"] = function (test) {
  var code = [
    "const [ a, b, c ] = [ 1, 2, 3 ];",
    "const [ d ] = [ 1 ];",
    "const [ e ] = [ z ];",
    "const [ hel, wor ] = [ 'hello', 'world' ]; ",
    "const [ o ] = [ { o : 1 } ];",
    "const [ f, [ [ [ g ], h ], i ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "const { foo : bar } = { foo : 1 };",
    "const [ j, { foo : foobar } ] = [ 2, { foo : 1 } ];",
    "[j] = [1];",
    "[j.a] = [1];",
    "[j['a']] = [1];",
  ];

  TestRun(test)
    .addError(1, 9, "'a' is defined but never used.")
    .addError(1, 12, "'b' is defined but never used.")
    .addError(1, 15, "'c' is defined but never used.")
    .addError(2, 9, "'d' is defined but never used.")
    .addError(3, 9, "'e' is defined but never used.")
    .addError(4, 9, "'hel' is defined but never used.")
    .addError(4, 14, "'wor' is defined but never used.")
    .addError(5, 9, "'o' is defined but never used.")
    .addError(6, 9, "'f' is defined but never used.")
    .addError(6, 18, "'g' is defined but never used.")
    .addError(6, 23, "'h' is defined but never used.")
    .addError(6, 28, "'i' is defined but never used.")
    .addError(7, 15, "'bar' is defined but never used.")
    .addError(8, 20, "'foobar' is defined but never used.")
    .addError(9, 2, "Attempting to override 'j' which is a constant.")
    .addError(11, 3, "['a'] is better written in dot notation.")
    .addError(3, 17, "'z' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true});

  test.done();
};

exports["destructuring const as es5"] = function (test) {
  var code = [
    "const [ a, b, c ] = [ 1, 2, 3 ];",
    "const [ d ] = [ 1 ];",
    "const [ e ] = [ z ];",
    "const [ hel, wor ] = [ 'hello', 'world' ]; ",
    "const [ o ] = [ { o : 1 } ];",
    "const [ f, [ [ [ g ], h ], i ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "const { foo : bar } = { foo : 1 };",
    "const [ j, { foo : foobar } ] = [ 2, { foo : 1 } ];",
  ];

  TestRun(test)
    .addError(1, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 9, "'a' is defined but never used.")
    .addError(1, 12, "'b' is defined but never used.")
    .addError(1, 15, "'c' is defined but never used.")
    .addError(2, 9, "'d' is defined but never used.")
    .addError(3, 9, "'e' is defined but never used.")
    .addError(4, 9, "'hel' is defined but never used.")
    .addError(4, 14, "'wor' is defined but never used.")
    .addError(5, 9, "'o' is defined but never used.")
    .addError(6, 9, "'f' is defined but never used.")
    .addError(6, 18, "'g' is defined but never used.")
    .addError(6, 23, "'h' is defined but never used.")
    .addError(6, 28, "'i' is defined but never used.")
    .addError(7, 15, "'bar' is defined but never used.")
    .addError(8, 9, "'j' is defined but never used.")
    .addError(8, 20, "'foobar' is defined but never used.")
    .addError(3, 17, "'z' is not defined.")
    .test(code, {unused: true, undef: true}); // es5

  test.done();
};

exports["destructuring const as legacy JS"] = function (test) {
  var code = [
    "const [ a, b, c ] = [ 1, 2, 3 ];",
    "const [ d ] = [ 1 ];",
    "const [ e ] = [ z ];",
    "const [ hel, wor ] = [ 'hello', 'world' ]; ",
    "const [ o ] = [ { o : 1 } ];",
    "const [ f, [ [ [ g ], h ], i ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "const { foo : bar } = { foo : 1 };",
    "const [ j, { foo : foobar } ] = [ 2, { foo : 1 } ];",
  ];

  TestRun(test)
    .addError(1, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 9, "'a' is defined but never used.")
    .addError(1, 12, "'b' is defined but never used.")
    .addError(1, 15, "'c' is defined but never used.")
    .addError(2, 9, "'d' is defined but never used.")
    .addError(3, 9, "'e' is defined but never used.")
    .addError(4, 9, "'hel' is defined but never used.")
    .addError(4, 14, "'wor' is defined but never used.")
    .addError(5, 9, "'o' is defined but never used.")
    .addError(6, 9, "'f' is defined but never used.")
    .addError(6, 18, "'g' is defined but never used.")
    .addError(6, 23, "'h' is defined but never used.")
    .addError(6, 28, "'i' is defined but never used.")
    .addError(7, 15, "'bar' is defined but never used.")
    .addError(8, 9, "'j' is defined but never used.")
    .addError(8, 20, "'foobar' is defined but never used.")
    .addError(3, 17, "'z' is not defined.")
    .test(code, {es3: true, unused: true, undef: true});

  test.done();
};

exports["destructuring const errors"] = function (test) {
  var code = [
    "const [ a, b, c ] = [ 1, 2, 3 ];",
    "const [ a, b, c ] = [ 1, 2, 3 ];",
    "const [ 1 ] = [ a ];",
    "const [ k, l; m ] = [ 1, 2, 3 ];",
    "const [ n, o, p ] = [ 1, 2; 3 ];",
    "const q = {};",
    "[q.a] = [1];",
    "({a:q.a} = {a:1});"
  ];

  TestRun(test)
    .addError(2, 12, "'b' is defined but never used.")
    .addError(2, 15, "'c' is defined but never used.")
    .addError(4, 9, "'k' is defined but never used.")
    .addError(4, 12, "'l' is defined but never used.")
    .addError(4, 15, "'m' is defined but never used.")
    .addError(5, 9, "'n' is defined but never used.")
    .addError(5, 12, "'o' is defined but never used.")
    .addError(5, 15, "'p' is defined but never used.")
    .addError(2, 9, "'a' has already been declared.")
    .addError(2, 12, "'b' has already been declared.")
    .addError(2, 15, "'c' has already been declared.")
    .addError(3, 9, "Expected an identifier and instead saw '1'.")
    .addError(4, 13, "Expected ',' and instead saw ';'.")
    .addError(5, 27, "Expected ']' to match '[' from line 5 and instead saw ';'.")
    .addError(5, 28, "Missing semicolon.")
    .addError(5, 29, "Expected an assignment or function call and instead saw an expression.")
    .addError(5, 30, "Missing semicolon.")
    .addError(5, 31, "Expected an identifier and instead saw ']'.")
    .addError(5, 31, "Expected an assignment or function call and instead saw an expression.")
    .test(code, {esnext: true, unused: true, undef: true});

  test.done();
};

exports["destructuring globals as moz"] = function (test) {
  var code = [
    "var a, b, c, d, h, w, o;",
    "[ a, b, c ] = [ 1, 2, 3 ];",
    "[ a ] = [ 1 ];",
    "[ a ] = [ z ];",
    "[ h, w ] = [ 'hello', 'world' ]; ",
    "[ o ] = [ { o : 1 } ];",
    "[ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "[ a, { foo : b } ] = [ 2, { foo : 1 } ];",
    "[ a.b ] = [1];",
    "[ { a: a.b } ] = [{a:1}];",
    "[ { a: a['b'] } ] = [{a:1}];",
    "[a['b']] = [1];",
    "[,...a.b] = [1];"
  ];

  TestRun(test)
    .addError(4, 11,  "'z' is not defined.")
    .addError(11, 9, "['b'] is better written in dot notation.")
    .addError(12, 3, "['b'] is better written in dot notation.")
    .addError(13, 3, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .test(code, {moz: true, unused: true, undef: true});

  test.done();
};

exports["destructuring globals as esnext"] = function (test) {
  var code = [
    "var a, b, c, d, h, i, w, o;",
    "[ a, b, c ] = [ 1, 2, 3 ];",
    "[ a ] = [ 1 ];",
    "[ a ] = [ z ];",
    "[ h, w ] = [ 'hello', 'world' ]; ",
    "[ o ] = [ { o : 1 } ];",
    "[ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "[ a, { foo : b } ] = [ 2, { foo : 1 } ];",
    "[ a.b ] = [1];",
    "[ { a: a.b } ] = [{a:1}];",
    "[ { a: a['b'] } ] = [{a:1}];",
    "[a['b']] = [1];",
    "[,...a.b] = [1];",
    "[...i] = [1];",
    "[notDefined1] = [];",
    "[...notDefined2] = [];",
  ];

  TestRun(test)
    .addError(4, 11,  "'z' is not defined.")
    .addError(11, 9, "['b'] is better written in dot notation.")
    .addError(12, 3, "['b'] is better written in dot notation.")
    .addError(15, 2, "'notDefined1' is not defined.")
    .addError(16, 5, "'notDefined2' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true});

  test.done();
};

exports["destructuring globals as es5"] = function (test) {
  var code = [
    "var a, b, c, d, h, w, o;",
    "[ a, b, c ] = [ 1, 2, 3 ];",
    "[ a ] = [ 1 ];",
    "[ a ] = [ z ];",
    "[ h, w ] = [ 'hello', 'world' ]; ",
    "[ o ] = [ { o : 1 } ];",
    "[ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "[ a, { foo : b } ] = [ 2, { foo : 1 } ];",
    "[ a.b ] = [1];",
    "[ { a: a.b } ] = [{a:1}];",
    "[ { a: a['b'] } ] = [{a:1}];",
    "[a['b']] = [1];",
    "[,...a.b] = [1];"
  ];

  TestRun(test)
    .addError(4, 11,  "'z' is not defined.")
    .addError(2, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(10, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(11, 9, "['b'] is better written in dot notation.")
    .addError(11, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(12, 3, "['b'] is better written in dot notation.")
    .addError(12, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(13, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(13, 3, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .test(code, {unused: true, undef: true}); // es5

  test.done();
};

exports["destructuring globals as legacy JS"] = function (test) {
  var code = [
    "var a, b, c, d, h, w, o;",
    "[ a, b, c ] = [ 1, 2, 3 ];",
    "[ a ] = [ 1 ];",
    "[ a ] = [ z ];",
    "[ h, w ] = [ 'hello', 'world' ]; ",
    "[ o ] = [ { o : 1 } ];",
    "[ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "[ a, { foo : b } ] = [ 2, { foo : 1 } ];",
    "[ a.b ] = [1];",
    "[ { a: a.b } ] = [{a:1}];",
    "[ { a: a['b'] } ] = [{a:1}];",
    "[a['b']] = [1];",
    "[,...a.b] = [1];"
  ];

  TestRun(test)
    .addError(4, 11,  "'z' is not defined.")
    .addError(2, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(10, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(11, 9, "['b'] is better written in dot notation.")
    .addError(11, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(12, 3, "['b'] is better written in dot notation.")
    .addError(12, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(13, 1, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(13, 3, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .test(code, {es3: true, unused: true, undef: true});

  test.done();
};

exports["destructuring globals with syntax error"] = function (test) {
  var code = [
    "var a, b, c;",
    "[ a ] = [ z ];",
    "[ 1 ] = [ a ];",
    "[ a, b; c ] = [ 1, 2, 3 ];",
    "[ a, b, c ] = [ 1, 2; 3 ];",
    "[ a ] += [ 1 ];",
    "[ { a.b } ] = [{a:1}];",
    "[ a() ] = [];",
    "[ { a: a() } ] = [];"
  ];

  TestRun(test)
    .addError(3, 3, "Bad assignment.")
    .addError(4, 7, "Expected ',' and instead saw ';'.")
    .addError(5, 21, "Expected ']' to match '[' from line 5 and instead saw ';'.")
    .addError(5, 22, "Missing semicolon.")
    .addError(5, 23, "Expected an assignment or function call and instead saw an expression.")
    .addError(5, 24, "Missing semicolon.")
    .addError(5, 25, "Expected an identifier and instead saw ']'.")
    .addError(5, 25, "Expected an assignment or function call and instead saw an expression.")
    .addError(6, 7, "Bad assignment.")
    .addError(7, 6, "Expected ',' and instead saw '.'.")
    .addError(8, 4, "Bad assignment.")
    .addError(9, 9, "Bad assignment.")
    .addError(2, 11,  "'z' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true});

  TestRun(test)
    .addError(1, 6, "Expected ',' and instead saw '['.")
    .addError(1, 10, "Expected ':' and instead saw ']'.")
    .addError(1, 12, "Expected an identifier and instead saw '}'.")
    .addError(1, 14, "Expected ',' and instead saw ']'.")
    .addError(1, 18, "Expected ',' and instead saw '['.")
    .addError(1, 19, "Expected an identifier and instead saw '{'.")
    .addError(1, 20, "Expected ',' and instead saw 'a'.")
    .addError(1, 21, "Expected an identifier and instead saw ':'.")
    .addError(1, 22, "Expected ',' and instead saw '1'.")
    .addError(1, 24, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 16, "Expected an identifier and instead saw '='.")
    .test("[ { a['b'] } ] = [{a:1}];", {esnext: true, unused: true, undef: true});

  TestRun(test)
    .addError(1, 6, "Expected ',' and instead saw '('.")
    .addError(1, 7, "Expected an identifier and instead saw ')'.")
    .test("[ { a() } ] = [];", {esnext: true, unused: true, undef: true});

  TestRun(test)
    .addError(1, 19, "Extending prototype of native object: 'Number'.")
    .addError(3, 9, "Bad assignment.")
    .addError(4, 14, "Assignment to properties of a mapped arguments object may cause unexpected changes to formal parameters.")
    .addError(6, 7, "Do not assign to the exception parameter.")
    .addError(7, 6, "Do not assign to the exception parameter.")
    .addError(9, 9, "Bad assignment.")
    .addError(10, 13, "Bad assignment.")
    .test([
      "[ Number.prototype.toString ] = [function(){}];",
      "function a() {",
      "  [ new.target ] = [];",
      "  [ arguments.anything ] = [];",
      "  try{} catch(e) {",
      "    ({e} = {e});",
      "    [e] = [];",
      "  }",
      "  ({ x: null } = {});",
      "  ({ y: [...this] } = {});",
      "  ({ y: [...z] } = {});",
      "}"], {esnext: true, freeze: true});

  test.done();
};

exports["destructuring assign of empty values as moz"] = function (test) {
  var code = [
    "var [ a ] = [ 1, 2 ];",
    "var [ c, d ] = [ 1 ];",
    "var [ e, , f ] = [ 3, , 4 ];"
  ];

  TestRun(test)
    .addError(1, 7, "'a' is defined but never used.")
    .addError(2, 7, "'c' is defined but never used.")
    .addError(2, 10, "'d' is defined but never used.")
    .addError(3, 7, "'e' is defined but never used.")
    .addError(3, 12, "'f' is defined but never used.")
    .test(code, {moz: true, unused: true, undef: true, laxcomma: true, elision: true});

  test.done();
};

exports["destructuring assign of empty values as esnext"] = function (test) {
  var code = [
    "var [ a ] = [ 1, 2 ];",
    "var [ c, d ] = [ 1 ];",
    "var [ e, , f ] = [ 3, , 4 ];"
  ];

  TestRun(test)
    .addError(1, 7, "'a' is defined but never used.")
    .addError(2, 7, "'c' is defined but never used.")
    .addError(2, 10, "'d' is defined but never used.")
    .addError(3, 7, "'e' is defined but never used.")
    .addError(3, 12, "'f' is defined but never used.")
    .test(code, {esnext: true, unused: true, undef: true, elision: true});

  test.done();
};

exports["destructuring assign of empty values as es5"] = function (test) {
  var code = [
    "var [ a ] = [ 1, 2 ];",
    "var [ c, d ] = [ 1 ];",
    "var [ e, , f ] = [ 3, , 4 ];"
  ];

  TestRun(test)
    .addError(1, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 7, "'a' is defined but never used.")
    .addError(2, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 7, "'c' is defined but never used.")
    .addError(2, 10, "'d' is defined but never used.")
    .addError(3, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 7, "'e' is defined but never used.")
    .addError(3, 12, "'f' is defined but never used.")
    .test(code, {unused: true, undef: true, elision: true}); // es5

  test.done();
};

exports["destructuring assign of empty values as JS legacy"] = function (test) {
  var code = [
    "var [ a ] = [ 1, 2 ];",
    "var [ c, d ] = [ 1 ];",
    "var [ e, , f ] = [ 3, , 4 ];"
  ];

  TestRun(test)
    .addError(1, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 7, "'a' is defined but never used.")
    .addError(2, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 7, "'c' is defined but never used.")
    .addError(2, 10, "'d' is defined but never used.")
    .addError(3, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 7, "'e' is defined but never used.")
    .addError(3, 12, "'f' is defined but never used.")
    .addError(3, 23, "Extra comma. (it breaks older versions of IE)")
    .test(code, {es3: true, unused: true, undef: true});

  test.done();
};

exports["destructuring assignment default values"] = function (test) {
  var code = [
    "var [ a = 3, b ] = [];",
    "var [ c, d = 3 ] = [];",
    "var [ [ e ] = [ 3 ] ] = [];",
    "var [ f = , g ] = [];",
    "var { g, h = 3 } = {};",
    "var { i = 3, j } = {};",
    "var { k, l: m = 3 } = {};",
    "var { n: o = 3, p } = {};",
    "var { q: { r } = { r: 3 } } = {};",
    "var { s = , t } = {};",
    "var [ u = undefined ] = [];",
    "var { v = undefined } = {};",
    "var { w: x = undefined } = {};",
    "var [ ...y = 3 ] = [];"
  ];

  TestRun(test)
    .addError(4, 11, "Expected an identifier and instead saw ','.")
    .addError(4, 13, "Expected ',' and instead saw 'g'.")
    .addError(10, 11, "Expected an identifier and instead saw ','.")
    .addError(10, 13, "Expected ',' and instead saw 't'.")
    .addError(11, 7, "It's not necessary to initialize 'u' to 'undefined'.")
    .addError(12, 7, "It's not necessary to initialize 'v' to 'undefined'.")
    .addError(13, 10, "It's not necessary to initialize 'x' to 'undefined'.")
    .addError(14, 12, "Expected ',' and instead saw '='.")
    .addError(14, 14, "Expected an identifier and instead saw '3'.")
    .test(code, { esnext: true });

  test.done();
};

exports["destructuring assignment of valid simple assignment targets"] = function (test) {
  TestRun(test)
    .test([
      "[ foo().attr ] = [];",
      "[ function() {}.attr ] = [];",
      "[ function() { return {}; }().attr ] = [];",
      "[ new Ctor().attr ] = [];"
    ], { esversion: 6 });

  TestRun(test)
    .addError(1, 6, "Bad assignment.")
    .test("[ foo() ] = [];", { esversion: 6 });

  TestRun(test)
    .addError(1, 10, "Bad assignment.")
    .test("({ x: foo() } = {});", { esversion: 6 });

  TestRun(test)
    .addError(1, 8, "Bad assignment.")
    .test("[ true ? x : y ] = [];", { esversion: 6 });

  TestRun(test)
    .addError(1, 12, "Bad assignment.")
    .test("({ x: true ? x : y } = {});", { esversion: 6 });

  TestRun(test)
    .addError(1, 5, "Bad assignment.")
    .test("[ x || y ] = [];", { esversion: 6 });

  TestRun(test)
    .addError(1, 9, "Bad assignment.")
    .test("({ x: x || y } = {});", { esversion: 6 });

  TestRun(test)
    .addError(1, 11, "Bad assignment.")
    .test("[ new Ctor() ] = [];", { esversion: 6 });

  TestRun(test)
    .addError(1, 15, "Bad assignment.")
    .test("({ x: new Ctor() } = {});", { esversion: 6 });

  test.done();
};

exports["regression test for GH-3408"] = function (test) {
  TestRun(test, "var statement")
    .addError(1, 9, "Expected an identifier and instead saw ';'.")
    .addError(1, 10, "Missing semicolon.")
    .test("var [x]=;", { esversion: 6 });

  TestRun(test, "let statement")
    .addError(1, 9, "Expected an identifier and instead saw ';'.")
    .addError(1, 10, "Missing semicolon.")
    .test("let [x]=;", { esversion: 6 });

  TestRun(test, "const statement")
    .addError(1, 11, "Expected an identifier and instead saw ';'.")
    .addError(1, 12, "Missing semicolon.")
    .test("const [x]=;", { esversion: 6 });

  test.done();
};

exports["non-identifier PropertyNames in object destructuring"] = function (test) {
  var code = [
    "var { ['x' + 2]: a = 3, 0: b } = { x2: 1, 0: 2 };",
    "var { c, '': d, 'x': e } = {};",
    "function fn({ 0: f, 'x': g, ['y']: h}) {}"
  ];

  TestRun(test)
    .addError(1, 18, "'a' is defined but never used.")
    .addError(1, 28, "'b' is defined but never used.")
    .addError(2, 7, "'c' is defined but never used.")
    .addError(2, 14, "'d' is defined but never used.")
    .addError(2, 22, "'e' is defined but never used.")
    .addError(3, 10, "'fn' is defined but never used.")
    .addError(3, 18, "'f' is defined but never used.")
    .addError(3, 26, "'g' is defined but never used.")
    .addError(3, 36, "'h' is defined but never used.")
    .test(code, { esnext: true, unused: true });

  test.done();
};

exports["empty destructuring"] = function (test) {
  var code = [
    "var {} = {};",
    "var [] = [];",
    "function a({}, []) {}",
    "var b = ({}) => ([]) => ({});"
  ];

  TestRun(test)
    .addError(1, 5, "Empty destructuring: this is unnecessary and can be removed.")
    .addError(2, 5, "Empty destructuring: this is unnecessary and can be removed.")
    .addError(3, 12, "Empty destructuring: this is unnecessary and can be removed.")
    .addError(3, 16, "Empty destructuring: this is unnecessary and can be removed.")
    .addError(4, 10, "Empty destructuring: this is unnecessary and can be removed.")
    .addError(4, 18, "Empty destructuring: this is unnecessary and can be removed.")
    .test(code, { esnext: true });

  test.done();
};

exports["array element assignment inside array"] = function (test) {
  var code = [
    "var a1 = {};",
    "var a2 = [function f() {a1[0] = 1;}];",
  ];

  TestRun(test)
    .test(code);

  test.done();
};

exports["let statement as moz"] = function (test) {
  var code = [
    "let x = 1;",
    "{",
    "  let y = 3 ;",
    "  {",
    "    let z = 2;",
    "    print(x + ' ' + y + ' ' + z);",
    "  }",
    "  print(x + ' ' + y);",
    "}",
    "print(x);"
  ];

  TestRun(test)
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement as esnext"] = function (test) {
  var code = [
    "let x = 1;",
    "{",
    "  let y = 3 ;",
    "  {",
    "    let z = 2;",
    "    print(x + ' ' + y + ' ' + z);",
    "  }",
    "  print(x + ' ' + y);",
    "}",
    "print(x);",
    "let",
    "y;",
    "print(y);"
  ];

  TestRun(test)
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement as es5"] = function (test) {
  var code = [
    "let x = 1;",
    "{",
    "  let y = 3 ;",
    "  {",
    "    let z = 2;",
    "    print(x + ' ' + y + ' ' + z);",
    "  }",
    "  print(x + ' ' + y);",
    "}",
    "print(x);"
  ];

  TestRun(test)
    .addError(1, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 3, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 5, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["let statement as legacy JS"] = function (test) {
  var code = [
    "let x = 1;",
    "{",
    "  let y = 3 ;",
    "  {",
    "    let z = 2;",
    "    print(x + ' ' + y + ' ' + z);",
    "  }",
    "  print(x + ' ' + y);",
    "}",
    "print(x);"
  ];

  TestRun(test)
    .addError(1, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 3, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 5, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement out of scope as moz"] = function (test) {
  var code = [
    "let x = 1;",
    "{",
    "  let y = 3 ;",
    "  {",
    "    let z = 2;",
    "  }",
    "  print(z);",
    "}",
    "print(y);",
  ];

  TestRun(test)
    .addError(1, 5, "'x' is defined but never used.")
    .addError(5, 9, "'z' is defined but never used.")
    .addError(3, 7, "'y' is defined but never used.")
    .addError(7, 9, "'z' is not defined.")
    .addError(9, 7, "'y' is not defined.")
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement out of scope as esnext"] = function (test) {
  var code = [
    "let x = 1;",
    "{",
    "  let y = 3 ;",
    "  {",
    "    let z = 2;",
    "  }",
    "  print(z);",
    "}",
    "print(y);",
  ];

  TestRun(test)
    .addError(1, 5, "'x' is defined but never used.")
    .addError(5, 9, "'z' is defined but never used.")
    .addError(3, 7, "'y' is defined but never used.")
    .addError(7, 9, "'z' is not defined.")
    .addError(9, 7, "'y' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement out of scope as es5"] = function (test) {
  var code = [
    "let x = 1;",
    "{",
    "  let y = 3 ;",
    "  {",
    "    let z = 2;",
    "  }",
    "  print(z);",
    "}",
    "print(y);",
  ];

  TestRun(test)
    .addError(1, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 3, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 5, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 5, "'x' is defined but never used.")
    .addError(5, 9, "'z' is defined but never used.")
    .addError(3, 7, "'y' is defined but never used.")
    .addError(7, 9, "'z' is not defined.")
    .addError(9, 7, "'y' is not defined.")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["let statement out of scope as legacy JS"] = function (test) {
  var code = [
    "let x = 1;",
    "{",
    "  let y = 3 ;",
    "  {",
    "    let z = 2;",
    "  }",
    "  print(z);",
    "}",
    "print(y);",
  ];

  TestRun(test)
    .addError(1, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 3, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 5, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 5, "'x' is defined but never used.")
    .addError(5, 9, "'z' is defined but never used.")
    .addError(3, 7, "'y' is defined but never used.")
    .addError(7, 9, "'z' is not defined.")
    .addError(9, 7, "'y' is not defined.")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement in functions as moz"] = function (test) {
  var code = [
    "let x = 1;",
    "function foo() {",
    "  let y = 3 ;",
    "  function bar() {",
    "    let z = 2;",
    "    print(x);",
    "    print(z);",
    "  }",
    "  print(y);",
    "  bar();",
    "}",
    "foo();"
  ];

  TestRun(test)
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement in functions as esnext"] = function (test) {
  var code = [
    "let x = 1;",
    "function foo() {",
    "  let y = 3 ;",
    "  function bar() {",
    "    let z = 2;",
    "    print(x);",
    "    print(z);",
    "  }",
    "  print(y);",
    "  bar();",
    "}",
    "foo();"
  ];

  TestRun(test)
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement in functions as es5"] = function (test) {
  var code = [
    "let x = 1;",
    "function foo() {",
    "  let y = 3 ;",
    "  function bar() {",
    "    let z = 2;",
    "    print(x);",
    "    print(z);",
    "  }",
    "  print(y);",
    "  bar();",
    "}",
    "foo();"
  ];

  TestRun(test)
    .addError(1, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 3, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 5, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["let statement in functions as legacy JS"] = function (test) {
  var code = [
    "let x = 1;",
    "function foo() {",
    "  let y = 3 ;",
    "  function bar() {",
    "    let z = 2;",
    "    print(x);",
    "    print(z);",
    "  }",
    "  print(y);",
    "  bar();",
    "}",
    "foo();"
  ];

  TestRun(test)
    .addError(1, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 3, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 5, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement not in scope as moz"] = function (test) {
  var code = [
    "let x = 1;",
    "function foo() {",
    "  let y = 3 ;",
    "  let bar = function () {",
    "    print(x);",
    "    let z = 2;",
    "  };",
    "  print(z);",
    "}",
    "print(y);",
    "bar();",
    "foo();",
  ];

  TestRun(test)
    .addError(6, 9, "'z' is defined but never used.")
    .addError(3, 7, "'y' is defined but never used.")
    .addError(4, 7, "'bar' is defined but never used.")
    .addError(8, 9, "'z' is not defined.")
    .addError(10, 7, "'y' is not defined.")
    .addError(11, 1, "'bar' is not defined.")
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement not in scope as esnext"] = function (test) {
  var code = [
    "let x = 1;",
    "function foo() {",
    "  let y = 3 ;",
    "  let bar = function () {",
    "    print(x);",
    "    let z = 2;",
    "  };",
    "  print(z);",
    "}",
    "print(y);",
    "bar();",
    "foo();",
  ];

  TestRun(test)
    .addError(6, 9, "'z' is defined but never used.")
    .addError(3, 7, "'y' is defined but never used.")
    .addError(4, 7, "'bar' is defined but never used.")
    .addError(8, 9, "'z' is not defined.")
    .addError(10, 7, "'y' is not defined.")
    .addError(11, 1, "'bar' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement not in scope as es5"] = function (test) {
  var code = [
    "let x = 1;",
    "function foo() {",
    "  let y = 3 ;",
    "  let bar = function () {",
    "    print(x);",
    "    let z = 2;",
    "  };",
    "  print(z);",
    "}",
    "print(y);",
    "bar();",
    "foo();",
  ];

  TestRun(test)
    .addError(1, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 3, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 3, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 5, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 9, "'z' is defined but never used.")
    .addError(3, 7, "'y' is defined but never used.")
    .addError(4, 7, "'bar' is defined but never used.")
    .addError(8, 9, "'z' is not defined.")
    .addError(10, 7, "'y' is not defined.")
    .addError(11, 1, "'bar' is not defined.")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["let statement not in scope as legacy JS"] = function (test) {
  var code = [
    "let x = 1;",
    "function foo() {",
    "  let y = 3 ;",
    "  let bar = function () {",
    "    print(x);",
    "    let z = 2;",
    "  };",
    "  print(z);",
    "}",
    "print(y);",
    "bar();",
    "foo();",
  ];

  TestRun(test)
    .addError(1, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 3, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 3, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 5, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 9, "'z' is defined but never used.")
    .addError(3, 7, "'y' is defined but never used.")
    .addError(4, 7, "'bar' is defined but never used.")
    .addError(8, 9, "'z' is not defined.")
    .addError(10, 7, "'y' is not defined.")
    .addError(11, 1, "'bar' is not defined.")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement in for loop as moz"] = function (test) {
  var code = [
    "var obj={foo: 'bar', bar: 'foo'};",
    "for ( let [n, v] in Iterator(obj) ) {",
    "  print('Name: ' + n + ', Value: ' + v);",
    "}",
    "for (let i in [1, 2, 3, 4]) {",
    "  print(i);",
    "}",
    "for (let i in [1, 2, 3, 4]) {",
    "  print(i);",
    "}",
    "for (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}",
    "for (let i=0 ; i < 10 ; i++ ) {",
    "print(i);",
    "}"
  ];

  TestRun(test)
    .test(code, {moz: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  test.done();
};

exports["let statement in for loop as esnext"] = function (test) {
  var code = [
    "var obj={foo: 'bar', bar: 'foo'};",
    "for ( let [n, v] in Iterator(obj) ) {",
    "  print('Name: ' + n + ', Value: ' + v);",
    "}",
    "for (let i in [1, 2, 3, 4]) {",
    "  print(i);",
    "}",
    "for (let i in [1, 2, 3, 4]) {",
    "  print(i);",
    "}",
    "for (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}",
    "for (let i=0 ; i < 10 ; i++ ) {",
    "print(i);",
    "}",
    "for (let of; false; false) {",
    "  print(of);",
    "}"
  ];

  TestRun(test)
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  test.done();
};

exports["let statement in for loop as es5"] = function (test) {
  var code = [
    "var obj={foo: 'bar', bar: 'foo'};",
    "for ( let [n, v] in Iterator(obj) ) {",
    "  print('Name: ' + n + ', Value: ' + v);",
    "}",
    "for (let i in [1, 2, 3, 4]) {",
    "  print(i);",
    "}",
    "for (let i in [1, 2, 3, 4]) {",
    "  print(i);",
    "}",
    "for (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}",
    "for (let i=0 ; i < 10 ; i++ ) {",
    "print(i);",
    "}"
  ];

  TestRun(test)
    .addError(2, 7, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(11, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(14, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print", "Iterator"]}); // es5

  test.done();
};

exports["let statement in for loop as legacy JS"] = function (test) {
  var code = [
    "var obj={foo: 'bar', bar: 'foo'};",
    "for ( let [n, v] in Iterator(obj) ) {",
    "  print('Name: ' + n + ', Value: ' + v);",
    "}",
    "for (let i in [1, 2, 3, 4]) {",
    "  print(i);",
    "}",
    "for (let i in [1, 2, 3, 4]) {",
    "  print(i);",
    "}",
    "for (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}",
    "for (let i=0 ; i < 10 ; i++ ) {",
    "print(i);",
    "}"
  ];

  TestRun(test)
    .addError(2, 7, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(11, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(14, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  test.done();
};

exports["let statement in destructured for loop as moz"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "var people = [",
    "{",
    "  name: 'Mike Smith',",
    "  family: {",
    "  mother: 'Jane Smith',",
    "  father: 'Harry Smith',",
    "  sister: 'Samantha Smith'",
    "  },",
    "  age: 35",
    "},",
    "{",
    "  name: 'Tom Jones',",
    "  family: {",
    "  mother: 'Norah Jones',",
    "  father: 'Richard Jones',",
    "  brother: 'Howard Jones'",
    "  },",
    "  age: 25",
    "}",
    "];",
    "for (let {name: n, family: { father: f } } in people) {",
    "print('Name: ' + n + ', Father: ' + f);",
    "}"
  ];

  TestRun(test)
    .test(code, {moz: true, unused: true,
           undef: true, predef: ["print"]});

  test.done();
};

exports["let statement in destructured for loop as esnext"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "var people = [",
    "{",
    "  name: 'Mike Smith',",
    "  family: {",
    "  mother: 'Jane Smith',",
    "  father: 'Harry Smith',",
    "  sister: 'Samantha Smith'",
    "  },",
    "  age: 35",
    "},",
    "{",
    "  name: 'Tom Jones',",
    "  family: {",
    "  mother: 'Norah Jones',",
    "  father: 'Richard Jones',",
    "  brother: 'Howard Jones'",
    "  },",
    "  age: 25",
    "}",
    "];",
    "for (let {name: n, family: { father: f } } in people) {",
    "print('Name: ' + n + ', Father: ' + f);",
    "}"
  ];

  TestRun(test)
    .test(code, {esnext: true, unused: true,
           undef: true, predef: ["print"]});

  test.done();
};

exports["let statement in destructured for loop as es5"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "var people = [",
    "{",
    "  name: 'Mike Smith',",
    "  family: {",
    "  mother: 'Jane Smith',",
    "  father: 'Harry Smith',",
    "  sister: 'Samantha Smith'",
    "  },",
    "  age: 35",
    "},",
    "{",
    "  name: 'Tom Jones',",
    "  family: {",
    "  mother: 'Norah Jones',",
    "  father: 'Richard Jones',",
    "  brother: 'Howard Jones'",
    "  },",
    "  age: 25",
    "}",
    "];",
    "for (let {name: n, family: { father: f } } in people) {",
    "print('Name: ' + n + ', Father: ' + f);",
    "}"
  ];

  TestRun(test)
    .addError(21, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(21, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["let statement in destructured for loop as legacy JS"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "var people = [",
    "{",
    "  name: 'Mike Smith',",
    "  family: {",
    "  mother: 'Jane Smith',",
    "  father: 'Harry Smith',",
    "  sister: 'Samantha Smith'",
    "  },",
    "  age: 35",
    "},",
    "{",
    "  name: 'Tom Jones',",
    "  family: {",
    "  mother: 'Norah Jones',",
    "  father: 'Richard Jones',",
    "  brother: 'Howard Jones'",
    "  },",
    "  age: 25",
    "}",
    "];",
    "for (let {name: n, family: { father: f } } in people) {",
    "print('Name: ' + n + ', Father: ' + f);",
    "}"
  ];

  TestRun(test)
    .addError(21, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(21, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["let statement (as seen in jetpack)"] = function (test) {
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
    .test(code, {moz: true, unused: true, undef: true,
           predef: ["require", "xferable", "options"]});
  test.done();
};

exports["let statement (as seen in jetpack) as esnext"] = function (test) {
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
    .addError(6, 57, "Missing semicolon.")
    .addError(3, 1, "'let' is not defined.")
    .addError(3, 6, "'str' is not defined.")
    .addError(10, 1, "'str' is not defined.")
    .addError(12, 42, "'str' is not defined.")
    .addError(12, 47, "'str' is not defined.")
    .addError(5, 5, "'converter' is not defined.")
    .addError(8, 1, "'converter' is not defined.")
    .addError(9, 1, "'converter' is not defined.")
    .addError(10, 12, "'converter' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true,
           predef: ["require", "xferable", "options"]});
  test.done();
};

exports["let statement (as seen in jetpack) as es5"] = function (test) {
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
    .addError(1, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 57, "Missing semicolon.")
    .addError(3, 1, "'let' is not defined.")
    .addError(3, 6, "'str' is not defined.")
    .addError(10, 1, "'str' is not defined.")
    .addError(12, 42, "'str' is not defined.")
    .addError(12, 47, "'str' is not defined.")
    .addError(5, 5, "'converter' is not defined.")
    .addError(8, 1, "'converter' is not defined.")
    .addError(9, 1, "'converter' is not defined.")
    .addError(10, 12, "'converter' is not defined.")
    .test(code, {unused: true, undef: true,
           predef: ["require", "xferable", "options"]}); // es5
  test.done();
};

exports["let statement (as seen in jetpack) as legacy JS"] = function (test) {
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
    .addError(1, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 1, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 57, "Missing semicolon.")
    .addError(3, 1, "'let' is not defined.")
    .addError(3, 6, "'str' is not defined.")
    .addError(10, 1, "'str' is not defined.")
    .addError(12, 42, "'str' is not defined.")
    .addError(12, 47, "'str' is not defined.")
    .addError(5, 5, "'converter' is not defined.")
    .addError(8, 1, "'converter' is not defined.")
    .addError(9, 1, "'converter' is not defined.")
    .addError(10, 12, "'converter' is not defined.")
    .test(code, {es3: true, unused: true, undef: true,
           predef: ["require", "xferable", "options"]});
  test.done();
};

exports["let block and let expression"] = function (test) {
  // Example taken from jetpack/addons sdk library from Mozilla project
  var code = [
    "let (x=1, y=2, z=3)",
    "{",
    "  let(t=4) print(x, y, z, t);",
    "  print(let(u=4) u,x);",
    "}",
    "for (; ; let (x = 1) x) {}"
  ];

  TestRun(test)
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});
  test.done();
};

exports["let block and let expression as esnext"] = function (test) {
  // Example taken from jetpack/addons sdk library from Mozilla project
  var code = [
    "let (x=1, y=2, z=3)",
    "{",
    "  let(t=4) print(x, y, z, t);",
    "  print(let(u=4) u,x);",
    "}",
    "for (; ; let (x = 1) x) {}"
  ];

  TestRun(test)
    .addError(1, 20, "Missing semicolon.")
    .addError(3, 11, "Missing semicolon.")
    .addError(4, 18, "Expected ')' and instead saw 'u'.")
    .addError(4, 20, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 21, "Missing semicolon.")
    .addError(4, 21, "Expected an identifier and instead saw ')'.")
    .addError(4, 21, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 1, "'let' is not defined.")
    .addError(3, 3, "'let' is not defined.")
    .addError(4, 9, "'let' is not defined.")
    .addError(1, 6, "'x' is not defined.")
    .addError(3, 18, "'x' is not defined.")
    .addError(4, 20, "'x' is not defined.")
    .addError(1, 11, "'y' is not defined.")
    .addError(3, 21, "'y' is not defined.")
    .addError(1, 16, "'z' is not defined.")
    .addError(3, 24, "'z' is not defined.")
    .addError(3, 7, "'t' is not defined.")
    .addError(3, 27, "'t' is not defined.")
    .addError(4, 13, "'u' is not defined.")
    .addError(6, 22, "Expected ')' to match '(' from line 6 and instead saw 'x'.")
    .addError(6, 23, "Expected an identifier and instead saw ')'.")
    .addError(6, 23, "Expected an assignment or function call and instead saw an expression.")
    .addError(6, 24, "Missing semicolon.")
    .addError(6, 10, "'let' is not defined.")
    .addError(6, 15, "'x' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});
  test.done();
};

exports["let block and let expression as es5"] = function (test) {
  // Example taken from jetpack/addons sdk library from Mozilla project
  var code = [
    "let (x=1, y=2, z=3)",
    "{",
    "  let(t=4) print(x, y, z, t);",
    "  print(let(u=4) u,x);",
    "}"
  ];

  TestRun(test)
    .addError(1, 20, "Missing semicolon.")
    .addError(3, 11, "Missing semicolon.")
    .addError(4, 18, "Expected ')' and instead saw 'u'.")
    .addError(4, 20, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 21, "Missing semicolon.")
    .addError(4, 21, "Expected an identifier and instead saw ')'.")
    .addError(4, 21, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 1, "'let' is not defined.")
    .addError(3, 3, "'let' is not defined.")
    .addError(4, 9, "'let' is not defined.")
    .addError(1, 6, "'x' is not defined.")
    .addError(3, 18, "'x' is not defined.")
    .addError(4, 20, "'x' is not defined.")
    .addError(1, 11, "'y' is not defined.")
    .addError(3, 21, "'y' is not defined.")
    .addError(1, 16, "'z' is not defined.")
    .addError(3, 24, "'z' is not defined.")
    .addError(3, 7, "'t' is not defined.")
    .addError(3, 27, "'t' is not defined.")
    .addError(4, 13, "'u' is not defined.")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5
  test.done();
};

exports["let block and let expression as legacy JS"] = function (test) {
  // Example taken from jetpack/addons sdk library from Mozilla project
  var code = [
    "let (x=1, y=2, z=3)",
    "{",
    "  let(t=4) print(x, y, z, t);",
    "  print(let(u=4) u,x);",
    "}"
  ];

  TestRun(test)
    .addError(1, 20, "Missing semicolon.")
    .addError(3, 11, "Missing semicolon.")
    .addError(4, 18, "Expected ')' and instead saw 'u'.")
    .addError(4, 20, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 21, "Missing semicolon.")
    .addError(4, 21, "Expected an identifier and instead saw ')'.")
    .addError(4, 21, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 1, "'let' is not defined.")
    .addError(3, 3, "'let' is not defined.")
    .addError(4, 9, "'let' is not defined.")
    .addError(1, 6, "'x' is not defined.")
    .addError(3, 18, "'x' is not defined.")
    .addError(4, 20, "'x' is not defined.")
    .addError(1, 11, "'y' is not defined.")
    .addError(3, 21, "'y' is not defined.")
    .addError(1, 16, "'z' is not defined.")
    .addError(3, 24, "'z' is not defined.")
    .addError(3, 7, "'t' is not defined.")
    .addError(3, 27, "'t' is not defined.")
    .addError(4, 13, "'u' is not defined.")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});
  test.done();
};

exports["make sure let variables are not treated as globals"] = function (test) {
  // This is a regression test for GH-1362
  var code = [
    "function sup() {",
      "if (true) {",
        "let closed = 1;",
        "closed = 2;",
      "}",

      "if (true) {",
        "if (true) {",
          "let closed = 1;",
          "closed = 2;",
        "}",
      "}",
    "}"
  ];

  TestRun(test).test(code, { esnext: true, browser: true });
  test.done();
};

exports["make sure var variables can shadow let variables"] = function (test) {
  // This is a regression test for GH-1394
  var code = [
    "let a = 1;",
    "let b = 2;",
    "var c = 3;",

    "function sup(a) {",
      "var b = 4;",
      "let c = 5;",
      "let d = 6;",
      "if (false) {",
        "var d = 7;",
      "}",
      "return b + c + a + d;",
    "}",

    "sup();"
  ];

  TestRun(test)
    .addError(1, 5, "'a' is defined but never used.")
    .addError(2, 5, "'b' is defined but never used.")
    .addError(3, 5, "'c' is defined but never used.")
    .addError(9, 5, "'d' has already been declared.")
    .test(code, { esnext: true, unused: true, undef: true, funcscope: true });

  test.done();
};

exports["make sure let variables in the closure of functions shadow predefined globals"] = function (test) {
  var code = [
    "function x() {",
    "  let foo;",
    "  function y() {",
    "    foo = {};",
    "  }",
    "}"
  ];

  TestRun(test).test(code, { esnext: true, predef: { foo: false } });
  test.done();
};

exports["make sure let variables in the closure of blocks shadow predefined globals"] = function (test) {
  var code = [
    "function x() {",
    "  let foo;",
    "  {",
    "    foo = {};",
    "  }",
    "}"
  ];

  TestRun(test).test(code, { esnext: true, predef: { foo: false } });
  test.done();
};

exports["make sure variables may shadow globals in functions after they are referenced"] = function (test) {
  var code = [
    "var foo;",
    "function x() {",
    "  foo();",
    "  var foo;",
    "}"
  ];

  TestRun(test).test(code);
  test.done();
};

exports["test block scope redefines globals only outside of blocks"] = function (test) {
  var code = [
    "{",
    "  let Map = true;",
    "}",
    "let Map = false;"
  ];

  TestRun(test)
    .addError(4, 5, "Redefinition of 'Map'.")
    .test(code, { esnext: true, browser: true });
  test.done();
};

exports["test destructuring function as moz"] = function (test) {
  // Example from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function userId({id}) {",
    "  return id;",
    "}",
    "function whois({displayName: displayName, fullName: {firstName: name}}) {",
    "  print(displayName + ' is ' + name);",
    "}",
    "var user = {id: 42, displayName: 'jdoe', fullName: {firstName: 'John', lastName: 'Doe'}};",
    "print('userId: ' + userId(user));",
    "whois(user);"
  ];
  TestRun(test)
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test destructuring function as esnext"] = function (test) {
  // Example from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function userId({id}) {",
    "  return id;",
    "}",
    "function whois({displayName: displayName, fullName: {firstName: name}}) {",
    "  print(displayName + ' is ' + name);",
    "}",
    "var user = {id: 42, displayName: 'jdoe', fullName: {firstName: 'John', lastName: 'Doe'}};",
    "print('userId: ' + userId(user));",
    "whois(user);"
  ];
  TestRun(test)
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test destructuring function as es5"] = function (test) {
  // Example from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function userId({id}) {",
    "  return id;",
    "}",
    "function whois({displayName: displayName, fullName: {firstName: name}}) {",
    "  print(displayName + ' is ' + name);",
    "}",
    "var user = {id: 42, displayName: 'jdoe', fullName: {firstName: 'John', lastName: 'Doe'}};",
    "print('userId: ' + userId(user));",
    "whois(user);"
  ];
  TestRun(test)
    .addError(1, 16, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 15, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test destructuring function as legacy JS"] = function (test) {
  // Example from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function userId({id}) {",
    "  return id;",
    "}",
    "function whois({displayName: displayName, fullName: {firstName: name}}) {",
    "  print(displayName + ' is ' + name);",
    "}",
    "var user = {id: 42, displayName: 'jdoe', fullName: {firstName: 'John', lastName: 'Doe'}};",
    "print('userId: ' + userId(user));",
    "whois(user);"
  ];
  TestRun(test)
    .addError(1, 16, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 15, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["destructuring function default values"] = function (test) {
  var code = [
    "function a([ b = 2, c = 2 ] = []) {}",
    "function d([ f = 2 ], g, [ e = 2 ] = []) {}",
    "function h({ i = 2 }, { j = 2 } = {}) {}",
    "function k({ l: m = 2, n = 2 }) {}",
    "let o = (p, [ q = 2, r = 2 ]) => {};",
    "let s = ({ t = 2 } = {}, [ u = 2 ] = []) => {};",
    "let v = ({ w: x = 2, y = 2 }) => {};"
  ];

  TestRun(test).test(code, { esnext: true });

  test.done();
};

exports["non-simple parameter list strict transition"] = function (test) {
  var noTransitionNonStrict = [
    "function f() {}",
    "function f(x) {}",
    "var a = x => {};",
    "function f({ x }) {}",
    "function f([ x ]) {}",
    "function f(...x) {}",
    "function f(x = 0) {}"
  ];

  TestRun(test, "no transition: ES6 & non-strict mode")
    .test(noTransitionNonStrict, { esversion: 6 });
  TestRun(test, "no transition: ES7 & non-strict mode")
    .test(noTransitionNonStrict, { esversion: 7 });

  var noTransitionStrict = [
    "'use strict';",
    "function f() {",
    "  'use strict';",
    "}",
    "function f(x) {",
    "  'use strict';",
    "}",
    "var a = x => {",
    "  'use strict';",
    "};",
    "function f({ x }) {",
    "  'use strict';",
    "}",
    "function f([ x ]) {",
    "  'use strict';",
    "}",
    "function f(...x) {",
    "  'use strict';",
    "}",
    "function f(x = 0) {",
    "  'use strict';",
    "}"
  ];

  TestRun(test, "no transition: ES6 & strict mode")
    .addError(1, 1, "Use the function form of \"use strict\".")
    .addError(3, 3, "Unnecessary directive \"use strict\".")
    .addError(6, 3, "Unnecessary directive \"use strict\".")
    .addError(9, 3, "Unnecessary directive \"use strict\".")
    .addError(12, 3, "Unnecessary directive \"use strict\".")
    .addError(15, 3, "Unnecessary directive \"use strict\".")
    .addError(18, 3, "Unnecessary directive \"use strict\".")
    .addError(21, 3, "Unnecessary directive \"use strict\".")
    .test(noTransitionStrict, { esversion: 6 });
  TestRun(test, "no transition: ES7 & strict mode")
    .addError(1, 1, "Use the function form of \"use strict\".")
    .addError(3, 3, "Unnecessary directive \"use strict\".")
    .addError(6, 3, "Unnecessary directive \"use strict\".")
    .addError(9, 3, "Unnecessary directive \"use strict\".")
    .addError(12, 3, "Unnecessary directive \"use strict\".")
    .addError(12, 3, "Functions defined outside of strict mode with non-simple parameter lists may not enable strict mode.")
    .addError(15, 3, "Unnecessary directive \"use strict\".")
    .addError(15, 3, "Functions defined outside of strict mode with non-simple parameter lists may not enable strict mode.")
    .addError(18, 3, "Unnecessary directive \"use strict\".")
    .addError(18, 3, "Functions defined outside of strict mode with non-simple parameter lists may not enable strict mode.")
    .addError(21, 3, "Unnecessary directive \"use strict\".")
    .addError(21, 3, "Functions defined outside of strict mode with non-simple parameter lists may not enable strict mode.")
    .test(noTransitionStrict, { esversion: 7 });

  var directTransition = [
    "function f() {",
    "  'use strict';",
    "}",
    "function f(x) {",
    "  'use strict';",
    "}",
    "var a = x => {",
    "  'use strict';",
    "};",
    "function f({ x }) {",
    "  'use strict';",
    "}",
    "function f([ x ]) {",
    "  'use strict';",
    "}",
    "function f(...x) {",
    "  'use strict';",
    "}",
    "function f(x = 0) {",
    "  'use strict';",
    "}"
  ];

  TestRun(test, "direct transition: ES6")
    .test(directTransition, { esversion: 6 });

  TestRun(test, "direct transition: ES7")
    .addError(11, 3, "Functions defined outside of strict mode with non-simple parameter lists may not enable strict mode.")
    .addError(14, 3, "Functions defined outside of strict mode with non-simple parameter lists may not enable strict mode.")
    .addError(17, 3, "Functions defined outside of strict mode with non-simple parameter lists may not enable strict mode.")
    .addError(20, 3, "Functions defined outside of strict mode with non-simple parameter lists may not enable strict mode.")
    .test(directTransition, { esversion: 7 });

  var indirectTransition = [
    "function f() {",
    "  function g() {",
    "    'use strict';",
    "  }",
    "}",
    "function f(x) {",
    "  function g() {",
    "    'use strict';",
    "  }",
    "}",
    "var a = x => {",
    "  function g() {",
    "    'use strict';",
    "  }",
    "};",
    "function f({ x }) {",
    "  function g() {",
    "    'use strict';",
    "  }",
    "}",
    "function f([ x ]) {",
    "  function g() {",
    "    'use strict';",
    "  }",
    "}",
    "function f(...x) {",
    "  function g() {",
    "    'use strict';",
    "  }",
    "}",
    "function f(x = 0) {",
    "  function g() {",
    "    'use strict';",
    "  }",
    "}",
  ];

  TestRun(test, "indirect transition: ES6")
    .test(indirectTransition, { esversion: 6 });
  TestRun(test, "indirect transition: ES7")
    .test(indirectTransition, { esversion: 7 });

  test.done();
};

exports["non var destructuring assignment statement"] = function (test) {
  var codeValid = [
    "let b;",
    "[b] = b;",
    "([b] = b);",
    "({b} = b);",
    "let c = {b} = b;",
    "c = [b] = b;",
    "c = ({b} = b);",
    "c = ([b] = b);"
  ];

  var codeInvalid = [
    "let b;",
    "{b} = b;",
    "({b}) = b;",
    "([b]) = b;",
    "[{constructor(){}}] = b;",
    "([{constructor(){}}] = b);",
    "let c = ({b}) = b;",
    "c = ([b]) = b;"
  ];

  TestRun(test).test(codeValid, { esnext: true });

  TestRun(test)
    .addError(2, 2, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, 3, "Missing semicolon.")
    .addError(2, 5, "Expected an identifier and instead saw '='.")
    .addError(2, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, 6, "Missing semicolon.")
    .addError(2, 7, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 7, "Bad assignment.")
    .addError(4, 7, "Bad assignment.")
    .addError(5, 14, "Expected ',' and instead saw '('.")
    .addError(5, 15, "Expected an identifier and instead saw ')'.")
    .addError(5, 16, "Expected ',' and instead saw '{'.")
    .addError(5, 18, "Expected ',' and instead saw '}'.")
    .addError(6, 15, "Expected ',' and instead saw '('.")
    .addError(6, 16, "Expected an identifier and instead saw ')'.")
    .addError(6, 17, "Expected ',' and instead saw '{'.")
    .addError(6, 19, "Expected ',' and instead saw '}'.")
    .addError(7, 15, "Bad assignment.")
    .addError(8, 11, "Bad assignment.")
    .test(codeInvalid, { esnext: true });

  test.done();

};

exports["invalid for each"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "for each (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}"
  ];

  TestRun(test)
    .addError(1, 5, "Invalid for each loop.")
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["invalid for each as esnext"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "for each (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}"
  ];

  TestRun(test)
    .addError(1, 5, "Invalid for each loop.")
    .addError(1, 5, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["invalid for each as ES5"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "for each (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}"
  ];

  TestRun(test)
    .addError(1, 5, "Invalid for each loop.")
    .addError(1, 5, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 11, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["invalid for each as legacy JS"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "for each (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}"
  ];
  TestRun(test)
    .addError(1, 5, "Invalid for each loop.")
    .addError(1, 5, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 11, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["esnext generator"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function* fib() {",
    "  var i = 0, j = 1;",
    "  while (true) {",
    "    yield i;",
    "    [i, j] = [j, i + j];",
    "  }",
    "}",

    "var g = fib();",
    "for (var i = 0; i < 10; i++)",
    "  print(g.next());"
  ];
  TestRun(test)
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  TestRun(test, "YieldExpression in parameters - declaration")
    .addError(1, 18, "Unexpected 'yield'.")
    .test("function * g(x = yield) { yield; }", { esversion: 6 });

  TestRun(test, "YieldExpression in parameters - expression")
    .addError(1, 22, "Unexpected 'yield'.")
    .test("void function * (x = yield) { yield; };", { esversion: 6 });

  TestRun(test, "YieldExpression in parameters - method")
    .addError(1, 16, "Unexpected 'yield'.")
    .test("void { * g(x = yield) { yield; } };", { esversion: 6 });

  test.done();
};

exports["esnext generator as moz extension"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function* fib() {",
    "  var i = 0, j = 1;",
    "  while (true) {",
    "    yield i;",
    "    [i, j] = [j, i + j];",
    "  }",
    "}",

    "var g = fib();",
    "for (var i = 0; i < 10; i++)",
    "  print(g.next());"
  ];
  TestRun(test)
    .addError(1, 9, "'function*' is only available in ES6 (use 'esversion: 6').")
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["esnext generator as es5"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function* fib() {",
    "  var i = 0, j = 1;",
    "  while (true) {",
    "    yield i;",
    "    [i, j] = [j, i + j];",
    "  }",
    "}",

    "var g = fib();",
    "for (var i = 0; i < 10; i++)",
    "  print(g.next());"
  ];
  TestRun(test)
    .addError(1, 9, "'function*' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 5, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["esnext generator as legacy JS"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function* fib() {",
    "  var i = 0, j = 1;",
    "  while (true) {",
    "    yield i;",
    "    [i, j] = [j, i + j];",
    "  }",
    "}",

    "var g = fib();",
    "for (var i = 0; i < 10; i++)",
    "  print(g.next());"
  ];
  TestRun(test)
    .addError(1, 9, "'function*' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 5, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["esnext generator without yield"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function* fib() {",
    "  var i = 0, j = 1;",
    "  while (true) {",
    "    [i, j] = [j, i + j];",
    "    return i;",
    "  }",
    "}",

    "var g = fib();",
    "for (let i = 0; i < 10; i++)",
    "  print(g.next());"
  ];
  TestRun(test)
    .addError(7, 1, "A generator function should contain at least one yield expression.")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["esnext generator without yield and check turned off"] = function (test) {
  var code = [
    "function* emptyGenerator() {}",

    "emptyGenerator();"
  ];
  TestRun(test)
    .test(code, {esnext: true, noyield: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["esnext generator with yield delegation, gh-1544"] = function(test) {
  var code = [
    "function* G() {",
    "  yield* (function*(){})();",
    "}"
  ];

  TestRun(test)
    .addError(1, 9, "'function*' is only available in ES6 (use 'esversion: 6').")
    .addError(2, 3, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 11, "'function*' is only available in ES6 (use 'esversion: 6').")
    .addError(2, 23, "A generator function should contain at least one yield expression.")
    .test(code);


  TestRun(test).test(code, {esnext: true, noyield: true});
  TestRun(test).test(code, {esnext: true, noyield: true, moz: true});

  test.done();
};

exports["mozilla generator"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function fib() {",
    "  var i = 0, j = 1;",
    "  while (true) {",
    "    yield i;",
    "    [i, j] = [j, i + j];",
    "  }",
    "}",
    "var g = fib();",
    "for (let i = 0; i < 10; i++)",
    "  print(g.next());"
  ];
  TestRun(test)
    .test(code, {moz: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  test.done();
};

exports["mozilla generator as esnext"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function fib() {",
    "  var i = 0, j = 1;",
    "  while (true) {",
    "    yield i;",
    "    [i, j] = [j, i + j];",
    "  }",
    "}",
    "var g = fib();",
    "for (let i = 0; i < 10; i++)",
    "  print(g.next());"
  ];
  TestRun(test)
    .addError(4, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 10, "Missing semicolon.")
    .addError(4, 11, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 5, "'yield' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  TestRun(test)
    .addError(4, 5,
     "Yield expressions may only occur within generator functions.")
    .test(code, {esnext: true, moz: true});

  test.done();
};

exports["yield expression within try-catch"] = function (test) {
  // see issue: https://github.com/jshint/jshint/issues/1505
  var code = [
    "function* fib() {",
    "  try {",
    "    yield 1;",
    "  } catch (err) {",
    "    yield err;",
    "  }",
    "}",
    "var g = fib();",
    "for (let i = 0; i < 10; i++)",
    "  print(g.next());"
  ];
  TestRun(test)
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  test.done();
};

exports["catch block no curlies"] = function (test) {
  var code = [
    "try {} catch(e) e.toString();"
  ];
  TestRun(test)
    .addError(1, 17, "Expected '{' and instead saw 'e'.")
    .test(code, {});

  test.done();
};

exports.optionalCatch = function (test) {
  var code = "try {} catch {}";

  TestRun(test)
    .addError(1, 8, "'optional catch binding' is only available in ES10 (use 'esversion: 10').")
    .test(code);

  TestRun(test)
    .test(code, {esversion: 10});

  test.done();
};

exports["strict violation - use of arguments and eval"] = function (test) {
  var code = [
    "'use strict';",
    "var arguments;",
    "(function() {",
    "  var eval;",
    "}());"
  ];
  TestRun(test)
    .addError(2, 5, "Strict violation.")
    .addError(4, 7, "Strict violation.")
    .test(code, { strict: "global"});

  TestRun(test, "via `catch` clause binding (valid)")
    .test([
      "try {} catch (arguments) {}",
      "try {} catch (eval) {}"
    ]);

  TestRun(test, "via `catch` clause binding (invalid)")
    .addError(2, 15, "Strict violation.")
    .addError(3, 15, "Strict violation.")
    .test([
      "'use strict';",
      "try {} catch (arguments) {}",
      "try {} catch (eval) {}"
    ], { strict: "global" });

  TestRun(test, "via parameter (valid)")
    .test([
      "function f1(arguments) {}",
      "function f2(eval) {}"
    ]);

  TestRun(test, "via parameter - (invalid)")
    .addError(1, 13, "Strict violation.")
    .addError(2, 13, "Strict violation.")
    .test([
      "function f1(arguments) { 'use strict'; }",
      "function f2(eval) { 'use strict'; }"
    ]);

  TestRun(test, "as function binding (valid)")
    .test([
      "function arguments() {}",
      "function eval() {}",
      "void function arguments() {};",
      "void function eval() {};"
    ]);

  TestRun(test, "as function bindings for expressions with inferred names (valid)")
    .test([
      "var arguments = function() {};",
      "(function() {",
      "  var eval = function() {};",
      "}());"
    ]);

  TestRun(test, "as function declaration binding (invalid)")
    .addError(1, 10, "Strict violation.")
    .addError(2, 10, "Strict violation.")
    .addError(5, 12, "Strict violation.")
    .addError(6, 12, "Strict violation.")
    .addError(10, 12, "Strict violation.")
    .addError(10, 26, "Unnecessary directive \"use strict\".")
    .addError(11, 12, "Strict violation.")
    .addError(11, 21, "Unnecessary directive \"use strict\".")
    .test([
      "function arguments() { 'use strict'; }",
      "function eval() { 'use strict'; }",
      "(function() {",
      "  'use strict';",
      "  function arguments() {}",
      "  function eval() {}",
      "}());",
      "(function() {",
      "  'use strict';",
      "  function arguments() { 'use strict'; }",
      "  function eval() { 'use strict'; }",
      "}());"
    ]);

  TestRun(test, "as function expression binding (invalid)")
    .addError(1, 15, "Strict violation.")
    .addError(2, 15, "Strict violation.")
    .addError(5, 17, "Strict violation.")
    .addError(6, 17, "Strict violation.")
    .addError(10, 17, "Strict violation.")
    .addError(10, 31, "Unnecessary directive \"use strict\".")
    .addError(11, 17, "Strict violation.")
    .addError(11, 26, "Unnecessary directive \"use strict\".")
    .test([
      "void function arguments() { 'use strict'; };",
      "void function eval() { 'use strict'; };",
      "(function() {",
      "  'use strict';",
      "  void function arguments() {};",
      "  void function eval() {};",
      "}());",
      "(function() {",
      "  'use strict';",
      "  void function arguments() { 'use strict'; };",
      "  void function eval() { 'use strict'; };",
      "}());"
    ]);

  test.done();
};

exports["mozilla generator as es5"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function fib() {",
    "  var i = 0, j = 1;",
    "  while (true) {",
    "    yield i;",
    "    [i, j] = [j, i + j];",
    "  }",
    "}",
    "var g = fib();",
    "for (let i = 0; i < 10; i++)",
    "  print(g.next());"
  ];
  TestRun(test)
    .addError(4, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 10, "Missing semicolon.")
    .addError(4, 11, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 5, "'yield' is not defined.")
    .addError(5, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print", "Iterator"]}); // es5

  test.done();
};

exports["mozilla generator as legacy JS"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function fib() {",
    "  var i = 0, j = 1;",
    "  while (true) {",
    "    yield i;",
    "    [i, j] = [j, i + j];",
    "  }",
    "}",
    "var g = fib();",
    "for (let i = 0; i < 10; i++)",
    "  print(g.next());"
  ];
  TestRun(test)
    .addError(4, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 10, "Missing semicolon.")
    .addError(4, 11, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 5, "'yield' is not defined.")
    .addError(5, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  test.done();
};

exports["array comprehension"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function *range(begin, end) {",
    "  for (let i = begin; i < end; ++i) {",
    "    yield i;",
    "  }",
    "}",
    "var ten_squares = [for (i of range(0, 10)) i * i];",
    "var evens = [for (i of range(0, 21)) if (i % 2 === 0) i];",
    "print('squares:', ten_squares);",
    "print('evens:', evens);",
    "(function() {",
    "  var ten_squares = [for (i of range(0, 10)) i * i];",
    "  print('squares:', ten_squares);",
    "}());"
  ];
  TestRun(test)
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["array comprehension unused and undefined"] = function (test) {
  var code = [
    "var range = [1, 2];",
    "var a = [for (i of range) if (i % 2 === 0) i];",
    "var b = [for (j of range) doesnotexist];",
    "var c = [for (\\u0024 of range) 1];"
  ];
  TestRun(test)
    .addError(2, 5, "'a' is defined but never used.")
    .addError(3, 15, "'j' is defined but never used.")
    .addError(3, 27, "'doesnotexist' is not defined.")
    .addError(3, 5, "'b' is defined but never used.")
    .addError(4, 15, "'\\u0024' is defined but never used.")
    .addError(4, 5, "'c' is defined but never used.")
    .test(code, { esnext: true, unused: true, undef: true });

  var unused = JSHINT.data().unused;
  test.deepEqual([
    { name: 'a', line: 2, character: 5 },
    { name: 'b', line: 3, character: 5 },
    { name: 'c', line: 4, character: 5 }
    //{ name: 'j', line: 3, character: 15 } // see gh-2440
  ], unused);

  var implieds = JSHINT.data().implieds;
  test.deepEqual([{ name: 'doesnotexist', line: [ 3 ] }], implieds);

  test.done();
};

exports["gh-1856 mistakenly identified as array comprehension"] = function (test) {
  var code = [
    "function main(value) {",
    "  var result = ['{'],",
    "      key;",
    "  for (key in value) {",
    "    result.push(key);",
    "  }",
    "  return result;",
    "}",
    "main({abc:true});"
  ];

  TestRun(test)
    .test(code);

  test.done();
};

exports["gh-1413 wrongly detected as array comprehension"] = function (test) {
  var code = [
    "var a = {};",
    "var b = [ a.for ];"
  ];

  TestRun(test)
    .test(code, { unused: false });

  test.done();
};

exports["moz-style array comprehension"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function range(begin, end) {",
    "  for (let i = begin; i < end; ++i) {",
    "    yield i;",
    "  }",
    "}",
    "var ten_squares = [i * i for each (i in range(0, 10))];",
    "var evens = [i for each (i in range(0, 21)) if (i % 2 === 0)];",
    "print('squares:', ten_squares);",
    "print('evens:', evens);"
  ];
  TestRun(test)
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["array comprehension with for..of"] = function (test) {
  // example adapted from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function *range(begin, end) {",
    "  for (let i = begin; i < end; ++i) {",
    "    yield i;",
    "  }",
    "}",
    "var ten_squares = [for (i of range(0, 10)) i * i];",
    "var evens = [for (i of range(0, 21)) if (i % 2 === 0) i];",
    "print('squares:', ten_squares);",
    "print('evens:', evens);"
  ];
  TestRun(test)
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["moz-style array comprehension with for..of"] = function (test) {
  // example adapted from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function range(begin, end) {",
    "  for (let i = begin; i < end; ++i) {",
    "    yield i;",
    "  }",
    "}",
    "var ten_squares = [i * i for (i of range(0, 10))];",
    "var evens = [i for (i of range(0, 21)) if (i % 2 === 0)];",
    "print('squares:', ten_squares);",
    "print('evens:', evens);"
  ];
  TestRun(test)
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["array comprehension with unused variables"] = function (test) {
  var code = [
    "var ret = [for (i of unknown) i];",
    "print('ret:', ret);",
  ];
  TestRun(test)
    .addError(1, 22, "'unknown' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["moz-style array comprehension with unused variables"] = function (test) {
  var code = [
    "var ret = [i for (i of unknown)];",
    "print('ret:', ret);",
  ];
  TestRun(test)
    .addError(1, 24, "'unknown' is not defined.")
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["moz-style array comprehension as esnext"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function range(begin, end) {",
    "  for (let i = begin; i < end; ++i) {",
    "    yield i;",
    "  }",
    "}",
    "var ten_squares = [i * i for each (i in range(0, 10))];",
    "var evens = [i for each (i in range(0, 21)) if (i % 2 === 0)];",
    "print('squares:', ten_squares);",
    "print('evens:', evens);"
  ];
  TestRun(test)
    .addError(3, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 10, "Missing semicolon.")
    .addError(3, 11, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 5, "'yield' is not defined.")
    .addError(6, 20, "Expected 'for' and instead saw 'i'.")
    .addError(6, 30, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(7, 14, "Expected 'for' and instead saw 'i'.")
    .addError(7, 20, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  TestRun(test)
    .addError(3, 5, "Yield expressions may only occur within generator functions.")
    .test(code, {esnext: true, moz: true});

  test.done();
};

exports["array comprehension as es5"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function *range(begin, end) {",
    "  for (let i = begin; i < end; ++i) {",
    "    yield i;",
    "  }",
    "}",
    "var ten_squares = [for (i of range(0, 10)) i * i];",
    "var evens = [for (i of range(0, 21)) if (i % 2 === 0) i];",
    "print('squares:', ten_squares);",
    "print('evens:', evens);"
  ];
  TestRun(test)
    .addError(1, 10, "'function*' is only available in ES6 (use 'esversion: 6').")
    .addError(2, 8, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 5, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 19, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(7, 13, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["moz-style array comprehension as es5"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function range(begin, end) {",
    "  for (let i = begin; i < end; ++i) {",
    "    yield i;",
    "  }",
    "}",
    "var ten_squares = [i * i for each (i in range(0, 10))];",
    "var evens = [i for each (i in range(0, 21)) if (i % 2 === 0)];",
    "print('squares:', ten_squares);",
    "print('evens:', evens);"
  ];
  TestRun(test)
    .addError(2, 8, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 10, "Missing semicolon.")
    .addError(3, 11, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 5, "'yield' is not defined.")
    .addError(6, 19, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(6, 20, "Expected 'for' and instead saw 'i'.")
    .addError(6, 30, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(7, 13, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(7, 14, "Expected 'for' and instead saw 'i'.")
    .addError(7, 20, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["array comprehension as legacy JS"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function range(begin, end) {",
    "  for (let i = begin; i < end; ++i) {",
    "    yield i;",
    "  }",
    "}",
    "var ten_squares = [for (i of range(0, 10)) i * i];",
    "var evens = [for (i of range(0, 21)) if (i % 2 === 0) i];",
    "print('squares:', ten_squares);",
    "print('evens:', evens);"
  ];
  TestRun(test)
    .addError(2, 8, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 10, "Missing semicolon.")
    .addError(3, 11, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 5, "'yield' is not defined.")
    .addError(6, 19, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(7, 13, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["moz-style array comprehension as legacy JS"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "function range(begin, end) {",
    "  for (let i = begin; i < end; ++i) {",
    "    yield i;",
    "  }",
    "}",
    "var ten_squares = [i * i for each (i in range(0, 10))];",
    "var evens = [i for each (i in range(0, 21)) if (i % 2 === 0)];",
    "print('squares:', ten_squares);",
    "print('evens:', evens);"
  ];
  TestRun(test)
    .addError(2, 8, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 10, "Missing semicolon.")
    .addError(3, 11, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 5, "'yield' is not defined.")

    .addError(6, 19, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(6, 20, "Expected 'for' and instead saw 'i'.")
    .addError(6, 30, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(7, 13, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(7, 14, "Expected 'for' and instead saw 'i'.")
    .addError(7, 20, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports['array comprehension with dest array at global scope'] = function (test) {
  var code = [
    "[for ([i, j] of [[0,0], [1,1], [2,2]]) [i, j] ];",
    "var destarray_comparray_1 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, [j, j] ]];",
    "var destarray_comparray_2 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, {i: [i, j]} ]];",
  ];
  TestRun(test)
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports['moz-style array comprehension with dest array at global scope'] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_1 = [ [i, [j, j] ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_2 = [ [i, {i: [i, j]} ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
  ];
  TestRun(test)
    .test(code, {moz: true, undef: true, predef: ["print"]});

  test.done();
};

exports['moz-style array comprehension with dest array at global scope as esnext'] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_1 = [ [i, [j, j] ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_2 = [ [i, {i: [i, j]} ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
  ];
  TestRun(test)
    .addError(1, 3, "Expected 'for' and instead saw '['.")
    .addError(1, 14, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(2, 31, "Expected 'for' and instead saw '['.")
    .addError(2, 48, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, 31, "Expected 'for' and instead saw '['.")
    .addError(3, 53, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports['array comprehension with dest array at global scope as es5'] = function (test) {
  var code = [
    "[for ([i, j] of [[0,0], [1,1], [2,2]]) [i, j] ];",
    "var destarray_comparray_1 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, [j, j] ] ];",
    "var destarray_comparray_2 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, {i: [i, j]} ] ];",
  ];
  TestRun(test)
    .addError(1, 1, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(2, 29, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, 29, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports['moz-style array comprehension with dest array at global scope as es5'] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_1 = [ [i, [j, j] ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_2 = [ [i, {i: [i, j]} ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
  ];
  TestRun(test)
    .addError(1, 1, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 3, "Expected 'for' and instead saw '['.")
    .addError(1, 14, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(2, 29, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(2, 31, "Expected 'for' and instead saw '['.")
    .addError(2, 48, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, 29, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, 31, "Expected 'for' and instead saw '['.")
    .addError(3, 53, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports['array comprehension with dest array at global scope as JS legacy'] = function (test) {
  var code = [
    "[for ([i, j] of [[0,0], [1,1], [2,2]]) [i, j] ];",
    "var destarray_comparray_1 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, [j, j] ] ];",
    "var destarray_comparray_2 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, {i: [i, j]} ] ];",
  ];
  TestRun(test)
    .addError(1, 1, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(2, 29, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, 29, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports['moz-style array comprehension with dest array at global scope as JS legacy'] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_1 = [ [i, [j, j] ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_2 = [ [i, {i: [i, j]} ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
  ];
  TestRun(test)
    .addError(1, 1, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 3, "Expected 'for' and instead saw '['.")
    .addError(1, 14, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(2, 29, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(2, 31, "Expected 'for' and instead saw '['.")
    .addError(2, 48, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, 29, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, 31, "Expected 'for' and instead saw '['.")
    .addError(3, 53, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports["array comprehension imbrication with dest array"] = function (test) {
  var code = [
    "[for ([i, j] of [for ([a, b] of [[2,2], [3,4]]) [a, b] ]) [i, j] ];"
  ];

  TestRun(test)
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports["moz-style array comprehension imbrication with dest array"] = function (test) {
  var code = [
    "[ [i, j] for ([i, j] in [[a, b] for each ([a, b] in [[2,2], [3,4]])]) ];"
  ];

  TestRun(test)
    .test(code, {moz: true, undef: true, predef: ["print"]});

  test.done();
};

exports["moz-style array comprehension imbrication with dest array using for..of"] = function (test) {
  var code = [
    "[ [i, j] for ([i, j] of [[a, b] for ([a, b] of [[2,2], [3,4]])]) ];"
  ];

  TestRun(test)
    .test(code, {moz: true, undef: true, predef: ["print"]});

  test.done();
};

exports["moz-style array comprehension imbrication with dest array as esnext"] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[a, b] for each ([a, b] in [[2,2], [3,4]])]) ];"
  ];
  TestRun(test)
    .addError(1, 3, "Expected 'for' and instead saw '['.")
    .addError(1, 14, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 31, "Expected 'for' and instead saw '['.")
    .addError(1, 42, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports["array comprehension imbrication with dest array as es5"] = function (test) {
  var code = [
    "[for ([i, j] of [for ([a, b] of [[2,2], [3,4]]) [a, b] ]) [i, j] ];"
  ];
  TestRun(test)
    .addError(1, 1, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 17, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["moz-style array comprehension imbrication with dest array as es5"] = function (test) {
  var code = [
    "[for ([i, j] of [for ([a, b] of [[2,2], [3,4]]) [a, b] ]) [i, j] ];"
  ];
  TestRun(test)
    .addError(1, 1, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 17, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["array comprehension imbrication with dest array as legacy JS"] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[a, b] for each ([a, b] in [[2,2], [3,4]])]) ];"

  ];
  TestRun(test)
    .addError(1, 1, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 30, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 3, "Expected 'for' and instead saw '['.")
    .addError(1, 31, "Expected 'for' and instead saw '['.")
    .addError(1, 14, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 42, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports["moz-style array comprehension imbrication with dest array as legacy JS"] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[a, b] for each ([a, b] in [[2,2], [3,4]])]) ];"

  ];
  TestRun(test)
    .addError(1, 1, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 30, "'array comprehension' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 3, "Expected 'for' and instead saw '['.")
    .addError(1, 31, "Expected 'for' and instead saw '['.")
    .addError(1, 14, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, 42, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports["no false positive array comprehension"] = function (test) {
  var code = [
    "var foo = []; for (let i in [1,2,3]) { print(i); }"
  ];
  TestRun(test)
    .test(code, {moz: true, undef: true, predef: ["print"]});

  test.done();
};

exports["try catch filters"] = function (test) {
  var code = [
    "try {",
    "  throw {name: 'foo', message: 'bar'};",
    "}",
    "catch (e if e.name === 'foo') {",
    "  print (e.message);",
    "}"
  ];
  TestRun(test)
    .test(code, {moz: true, undef: true, predef: ["print"]});

  test.done();
};

exports["try catch filters as esnext"] = function (test) {
  var code = [
    "try {",
    "  throw {name: 'foo', message: 'bar'};",
    "}",
    "catch (e if e.name === 'foo') {",
    "  print (e.message);",
    "}"
  ];
  TestRun(test)
    .addError(4, 8, "'catch filter' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports["try catch filters as es5"] = function (test) {
  var code = [
    "try {",
    "  throw {name: 'foo', message: 'bar'};",
    "}",
    "catch (e if e.name === 'foo') {",
    "  print (e.message);",
    "}"
  ];
  TestRun(test)
    .addError(4, 8, "'catch filter' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["try catch filters as legacy JS"] = function (test) {
  var code = [
    "try {",
    "  throw {name: 'foo', message: 'bar'};",
    "}",
    "catch (e if e.name === 'foo') {",
    "  print (e.message);",
    "}"
  ];
  TestRun(test)
    .addError(4, 8, "'catch filter' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports["function closure expression"] = function (test) {
  var code = [
    "let (arr = [1,2,3]) {",
    "  arr.every(function (o) o instanceof Object);",
    "}"
  ];
  TestRun(test)
    .test(code, {es3: true, moz: true, undef: true});

  test.done();
};

exports["function closure expression as esnext"] = function (test) {
  var code = [
    "var arr = [1,2,3];",
    "arr.every(function (o) o instanceof Object);",
  ];
  TestRun(test)
    .addError(2, 22, "'function closure expressions' is only available in Mozilla JavaScript " +
      "extensions (use moz option).")
    .test(code, {esnext: true, undef: true});

  test.done();
};

exports["function closure expression as es5"] = function (test) {
  var code = [
    "var arr = [1,2,3];",
    "arr.every(function (o) o instanceof Object);",
  ];
  TestRun(test)
    .addError(2, 22, "'function closure expressions' is only available in Mozilla JavaScript " +
      "extensions (use moz option).")
    .test(code, {undef: true}); // es5

  test.done();
};

exports["function closure expression as legacy JS"] = function (test) {
  var code = [
    "var arr = [1,2,3];",
    "arr.every(function (o) o instanceof Object);",
  ];
  TestRun(test)
    .addError(2, 22, "'function closure expressions' is only available in Mozilla JavaScript " +
      "extensions (use moz option).")
    .test(code, {es3: true, undef: true});

  test.done();
};

exports["for of as esnext"] = function (test) {
  var code = [
    "for (let x of [1,2,3,4]) {",
    "    print(x);",
    "}",
    "for (let x of [1,2,3,4]) print(x);",
    "for (const x of [1,2,3,4]) print(x);",
    "var xg, yg;",
    "for (xg = 1 of [1,2,3,4]) print(xg);",
    "for (xg, yg of [1,2,3,4]) print(xg + yg);",
    "for (xg = 1, yg = 2 of [1,2,3,4]) print(xg + yg);",
    "for (var xv = 1 of [1,2,3,4]) print(xv);",
    "for (var xv, yv of [1,2,3,4]) print(xv + yv);",
    "for (var xv = 1, yv = 2 of [1,2,3,4]) print(xv + yv);",
    "for (let x = 1 of [1,2,3,4]) print(x);",
    "for (let x, y of [1,2,3,4]) print(x + y);",
    "for (let x = 1, y = 2 of [1,2,3,4]) print(x + y);",
    "for (const x = 1 of [1,2,3,4]) print(x);",
    "for (const x, y of [1,2,3,4]) print(x + y);",
    "for (const x = 1, y = 2 of [1,2,3,4]) print(x + y);"
  ];
  TestRun(test)
    .addError(7, 9, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(8, 8, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(9, 17, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(9, 12, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(10, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(11, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(12, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(12, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(13, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(14, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(15, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(15, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(16, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(17, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(18, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(18, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  TestRun(test, "Left-hand side as MemberExpression")
    .test([
      "for (x.y of []) {}",
      "for (x[z] of []) {}",
    ], {esversion: 2015});

  TestRun(test, "Left-hand side as MemberExpression (invalid)")
    .addError(1, 10, "Bad assignment.")
    .addError(2, 13, "Bad assignment.")
    .test([
      "for (x+y of {}) {}",
      "for ((this) of {}) {}"
    ], {esversion: 2015});

  TestRun(test, "let binding named `of`")
    .test("for (let of of []) {}", {esversion: 2015});

  test.done();
};

exports["for of as es5"] = function (test) {
  var code = [
    "for (let x of [1,2,3,4]) {",
    "    print(x);",
    "}",
    "for (let x of [1,2,3,4]) print(x);",
    "for (const x of [1,2,3,4]) print(x);",
    "for (x = 1 of [1,2,3,4]) print(x);",
    "for (x, y of [1,2,3,4]) print(x + y);",
    "for (x = 1, y = 2 of [1,2,3,4]) print(x + y);",
    "for (var x = 1 of [1,2,3,4]) print(x);",
    "for (var x, y of [1,2,3,4]) print(x + y);",
    "for (var x = 1, y = 2 of [1,2,3,4]) print(x + y);",
    "for (let x = 1 of [1,2,3,4]) print(x);",
    "for (let x, y of [1,2,3,4]) print(x + y);",
    "for (let x = 1, y = 2 of [1,2,3,4]) print(x + y);",
    "for (const x = 1 of [1,2,3,4]) print(x);",
    "for (const x, y of [1,2,3,4]) print(x + y);",
    "for (const x = 1, y = 2 of [1,2,3,4]) print(x + y);"
  ];
  TestRun(test)
    .addError(1, 12, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 12, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 14, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 12, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 8, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(7, 11, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 7, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(8, 19, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 11, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(8, 15, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(9, 16, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(10, 15, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(10, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(11, 23, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(11, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(11, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(12, 16, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(12, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(12, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(13, 15, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(13, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(13, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(14, 23, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(14, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(14, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(14, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(15, 18, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(15, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(15, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(16, 17, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(16, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(16, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(17, 25, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(17, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(17, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(17, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["for of as legacy JS"] = function (test) {
  var code = [
    "for (let x of [1,2,3,4]) {",
    "    print(x);",
    "}",
    "for (let x of [1,2,3,4]) print(x);",
    "for (const x of [1,2,3,4]) print(x);",
    "for (x = 1 of [1,2,3,4]) print(x);",
    "for (x, y of [1,2,3,4]) print(x + y);",
    "for (x = 1, y = 2 of [1,2,3,4]) print(x + y);",
    "for (var x = 1 of [1,2,3,4]) print(x);",
    "for (var x, y of [1,2,3,4]) print(x + y);",
    "for (var x = 1, y = 2 of [1,2,3,4]) print(x + y);",
    "for (let x = 1 of [1,2,3,4]) print(x);",
    "for (let x, y of [1,2,3,4]) print(x + y);",
    "for (let x = 1, y = 2 of [1,2,3,4]) print(x + y);",
    "for (const x = 1 of [1,2,3,4]) print(x);",
    "for (const x, y of [1,2,3,4]) print(x + y);",
    "for (const x = 1, y = 2 of [1,2,3,4]) print(x + y);"
  ];
  TestRun(test)
    .addError(1, 12, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 12, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 14, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 12, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 8, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(7, 11, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 7, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(8, 19, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 11, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(8, 15, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(9, 16, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(10, 15, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(10, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(11, 23, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(11, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(11, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(12, 16, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(12, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(12, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(13, 15, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(13, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(13, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(14, 23, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(14, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(14, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(14, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(15, 18, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(15, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(15, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(16, 17, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(16, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(16, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(17, 25, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(17, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(17, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(17, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports["array destructuring for of as esnext"] = function (test) {
  var basic = [
    "for ([i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (let [i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);"
  ];

  TestRun(test, "basic")
    .addError(1, 7, "Creating global 'for' variable. Should be 'for (var i ...'.")
    .addError(1, 10, "Creating global 'for' variable. Should be 'for (var v ...'.")
    .test(basic, {esnext: true, undef: true, predef: ["print"]});

  var bad = [
    "for ([i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for ([i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for ([i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
  ];

  TestRun(test, "errors #1")
    .addError(1, 13, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(2, 12, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(3, 21, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(3, 12, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(4, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(5, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .test(bad, {esnext: true, undef: true, predef: ["print"]});

  var bad2 = [
    "for (let [i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (let [i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (let [i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
  ];
  TestRun(test, "errors #2")
    .addError(1, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(2, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(3, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(3, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(4, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(5, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .test(bad2, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports["array destructuring for of as es5"] = function (test) {
  var basic = [
    "for ([i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (let [i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);"
  ];

  TestRun(test, "basic")
    .addError(1, 13, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 7, "Creating global 'for' variable. Should be 'for (var i ...'.")
    .addError(1, 10, "Creating global 'for' variable. Should be 'for (var v ...'.")
    .addError(2, 17, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 17, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 19, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(basic, {undef: true, predef: ["print"]}); // es5

  var bad = [
    "for ([i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for ([i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for ([i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
  ];

  TestRun(test, "errors #1")
    .addError(1, 22, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 13, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(1, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 21, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 12, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(2, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 12, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 30, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 12, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(3, 21, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(3, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 12, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 26, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(4, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 25, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(5, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 16, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 34, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 16, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(bad, {undef: true, predef: ["print"]}); // es5

  var bad2 = [
    "for (let [i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (let [i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (let [i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
  ];
  TestRun(test, "errors #2")
    .addError(1, 26, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(1, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 25, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(2, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 16, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 34, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(3, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(3, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 16, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 28, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(4, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 27, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(5, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 18, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 36, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 18, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(bad2, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["array destructuring for of as legacy JS"] = function (test) {
  var basic = [
    "for ([i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (let [i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);"
  ];

  TestRun(test, "basic")
    .addError(1, 13, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 7, "Creating global 'for' variable. Should be 'for (var i ...'.")
    .addError(1, 10, "Creating global 'for' variable. Should be 'for (var v ...'.")
    .addError(2, 17, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 17, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 19, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(basic, {es3: true, undef: true, predef: ["print"]}); // es3

  var bad = [
    "for ([i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for ([i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for ([i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (var [i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
  ];

  TestRun(test, "errors #1")
    .addError(1, 22, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 13, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(1, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 21, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 12, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(2, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 12, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 30, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 12, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(3, 21, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(3, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 12, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 26, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(4, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 25, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(5, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 16, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 34, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 16, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(bad, {es3: true, undef: true, predef: ["print"]}); // es3

  var bad2 = [
    "for (let [i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (let [i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (let [i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v], [a, b] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
    "for (const [i, v], [a, b] = [1, 2] of [[0, 1],[1, 2],[2, 3],[3, 4]]) print(i + '=' + v);",
  ];
  TestRun(test, "errors #2")
    .addError(1, 26, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(1, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 25, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(2, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 16, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 34, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(3, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(3, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 16, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 28, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(4, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 27, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(5, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 18, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 36, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 18, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(bad2, {es3: true, undef: true, predef: ["print"]}); // es3

  test.done();
};

exports["object destructuring for of as esnext"] = function (test) {
  var basic = [
    "var obj1 = { key: 'a', data: { value: 1 } };",
    "var obj2 = { key: 'b', data: { value: 2 } };",
    "var arr = [obj1, obj2];",
    "for ({key, data: { value } } of arr) print(key + '=' + value);",
    "for (var {key, data: { value } } of arr) print(key + '=' + value);",
    "for (let {key, data: { value } } of arr) print(key + '=' + value);",
    "for (const {key, data: { value } } of arr) print(key + '=' + value);"
  ];

  TestRun(test, "basic")
    .addError(4, 7, "Creating global 'for' variable. Should be 'for (var key ...'.")
    .addError(4, 20, "Creating global 'for' variable. Should be 'for (var value ...'.")
    .test(basic, {esnext: true, undef: true, predef: ["print"]});

  var bad = [
    "var obj1 = { key: 'a', data: { val: 1 } };",
    "var obj2 = { key: 'b', data: { val: 2 } };",
    "var arr = [obj1, obj2];",
    "for ({key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for ({key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for ({key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);",
    "for (var {key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for (var {key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for (var {key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);"
  ];

  TestRun(test, "errors #1")
    .addError(4, 25, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(5, 24, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 33, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 24, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(7, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(8, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(9, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(9, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .test(bad, {esnext: true, undef: true, predef: ["print"]});

  var bad2 = [
    "var obj1 = { key: 'a', data: { val: 1 } };",
    "var obj2 = { key: 'b', data: { val: 2 } };",
    "var arr = [obj1, obj2];",
    "for (let {key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for (let {key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for (let {key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);",
    "for (const {key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for (const {key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for (const {key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);"
  ];

  TestRun(test, "errors #2")
    .addError(4, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(5, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(7, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(8, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(9, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(9, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .test(bad2, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports["object destructuring for of as es5"] = function (test) {
  var basic = [
    "var obj1 = { key: 'a', data: { value: 1 } };",
    "var obj2 = { key: 'b', data: { value: 2 } };",
    "var arr = [obj1, obj2];",
    "for ({key, data: { value } } of arr) print(key + '=' + value);",
    "for (var {key, data: { value } } of arr) print(key + '=' + value);",
    "for (let {key, data: { value } } of arr) print(key + '=' + value);",
    "for (const {key, data: { value } } of arr) print(key + '=' + value);"
  ];

  TestRun(test, "basic")
    .addError(4, 30, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 7, "Creating global 'for' variable. Should be 'for (var key ...'.")
    .addError(4, 20, "Creating global 'for' variable. Should be 'for (var value ...'.")
    .addError(5, 34, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 34, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 36, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(basic, {undef: true, predef: ["print"]}); // es5

  var bad = [
    "var obj1 = { key: 'a', data: { val: 1 } };",
    "var obj2 = { key: 'b', data: { val: 2 } };",
    "var arr = [obj1, obj2];",
    "for ({key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for ({key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for ({key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);",
    "for (var {key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for (var {key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for (var {key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);"
  ];

  TestRun(test, "errors #1")
    .addError(4, 32, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 25, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(4, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 33, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 24, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(5, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 24, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 40, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 24, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 33, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 24, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 36, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(7, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 37, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(8, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 28, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 44, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(9, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(9, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 28, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(bad, {undef: true, predef: ["print"]}); // es5

  var bad2 = [
    "var obj1 = { key: 'a', data: { val: 1 } };",
    "var obj2 = { key: 'b', data: { val: 2 } };",
    "var arr = [obj1, obj2];",
    "for (let {key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for (let {key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for (let {key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);",
    "for (const {key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for (const {key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for (const {key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);"
  ];

  TestRun(test, "errors #2")
    .addError(4, 36, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(4, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 37, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(5, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 28, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 44, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 28, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 38, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(7, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 39, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(8, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 30, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 46, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(9, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(9, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 30, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(bad2, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["object destructuring for of as legacy JS"] = function (test) {
  var basic = [
    "var obj1 = { key: 'a', data: { value: 1 } };",
    "var obj2 = { key: 'b', data: { value: 2 } };",
    "var arr = [obj1, obj2];",
    "for ({key, data: { value } } of arr) print(key + '=' + value);",
    "for (var {key, data: { value } } of arr) print(key + '=' + value);",
    "for (let {key, data: { value } } of arr) print(key + '=' + value);",
    "for (const {key, data: { value } } of arr) print(key + '=' + value);"
  ];

  TestRun(test, "basic")
    .addError(4, 30, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 7, "Creating global 'for' variable. Should be 'for (var key ...'.")
    .addError(4, 20, "Creating global 'for' variable. Should be 'for (var value ...'.")
    .addError(5, 34, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 34, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 36, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(basic, {es3: true, undef: true, predef: ["print"]}); // es3

  var bad = [
    "var obj1 = { key: 'a', data: { val: 1 } };",
    "var obj2 = { key: 'b', data: { val: 2 } };",
    "var arr = [obj1, obj2];",
    "for ({key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for ({key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for ({key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);",
    "for (var {key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for (var {key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for (var {key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);"
  ];

  TestRun(test, "errors #1")
    .addError(4, 32, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 25, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(4, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 33, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 24, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(5, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 24, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 40, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 24, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 33, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 5, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 24, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 36, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(7, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 37, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(8, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 28, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 44, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(9, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(9, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 28, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(bad, {es3: true, undef: true, predef: ["print"]}); // es3

  var bad2 = [
    "var obj1 = { key: 'a', data: { val: 1 } };",
    "var obj2 = { key: 'b', data: { val: 2 } };",
    "var arr = [obj1, obj2];",
    "for (let {key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for (let {key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for (let {key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);",
    "for (const {key, data: {val}} = obj1 of arr) print(key + '=' + val);",
    "for (const {key, data: {val}}, {a, b} of arr) print(key + '=' + val);",
    "for (const {key, data: {val}}, {a, b} = obj1 of arr) print(key + '=' + val);"
  ];

  TestRun(test, "errors #2")
    .addError(4, 36, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(4, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 37, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(5, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 28, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 44, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(6, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(6, 6, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 28, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 38, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(7, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 39, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(8, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 30, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 46, "'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 6, "Invalid for-of loop left-hand-side: initializer is forbidden.")
    .addError(9, 6, "Invalid for-of loop left-hand-side: more than one ForBinding.")
    .addError(9, 6, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 6, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(9, 30, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(bad2, {es3: true, undef: true, predef: ["print"]}); // es3

  test.done();
};

exports["try multi-catch for moz extensions"] = function (test) {
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
    .test(code, {moz: true, undef: true, predef: ["print"]});

  test.done();
};

exports["try multi-catch as esnext"] = function (test) {
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
    .addError(5, 3, "'multiple catch blocks' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports["try multi-catch as es5"] = function (test) {
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
    .addError(5, 3, "'multiple catch blocks' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["try multi-catch as legacy JS"] = function (test) {
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
    .addError(5, 3, "'multiple catch blocks' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports["no let not directly within a block"] = function (test) {
  var code = [
    "if (true) let x = 1;",
    "function foo() {",
    "   if (true)",
    "       let x = 1;",
    "}",
    "for (let x = 0; x < 42; ++x) let a = 1;",
    "for (let x in [1, 2, 3, 4] ) let a = 1;",
    "for (let x of [1, 2, 3, 4] ) let a = 1;",
    "while (true) let a = 1;",
    "if (false) let a = 1; else if (true) let a = 1; else let a = 2;",
    "if (true) if (false) let x = 1;",
    "if (true) if (false) { let x = 1; }",
    "if (true) try { let x = 1; } catch (e) { let x = 1; }"
  ];

  var run = TestRun(test)
    .addError(1, 11, "Let declaration not directly within block.")
    .addError(4, 8, "Let declaration not directly within block.")
    .addError(6, 30, "Let declaration not directly within block.")
    .addError(7, 30, "Let declaration not directly within block.")
    .addError(8, 30, "Let declaration not directly within block.")
    .addError(9, 14, "Let declaration not directly within block.")
    .addError(10, 12, "Let declaration not directly within block.")
    .addError(10, 38, "Let declaration not directly within block.")
    .addError(10, 54, "Let declaration not directly within block.")
    .addError(11, 22, "Let declaration not directly within block.");
  run.test(code, {esversion: 6});
  run.test(code, {moz: true});

  // Don't warn about let expressions
  TestRun(test).test("if (true) let (x = 1) print(x);", {moz: true, predef: ["print"]});

  test.done();
};

exports["no const not directly within a block"] = function (test) {
  var code = [
    "if (true) const x = 1;",
    "function foo() {",
    "   if (true)",
    "       const x = 1;",
    "}",
    "for (let x = 0; x < 42; ++x) const a = 1;",
    "while (true) const a = 1;",
    "if (false) const a = 1; else if (true) const a = 1; else const a = 2;",
    "if (true) if (false) { const a = 1; }"
  ];

  TestRun(test)
    .addError(1, 11, "Const declaration not directly within block.")
    .addError(4, 8, "Const declaration not directly within block.")
    .addError(6, 30, "Const declaration not directly within block.")
    .addError(7, 14, "Const declaration not directly within block.")
    .addError(8, 12, "Const declaration not directly within block.")
    .addError(8, 40, "Const declaration not directly within block.")
    .addError(8, 58, "Const declaration not directly within block.")
    .test(code, {predef: ["print"], esnext: true});

  test.done();
};

exports["test: let declared directly within block"] = function (test) {
  var code = [
    "for (let i;;){",
    "  console.log(i);",
    "}"
  ];

  TestRun(test)
    .test(code, {esnext: true});

  code = [
    "for (let i;;)",
    "  console.log(i);"
  ];

  TestRun(test)
    .test(code, {esnext: true});

  test.done();
};

exports["test: let is directly within nested block"] = function (test) {
  var code   = [
    "if(true) {",
    "  for (let i;;)",
    "    console.log(i);",
    "}"
  ];

  TestRun(test)
    .test(code, {esnext: true});

  code   = [
    "if(true)",
    "  for (let i;;)",
    "    console.log(i);"
  ];

  TestRun(test)
    .test(code, {esnext: true});

  code   = [
    "if(true) {",
    "  for (let i;;){",
    "    console.log(i);",
    "  }",
    "}"
  ];

  TestRun(test)
    .test(code, {esnext: true});

  test.done();
};

exports["regression test for crash from GH-964"] = function (test) {
  var code = [
    "function test(a, b) {",
    "  return a[b] || a[b] = new A();",
    "}"
  ];

  TestRun(test)
    .addError(2, 23, "Bad assignment.")
    .addError(2, 23, "Did you mean to return a conditional instead of an assignment?")
    .test(code);

  test.done();
};

exports.ASI = {};
exports.ASI.gh950 = function (test) {
  var code = [
    "var a = b",
    "instanceof c;",

    "var a = { b: 'X' }",
    "delete a.b",

    "var y = true",
    "           && true && false;",

    "function test() {",
    "  return",
    "      { a: 1 }",
    "}",

    "a",
    "++",
    "a",
    "a",
    "--",
    "a",
  ];

  var run = TestRun(test)
    .addError(2, 1, "Misleading line break before 'instanceof'; readers may interpret this as an expression boundary.")
    .addError(6, 12, "Misleading line break before '&&'; readers may interpret this as an expression boundary.")
    .addError(8, 3, "Line breaking error 'return'.")
    .addError(9, 12, "Label 'a' on 1 statement.")
    .addError(9, 12, "Expected an assignment or function call and instead saw an expression.")
    .addError(11, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(14, 1, "Expected an assignment or function call and instead saw an expression.");

  run.test(code, {es3: true, asi: true});
  run.test(code, {asi: true}); // es5
  run.test(code, {esnext: true, asi: true});
  run.test(code, {moz: true, asi: true});

  run = TestRun(test)
    .addError(2, 1, "Misleading line break before 'instanceof'; readers may interpret this as an expression boundary.")
    .addError(3, 19, "Missing semicolon.")
    .addError(4, 11, "Missing semicolon.")
    .addError(6, 12, "Misleading line break before '&&'; readers may interpret this as an expression boundary.")
    .addError(8, 3, "Line breaking error 'return'.")
    .addError(8, 9, "Missing semicolon.")
    .addError(9, 12, "Label 'a' on 1 statement.")
    .addError(9, 12, "Expected an assignment or function call and instead saw an expression.")
    .addError(9, 13, "Missing semicolon.")
    .addError(11, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(11, 2, "Missing semicolon.")
    .addError(13, 2, "Missing semicolon.")
    .addError(14, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(14, 2, "Missing semicolon.")
    .addError(16, 2, "Missing semicolon.");

  run.test(code, {es3: true, asi: false});
  run.test(code, {asi: false}); // es5
  run.test(code, {esnext: true, asi: false});
  run.test(code, {moz: true, asi: false});

  test.done();
};

// gh-3037 - weird behaviour (yield related)
// https://github.com/jshint/jshint/issues/3037
exports.ASI.followingYield = function (test) {
  var code = [
    "function* g() {",
    "  void 0",
    "  yield;",
    "}"
  ];

  TestRun(test)
    .addError(2, 9, "Missing semicolon.")
    .test(code, { esversion: 6 });

  TestRun(test)
    .test(code, { esversion: 6, asi: true });

  test.done();
};

exports.ASI.followingPostfix = function (test) {
  var code = [
    "x++",
    "void 0;",
    "x--",
    "void 0;"
  ];

  TestRun(test)
    .addError(1, 4, "Missing semicolon.")
    .addError(3, 4, "Missing semicolon.")
    .test(code);

  TestRun(test)
    .test(code, { asi: true });

  test.done();
};

exports.ASI.followingContinue = function (test) {
  var code = [
    "while (false) {",
    "  continue",
    "}"
  ];

  TestRun(test)
    .addError(2, 11, "Missing semicolon.")
    .test(code);

  TestRun(test)
    .test(code, { asi: true });

  test.done();
};

exports.ASI.followingBreak = function (test) {
  var code = [
    "while (false) {",
    "  break",
    "}"
  ];

  TestRun(test)
    .addError(2, 8, "Missing semicolon.")
    .test(code);

  TestRun(test)
    .test(code, { asi: true });

  test.done();
};

exports.ASI.cStyleFor = function (test) {
  TestRun(test, "following first expression")
    .test([
      "for (false",
      ";;){}"
    ]);

  TestRun(test, "following second expression")
    .test([
      "for (false;",
      ";){}"
    ]);

  test.done();
};

exports["fat arrows support"] = function (test) {
  var code = [
    "let empty = () => {};",
    "let identity = x => x;",
    "let square = x => x * x;",
    "let key_maker = val => ({key: val});",
    "let odds = evens.map(v => v + 1);",
    "let fives = []; nats.forEach(v => { if (v % 5 === 0) fives.push(v); });",

    "let block = (x,y, { z: t }) => {",
    "  print(x,y,z);",
    "  print(j, t);",
    "};",

    // using lexical this
    "const obj = {",
    "  method: function () {",
    "    return () => this;",
    "  }",
    "};",

    "let retnObj = () => ({});",
    "let assgnRetnObj = (() => ({}))();",
    "let retnObjLong = () => { return {}; };",
    "let assgnRetnObjLong = (() => { return {}; })();",

    "let objFns = {",
    "  retnObj: () => ({}),",
    "  assgnRetnObj: (() => ({}))(),",
    "  retnObjLong: () => { return {}; },",
    "  assgnRetnObjLong: (() => { return {}; })()",
    "};",

    // GH-2351
    "let immediatelyInvoked = (x => {})(0);"
  ];

  var run = TestRun(test)
    .addError(5, 12, "'evens' is not defined.")
    .addError(6, 17, "'nats' is not defined.")
    .addError(8, 3, "'print' is not defined.")
    .addError(9, 3, "'print' is not defined.")
    .addError(9, 9, "'j' is not defined.")
    .addError(8, 13, "'z' is not defined.");

  run.test(code, { undef: true, esnext: true });
  run.test(code, { undef: true, esversion: 2016 });
  run.test(code, { undef: true, esversion: 2017 });

  run = TestRun(test)
    .addError(1, 14, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(2, 18, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(3, 16, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 21, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(5, 24, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(5, 12, "'evens' is not defined.")
    .addError(6, 32, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(6, 17, "'nats' is not defined.")
    .addError(7, 27, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(8, 3, "'print' is not defined.")
    .addError(8, 13, "'z' is not defined.")
    .addError(9, 3, "'print' is not defined.")
    .addError(9, 9, "'j' is not defined.")
    .addError(13, 13, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(16, 16, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(17, 22, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(18, 20, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(19, 26, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(21, 13, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(22, 19, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(23, 17, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(24, 23, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(26, 29, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').");

  run.test(code, { undef: true, moz: true });

  run = TestRun(test)
    .addError(1, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 14, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(2, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 18, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(3, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 16, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 21, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(5, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 24, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(6, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 32, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(7, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 17, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 27, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(11, 1, "'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(13, 13, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(16, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(16, 16, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(17, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(17, 22, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(18, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(18, 20, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(19, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(19, 26, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(20, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(21, 13, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(22, 19, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(23, 17, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(24, 23, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(26, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(26, 29, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').");

  run.test(code); // es5
  run.test(code, {es3: true});

  test.done();
};

exports["fat arrow nested function scoping"] = function (test) {
  var code = [
    "(() => {",
    "  for (var i = 0; i < 10; i++) {",
    "    var x;",
    "  }",
    "  var arrow = (x) => {",
    "    return x;",
    "  };",
    "  var arrow2 = (x) => x;",
    "  arrow();",
    "  arrow2();",
    "})();",
    "(function() {",
    "  for (var i = 0; i < 10; i++) {",
    "    var x;",
    "  }",
    "  var arrow = (x) => {",
    "    return x;",
    "  };",
    "  var arrow2 = (x) => x;",
    "  arrow();",
    "  arrow2();",
    "})();"
  ];

  TestRun(test)
    .test(code, {esnext: true});

  test.done();
};

exports["default arguments in fat arrow functions"] = function (test) {
  TestRun(test)
    .test("(x = 0) => { return x; };", { expr: true, unused: true, esnext: true });

  test.done();
};

exports["expressions in place of arrow function parameters"] = function (test) {
  TestRun(test)
    .addError(1, 2, "Expected an identifier and instead saw '1'.")
    .test("(1) => {};", { expr: true, esnext: true });

  test.done();
};

exports["arrow function parameter containing semicolon (gh-3002)"] = function (test) {
  TestRun(test)
    .addError(1, 19, "Unnecessary semicolon.")
    .addError(1, 27, "Expected an assignment or function call and instead saw an expression.")
    .test("(x = function() { ; }) => 0;", { esversion: 6 });

  test.done();
};

var conciseMethods = exports.conciseMethods = {};

conciseMethods.basicSupport = function (test) {
  var code = [
    "var foobar = {",
    "  foo () {",
    "    return 'foo';",
    "  },",
    "  *bar () {",
    "    yield 'bar';",
    "  }",
    "};"
  ];

  var run = TestRun(test);
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  run = TestRun(test)
    .addError(2, 3, "'concise methods' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 3, "'generator functions' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 4, "'concise methods' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 5, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).");

  run.test(code); // es5
  run.test(code, {es3: true});

  test.done();
};

conciseMethods.getAndSet = function (test) {
  var code = [
    "var a = [1, 2, 3, 4, 5];",
    "var strange = {",
    "  get (i) {",
    "    return a[i];",
    "  },",
    "  set () {",
    "    a.forEach(function(v, i, l) { l[i] = v++; });",
    "  }",
    "};"
  ];

  TestRun(test).test(code, {esnext: true});

  test.done();
};

conciseMethods.getWithoutSet = function (test) {
  var code = [
    "var a = [1, 2, 3, 4, 5];",
    "var strange = {",
    "  get () {",
    "    return a;",
    "  }",
    "};"
  ];

  TestRun(test).test(code, {esnext: true});

  test.done();
};

conciseMethods.setWithoutGet = function (test) {
  var code = [
    "var a = [1, 2, 3, 4, 5];",
    "var strange = {",
    "  set (v) {",
    "    a = v;",
    "  }",
    "};"
  ];

  TestRun(test).test(code, {esnext: true});

  test.done();
};

// GH-2022: "Concise method names are colliding with params/variables"
conciseMethods.nameIsNotLocalVar = function (test) {
  var code = [
    "var obj = {",
    "  foo(foo) {},",
    "  bar() { var bar; }",
    "};"
  ];

  TestRun(test).test(code, {esnext: true});

  test.done();
};

conciseMethods.uniqueFormalParameters = function (test) {
  TestRun(test, "adjacent")
    .addError(1, 15, "'a' has already been declared.")
    .test("void { method(a, a) {} };", { esversion: 6 });

  TestRun(test, "separated")
    .addError(1, 15, "'b' has already been declared.")
    .test("void { method(b, c, b) {} };", { esversion: 6 });

  test.done();
};

exports["object short notation: basic"] = function (test) {
  var code = [
    "var foo = 42;",
    "var bar = {foo};",
    "var baz = {foo, bar};",
    "var biz = {",
    "  foo,",
    "  bar",
    "};"
  ];

  TestRun(test, 1).test(code, {esnext: true});

  TestRun(test, 2)
    .addError(2, 12, "'object short notation' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 12, "'object short notation' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 17, "'object short notation' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 3, "'object short notation' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 3, "'object short notation' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code);

  test.done();
};

exports["object short notation: mixed"] = function (test) {
  var code = [
    "var b = 1, c = 2;",
    "var o1 = {a: 1, b, c};",
    "var o2 = {b, a: 1, c};"
  ].join("\n");

  TestRun(test).test(code, { esnext: true });

  TestRun(test)
    .addError(2, 17, "'object short notation' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 20, "'object short notation' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 11, "'object short notation' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 20, "'object short notation' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
  .test(code);

  test.done();
};

exports["object ComputedPropertyName"] = function (test) {
  var code = [
    "function fn(obj) {}",
    "function p() { return 'key'; }",
    "var vals = [1];",
    "var a = 7;",
    "var o1 = {",
      "[a++]: true,",
      "obj: { [a++ + 1]: true },",
      "[a + 3]() {},",
      "[p()]: true,",
      "[vals[0]]: true,",
      "[(1)]: true,",
    "};",
    "fn({ [a / 7]: true });",
    "var b = { '[': 1 };",
    "var c = { [b]: 1 };",
    "var d = { 0: 1 };",
    "var e = { ['s']: 1 };",
    "var f = { get [0]() {} };",
    "var g = { set [0](_) {} };",
  ];

  TestRun(test)
    .addError(19, 17, "Setter is defined without getter.")
    .test(code, { esnext: true });

  TestRun(test, "regression test for gh-3381")
    .test([
      "void {",
      "  set() {}",
      "};"
    ], {esversion: 6});

  TestRun(test)
    .addError(6, 1, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(7, 8, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(8, 7, "'concise methods' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 1, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(9, 1, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(10, 1, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(11, 1, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(13, 6, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(15, 11, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(17, 11, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(18, 15, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(19, 15, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(19, 17, "Setter is defined without getter.")
  .test(code);

  TestRun(test, "YieldExpression")
    .test([
      "(function * () {",
      "  void {",
      "    [yield]: 0,",
      "    [yield 0]: 0,",
      "    [yield * 0]: 0",
      "  };",
      "}());"
    ], { esversion: 6 });

  test.done();
};

exports["spread & rest operator support"] = function (test) {
  var code = [
    // 1
    // Spread Identifier
    "foo(...args);",

    // 2
    // Spread Array Literal
    "foo(...[]);",

    // 3, 4
    // Spread String Literal
    "foo(...'');",
    'foo(..."");',

    // 5
    // Spread Group
    "foo(...([]));",

    // 6, 7, 8
    // Spread Operator
    "let initial = [ 1, 2, 3, 4, 5 ];",
    "let extended = [ ...initial, 6, 7, 8, 9 ];",
    "let nest = [ ...[], 6, 7, 8, 9 ];",

    // 9
    // Rest Operator
    "function foo(...args) {}",

    // 10
    // Rest Operator (Fat Arrow Params)
    "let bar = (...args) => args;",

    // 11
    "foo(...[].entries());",

    // 12
    "foo(...(new Map()).set('a', 1).values());"
  ];

  TestRun(test)
    .test(code, {esnext: true});

  TestRun(test)
    .addError(1, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(2, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(3, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(5, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(7, 18, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(8, 14, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(9, 14, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(10, 12, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(10, 19, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(11, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(12, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .test(code, {moz: true});

  TestRun(test)
    .addError(1, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(2, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(3, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(5, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(6, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")

    .addError(7, 18, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(8, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 14, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(9, 14, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(10, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(10, 12, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(10, 19, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(11, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .addError(12, 5, "'spread operator' is only available in ES6 (use 'esversion: 6').")
    .test(code);

  test.done();
};

exports["parameter destructuring with rest"] = function (test) {
  var code = [
    // 1
    // parameter destructuring with rest operator, solo
    "let b = ([...args]) => args;",

    // 2
    // ...in function expression
    "let c = function([...args]) { return args; };",

    // 3
    // ...in function declaration
    "function d([...args]) { return args; }",

    // 4
    // default destructuring with rest operator, with leading param
    "let e = ([first, ...args]) => args;",

    // 5
    // ...in function expression
    "let f = function([first, ...args]) { return args; };",

    // 6
    // ...in function declaration
    "function g([first, ...args]) { return args; }",

    // 7
    // Just rest
    "let h = (...args) => args;",

    // 8
    // ...in function expression
    "let i = function(...args) { return args; };",

    // 9
    // ...in function declaration
    "function j(...args) { return args; }"
  ];

  var run = TestRun(test);
  run.test(code, {esnext: true});

  run = TestRun(test)
    .addError(1, 19, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 26, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(7, 17, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(7, 10, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(1, 11, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(2, 19, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(3, 13, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 18, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(5, 26, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(6, 20, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(8, 18, "'rest operator' is only available in ES6 (use 'esversion: 6').")
    .addError(9, 12, "'rest operator' is only available in ES6 (use 'esversion: 6').");

  run.test(code, {moz: true});

  run = TestRun(test)
    .addError(1, 19, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(1, 9, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 11, "'rest operator' is only available in ES6 (use 'esversion: 6').")

    .addError(2, 17, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(2, 19, "'rest operator' is only available in ES6 (use 'esversion: 6').")

    .addError(3, 11, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 13, "'rest operator' is only available in ES6 (use 'esversion: 6').")

    .addError(4, 26, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 9, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 18, "'rest operator' is only available in ES6 (use 'esversion: 6').")

    .addError(5, 17, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 26, "'rest operator' is only available in ES6 (use 'esversion: 6').")

    .addError(6, 11, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 20, "'rest operator' is only available in ES6 (use 'esversion: 6').")

    .addError(7, 17, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(7, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 10, "'rest operator' is only available in ES6 (use 'esversion: 6').")

    .addError(8, 1, "'let' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 18, "'rest operator' is only available in ES6 (use 'esversion: 6').")

    .addError(9, 12, "'rest operator' is only available in ES6 (use 'esversion: 6').");

  run.test(code);

  test.done();
};

exports["test for GH-1010"] = function (test) {
  var code = [
    "var x = 20, y, z; if(x < 30) y=7, z=2; else y=5;"
  ];

  var run = TestRun(test);
  run.test(code, {expr: true, es3: true});
  run.test(code, {expr: true}); // es5
  run.test(code, {expr: true, esnext: true});
  run.test(code, {expr: true, moz: true});

  test.done();
};

exports.classes = function (test) {
  var cdecl = "// cdecl";
  var cexpr = "// cexpr";
  var cdeclAssn = "// cdeclAssn";
  var cexprAssn = "// cexprAssn";
  var code = [
    "var Bar;",

    // class declarations
    cdecl,
    "class Foo0 {}",
    "class Foo1 extends Bar {}",
    "class protected {",
    "  constructor(package) {}",
    "}",
    "class Foo3 extends interface {",
    "  constructor() {}",
    "}",
    "class Foo4 extends Bar {",
    "  constructor() {",
    "    super();",
    "  }",
    "}",
    "class Foo5 {",
    "  constructor() {",
    "  }",
    "  static create() {",
    "  }",
    "}",
    "class Foo6 extends Bar {",
    "  constructor() {",
    "    super();",
    "  }",
    "  static create() {",
    "  }",
    "}",

    // class expressions
    cexpr,
    "var Foo7 = class {};",
    "let Foo8 = class extends Bar {};",
    "var static = class protected {",
    "  constructor(package) {}",
    "};",
    "var Foo10 = class extends interface {",
    "  constructor() {}",
    "};",
    "var Foo11 = class extends Bar {",
    "  constructor() {",
    "    super();",
    "  }",
    "};",
    "var Foo12 = class {",
    "  constructor() {",
    "  }",
    "  static create() {",
    "  }",
    "};",
    "let Foo13 = class extends Bar {",
    "  constructor() {",
    "    super();",
    "  }",
    "  static create() {",
    "  }",
    "};",

    // mark these as used
    "void (Foo1, Foo3, Foo4, Foo5, Foo6);",
    "void (Foo8, Foo10, Foo11, Foo12, Foo13);",

    // class declarations: extends AssignmentExpression
    cdeclAssn,
    "class Foo14 extends Bar[42] {}",
    "class Foo15 extends { a: function() { return 42; } } {}",
    "class Foo16 extends class Foo15 extends Bar {} {}",
    "class Foo17 extends Foo15 = class Foo16 extends Bar {} {}",
    "class Foo18 extends function () {} {}",
    "class Foo19 extends class extends function () {} {} {}",
    "class Foo20 extends Foo18 = class extends Foo17 = function () {} {} {}",

    // class expressions: extends AssignmentExpression
    cexprAssn,
    "let Foo21 = class extends Bar[42] {};",
    "let Foo22 = class extends { a() { return 42; } } {};",
    "let Foo23 = class extends class Foo15 extends Bar {} {};",
    "let Foo24 = class extends Foo15 = class Foo16 extends Bar {} {};",
    "let Foo25 = class extends function () {} {};",
    "let Foo26 = class extends class extends function () {} {} {};",
    "let Foo27 = class extends Foo18 = class extends Foo17 = function () {} {} {};",

    // mark these as used
    "void (Foo14, Foo15, Foo16, Foo17, Foo18, Foo19, Foo20);",
    "void (Foo21, Foo22, Foo23, Foo24, Foo25, Foo26, Foo27);"
  ];

  cdecl = code.indexOf(cdecl) + 1;
  cexpr = code.indexOf(cexpr) + 1;
  cdeclAssn = code.indexOf(cdeclAssn) + 1;
  cexprAssn = code.indexOf(cexprAssn) + 1;

  var run = TestRun(test)
    .addError(cdecl + 3, 7, "Expected an identifier and instead saw 'protected' (a reserved word).")
    .addError(cexpr + 3, 20, "Expected an identifier and instead saw 'protected' (a reserved word).")
    .addError(cdecl + 4, 15, "Expected an identifier and instead saw 'package' (a reserved word).")
    .addError(cexpr + 4, 15, "Expected an identifier and instead saw 'package' (a reserved word).")
    .addError(cdecl + 6, 20, "Expected an identifier and instead saw 'interface' (a reserved word).")
    .addError(cexpr + 6, 27, "Expected an identifier and instead saw 'interface' (a reserved word).")
    .addError(cdeclAssn + 4, 21, "Reassignment of 'Foo15', which is a class. Use 'var' or 'let' to declare bindings that may change.")
    .addError(cdeclAssn + 7, 21, "Reassignment of 'Foo18', which is a class. Use 'var' or 'let' to declare bindings that may change.")
    .addError(cdeclAssn + 7, 43, "Reassignment of 'Foo17', which is a class. Use 'var' or 'let' to declare bindings that may change.")
    .addError(cexprAssn + 4, 27, "Reassignment of 'Foo15', which is a class. Use 'var' or 'let' to declare bindings that may change.")
    .addError(cexprAssn + 7, 27, "Reassignment of 'Foo18', which is a class. Use 'var' or 'let' to declare bindings that may change.")
    .addError(cexprAssn + 7, 49, "Reassignment of 'Foo17', which is a class. Use 'var' or 'let' to declare bindings that may change.");

  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  run
    .addError(cdecl + 1, 7, "'Foo0' is defined but never used.")
    .addError(cdecl + 3, 7, "'protected' is defined but never used.")
    .addError(cdecl + 4, 15, "'package' is defined but never used.");
  run
    .addError(cexpr + 1, 5, "'Foo7' is defined but never used.")
    .addError(cexpr + 3, 5, "Expected an identifier and instead saw 'static' (a reserved word).")
    .addError(cexpr + 3, 5, "'static' is defined but never used.")
    .addError(cexpr + 4, 15, "'package' is defined but never used.");

  code[0] = "'use strict';" + code[0];
  run.test(code, {unused: true, globalstrict: true, esnext: true});
  run.test(code, {unused: true, globalstrict: true, moz: true});

  test.done();
};

exports["class and method naming"] = function (test) {
  var code = [
    "class eval {}",
    "class arguments {}",
    "class C {",
    "  get constructor() {}",
    "  set constructor(x) {}",
    "  prototype() {}",
    "  an extra identifier 'in' methodName() {}",
    "  get foo extraIdent1() {}",
    "  set foo extraIdent2() {}",
    "  static some extraIdent3() {}",
    "  static get an extraIdent4() {}",
    "  static set an extraIdent5() {}",
    "  get dupgetter() {}",
    "  get dupgetter() {}",
    "  set dupsetter() {}",
    "  set dupsetter() {}",
    "  static get dupgetter() {}",
    "  static get dupgetter() {}",
    "  static set dupsetter() {}",
    "  static set dupsetter() {}",
    "  dupmethod() {}",
    "  dupmethod() {}",
    "  static dupmethod() {}",
    "  static dupmethod() {}",
    "  ['computed method']() {}",
    "  static ['computed static']() {}",
    "  get ['computed getter']() {}",
    "  set ['computed setter']() {}",
    "  (typo() {}",
    "  set lonely() {}",
    "  set lonel2",
    "            () {}",
    "  *validGenerator() { yield; }",
    "  static *validStaticGenerator() { yield; }",
    "  *[1]() { yield; }",
    "  static *[1]() { yield; }",
    "  * ['*']() { yield; }",
    "  static *['*']() { yield; }",
    "  * [('*')]() { yield; }",
    "  static *[('*')]() { yield; }",
    "}"
  ];
  var run = TestRun(test)
    .addError(1, 7, "Strict violation.")
    .addError(2, 7, "Strict violation.")
    .addError(4, 7, "A class getter method cannot be named 'constructor'.")
    .addError(5, 7, "A class setter method cannot be named 'constructor'.")
    .addError(7, 6, "Class properties must be methods. Expected '(' but instead saw 'extra'.")
    .addError(8, 11, "Class properties must be methods. Expected '(' but instead saw 'extraIdent1'.")
    .addError(9, 11, "Class properties must be methods. Expected '(' but instead saw 'extraIdent2'.")
    .addError(10, 15, "Class properties must be methods. Expected '(' but instead saw 'extraIdent3'.")
    .addError(11, 17, "Class properties must be methods. Expected '(' but instead saw 'extraIdent4'.")
    .addError(12, 17, "Class properties must be methods. Expected '(' but instead saw 'extraIdent5'.")
    .addError(14, 16, "Duplicate getter method 'dupgetter'.")
    .addError(16, 16, "Duplicate setter method 'dupsetter'.")
    .addError(16, 7, "Setter is defined without getter.")
    .addError(18, 23, "Duplicate static getter method 'dupgetter'.")
    .addError(20, 23, "Duplicate static setter method 'dupsetter'.")
    .addError(22, 12, "Duplicate class method 'dupmethod'.")
    .addError(24, 19, "Duplicate static class method 'dupmethod'.")
    .addError(29, 3, "Unexpected '('.")
    .addError(30, 7, "Setter is defined without getter.")
    .addError(31, 7, "Setter is defined without getter.");

  run.test(code, {esnext: true});

  TestRun(test, "valid uses of name `constructor`")
    .test([
      "void class {",
      "  constructor() {}",
      "};",
      "void class {",
      "  static constructor() {}",
      "};",
      "void class {",
      "  static get constructor() {}",
      "};"
    ], {esversion: 6});

  TestRun(test, "valid uses of name `prototype`")
    .test([
      "void class {",
      "  get prototype() {}",
      "};",
      "void class {",
      "  get prototype() {}",
      "  set prototype(x) {}",
      "};"
    ], {esversion: 6});

  TestRun(test, "valid uses of name `static`")
    .test([
      "void class {",
      "  static() {}",
      "  static static() {}",
      "  static ['static']() {}",
      "};",
      "void class {",
      "  * static() { yield; }",
      "  static * static() { yield; }",
      "  static * ['static']() { yield; }",
      "};",
      "void class {",
      "  get static() {}",
      "  set static(x) {}",
      "  static get static() {}",
      "  static set static(x) {}",
      "  static get ['static']() {}",
      "  static set ['static'](x) {}",
      "};"
    ], {esversion: 6});

  TestRun(test, "invalid use of name `prototype`: static method")
    .addError(2, 10, "A static class method cannot be named 'prototype'.")
    .test([
      "void class {",
      "  static prototype() {}",
      "};"
    ], {esversion: 6});

  TestRun(test, "invalid use of name `prototype`: static accessor method")
    .addError(2, 14, "A static class getter method cannot be named 'prototype'.")
    .test([
      "void class {",
      "  static get prototype() {}",
      "};"
    ], {esversion: 6});

  TestRun(test, "regression test for gh-3381")
    .test([
      "void class {",
      "  set() {}",
      "};"
    ], {esversion: 6});

  TestRun(test, "hazardous method names (see gh-3358)")
    .addError(3, 17, "'hasOwnProperty' is a really bad name.")
    .test([
      "void class {",
      "  constructor() {}",
      "  hasOwnProperty() {}",
      "  toString() {}",
      "  toLocaleString() {}",
      "  valueOf() {}",
      "  isPrototypeOf() {}",
      "  propertyIsEnumerable() {}",
      "};"
   ], {esversion: 6});

  TestRun(test, "hazardous method names -- true duplicate (see gh-3358)")
    .addError(4, 11, "Duplicate class method 'toString'.")
    .test([
      "void class {",
      "  toString() {}",
      "  x() {}",
      "  toString() {}",
      "};"
   ], {esversion: 6});

  TestRun(test, "hazardous static method names (see gh-3358)")
    .addError(3, 24, "'hasOwnProperty' is a really bad name.")
    .test([
      "void class {",
      "  static constructor() {}",
      "  static hasOwnProperty() {}",
      "  static toString() {}",
      "  static toLocaleString() {}",
      "  static valueOf() {}",
      "  static isPrototypeOf() {}",
      "  static propertyIsEnumerable() {}",
      "};"
   ], {esversion: 6});

  TestRun(test, "hazardous static method names -- true duplicate (see gh-3358)")
    .addError(4, 18, "Duplicate static class method 'toString'.")
    .test([
      "void class {",
      "  static toString() {}",
      "  static x() {}",
      "  static toString() {}",
      "};"
   ], {esversion: 6});

  TestRun(test, "hazardous accessor method names (see gh-3358)")
    .addError(2, 21, "'hasOwnProperty' is a really bad name.")
    .addError(3, 21, "'hasOwnProperty' is a really bad name.")
    .test([
      "void class {",
      "  get hasOwnProperty() {}",
      "  set hasOwnProperty(_) {}",
      "  get toString() {}",
      "  set toString(_) {}",
      "  get toLocaleString() {}",
      "  set toLocaleString(_) {}",
      "  get valueOf() {}",
      "  set valueOf(_) {}",
      "  get isPrototypeOf() {}",
      "  set isPrototypeOf(_) {}",
      "  get propertyIsEnumerable() {}",
      "  set propertyIsEnumerable(_) {}",
      "};"
   ], {esversion: 6});

  TestRun(test, "hazardous accessor method names -- true duplicate (see gh-3358)")
    .addError(5, 15, "Duplicate getter method 'toString'.")
    .addError(6, 15, "Duplicate setter method 'toString'.")
    .test([
      "void class {",
      "  get toString() {}",
      "  set toString(_) {}",
      "  static x() {}",
      "  get toString() {}",
      "  set toString(_) {}",
      "};"
   ], {esversion: 6});

  test.done();
};

exports["computed class methods aren't duplicate"] = function (test) {
  var code = [
    "const obj = {};",
    "class A {",
    "  [Symbol()]() {}",
    "  [Symbol()]() {}",
    "  [obj.property]() {}",
    "  [obj.property]() {}",
    "  [obj[0]]() {}",
    "  [obj[0]]() {}",
    "  [`template`]() {}",
    "  [`template2`]() {}",
    "}"
  ];

  // JSHint shouldn't throw a "Duplicate class method" warning with computed method names
  // GH-2350
  TestRun(test).test(code, { esnext: true });

  test.done();
};

exports["class method UniqueFormalParameters"] = function (test) {
  TestRun(test, "adjacent")
    .addError(1, 18, "'a' has already been declared.")
    .test("class C { method(a, a) {} }", { esversion: 6 });

  TestRun(test, "separated")
    .addError(1, 18, "'b' has already been declared.")
    .test("class C { method(b, c, b) {} }", { esversion: 6 });

  test.done();
};

exports["class method this"] = function (test) {
  var code = [
  "class C {",
  "  constructor(x) {",
  "    this._x = x;",
  "  }",
  "  x() { return this._x; }",
  "  static makeC(x) { return new this(x); }",
  "  0() { return this._x + 0; }",
  "  ['foo']() { return this._x + 6; }",
  "  'test'() { return this._x + 'test'; }",
  "  bar() { function notCtor() { return this; } notCtor(); }",
  "}"
  ];

  TestRun(test)
    .addError(10, 39, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .test(code, {esnext: true});

  test.done();
};

exports.classNewcap = function (test) {
  var code = [
    "class C {",
    "  m() {",
    "    var ctor = function() {};",
    "    var Ctor = function() {};",
    "    var c1 = new ctor();",
    "    var c2 = Ctor();",
    "  }",
    "}"
  ];

  TestRun(test, "The `newcap` option is not automatically enabled within class bodies.")
    .test(code, { esversion: 6 });

  test.done();
};

exports.classExpression = function (test) {
  var code = [
    "void class MyClass {",
    "  constructor() { MyClass = null; }",
    "  method() { MyClass = null; }",
    "  static method() { MyClass = null; }",
    "  get accessor() { MyClass = null; }",
    "  set accessor() { MyClass = null; }",
    "  method2() { MyClass &= null; }",
    "};",
    "void MyClass;"
  ];

  TestRun(test)
    .addError(2, 19, "Reassignment of 'MyClass', which is a class. Use 'var' or 'let' to declare bindings that may change.")
    .addError(3, 14, "Reassignment of 'MyClass', which is a class. Use 'var' or 'let' to declare bindings that may change.")
    .addError(4, 21, "Reassignment of 'MyClass', which is a class. Use 'var' or 'let' to declare bindings that may change.")
    .addError(5, 20, "Reassignment of 'MyClass', which is a class. Use 'var' or 'let' to declare bindings that may change.")
    .addError(6, 20, "Reassignment of 'MyClass', which is a class. Use 'var' or 'let' to declare bindings that may change.")
    .addError(7, 15, "Reassignment of 'MyClass', which is a class. Use 'var' or 'let' to declare bindings that may change.")
    .addError(9, 6, "'MyClass' is not defined.")
    .test(code, { esnext: true, undef: true });

  test.done();
};

exports.super = {};

exports.super.invalid = function (test) {
  TestRun(test, "as identifier")
    .addError(3, 10, "Unexpected ';'.")
    .addError(3, 5, "Expected an assignment or function call and instead saw an expression.")
    .test([
      "void {",
      "  m() {",
      "    super;",
      "  }",
      "};"
    ], { esversion: 6 });

  test.done();
};

exports.super.superProperty = function (test) {
  TestRun(test, "bracket notation")
    .addError(3, 14, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 20, "['ab'] is better written in dot notation.")
    .test([
      "void {",
      "  m() {",
      "    super['4'];",
      "    void super['a' + 'b'];",
      "  }",
      "};"
    ], { esversion: 6 });

  TestRun(test, "dot operator")
    .addError(3, 11, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 26, "'hasOwnProperty' is a really bad name.")
    .test([
      "void {",
      "  m() {",
      "    super.x;",
      "    super.hasOwnProperty = 0;",
      "  }",
      "};"
    ], { esversion: 6 });

  TestRun(test, "within arrow functions")
    .test([
      "void {",
      "  m() {",
      "    void (() => {",
      "      void (() => {",
      "        void super.x;",
      "      });",
      "    });",
      "  },",
      "  *g() {",
      "    void (() => {",
      "      void (() => {",
      "        void super.x;",
      "      });",
      "    });",
      "    yield;",
      "  }",
      "};",
      "class C {",
      "  m() {",
      "    void (() => {",
      "      void (() => {",
      "        void super.x;",
      "      });",
      "    });",
      "  }",
      "  static m() {",
      "    void (() => {",
      "      void (() => {",
      "        void super.x;",
      "      });",
      "    });",
      "  }",
      "}"
    ], { esversion: 6 });

  TestRun(test, "outside of method")
    .addError(5, 14, "Super property may only be used within method bodies.")
    .addError(6, 14, "Super property may only be used within method bodies.")
    .addError(12, 8, "Super property may only be used within method bodies.")
    .addError(13, 8, "Super property may only be used within method bodies.")
    .addError(15, 6, "Super property may only be used within method bodies.")
    .addError(16, 6, "Super property may only be used within method bodies.")
    .test([
      "void {",
      "  m() {",
      "    function f() {",
      "      void (() => {",
      "        void super.x;",
      "        void super[x];",
      "      });",
      "    }",
      "  }",
      "};",
      "function f() {",
      "  void super.x;",
      "  void super[x];",
      "}",
      "void super.x;",
      "void super[x];"
    ], { esversion: 6 });

  test.done();
};

exports.super.superCall = function (test) {
  TestRun(test)
    .test([
      "class C {",
      "  m() {",
      "    super();",
      "    super(1);",
      "    super(...x);",
      "  }",
      "}"
    ], { esversion: 6 });

  TestRun(test, "within arrow functions")
    .test([
      "class C {",
      "  m() {",
      "    void (() => {",
      "      void (() => {",
      "        super();",
      "      });",
      "    });",
      "  }",
      "  *g() {",
      "    void (() => {",
      "      void (() => {",
      "        super();",
      "      });",
      "    });",
      "    yield;",
      "  }",
      "  static m() {",
      "    void (() => {",
      "      void (() => {",
      "        super();",
      "      });",
      "    });",
      "  }",
      "}"
    ], { esversion: 6 });

  TestRun(test, "outside of class method")
    .addError(5, 9, "Super call may only be used within class method bodies.")
    .addError(14, 9, "Super call may only be used within class method bodies.")
    .addError(20, 3, "Super call may only be used within class method bodies.")
    .addError(22, 1, "Super call may only be used within class method bodies.")
    .test([
      "class C {",
      "  m() {",
      "    function f() {",
      "      void (() => {",
      "        super();",
      "      });",
      "    }",
      "  }",
      "}",
      "void {",
      "  m() {",
      "    function f() {",
      "      void (() => {",
      "        super();",
      "      });",
      "    }",
      "  }",
      "};",
      "function f() {",
      "  super();",
      "}",
      "super();"
    ], { esversion: 6 });

  TestRun(test, "within async method")
    .addError(3, 5, "Super call may only be used within class method bodies.")
    .test([
      "class C {",
      "  async m() {",
      "    super();",
      "  }",
      "}"
    ], { esversion: 8 });

  TestRun(test, "as operand to `new`")
    .addError(3, 9, "Unexpected 'super'.")
    .test([
      "class C {",
      "  constructor() {",
      "    new super();",
      "  }",
      "}"
    ], { esversion: 6 });

  test.done();
};


exports.functionReassignment = function (test) {
  var src = [
    "function f() {}",
    "f = null;",
    "f ^= null;",
    "function g() {",
    "  g = null;",
    "  g &= null;",
    "}",
    "(function h() {",
    "  h = null;",
    "  h |= null;",
    "}());"
  ];

  TestRun(test)
    .addError(2, 1, "Reassignment of 'f', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .addError(3, 1, "Reassignment of 'f', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .addError(5, 3, "Reassignment of 'g', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .addError(6, 3, "Reassignment of 'g', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .addError(9, 3, "Reassignment of 'h', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .addError(10, 3, "Reassignment of 'h', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .test(src);

  TestRun(test, "generator functions")
    .addError(2, 1, "Reassignment of 'g', which is a generator function. Use 'var' or 'let' to declare bindings that may change.")
    .test([
      "function * g () { yield; }",
      "g = null;"
    ], { esversion: 6 });

  TestRun(test, "async functions")
    .addError(2, 1, "Reassignment of 'a', which is a async function. Use 'var' or 'let' to declare bindings that may change.")
    .test([
      "async function a () {}",
      "a = null;"
    ], { esversion: 8 });

  test.done();
};

exports.functionNotOverwritten = function (test) {
  var code = [
    "function x() {",
    "  x = 1;",
    "  var x;",
    "}"
  ];

  TestRun(test)
    .test(code, { shadow: true });

  test.done();
};

exports.classExpressionThis = function (test) {
  var code = [
    "void class MyClass {",
    "  constructor() { return this; }",
    "  method() { return this; }",
    "  static method() { return this; }",
    "  get accessor() { return this; }",
    "  set accessor() { return this; }",
    "};"
  ];

  TestRun(test)
    .test(code, { esnext: true });

  test.done();
};

exports.classElementEmpty = function (test) {
  var code = [
    "class A {",
    "  ;",
    "  method() {}",
    "  ;",
    "  *methodB() { yield; }",
    "  ;;",
    "  methodC() {}",
    "  ;",
    "}",
  ];

  TestRun(test)
    .addError(2, 3, "Unnecessary semicolon.")
    .addError(4, 3, "Unnecessary semicolon.")
    .addError(6, 3, "Unnecessary semicolon.")
    .addError(6, 4, "Unnecessary semicolon.")
    .addError(8, 3, "Unnecessary semicolon.")
    .test(code, { esnext: true });

  test.done();
};

exports.invalidClasses = function (test) {
  // Regression test for GH-2324
  TestRun(test)
    .addError(1, 11, "Class properties must be methods. Expected '(' but instead saw ''.")
    .addError(1, 11, "Unrecoverable syntax error. (100% scanned).")
    .test("class a { b", { esnext: true });

  // Regression test for GH-2339
  TestRun(test)
    .addError(2, 14, "Class properties must be methods. Expected '(' but instead saw ':'.")
    .addError(3, 3, "Expected '(' and instead saw '}'.")
    .addError(4, 1, "Expected an identifier and instead saw '}'.")
    .addError(4, 1, "Unrecoverable syntax error. (100% scanned).")
    .test([
        "class Test {",
        "  constructor: {",
        "  }",
        "}"
      ], { esnext: true });

  test.done();
};

exports["test for GH-1018"] = function (test) {
  var code = [
    "if (a = 42) {}",
    "else if (a = 42) {}",
    "while (a = 42) {}",
    "for (a = 42; a = 42; a += 42) {}",
    "do {} while (a = 42);",
    "switch (a = 42) {}"
  ];

  var run = TestRun(test);
  run.test(code, {boss: true});

  run
    .addError(1, 7, "Expected a conditional expression and instead saw an assignment.")
    .addError(2, 12, "Expected a conditional expression and instead saw an assignment.")
    .addError(3, 10, "Expected a conditional expression and instead saw an assignment.")
    .addError(4, 16, "Expected a conditional expression and instead saw an assignment.")
    .addError(5, 16, "Expected a conditional expression and instead saw an assignment.")
    .addError(6, 11, "Expected a conditional expression and instead saw an assignment.")
    .test(code);

  test.done();
};

exports["test warnings for assignments in conditionals"] = function (test) {
  var code = [
    "if (a = b) { }",
    "if ((a = b)) { }",
    "if (a = b, a) { }",
    "if (a = b, b = c) { }",
    "if ((a = b, b = c)) { }",
    "if (a = b, (b = c)) { }"
  ];

  var run = TestRun(test)
    .addError(1, 7, "Expected a conditional expression and instead saw an assignment.")
    .addError(4, 14, "Expected a conditional expression and instead saw an assignment.");

  run.test(code); // es5

  test.done();
};

exports["test for GH-1089"] = function (test) {
  var code = [
    "function foo() {",
    "    'use strict';",
    "    Object.defineProperty(foo, 'property', {",
    "        get: function() foo,",
    "        set: function(value) {},",
    "        enumerable: true",
    "    });",
    "}",
    "foo;"
  ];

  var run = TestRun(test)
    .addError(9, 1, "Expected an assignment or function call and instead saw an expression.");

  run.test(code, {moz: true});

  run
    .addError(4, 23, "'function closure expressions' is only available in Mozilla JavaScript " +
        "extensions (use moz option).");
  run.test(code);

  test.done();
};

exports["test for GH-1105"] = function (test) {
  var code = [
    "while (true) {",
    "    if (true) { break }",
    "}"
  ];

  TestRun(test)
    .addError(2, 22, "Missing semicolon.")
    .test(code);

  code = [
    "while (true) {",
    "    if (true) { continue }",
    "}"
  ];

  TestRun(test)
    .addError(2, 25, "Missing semicolon.")
    .test(code);

  test.done();
};

exports["test for crash with invalid condition"] = function (test) {
  var code = [
    "do {} while ();",
    "do {} while (,);",
    "do {} while (a,);",
    "do {} while (,b);",
    "do {} while (());",
    "do {} while ((,));",
    "do {} while ((a,));",
    "do {} while ((,b));"
  ];

  // As long as jshint doesn't crash, it doesn't matter what these errors
  // are. Feel free to adjust these if they don't match the output.
  var run = TestRun(test)
    .addError(1, 14, "Expected an identifier and instead saw ')'.")
    .addError(1, 15, "Expected ')' to match '(' from line 1 and instead saw ';'.")
    .addError(2, 14, "Expected an identifier and instead saw ','.")
    .addError(3, 16, "Unexpected ')'.")
    .addError(4, 14, "Expected an identifier and instead saw ','.")
    .addError(4, 15, "Expected ')' to match '(' from line 4 and instead saw 'b'.")
    .addError(4, 16, "Expected an identifier and instead saw ')'.")
    .addError(4, 16, "Missing semicolon.")
    .addError(6, 15, "Expected an identifier and instead saw ','.")
    .addError(7, 17, "Unexpected ')'.")
    .addError(8, 15, "Expected an identifier and instead saw ','.")
    .addError(8, 16, "Expected ')' to match '(' from line 8 and instead saw 'b'.")
    .addError(8, 18, "Expected an identifier and instead saw ')'.")
    .addError(8, 18, "Missing semicolon.");

  run.test(code, {asi: true, expr: true});
  test.done();
};

exports["test 'yield' in compound expressions."] = function (test) {
  var code = fs.readFileSync(path.join(__dirname, "./fixtures/yield-expressions.js"), "utf8");

  var run = TestRun(test);

  run
    .addError(22, 14, "Did you mean to return a conditional instead of an assignment?")
    .addError(23, 22, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(31, 14, "Did you mean to return a conditional instead of an assignment?")
    .addError(32, 20, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(32, 17, "Bad operand.")
    .addError(51, 10, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(53, 10, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(54, 16, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(57, 10, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(58, 11, "Bad operand.")
    .addError(59, 10, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(59, 16, "Bad operand.")
    .addError(60, 11, "Bad operand.")
    .addError(60, 14, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(64, 6, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(65, 7, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(66, 6, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(67, 7, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(70, 6, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(71, 7, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")
    .addError(77, 11, "Bad operand.")
    .addError(78, 11, "Bad operand.")
    .addError(78, 19, "Bad operand.")
    .addError(79, 11, "Bad operand.")
    .addError(79, 19, "Bad operand.")
    .addError(79, 47, "Bad operand.")
    .addError(82, 11, "Bad operand.")
    .addError(83, 11, "Bad operand.")
    .addError(83, 19, "Bad operand.")
    .addError(84, 11, "Bad operand.")
    .addError(84, 19, "Bad operand.")
    .addError(84, 43, "Bad operand.")
    .test(code, {maxerr: 1000, expr: true, esnext: true});

  run = TestRun(test)
    .addError(22, 14, "Did you mean to return a conditional instead of an assignment?")
    .addError(31, 14, "Did you mean to return a conditional instead of an assignment?");

  // These are line-column pairs for the Mozilla paren errors.
  var needparen = [
    // comma
    [ 5,  5], [ 6,  8], [ 7,  5], [11,  5], [12,  8], [13,  5],
    // yield in yield
    [20, 11], [20,  5], [21, 11], [21,  5],
    [23, 22], [29, 11], [29,  5], [30, 11], [30,  5],
    [32, 11], [32, 20],
    // infix
    [51, 10], [53, 10], [54, 16], [57, 10], [58,  5], [59, 10], [60,  5], [60, 14],
    // prefix
    [64,  6], [65,  7], [66,  6], [67,  7], [70,  6], [71,  7],
    // ternary
    [77,  5], [78,  5], [78, 13], [79,  5], [79, 13], [79, 41], [82,  5], [83,  5], [83, 13],
    [84,  5], [84, 13], [84, 37]
  ];

  needparen.forEach(function (lc) {
    run.addError(lc[0], lc[1], "Mozilla requires the yield expression to be parenthesized here.");
  });

  run
    .addError(1, 9, "'function*' is only available in ES6 (use 'esversion: 6').")
    .addError(74, 9, "'function*' is only available in ES6 (use 'esversion: 6').");

  run.test(code, {maxerr: 1000, expr: true, moz: true});

  test.done();
};

exports["test 'yield' in invalid positions"] = function (test) {
  var testRun = TestRun(test, "as an invalid operand")
    .addError(1, 25, "Invalid position for 'yield' expression (consider wrapping in parenthesis).");

  testRun.test("function* g() { null || yield; }", { esversion: 6, expr: true });
  testRun.test("function* g() { null || yield null; }", { esversion: 6, expr: true });
  testRun.test("function* g() { null || yield* g(); }", { esversion: 6, expr: true });
  testRun.test("function* g() { null && yield; }", { esversion: 6, expr: true });
  testRun.test("function* g() { null && yield null; }", { esversion: 6, expr: true });
  testRun.test("function* g() { null && yield* g(); }", { esversion: 6, expr: true });

  testRun = TestRun(test, "as an invalid operand")
    .addError(1, 18, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")

  testRun.test("function* g() { !yield; }", { esversion: 6, expr: true });
  testRun.test("function* g() { !yield null; }", { esversion: 6, expr: true });
  testRun.test("function* g() { !yield* g(); }", { esversion: 6, expr: true });

  testRun = TestRun(test, "as an invalid operand")
    .addError(1, 19, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")

  testRun.test("function* g() { !!yield; }", { esversion: 6, expr: true });
  testRun.test("function* g() { !!yield null; }", { esversion: 6, expr: true });
  testRun.test("function* g() { !!yield* g(); }", { esversion: 6, expr: true });

  testRun = TestRun(test, "as an invalid operand")
    .addError(1, 21, "Invalid position for 'yield' expression (consider wrapping in parenthesis).")

  testRun.test("function* g() { 1 + yield; }", { esversion: 6, expr: true });
  testRun.test("function* g() { 1 + yield null; }", { esversion: 6, expr: true });
  testRun.test("function* g() { 1 + yield* g(); }", { esversion: 6, expr: true });
  testRun.test("function* g() { 1 - yield; }", { esversion: 6, expr: true });
  testRun.test("function* g() { 1 - yield null; }", { esversion: 6, expr: true });
  testRun.test("function* g() { 1 - yield* g(); }", { esversion: 6, expr: true });

  TestRun(test, "with an invalid operand")
    .addError(1, 22, "Bad operand.")
    .test("function* g() { yield.x; }", { esversion: 6, expr: true });

  testRun = TestRun(test, "with an invalid operand")
    .addError(1, 23, "Bad operand.");

  testRun.test("function* g() { yield*.x; }", { esversion: 6, expr: true });
  testRun.test("function* g() { yield ? null : null; }", { esversion: 6, expr: true });

  testRun = TestRun(test, "with an invalid operand")
    .addError(1, 24, "Bad operand.");

  testRun.test("function* g() { yield* ? null : null; }", { esversion: 6, expr: true });
  testRun.test("function* g() { (yield ? 1 : 1); }", { esversion: 6, expr: true });

  TestRun(test)
    .addError(1, 25, "Bad operand.")
    .test("function* g() { (yield* ? 1 : 1); }", { esversion: 6, expr: true });
  TestRun(test)
    .addError(1, 24, "Unclosed regular expression.")
    .addError(1, 24, "Unrecoverable syntax error. (100% scanned).")
    .test("function* g() { yield* / 1; }", { esversion: 6, expr: true });

  TestRun(test, 'as a valid operand')
    .test([
      "function* g() {",
      "  (yield);",
      "  var x = yield;",
      "  x = yield;",
      "  x = (yield, null);",
      "  x = (null, yield);",
      "  x = (null, yield, null);",
      "  x += yield;",
      "  x -= yield;",
      "  x *= yield;",
      "  x /= yield;",
      "  x %= yield;",
      "  x <<= yield;",
      "  x >>= yield;",
      "  x >>>= yield;",
      "  x &= yield;",
      "  x ^= yield;",
      "  x |= yield;",
      "  x = (yield) ? 0 : 0;",
      "  x = yield 0 ? 0 : 0;",
      "  x = 0 ? yield : 0;",
      "  x = 0 ? 0 : yield;",
      "  x = 0 ? yield : yield;",
      "  yield yield;",
      "}"
    ], { esversion: 6 });

  TestRun(test, "with a valid operand")
    .test([
      "function *g() {",
      "  yield g;",
      "  yield{};",
      // Misleading cases; potential future warning.
      "  yield + 1;",
      "  yield - 1;",
      "  yield[0];",
      "}"
    ], { esversion: 6 });

  var code = [
    "function* g() {",
    "  var x;",
    "  x++",
    "  yield;",
    "  x--",
    "  yield;",
    "}"
  ];

  TestRun(test, "asi")
    .addError(3, 6, "Missing semicolon.")
    .addError(5, 6, "Missing semicolon.")
    .test(code, { esversion: 6, expr: true });

  TestRun(test, "asi (ignoring warnings)")
    .test(code, { esversion: 6, expr: true, asi: true });

  TestRun(test, "name of a generator expression")
    .addError(1, 13, "Unexpected 'yield'.")
    .test([
      "(function * yield() {",
      "  yield;",
      "})();"
    ], { esversion: 6 });

  test.done();
};

exports["test for GH-387"] = function (test) {
  var code = [
    "var foo = a",
    "delete foo.a;"
  ];

  var run = TestRun(test)
    .addError(1, 12, "Missing semicolon.");

  run.test(code); // es5

  test.done();
};

exports["test for line breaks with 'yield'"] = function (test) {
  var code = [
    "function* F() {",
    "    a = b + (yield",
    "    c",
    "    );",
    "    d = yield",
    "    + e;",
    "    f = (yield",
    "    , g);",
    "    h = yield",
    "    ? i : j;",
    "    k = l ? yield",
    "    : m;",
    "    n = o ? p : yield",
    "    + r;",
    "}"
  ];

  var run = TestRun(test)
    .addError(3, 5, "Expected ')' to match '(' from line 2 and instead saw 'c'.")
    .addError(3, 6, "Missing semicolon.")
    .addError(4, 5, "Expected an identifier and instead saw ')'.")
    .addError(4, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(5, 14, "Missing semicolon.")
    .addError(6, 7, "Expected an assignment or function call and instead saw an expression.")
    .addError(7, 10, "Misleading line break before ','; readers may interpret this as an expression boundary.")
    .addError(8, 5, "Comma warnings can be turned off with 'laxcomma'.")
    .addError(9, 14, "Missing semicolon.")
    .addError(10, 5, "Expected an identifier and instead saw '?'.")
    .addError(10, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(10, 6, "Missing semicolon.")
    .addError(10, 11, "Label 'i' on j statement.")
    .addError(10, 11, "Expected an assignment or function call and instead saw an expression.")
    .addError(13, 22, "Missing semicolon.")
    .addError(14, 7, "Expected an assignment or function call and instead saw an expression.");

  run.test(code, {esnext: true});

  // Mozilla assumes the statement has ended if there is a line break
  // following a `yield`. This naturally causes havoc with the subsequent
  // parse.
  //
  // Note: there is one exception to the line-breaking rule:
  // ```js
  // a ? yield
  // : b;
  // ```
  run = TestRun(test)
    .addError(1, 9, "'function*' is only available in ES6 (use 'esversion: 6').")
    .addError(3, 5, "Expected ')' to match '(' from line 2 and instead saw 'c'.")
    .addError(4, 5, "Expected an identifier and instead saw ')'.")
    .addError(4, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(6, 7, "Expected an assignment or function call and instead saw an expression.")
    .addError(8, 5, "Comma warnings can be turned off with 'laxcomma'.")
    .addError(7, 10, "Misleading line break before ','; readers may interpret this as an expression boundary.")
    .addError(10, 5, "Expected an identifier and instead saw '?'.")
    .addError(10, 6, "Missing semicolon.")
    .addError(10, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(10, 11, "Label 'i' on j statement.")
    .addError(10, 11, "Expected an assignment or function call and instead saw an expression.")
    .addError(14, 7, "Expected an assignment or function call and instead saw an expression.");

  run.test(code, {moz: true, asi: true});

  run
    .addError(2, 14, "Line breaking error 'yield'.")
    .addError(3, 6, "Missing semicolon.")
    .addError(5, 9, "Line breaking error 'yield'.")
    .addError(5, 14, "Missing semicolon.")
    .addError(7, 10, "Line breaking error 'yield'.")
    .addError(9, 9, "Line breaking error 'yield'.")
    .addError(9, 14, "Missing semicolon.")
    .addError(11, 13, "Line breaking error 'yield'.")
    .addError(13, 17, "Line breaking error 'yield'.")
    .addError(13, 22, "Missing semicolon.");

  run.test(code, {moz: true});

  var code2 = [
    "function* gen() {",
    "  yield",
    "  fn();",
    "  yield*",
    "  fn();",
    "}"
  ];

  TestRun(test, "gh-2530 (asi: true)")
    .addError(5, 3, "Misleading line break before 'fn'; readers may interpret this as an expression boundary.")
    .test(code2, { esnext: true, undef: false, asi: true });

  TestRun(test, "gh-2530 (asi: false)")
    .addError(2, 8, "Missing semicolon.")
    .addError(5, 3, "Misleading line break before 'fn'; readers may interpret this as an expression boundary.")
    .test(code2, { esnext: true, undef: false });

  test.done();
};

// Regression test for gh-2956
exports.yieldRegExp = function (test) {
  var code = [
    "function* g() {",
    "  yield /./;",
    "  yield/./;",
    "  yield",
    "  /./;",
    "  yield /* comment */;",
    "  yield /* comment *//./;",
    "  yield 1 / 1;",
    "}"
  ];

  TestRun(test)
    .addError(1, 9, "'function*' is only available in ES6 (use 'esversion: 6').")
    .addError(2, 3, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 3, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 3, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 8, "Missing semicolon.")
    .addError(5, 3, "Expected an assignment or function call and instead saw an expression.")
    .addError(6, 3, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 3, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(8, 3, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(code);

  TestRun(test)
    .addError(4, 8, "Missing semicolon.")
    .addError(5, 3, "Expected an assignment or function call and instead saw an expression.")
    .test(code, { esversion: 6 });

  code = [
    "function* g() {",
    "  yield / 2;",
    "}"
  ];

  TestRun(test)
    .addError(1, 9, "'function*' is only available in ES6 (use 'esversion: 6').")
    .addError(2, 9, "Unclosed regular expression.")
    .addError(2, 9, "Unrecoverable syntax error. (66% scanned).")
    .test(code);

  TestRun(test)
    .addError(2, 9, "Unclosed regular expression.")
    .addError(2, 9, "Unrecoverable syntax error. (66% scanned).")
    .test(code, { esversion: 6 });

  test.done();
};

exports.unreachable = {
  "regression for GH-1227": function (test) {
    var src = fs.readFileSync(__dirname + "/fixtures/gh1227.js", "utf8");

    TestRun(test)
      .addError(14, 3, "Unreachable 'return' after 'return'.")
      .test(src);

    test.done();
  },
  break: function (test) {
    var src = [
      "var i = 0;",
      "foo: while (i) {",
      "  break foo;",
      "  i--;",
      "}"
    ];

    TestRun(test)
      .addError(4, 3, "Unreachable 'i' after 'break'.")
      .test(src);

    test.done();
  },
  continue: function (test) {
    var src = [
      "var i = 0;",
      "while (i) {",
      "  continue;",
      "  i--;",
      "}"
    ];

    TestRun(test)
      .addError(4, 3, "Unreachable 'i' after 'continue'.")
      .test(src);

    test.done();
  },
  return: function (test) {
    var src = [
      "(function() {",
      "  var x = 0;",
      "  return;",
      "  x++;",
      "}());"
    ];

    TestRun(test)
      .addError(4, 3, "Unreachable 'x' after 'return'.")
      .test(src);

    test.done();
  },
  throw: function (test) {
    var src = [
      "throw new Error();",
      "var x;"
    ];

    TestRun(test)
      .addError(2, 1, "Unreachable 'var' after 'throw'.")
      .test(src);

    test.done();
  },
  braceless: function (test) {
    var src = [
      "(function() {",
      "  var x;",
      "  if (x)",
      "    return;",
      "  return;",
      "}());"
    ];

    TestRun(test)
      .test(src);

    test.done();
  },
  // Regression test for GH-1387 "false positive: Unreachable 'x' after 'return'"
  nestedBraceless: function (test) {
    var src = [
      "(function() {",
      "  var x;",
      "  if (!x)",
      "    return function() {",
      "      if (!x) x = 0;",
      "      return;",
      "    };",
      "  return;",
      "}());"
    ];

    TestRun(test)
      .test(src);

    test.done();
  }
};

exports["test for 'break' in switch case + curly braces"] = function (test) {
  var code = [
    "switch (foo) {",
    "  case 1: { break; }",
    "  case 2: { return; }",
    "  case 3: { throw 'Error'; }",
    "  case 11: {",
    "    while (true) {",
    "      break;",
    "    }",
    "  }",
    "  default: break;",
    "}"
  ];

  // No error for case 1, 2, 3.
  var run = TestRun(test)
    .addError(9, 3, "Expected a 'break' statement before 'default'.")
    .test(code);

  test.done();
};

exports["test for 'break' in switch case in loop + curly braces"] = function (test) {
  var code = [
    "while (true) {",
    "  switch (foo) {",
    "    case 1: { break; }",
    "    case 2: { return; }",
    "    case 3: { throw 'Error'; }",
    "    case 4: { continue; }",
    "    case 11: {",
    "      while (true) {",
    "        break;",
    "      }",
    "    }",
    "    default: break;",
    "  }",
    "}"
  ];

  // No error for case 1, 2, 3, 4.
  var run = TestRun(test)
    .addError(11, 5, "Expected a 'break' statement before 'default'.")
    .test(code);

  test.done();
};

exports["allow expression with a comma in switch case condition"] = function (test) {
  var code = [
    "switch (false) {",
    "  case x = 1, y = x: { break; }",
    "}"
  ]

  var run = TestRun(test).test(code);
  test.done();
};

exports.ignoreDirective = {};

exports.ignoreDirective["should be a good option and only accept start, end or line as values"] = function (test) {
  var code = [
    "/*jshint ignore:start*/",
    "/*jshint ignore:end*/",
    "/*jshint ignore:line*/",
    "/*jshint ignore:badvalue*/"
  ];

  TestRun(test)
    .addError(4, 1, "Bad option value.")
    .test(code);

  test.done();
};

exports.ignoreDirective["should allow the linter to skip blocked-out lines to continue finding errors in the rest of the code"] = function (test) {
  var code = fs.readFileSync(__dirname + "/fixtures/gh826.js", "utf8");

  /**
   * This test previously asserted the issuance of warning W041.
   * W041 has since been removed, but the test is maintained in
   * order to discourage regressions.
   */
  TestRun(test)
    .test(code);

  test.done();
};

exports.ignoreDirective["should ignore lines that appear to end with multiline comment endings (GH-1691)"] = function(test) {
  var code = [
    "/*jshint ignore: start*/",
    "var a = {",
    // The following line ends in a sequence of characters that, if parsed
    // naively, could be interpreted as an "end multiline comment" token.
    "  a: /\s*/",
    "};",
    "/*jshint ignore: end*/"
  ];

  TestRun(test)
    .test(code);

  test.done();
};

exports.ignoreDirective["should ignore lines that end with a multi-line comment (GH-1396)"] = function(test) {
  var code = [
    "/*jshint ignore:start */",
    "var a; /* following comment */",
    "/*jshint ignore:end */"
  ];

  TestRun(test)
    .test(code, { unused: true });

  test.done();
};

exports.ignoreDirective["should ignore multi-line comments"] = function(test) {
  var code = [
    "/*jshint ignore:start */",
    "/*",
    "following comment",
    "*/",
    "var a;",
    "/*jshint ignore:end */"
  ];

  TestRun(test)
    .test(code, { unused: true });

  test.done();
};

exports.ignoreDirective["should be detected even with leading and/or trailing whitespace"] = function (test) {
  var code = [
    "  /*jshint ignore:start */",     // leading whitespace
    "   if (true) { alert('sup') }", // should be ignored
    "  /*jshint ignore:end */  ",     // leading and trailing whitespace
    "   if (true) { alert('sup') }", // should not be ignored
    "  /*jshint ignore:start */   ",  // leading and trailing whitespace
    "   if (true) { alert('sup') }", // should be ignored
    "  /*jshint ignore:end */   "     // leading and trailing whitespace
  ];

  TestRun(test)
    .addError(4, 28, "Missing semicolon.")
    .test(code);

  test.done();
};

// gh-2411 /* jshint ignore:start */ stopped working.
exports.ignoreDirective["should apply to lines lexed during lookahead operations"] = function (test) {
  var code = [
    "void [function () {",
    "  /* jshint ignore:start */",
    "  ?",
    "  /* jshint ignore:end */",
    "}];"
  ];

  TestRun(test)
    .test(code);

  code = [
    "(function () {",
    "  /* jshint ignore:start */",
    "  ?",
    "  /* jshint ignore:end */",
    "}());"
  ];

  TestRun(test)
    .test(code);

  test.done();
};

exports["should be able to ignore a single line with a trailing comment: // jshint:ignore"] = function (test) {
  var code = fs.readFileSync(__dirname + "/fixtures/gh870.js", "utf8");
  TestRun(test).test(code, { unused: true });
  test.done();
};

exports["regression test for GH-1431"] = function (test) {
  // The code is invalid but it should not crash JSHint.
  TestRun(test)
    .addError(1, 25, "Expected ';' and instead saw ')'.")
    .addError(1, 26, "Expected ')' and instead saw ';'.")
    .addError(1, 26, "Expected an identifier and instead saw ';'.")
    .addError(1, 28, "Expected ')' to match '(' from line 1 and instead saw 'i'.")
    .addError(1, 31, "Expected an identifier and instead saw ')'.")
    .test("for (i=0; (arr[i])!=null); i++);");

  test.done();
};

exports["jshint ignore:start/end should be detected using single line comments"] = function (test) {
  var code = [
    "// jshint ignore:start",
    "var a;",
    "// jshint ignore:end",
    "var b;"
  ];

  TestRun(test)
    .addError(4, 5, "'b' is defined but never used.")
    .test(code, { unused: true });

  test.done();
};

exports["test destructuring function parameters as es5"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/destparam.js", "utf8");
  TestRun(test)
    .addError(4, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 14, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(5, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 18, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(6, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 14, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 22, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(7, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 24, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(10, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(10, 16, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(11, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(11, 20, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(14, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(14, 11, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(15, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(15, 14, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(16, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(16, 17, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(16, 22, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(17, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(17, 20, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(18, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(18, 22, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(21, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(21, 19, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(22, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(22, 25, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(23, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(23, 28, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(24, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(24, 30, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(27, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(27, 13, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(28, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(28, 16, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(29, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(29, 19, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(30, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(30, 22, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(31, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(31, 24, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
  .test(src, {unused: true, undef: true, maxerr: 100});

  test.done();
};

exports["test destructuring function parameters as legacy JS"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/destparam.js", "utf8");
  TestRun(test)
    .addError(4, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(4, 14, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(5, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(5, 18, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(6, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 14, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(6, 22, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(7, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(7, 24, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(10, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(10, 16, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(11, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(11, 20, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(14, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(14, 11, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(15, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(15, 14, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(16, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(16, 17, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(16, 22, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(17, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(17, 20, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(18, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(18, 22, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(21, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(21, 19, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(22, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(22, 25, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(23, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(23, 28, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(24, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(24, 30, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(27, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(27, 13, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(28, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(28, 16, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(29, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(29, 19, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(30, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(30, 22, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .addError(31, 7, "'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(31, 24, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .test(src, {es3: true, unused: true, undef: true, maxerr: 100});

  test.done();
};

exports["test for parentheses in odd-numbered token"] = function (test) {
  var code = [
    "let f, b;",
    "let a = x => ({ f: f(x) });",
    "b = x => x;"
  ];

  TestRun(test)
    .test(code, {esnext: true});

  test.done();
};

exports["regression crash from GH-1573"] = function (test) {
  TestRun(test)
    .addError(1, 2, "Expected an identifier and instead saw 'var'.")
    .addError(1, 6, "Expected ']' to match '[' from line 1 and instead saw 'foo'.")
    .addError(1, 14, "Expected an identifier and instead saw ']'.")
    .addError(1, 14, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 15, "Missing semicolon.")
    .addError(1, 10, "Bad assignment.")
    .test("[var foo = 1;]");
  test.done();
};

exports["make sure we don't throw errors on removed options"] = function (test) {
  TestRun(test).test("a();", { nomen: true, onevar: true, passfail: true, white: true });
  test.done();
};

exports["'for of' shouldn't be subject to 'for in' rules"] = function (test) {
  TestRun(test)
    .test("for (let x of [1, 2, 3]) { console.log(x); }", { forin: true, esnext: true });
  test.done();
};

// See gh-3099, "TypeError: Cannot read property 'type' of undefined"
exports["enforcement of `forin` option should be tolerant of invalid syntax"] = function (test) {
  TestRun(test)
    .addError(1, 6, "Creating global 'for' variable. Should be 'for (var x ...'.")
    .addError(2, 3, "Unrecoverable syntax error. (66% scanned).")
    .addError(3, 1, "Expected an identifier and instead saw '}'.")
    .test([
      "for (x in x) {",
      "  if (",
      "}"
    ], { forin: true });

  test.done();
};

exports["Ignore strings containing braces within array literal declarations"] = function (test) {
  TestRun(test).test("var a = [ '[' ];");
  test.done();
};

exports["gh-1016: don't issue W088 if identifier is outside of blockscope"] = function (test) {
  var code = [
    "var globalKey;",
    "function x() {",
    "  var key;",
    "  var foo = function () {",
    "      alert(key);",
    "  };",
    "  for (key in {}) {",
    "      foo();",
    "  }",
    "  function y() {",
    "    for (key in {}) {",
    "      foo();",
    "    }",
    "    for (globalKey in {}) {",
    "      foo();",
    "    }",
    "    for (nonKey in {}) {",
    "      foo();",
    "    }",
    "  }",
    "}"
  ];

  TestRun(test)
    .addError(17, 10, "Creating global 'for' variable. Should be 'for (var nonKey ...'.")
    .test(code);

  test.done();
};

exports.testES6UnusedExports = function (test) {
  var code = [
    "export {",
    "  varDefinedLater,",
    "  letDefinedLater,",
    "  constDefinedLater",
    "};",
    "var unusedGlobalVar = 41;",
    "let unusedGlobalLet = 41;",
    "const unusedGlobalConst = 41;",
    "function unusedGlobalFunc() {}",
    "class unusedGlobalClass {}",
    "export let globalExportLet = 42;",
    "export var globalExportVar = 43;",
    "export const globalExportConst = 44;",
    "export function unusedFn() {}",
    "export class unusedClass {}",
    "export {",
    "  unusedGlobalVar,",
    "  unusedGlobalLet,",
    "  unusedGlobalConst,",
    "  unusedGlobalFunc,",
    "  unusedGlobalClass",
    "};",
    "var varDefinedLater = 60;",
    "let letDefinedLater = 61;",
    "const constDefinedLater = 62;"
  ];

  TestRun(test)
    .addError(24, 5, "'letDefinedLater' was used before it was declared, which is illegal for 'let' variables.")
    .addError(25, 7, "'constDefinedLater' was used before it was declared, which is illegal for 'const' variables.")
    .test(code, { esnext: true, unused: true });

  test.done();
};

exports.testES6BlockExports = function (test) {
  var code = [
    "var broken = true;",
    "var broken2 = false;",
    "function funcScope() {",
    "  export let exportLet = 42;",
    "  export var exportVar = 43;",
    "  export const exportConst = 44;",
    "  export function exportedFn() {}",
    "  export {",
    "    broken,",
    "    broken2",
    "  };",
    "}",
    "if (true) {",
    "  export let conditionalExportLet = 42;",
    "  export var conditionalExportVar = 43;",
    "  export const conditionalExportConst = 44;",
    "  export function conditionalExportedFn() {}",
    "  export {",
    "    broken,",
    "    broken2",
    "  };",
    "}",
    "funcScope();"
  ];

  TestRun(test)
    .addError(1, 5, "'broken' is defined but never used.")
    .addError(2, 5, "'broken2' is defined but never used.")
    .addError(4, 3, "Export declarations are only allowed at the top level of module scope.")
    .addError(5, 3, "Export declarations are only allowed at the top level of module scope.")
    .addError(6, 3, "Export declarations are only allowed at the top level of module scope.")
    .addError(7, 3, "Export declarations are only allowed at the top level of module scope.")
    .addError(8, 3, "Export declarations are only allowed at the top level of module scope.")
    .addError(14, 3, "Export declarations are only allowed at the top level of module scope.")
    .addError(15, 3, "Export declarations are only allowed at the top level of module scope.")
    .addError(16, 3, "Export declarations are only allowed at the top level of module scope.")
    .addError(17, 3, "Export declarations are only allowed at the top level of module scope.")
    .addError(17, 10, "Function declarations should not be placed in blocks. Use a function expression or move the statement to the top of the outer function.")
    .addError(18, 3, "Export declarations are only allowed at the top level of module scope.")
    .test(code, { esnext: true, unused: true });

  test.done();
};

exports.testES6BlockImports = function (test) {
  var code = [
    "{",
    " import x from './m.js';",
    "}",
    "function limitScope(){",
    " import {x} from './m.js';",
    "}",
    "(function(){",
    " import './m.js';",
    "}());",
    "{",
    " import {x as y} from './m.js';",
    "}",
    "limitScope();"
  ];

  TestRun(test)
    .addError(2, 2, "Import declarations are only allowed at the top level of module scope.")
    .addError(5, 2, "Import declarations are only allowed at the top level of module scope.")
    .addError(8, 2, "Import declarations are only allowed at the top level of module scope.")
    .addError(11, 2, "Import declarations are only allowed at the top level of module scope.")
    .test(code, { esversion: 6, module: true });

  test.done();
};

exports.testStrictDirectiveASI = function (test) {
  var options = { strict: true, asi: true, globalstrict: true };

  TestRun(test, 1)
    .test("'use strict'\nfunction fn() {}\nfn();", options);

  TestRun(test, 2)
    .test("'use strict'\n;function fn() {}\nfn();", options);

  TestRun(test, 3)
    .test("'use strict';function fn() {} fn();", options);

  TestRun(test, 4)
    .addError(2, 1, "Unorthodox function invocation.")
    .addError(2, 21, "Missing \"use strict\" statement.")
    .test("'use strict'\n(function fn() {})();", options);

  TestRun(test, 5)
    .addError(2, 10, "Missing \"use strict\" statement.")
    .test("'use strict'\n[0] = '6';", options);

  TestRun(test, 6)
    .addError(1, 29, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, 1, "Missing \"use strict\" statement.")
    .addError(2, 5, "Missing \"use strict\" statement.")
    .test("'use strict',function fn() {}\nfn();", options);

  TestRun(test, 7)
    .addError(1, 24, "Missing \"use strict\" statement.")
    .test("'use strict'.split(' ');", options);

  TestRun(test, 8)
    .addError(1, 15, "Missing \"use strict\" statement.")
    .test("(function() { var x; \"use strict\"; return x; }());", { strict: true, expr: true });

  TestRun(test, 9)
    .addError(1, 27, "Missing \"use strict\" statement.")
    .addError(1, 15, "Expected an assignment or function call and instead saw an expression.")
    .test("'use strict', 'use strict';", options);

  TestRun(test, 10)
    .addError(1, 28, "Missing \"use strict\" statement.")
    .addError(1, 16, "Expected an assignment or function call and instead saw an expression.")
    .test("'use strict' * 'use strict';", options);

  TestRun(test, 11)
    .addError(2, 2, "Expected an assignment or function call and instead saw an expression.")
    .test("'use strict'\n!x;", options, { x: true });

  TestRun(test, 12)
    .addError(2, 1, "Misleading line break before '+'; readers may interpret this as an expression boundary.")
    .addError(2, 3, "Missing \"use strict\" statement.")
    .addError(2, 2, "Expected an assignment or function call and instead saw an expression.")
    .test("'use strict'\n+x;", options, { x: true });

  TestRun(test, 13)
    .test("'use strict'\n++x;", options, { x: true });

  TestRun(test, 14)
    .addError(1, 13, "Bad assignment.")
    .addError(2, 1, "Missing \"use strict\" statement.")
    .addError(2, 2, "Missing \"use strict\" statement.")
    .addError(2, 1, "Expected an assignment or function call and instead saw an expression.")
    .test("'use strict'++\nx;", options, { x: true });

  TestRun(test, 15)
    .addError(1, 13, "Bad assignment.")
    .addError(1, 15, "Missing \"use strict\" statement.")
    .test("'use strict'++;", options, { x: true });

  TestRun(test, 16)
    .addError(1, 9, "Missing \"use strict\" statement.")
    .test("(() => 1)();", { strict: true, esnext: true });

  TestRun(test, 17)
    .test("(() => { \"use strict\"; })();", { strict: true, esnext: true });

  TestRun(test, 18)
    .test("(() => {})();", { strict: true, esnext: true });

  TestRun(test, 19)
    .addError(1, 10, "Missing \"use strict\" statement.")
    .test("(() => { return 1; })();", { strict: true, esnext: true });

  TestRun(test, 20)
    .addError(1, 1, "Use the function form of \"use strict\".")
    .test([
      "'use strict';",
      "(() => { return 1; })();"],
    { strict: true, esnext: true });

  test.done();
};

exports.dereferenceDelete = function (test) {
  TestRun(test)
    .addError(1, 7, "Expected an identifier and instead saw '.'.")
    .addError(1, 8, "Missing semicolon.")
    .test("delete.foo();");

  test.done();
};

exports.trailingCommaInObjectBindingPattern = function (test) {
  var code = [
    'function fn(O) {',
    '  var {a, b, c,} = O;',
    '}',
    'fn({ a: 1, b: 2, c: 3 });'
  ];

  TestRun(test)
    .test(code, { esnext: true });

  test.done();
};


exports.trailingCommaInObjectBindingPatternParameters = function (test) {
  var code = [
    'function fn({a, b, c,}) { }',
    'fn({ a: 1, b: 2, c: 3 });'
  ];

  TestRun(test)
    .test(code, { esnext: true });

  test.done();
};


exports.trailingCommaInArrayBindingPattern = function (test) {
  var code = [
    'function fn(O) {',
    '  var [a, b, c,] = O;',
    '}',
    'fn([1, 2, 3]);'
  ];

  TestRun(test)
    .test(code, { esnext: true });

  test.done();
};


exports.trailingCommaInArrayBindingPatternParameters = function (test) {
  var code = [
    'function fn([a, b, c,]) { }',
    'fn([1, 2, 3]);'
  ];

  TestRun(test)
    .test(code, { esnext: true });

  test.done();
};

exports.testGH1879 = function (test) {
  var code = [
    "function Foo() {",
    "  return;",
    "  // jshint ignore:start",
    "  return [];",
    "  // jshint ignore:end",
    "}"
  ];

  TestRun(test)
    .test(code);

  test.done();
};

exports.commaAfterRestElementInArrayBindingPattern = function (test) {
  var code = [
    'function fn(O) {',
    '  var [a, b, ...c,] = O;',
    '  var [...d,] = O;',
    '}',
    'fn([1, 2, 3]);'
  ];

  TestRun(test)
    .addError(2, 18, "Invalid element after rest element.")
    .addError(3, 12, "Invalid element after rest element.")
    .test(code, { esnext: true });

  test.done();
};


exports.commaAfterRestElementInArrayBindingPatternParameters = function (test) {
  var code = [
    'function fn([a, b, ...c,]) { }',
    'function fn2([...c,]) { }',
    'fn([1, 2, 3]);',
    'fn2([1,2,3]);'
  ];

  TestRun(test)
    .addError(1, 24, "Invalid element after rest element.")
    .addError(2, 19, "Invalid element after rest element.")
    .test(code, { esnext: true });

  test.done();
};


exports.commaAfterRestParameter = function (test) {
  var code = [
    'function fn(a, b, ...c, d) { }',
    'function fn2(...a, b) { }',
    'fn(1, 2, 3);',
    'fn2(1, 2, 3);'
  ];

  TestRun(test)
    .addError(1, 23, "Invalid parameter after rest parameter.")
    .addError(2, 18, "Invalid parameter after rest parameter.")
    .test(code, { esnext: true });

  test.done();
};


exports.restParameterWithDefault = function (test) {
  TestRun(test)
    .addError(1, 17, "Rest parameter does not a support default value.")
    .test("function f(...x = 0) {}", { esversion: 6 });

  test.done();
};


exports.extraRestOperator = function (test) {
  TestRun(test)
    .addError(1, 23, "Unexpected '...'.")
    .test('function fn([a, b, ......c]) { }', { esnext: true });

  TestRun(test)
    .addError(1, 18, "Unexpected '...'.")
    .test('function fn2([......c]) { }', { esnext: true });

  TestRun(test)
    .addError(1, 23, "Unexpected '...'.")
    .addError(1, 26, "Expected an identifier and instead saw ')'.")
    .addError(1, 30, "Unrecoverable syntax error. (100% scanned).")
    .test('function fn3(a, b, ......) { }', { esnext: true });

  TestRun(test)
    .addError(1, 17, "Unexpected '...'.")
    .addError(1, 20, "Expected an identifier and instead saw ')'.")
    .addError(1, 24, "Unrecoverable syntax error. (100% scanned).")
    .test('function fn4(......) { }', { esnext: true });

  TestRun(test)
    .addError(1, 9, "Unexpected '...'.")
    .test('var [......a] = [1, 2, 3];', { esnext: true });

  TestRun(test)
    .addError(1, 16, "Unexpected '...'.")
    .test('var [a, b, ... ...c] = [1, 2, 3];', { esnext: true });

  TestRun(test)
    .addError(1, 17, "Unexpected '...'.")
    .test('var arrow = (......a) => a;', { esnext: true });

  TestRun(test)
    .addError(1, 24, "Unexpected '...'.")
    .test('var arrow2 = (a, b, ......c) => c;', { esnext: true });

  TestRun(test)
    .addError(1, 19, "Unexpected '...'.")
    .test('var arrow3 = ([......a]) => a;', { esnext: true });

  TestRun(test)
    .addError(1, 25, "Unexpected '...'.")
    .test('var arrow4 = ([a, b, ......c]) => c;', { esnext: true });

  test.done();
};


exports.restOperatorWithoutIdentifier = function (test) {
  var code = [
    'function fn([a, b, ...]) { }',
    'function fn2([...]) { }',
    'function fn3(a, b, ...) { }',
    'function fn4(...) { }',
    'var [...] = [1, 2, 3];',
    'var [a, b, ...] = [1, 2, 3];',
    'var arrow = (...) => void 0;',
    'var arrow2 = (a, b, ...) => a;',
    'var arrow3 = ([...]) => void 0;',
    'var arrow4 = ([a, b, ...]) => a;',
    'fn([1, 2, 3]);',
    'fn2([1, 2, 3]);',
    'fn3(1, 2, 3);',
    'fn3(1, 2, 3);',
    'arrow(1, 2, 3);',
    'arrow2(1, 2, 3);',
    'arrow3([1, 2, 3]);',
    'arrow4([1, 2, 3]);'
  ];

  TestRun(test)
    .addError(1, 23, "Expected an identifier and instead saw ']'.")
    .addError(1, 24, "Expected ',' and instead saw ')'.")
    .addError(1, 26, "Empty destructuring: this is unnecessary and can be removed.")
    .addError(2, 1, "Expected ',' and instead saw 'function'.")
    .addError(2, 13, "Expected ',' and instead saw '('.")
    .addError(2, 18, "Expected an identifier and instead saw ']'.")
    .addError(2, 19, "Expected ',' and instead saw ')'.")
    .addError(2, 21, "Empty destructuring: this is unnecessary and can be removed.")
    .addError(3, 1, "Expected ',' and instead saw 'function'.")
    .addError(3, 13, "Expected ',' and instead saw '('.")
    .addError(3, 23, "Expected an identifier and instead saw ')'.")
    .addError(3, 25, "Expected ',' and instead saw '{'.")
    .addError(3, 27, "Expected an identifier and instead saw '}'.")
    .addError(4, 1, "Expected ',' and instead saw 'function'.")
    .addError(4, 13, "Expected ',' and instead saw '('.")
    .addError(4, 17, "Expected an identifier and instead saw ')'.")
    .addError(4, 19, "Expected ',' and instead saw '{'.")
    .addError(4, 21, "Expected an identifier and instead saw '}'.")
    .addError(5, 1, "Expected ',' and instead saw 'var'.")
    .addError(5, 9, "Expected an identifier and instead saw ']'.")
    .addError(5, 11, "Expected ',' and instead saw '='.")
    .addError(5, 14, "Expected an identifier and instead saw '1'.")
    .addError(5, 17, "Expected an identifier and instead saw '2'.")
    .addError(5, 20, "Expected an identifier and instead saw '3'.")
    .addError(5, 22, "Expected ',' and instead saw ';'.")
    .addError(6, 1, "Expected an identifier and instead saw 'var' (a reserved word).")
    .addError(6, 5, "Expected ',' and instead saw '['.")
    .addError(6, 15, "Expected an identifier and instead saw ']'.")
    .addError(6, 17, "Expected ',' and instead saw '='.")
    .addError(6, 20, "Expected an identifier and instead saw '1'.")
    .addError(6, 23, "Expected an identifier and instead saw '2'.")
    .addError(6, 26, "Expected an identifier and instead saw '3'.")
    .addError(6, 28, "Expected ',' and instead saw ';'.")
    .addError(7, 1, "Expected an identifier and instead saw 'var' (a reserved word).")
    .addError(7, 5, "Expected ',' and instead saw 'arrow'.")
    .addError(7, 11, "Expected an identifier and instead saw '='.")
    .addError(7, 13, "Expected ',' and instead saw '('.")
    .addError(7, 17, "Expected an identifier and instead saw ')'.")
    .addError(7, 19, "Expected ',' and instead saw '=>'.")
    .addError(7, 22, "Expected an identifier and instead saw 'void' (a reserved word).")
    .addError(7, 27, "Expected ',' and instead saw '0'.")
    .addError(7, 28, "Expected an identifier and instead saw ';'.")
    .addError(7, 28, "Expected ',' and instead saw ';'.")
    .addError(8, 1, "Expected an identifier and instead saw 'var' (a reserved word).")
    .addError(8, 5, "Expected ',' and instead saw 'arrow2'.")
    .addError(8, 12, "Expected an identifier and instead saw '='.")
    .addError(8, 14, "Expected ',' and instead saw '('.")
    .addError(8, 24, "Expected an identifier and instead saw ')'.")
    .addError(8, 26, "Expected ',' and instead saw '=>'.")
    .addError(8, 30, "Expected ',' and instead saw ';'.")
    .addError(8, 30, "Too many errors. (44% scanned).")
    .test(code, { esnext: true });

  test.done();
};

exports.invalidSpread = function (test) {
  TestRun(test)
    .addError(1, 6, "Expected an identifier and instead saw '...'.")
    .addError(1, 9, "Missing semicolon.")
    .addError(1, 9, "Expected an assignment or function call and instead saw an expression.")
    .test('void ...x;', { esversion: 6 });

  test.done();
};

exports.getAsIdentifierProp = function (test) {
  TestRun(test)
    .test('var get; var obj = { get };', { esnext: true });

  TestRun(test)
    .test('var set; var obj = { set };', { esnext: true });

  TestRun(test)
    .test('var get, set; var obj = { get, set };', { esnext: true });

  TestRun(test)
    .test('var get, set; var obj = { set, get };', { esnext: true });

  TestRun(test)
    .test('var get; var obj = { a: null, get };', { esnext: true });

  TestRun(test)
    .test('var get; var obj = { a: null, get, b: null };', { esnext: true });

  TestRun(test)
    .test('var get; var obj = { get, b: null };', { esnext: true });

  TestRun(test)
    .test('var get; var obj = { get, get a() {} };', { esnext: true });

  TestRun(test)
    .test([
      'var set;',
      'var obj = { set, get a() {}, set a(_) {} };'
    ], { esnext: true });

  test.done();
};

exports.invalidParams = function (test) {
  TestRun(test)
    .addError(1, 11, "Expected an identifier and instead saw '!'.")
    .addError(1, 11, "Unrecoverable syntax error. (100% scanned).")
    .test("(function(!", { esnext: true });

  test.done();
};

// Regression test for gh-2362
exports.functionKeyword = function (test) {
  TestRun(test)
    .addError(1, 1, "Missing name in function declaration.")
    .addError(1, 1, "Expected '(' and instead saw ''.")
    .addError(1, 1, "Unrecoverable syntax error. (100% scanned).")
    .test("function");

  test.done();
};

exports.nonGeneratorAfterGenerator = function (test) {
  var run;
  var code = [
    'var obj = {',
    '  *gen() {',
    '    yield 1;',
    '  },',
    // non_gen shouldn't be parsed as a generator method here, and parser
    // shouldn't report an error about a generator without a yield expression.
    '  non_gen() {',
    '  }',
    '};'
  ];

  run = TestRun(test);
  run.test(code, { esnext: true });

  test.done();
};

exports["new.target"] = function (test) {
  var code = [
    "class A {",
    "  constructor() {",
    "    return new.target;",
    "  }",
    "}"
  ];

  TestRun(test, "only in ES6")
    .addError(1, 1, "'class' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(3, 15, "'new.target' is only available in ES6 (use 'esversion: 6').")
    .test(code);

  TestRun(test, "only in ES6").test(code, { esnext: true });
  TestRun(test, "ES7").test(code, { esversion: 7 });
  TestRun(test, "ES8").test(code, { esversion: 8 });

  var code2 = [
    "var a = new.target;",
    "var b = () => {",
    "  var c = () => {",
    "    return new.target;",
    "  };",
    "  return new.target;",
    "};",
    "var d = function() {",
    "  return new.target;",
    "};",
    "function e() {",
    "  var f = () => {",
    "    return new.target;",
    "  };",
    "  return new.target;",
    "}",
    "class g {",
    "  constructor() {",
    "    return new.target;",
    "  }",
    "}"
  ];

  TestRun(test, "must be in function scope")
    .addError(1, 12, "'new.target' must be in function scope.")
    .addError(4, 15, "'new.target' must be in function scope.")
    .addError(6, 13, "'new.target' must be in function scope.")
    .test(code2, { esnext: true });

  TestRun(test, "must be in function scope")
    .addError(1, 12, "'new.target' must be in function scope.")
    .addError(4, 15, "'new.target' must be in function scope.")
    .addError(6, 13, "'new.target' must be in function scope.")
    .test(code2, { esversion: 2016 });

  TestRun(test, "must be in function scope")
    .addError(1, 12, "'new.target' must be in function scope.")
    .addError(4, 15, "'new.target' must be in function scope.")
    .addError(6, 13, "'new.target' must be in function scope.")
    .test(code2, { esversion: 2017 });

  var code3 = [
    "var x = new.meta;"
  ];

  TestRun(test, "invalid meta property")
    .addError(1, 12, "Invalid meta property: 'new.meta'.")
    .test(code3);

  var code4 = [
    "class A {",
    "  constructor() {",
    "    new.target = 2;",
    "    new.target += 2;",
    "    new.target &= 2;",
    "    new.target++;",
    "    ++new.target;",
    "  }",
    "}"
  ];

  TestRun(test, "can't assign to new.target")
    .addError(3, 16, "Bad assignment.")
    .addError(4, 16, "Bad assignment.")
    .addError(5, 16, "Bad assignment.")
    .addError(6, 15, "Bad assignment.")
    .addError(7, 5, "Bad assignment.")
    .test(code4, { esnext: true });

  test.done();
};

// gh2656: "[Regression] 2.9.0 warns about proto deprecated even if proto:true"
exports.lazyIdentifierChecks = function (test) {
  var src = [
    "var o = [",
    "  function() {",
    "    // jshint proto: true",
    "    o.__proto__ = null;",
    "  }",
    "];",
    "o.__proto__ = null;"
  ];

  TestRun(test)
    .addError(7, 12, "The '__proto__' property is deprecated.")
    .test(src);

  src = [
    "var o = {",
    "  p: function() {",
    "    // jshint proto: true, iterator: true",
    "    o.__proto__ = null;",
    "    o.__iterator__ = null;",
    "  }",
    "};",
    "o.__proto__ = null;",
    "o.__iterator__ = null;"
  ];

  TestRun(test)
    .addError(8, 12, "The '__proto__' property is deprecated.")
    .addError(9, 15, "The '__iterator__' property is deprecated.")
    .test(src);

  test.done();
};

exports.parsingCommas = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/parsingCommas.js', 'utf8');

  TestRun(test)
    .addError(2, 12, "Expected an identifier and instead saw ','.")
    .addError(6, 9, "Unexpected ','.")
    .addError(6, 9, "Comma warnings can be turned off with 'laxcomma'.")
    .addError(5, 12, "Misleading line break before ','; readers may interpret this as an expression boundary.")
    .addError(6, 10, "Unexpected ')'.")
    .addError(6, 10, "Expected an identifier and instead saw ')'.")
    .addError(6, 12, "Expected ')' to match '(' from line 5 and instead saw '{'.")
    .addError(6, 13, "Expected an identifier and instead saw '}'.")
    .addError(6, 13, "Expected an assignment or function call and instead saw an expression.")
    .addError(6, 14, "Missing semicolon.")
    .test(src);

  test.done();
};

exports.instanceOfLiterals = function (test) {
  var code = [
    "var x;",
    "var y = [x];",

    // okay
    "function Y() {}",
    "function template() { return Y; }",
    "var a = x instanceof Y;",
    "a = new X() instanceof function() { return X; }();",
    "a = x instanceof template``;",
    "a = x instanceof /./.constructor;",
    "a = x instanceof \"\".constructor;",
    "a = x instanceof [y][0];",
    "a = x instanceof {}[constructor];",
    "function Z() {",
    "  let undefined = function() {};",
    "  a = x instanceof undefined;",
    "}",

    // error: literals and unary operators cannot be used
    "a = x instanceof +x;",
    "a = x instanceof -x;",
    "a = x instanceof 0;",
    "a = x instanceof '';",
    "a = x instanceof null;",
    "a = x instanceof undefined;",
    "a = x instanceof {};",
    "a = x instanceof [];",
    "a = x instanceof /./;",
    "a = x instanceof ``;",
    "a = x instanceof `${x}`;",

    // warning: functions declarations should not be used
    "a = x instanceof function() {};",
    "a = x instanceof function MyUnusableFunction() {};",
  ];

  var errorMessage = "Non-callable values cannot be used as the second operand to instanceof.";
  var warningMessage = "Function expressions should not be used as the second operand to instanceof.";

  var run = TestRun(test)
    .addError(16, 20, errorMessage)
    .addError(17, 20, errorMessage)
    .addError(18, 19, errorMessage)
    .addError(19, 20, errorMessage)
    .addError(20, 22, errorMessage)
    .addError(21, 27, errorMessage)
    .addError(22, 20, errorMessage)
    .addError(23, 20, errorMessage)
    .addError(24, 21, errorMessage)
    .addError(25, 20, errorMessage)
    .addError(26, 24, errorMessage)
    .addError(27, 31, warningMessage)
    .addError(28, 50, warningMessage);

  run.test(code, { esversion: 6 });

  TestRun(test)
    .addError(1, 13, "Expected an identifier and instead saw ';'.")
    .addError(1, 13, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 14, "Missing semicolon.")
    .test('0 instanceof;');

  test.done();
};

exports.forInExpr = function (test) {
  TestRun(test)
    .test([
      "for (var x in [], []) {}"
    ]);

  TestRun(test)
    .addError(2, 17, "Expected ')' to match '(' from line 2 and instead saw ','.")
    .addError(2, 21, "Expected an identifier and instead saw ')'.")
    .addError(2, 21, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, 22, "Missing semicolon.")
    .test([
      "for (var x in [], []) {}",
      "for (var x of {}, {}) {}"
    ], { esversion: 6 });

  test.done();
};

exports.octalEscape = function (test) {
  TestRun(test)
    .addError(3, 8, "Octal literals are not allowed in strict mode.")
    .addError(4, 8, "Octal literals are not allowed in strict mode.")
    .addError(5, 8, "Octal literals are not allowed in strict mode.")
    .addError(6, 8, "Octal literals are not allowed in strict mode.")
    .addError(7, 8, "Octal literals are not allowed in strict mode.")
    .addError(8, 8, "Octal literals are not allowed in strict mode.")
    .addError(9, 8, "Octal literals are not allowed in strict mode.")
    .test([
      "'use strict';",
      "void '\\0';",
      "void '\\1';",
      "void '\\2';",
      "void '\\3';",
      "void '\\4';",
      "void '\\5';",
      "void '\\6';",
      "void '\\7';",
      "void '\\8';",
      "void '\\9';"
    ], { strict: "global" });

  TestRun(test)
    .test([
      "void '\\0';",
      "void '\\1';",
      "void '\\2';",
      "void '\\3';",
      "void '\\4';",
      "void '\\5';",
      "void '\\6';",
      "void '\\7';",
      "void '\\8';",
      "void '\\9';"
    ]);

  test.done();
};

// See gh-3004, "Starting jsdoc comment causes 'Unclosed regular expression'
// error"
exports.lookaheadBeyondEnd = function (test) {
  TestRun(test)
    .addError(1, 7, "Unmatched '{'.")
    .addError(1, 7, "Unrecoverable syntax error. (100% scanned).")
    .test("({ a: {");

  test.done();
};

// In releases prior to 2.9.6, JSHint would not terminate when given the source
// code in the following tests.
exports["regression test for GH-3230"] = function (test) {
  TestRun(test, "as originally reported")
    .addError(1, 12, "Expected ';' and instead saw ')'.")
    .addError(1, 13, "Unmatched '{'.")
    .addError(1, 13, "Unrecoverable syntax error. (100% scanned).")
    .test("for(var i=1){");

  TestRun(test, "further simplified (unclosed brace)")
    .addError(1, 4, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 5, "Expected an identifier and instead saw ''.")
    .addError(1, 5, "Unrecoverable syntax error. (100% scanned).")
    .test("for({");

  TestRun(test, "further simplified (unclosed bracket)")
    .addError(1, 4, "'destructuring assignment' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(1, 5, "Unexpected early end of program.")
    .addError(1, 5, "Unrecoverable syntax error. (100% scanned).")
    .test("for([");

  test.done();
};


exports.unicode8 = function (test) {
  TestRun(test)
    .addError(1, 5, "'unicode 8' is only available in ES6 (use 'esversion: 6').")
    .test("var Ϳ;", {esversion: 5});

  TestRun(test)
    .test("var Ϳ;", {esversion: 6});

  test.done();
};

exports.exponentiation = {};

exports.exponentiation.esversion = function (test) {
  var src = "x = 2 ** 3;";

  TestRun(test)
    .addError(1, 7, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .test(src);

  TestRun(test)
    .addError(1, 7, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .test(src, { esversion: 6 });

  TestRun(test)
    .test(src, { esversion: 7 });

  test.done();
};

exports.exponentiation.whitespace = function (test) {
  TestRun(test)
    .test([
      "2 ** 3;",
      "2** 3;",
      "2 **3;",
    ], { expr: true, esversion: 7 });

  TestRun(test, "newlines")
    .addError(2, 1, "Misleading line break before '**'; readers may interpret this as an expression boundary.")
    .test([
      "2",
      "** 3;",
      "2 **",
      "3;"
    ], { expr: true, esversion: 7 });

  TestRun(test, "invalid")
    .addError(1, 5, "Expected an identifier and instead saw '*'.")
    .addError(1, 6, "Missing semicolon.")
    .test([
      "2 * * 3;"
    ], { expr: true, esversion: 7 });

  test.done();
};

exports.exponentiation.leftPrecedence = function (test) {
  TestRun(test, "UpdateExpressions")
    .test([
      "++x ** y;",
      "--x ** y;",
      "x++ ** y;",
      "x-- ** y;",
    ], { expr: true, esversion: 7 });

  TestRun(test, "UnaryExpressions")
    .addError(1, 10, "Variables should not be deleted.")
    .addError(1, 10, "Unexpected '**'.")
    .addError(2, 8, "Unexpected '**'.")
    .addError(3, 10, "Unexpected '**'.")
    .addError(4, 4, "Unexpected '**'.")
    .addError(5, 4, "Unexpected '**'.")
    .addError(6, 4, "Unexpected '**'.")
    .addError(7, 4, "Unexpected '**'.")
    .test([
      "delete 2 ** 3;",
      "void 2 ** 3;",
      "typeof 2 ** 3;",
      "+2 ** 3;",
      "-2 ** 3;",
      "~2 ** 3;",
      "!2 ** 3;"
    ], { expr: true, esversion: 7 });

  TestRun(test, "Grouping")
    .addError(1, 10, "Variables should not be deleted.")
    .test([
      "(delete 2) ** 3;",
      "(void 2) ** 3;",
      "(typeof 2) ** 3;",
      "(+2) ** 3;",
      "(-2) ** 3;",
      "(~2) ** 3;",
      "(!2) ** 3;"
    ], { expr: true, esversion: 7 });

  test.done();
};

exports.exponentiation.rightPrecedence = function (test) {
  TestRun(test, "ExponentiationExpression")
    .test([
      "x ** x ** y;",
      "x ** ++x ** y;",
      "x ** --x ** y;",
      "x ** x++ ** y;",
      "x ** x-- ** y;"
    ], { expr: true, esversion: 7 });

  TestRun(test, "UnaryExpression")
    .test([
      "x ** delete x.y;",
      "x ** void y;",
      "x ** typeof y;",
      "x ** +y;",
      "x ** -y;",
      "x ** ~y;",
      "x ** !y;"
    ], { expr: true, esversion: 7 });

  test.done();
};

exports.exponentiation.compoundAssignment = function (test) {
  var src = [
      "x **= x;",
      "x**=x;",
      "x **= -2;",
      "x **= 2 ** 4;"
    ];

  TestRun(test, "valid (esversion: 6)")
    .addError(1, 3, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .addError(2, 2, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .addError(3, 3, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .addError(4, 3, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .addError(4, 9, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .test(src, { esversion: 5 });

  TestRun(test, "valid (esversion: 6)")
    .addError(1, 3, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .addError(2, 2, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .addError(3, 3, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .addError(4, 3, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .addError(4, 9, "'Exponentiation operator' is only available in ES7 (use 'esversion: 7').")
    .test(src, { esversion: 6 });

  TestRun(test, "valid (esversion: 7)")
    .test(src, { esversion: 7 });

  TestRun(test, "invalid syntax - whitespace 1")
    .addError(1, 5, "Expected an identifier and instead saw '*='.")
    .addError(1, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 8, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 7, "Missing semicolon.")
    .test("x * *= x;", { esversion: 7 });

  TestRun(test, "invalid syntax - whitespace 2")
    .addError(1, 5, "Expected an identifier and instead saw '*='.")
    .addError(1, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 7, "Missing semicolon.")
    .addError(1, 8, "Expected an assignment or function call and instead saw an expression.")
    .test("x * *= x;", { esversion: 7 });

  TestRun(test, "invalid syntax - newline 1")
    .addError(2, 1, "Expected an identifier and instead saw '*='.")
    .addError(2, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, 3, "Missing semicolon.")
    .addError(2, 4, "Expected an assignment or function call and instead saw an expression.")
    .test([
      "x *",
      "*= x;"
    ], { esversion: 7 });

  TestRun(test, "invalid syntax - newline 2")
    .addError(2, 1, "Expected an identifier and instead saw '='.")
    .addError(2, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, 2, "Missing semicolon.")
    .addError(2, 3, "Expected an assignment or function call and instead saw an expression.")
    .test([
      "x **",
      "= x;"
    ], { esversion: 7 });

  TestRun(test, 'invalid assignment target')
    .addError(1, 3, "Bad assignment.")
    .addError(2, 6, "Bad assignment.")
    .test([
      "0 **= x;",
      "this **= x;"
    ], { esversion: 7 });

  test.done();
};

exports.letAsIdentifier = function (test) {
  TestRun(test, "variable binding")
    .test([
      "var let;",
      "function f(let) {}"
    ]);

  TestRun(test, "function binding")
    .test("function let(let) {}");

  var src = [
    "var let;",
    "var x = let;",
    "let;",
    "void let;",
    "let();",
    "let(let);",
    "let(let());",
    "for (let; false; false) {}",
    "for (let in {}) {}",
    "for (let = 0; false; false) {}",
    "for (let || 0; false; false) {}"
  ];

  TestRun(test, "identifier reference (ES5)")
    .addError(3, 1, "Expected an assignment or function call and instead saw an expression.")
    .test(src, {esversion: 5});

  TestRun(test, "identifier reference (ES2015)")
    .addError(3, 1, "Expected an assignment or function call and instead saw an expression.")
    .test(src, {esversion: 6});

  // The same source code is expected to be parsed as a `let` declaration in
  // ES2015 and later.
  TestRun(test, "identifier reference with ASI")
    .addError(1, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 4, "Missing semicolon.")
    .addError(2, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 4, "Missing semicolon.")
    .addError(6, 1, "Misleading line break before '='; readers may interpret this as an expression boundary.")
    .test([
      "let",
      "x;",
      "let",
      "void 0;",
      "let",
      "= 0;"
    ], {esversion: 5});

  // The same source code is expected to be parsed as a `let` declaration in
  // ES2015 and later.
  TestRun(test, "identifier reference with ASI")
    .addError(1, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 4, "Missing semicolon.")
    .addError(4, 1, "Misleading line break before '='; readers may interpret this as an expression boundary.")
    .test([
      "let",
      "void 0;",
      "let",
      "= 0;"
    ], {esversion: 6});

  TestRun(test, "other uses")
    .test([
      "let: while (false) {",
      "  break let;",
      "}",
      "void { let: 0 };",
      "void {}.let;"
    ]);

  test.done();
};

exports.trailingParameterComma = function(test) {
  var code = 'function f(x,) {}';

  TestRun(test, 'declaration in ES5')
    .addError(1, 13, "'Trailing comma in function parameters' is only available in ES8 (use 'esversion: 8').")
    .test(code, { esversion: 5 });
  TestRun(test, 'declaration in ES6')
    .addError(1, 13, "'Trailing comma in function parameters' is only available in ES8 (use 'esversion: 8').")
    .test(code, { esversion: 6 });
  TestRun(test, 'declaration in ES7')
    .addError(1, 13, "'Trailing comma in function parameters' is only available in ES8 (use 'esversion: 8').")
    .test(code, { esversion: 7 });
  TestRun(test, 'declaration in ES8')
    .test(code, { esversion: 8 });

  test.done();
};

exports.trailingArgumentsComma = function(test) {
  TestRun(test, "valid - not supported in ES7")
    .addError(1, 4, "'Trailing comma in arguments lists' is only available in ES8 (use 'esversion: 8').")
    .test("f(0,);", { esversion: 7 })

  TestRun(test, "valid - supported in ES8")
    .test([
      "f(0,);",
      "f(0, 0,);",
    ], { esversion: 8 })

  TestRun(test, "invalid - zero expressions")
    .addError(1, 3, "Expected an identifier and instead saw ','.")
    .test([
      "f(,);",
    ], { esversion: 8 })

  TestRun(test, "invalid - zero expressions, multiple commas")
    .addError(1, 3, "Expected an identifier and instead saw ','.")
    .test([
      "f(,,);",
    ], { esversion: 8 })

  TestRun(test, "invalid - multiple commas")
    .addError(1, 5, "Expected an identifier and instead saw ','.")
    .test([
      "f(0,,);",
    ], { esversion: 8 })

  test.done();
};

exports.asyncFunctions = {};

exports.asyncFunctions.asyncIdentifier = function (test) {
  var code = [
    "var async;",
    "{ let async; }",
    "{ const async = null; }",
    "async: while (false) {}",
    "void { async };",
    "void { async: 0 };",
    "void { async() {} };",
    "void { get async() {} };",
    "async();",
    "async(async);",
    "async(async());"
  ];
  var strictCode = ["'use strict';"].concat(code);

  TestRun(test)
    .test(code, { esversion: 7 });

  TestRun(test)
    .test(strictCode, { esversion: 7, strict: "global" });

  TestRun(test)
    .test(code, { esversion: 8 });

  TestRun(test)
    .test(strictCode, { esversion: 8, strict: "global" });

  TestRun(test)
    .addError(1, 9, "Expected an assignment or function call and instead saw an expression.")
    .test("async=>{};", { esversion: 6 });

  TestRun(test)
    .addError(1, 9, "Expected an assignment or function call and instead saw an expression.")
    .test("async=>{};", { esversion: 8 });

  TestRun(test, "Line termination")
    .addError(1, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 6, "Missing semicolon.")
    .addError(3, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 6, "Missing semicolon.")
    .addError(4, 7, "Expected an assignment or function call and instead saw an expression.")
    .test([
      "async",
      "function f() {}",
      "async",
      "x => {};"
    ], { esversion: 8 });

  test.done();
};

exports.asyncFunctions.awaitIdentifier = function (test) {
  var code = [
    "var await;",
    "{ let await; }",
    "{ const await = null; }",
    "await: while (false) {}",
    "void { await };",
    "void { await: 0 };",
    "void { await() {} };",
    "void { get await() {} };",
    "await();",
    "await(await);",
    "await(await());",
    "await;"
  ];
  var functionCode = ["(function() {"].concat(code).concat("}());");
  var strictCode = ["'use strict';"].concat(code);

  TestRun(test)
    .addError(12, 1, "Expected an assignment or function call and instead saw an expression.")
    .test(code, { esversion: 7 });
  TestRun(test)
    .addError(13, 1, "Expected an assignment or function call and instead saw an expression.")
    .test(functionCode, { esversion: 7 });
  TestRun(test)
    .addError(13, 1, "Expected an assignment or function call and instead saw an expression.")
    .test(strictCode, { esversion: 7, strict: "global" });

  TestRun(test)
    .addError(12, 1, "Expected an assignment or function call and instead saw an expression.")
    .test(code, { esversion: 8 });
  TestRun(test)
    .addError(13, 1, "Expected an assignment or function call and instead saw an expression.")
    .test(functionCode, { esversion: 8 });
  TestRun(test)
    .addError(13, 1, "Expected an assignment or function call and instead saw an expression.")
    .test(strictCode, { esversion: 8, strict: "global" });

  TestRun(test, "nested inside a non-async function")
    .addError(3, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(6, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(9, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(13, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(17, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(21, 7, "Expected an assignment or function call and instead saw an expression.")
    .addError(24, 7, "Expected an assignment or function call and instead saw an expression.")
    .addError(27, 7, "Expected an assignment or function call and instead saw an expression.")
    .test([
      "async function a() {",
      "  function f() {",
      "    await;",
      "  }",
      "  void function() {",
      "    await;",
      "  };",
      "  function* g() {",
      "    await;",
      "    yield 0;",
      "  }",
      "  void function*() {",
      "    await;",
      "    yield 0;",
      "  };",
      "  void (() => {",
      "    await;",
      "  });",
      "  void {",
      "    get a() {",
      "      await;",
      "    },",
      "    m() {",
      "      await;",
      "    },",
      "    *g() {",
      "      await;",
      "      yield 0;",
      "    }",
      "  };",
      "}"
    ], { esversion: 8 });

  test.done();
};

exports.asyncFunctions.expression = function (test) {
  TestRun(test, "Statement position")
    .addError(1, 15, "Missing name in function declaration.")
    .test("async function() {}", { esversion: 8 });

  TestRun(test, "Expression position (disallowed prior to ES8)")
    .addError(1, 6, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .test("void async function() {};", { esversion: 7 });

  TestRun(test, "Expression position")
    .test("void async function() {};", { esversion: 8 });

  TestRun(test, "AwaitExpression in parameter list")
    .addError(1, 26, "Unexpected 'await'.")
    .test("void async function (x = await 0) {};", { esversion: 8 });

  test.done();
};

exports.asyncFunctions.awaitOperator = function (test) {
  TestRun(test, "Operands")
    .test([
      "void async function() {",
      "  await 0;",
      "  await /(?:)/;",
      "  await await 0;",
      "  await async function() {};",
      "};"
    ], { esversion: 8 });

  TestRun(test, "missing operands")
    .addError(2, 8, "Expected an identifier and instead saw ';'.")
    .addError(2, 9, "Missing semicolon.")
    .test([
      "void async function() {",
      "  await;",
      "};",
    ], { esversion: 8 });

  // Regression test for gh-3395
  TestRun(test, "within object initializer")
    .test([
      "void async function() {",
      "  void {",
      "    x: await 0,",
      "    [await 0]: 0,",
      "    get [await 0]() {},",
      "    set [await 0](_) {},",
      "  };",
      "};"
    ], { esversion: 8 });

  test.done();
};

exports.asyncFunctions.arrow = function (test) {
  TestRun(test, "Statement position")
    .addError(1, 14, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, 13, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 15, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, 18, "Expected an assignment or function call and instead saw an expression.")
    .addError(5, 24, "Expected an assignment or function call and instead saw an expression.")
    .test([
      "async () => {};",
      "async x => {};",
      "async (x) => {};",
      "async (x, y) => {};",
      "async (x, y = x()) => {};"
    ], { esversion: 8 })

  var expressions = [
    "void (async () => {});",
    "void (async x => {});",
    "void (async (x) => {});",
    "void (async (x, y) => {});",
    "void (async (x, y = x()) => {});"
  ];

  TestRun(test, "Expression position (disallowed prior to ES8)")
    .addError(1, 7, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .addError(2, 7, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .addError(3, 7, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .addError(4, 7, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .addError(5, 7, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .test(expressions, { esversion: 7 })

  TestRun(test, "Expression position")
    .test(expressions, { esversion: 8 })

  TestRun(test, "AwaitExpression in parameter list")
    .addError(1, 18, "Unexpected 'await'.")
    .test("void (async (x = await 0) => {});", { esversion: 8 });

  test.done();
};

exports.asyncFunctions.declaration = function (test) {
  TestRun(test)
    .addError(1, 1, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .test("async function f() {}", { esversion: 7 });

  TestRun(test)
    .test("async function f() {}", { esversion: 8 });

  TestRun(test)
    .addError(1, 22, "Unnecessary semicolon.")
    .test("async function f() {};", { esversion: 8 });

  TestRun(test, "AwaitExpression in parameter list")
    .addError(1, 22, "Unexpected 'await'.")
    .test("async function f(x = await 0) {}", { esversion: 8 });

  test.done();
};

exports.asyncFunctions.objectMethod = function (test) {
  var code = [
    "void { async m() {} };",
    "void { async 'm'() {} };",
    "void { async ['m']() {} };",
  ];

  TestRun(test, "Disallowed prior to ES8")
    .addError(1, 8, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .addError(2, 8, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .addError(3, 8, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .test(code, { esversion: 7 });

  TestRun(test, "Allowed in ES8")
    .test(code, { esversion: 8 });

  TestRun(test)
    .test([
      "void { async m() { await 0; } };"
    ], { esversion: 8 });

  TestRun(test)
    .addError(3, 9, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 14, "Missing semicolon.")
    .addError(3, 15, "Expected an assignment or function call and instead saw an expression.")
    .test([
      "void {",
      "  async m() { await 0; },",
      "  n() { await 0; },",
      "};"
    ], { esversion: 8 });

  TestRun(test, "AwaitExpression in parameter list")
    .addError(1, 20, "Unexpected 'await'.")
    .test("void { async m(x = await 0) {} };", { esversion: 9 });

  TestRun(test, "Illegal line break")
    .addError(2, 3, "Line breaking error 'async'.")
    .test([
      "void {",
      "  async",
      "  m() {}",
      "};"
    ], { esversion: 9 });

  test.done();
};

exports.asyncFunctions.classMethod = function (test) {
  var code = [
    "void class { async m() {} };",
    "void class { async 'm'() {} };",
    "void class { async ['m']() {} };",
  ];

  TestRun(test, "Disallowed prior to ES8")
    .addError(1, 14, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .addError(2, 14, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .addError(3, 14, "'async functions' is only available in ES8 (use 'esversion: 8').")
    .test(code, { esversion: 7 });

  TestRun(test, "Allowed in ES8")
    .test(code, { esversion: 8 });

  TestRun(test)
    .test([
      "class C { async m() { await 0; } }"
    ], { esversion: 8 });

  TestRun(test)
    .addError(3, 9, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 14, "Missing semicolon.")
    .addError(3, 15, "Expected an assignment or function call and instead saw an expression.")
    .test([
      "class C {",
      "  async m() { await 0; }",
      "  n() { await 0; }",
      "}"
    ], { esversion: 8 });

  TestRun(test, "AwaitExpression in parameter list")
    .addError(1, 23, "Unexpected 'await'.")
    .test("class C { async m(x = await 0) {} }", { esversion: 8 });

  TestRun(test, "Illegal line break")
    .addError(2, 3, "Line breaking error 'async'.")
    .test([
      "class C {",
      "  async",
      "  m() {}",
      "}"
    ], { esversion: 8 });

  TestRun(test, "Illegal constructor")
    .addError(1, 17, "Unexpected 'constructor'.")
    .test("class C { async constructor() {} }", { esversion: 8 });

  test.done();
};

exports.asyncGenerators = {};

exports.asyncGenerators.expression = function (test) {
  TestRun(test, "Statement position")
    .addError(1, 18, "Missing name in function declaration.")
    .test("async function * () { await 0; yield 0; }", { esversion: 9 });

  TestRun(test, "Expression position (disallowed prior to ES9)")
    .addError(1, 6, "'async generators' is only available in ES9 (use 'esversion: 9').")
    .test("void async function * () { await 0; yield 0; };", { esversion: 8 });

  TestRun(test, "Expression position")
    .test("void async function * () { await 0; yield 0; };", { esversion: 9 });

  TestRun(test, "YieldExpression in parameter list")
    .addError(1, 28, "Unexpected 'yield'.")
    .test("void async function * (x = yield) { await 0; yield 0; };", { esversion: 9 });

  TestRun(test, "AwaitExpression in parameter list")
    .addError(1, 28, "Unexpected 'await'.")
    .test("void async function * (x = await 0) { await 0; yield 0; };", { esversion: 9 });

  test.done();
};

exports.asyncGenerators.declaration = function (test) {
  TestRun(test)
    .addError(1, 1, "'async generators' is only available in ES9 (use 'esversion: 9').")
    .test("async function * f() { await 0; yield 0; }", { esversion: 8 });

  TestRun(test)
    .test("async function * f() { await 0; yield 0; }", { esversion: 9 });

  TestRun(test)
    .addError(1, 43, "Unnecessary semicolon.")
    .test("async function * f() { await 0; yield 0; };", { esversion: 9 });

  TestRun(test, "YieldExpression in parameter list")
    .addError(1, 24, "Unexpected 'yield'.")
    .test("async function * f(x = yield) { await 0; yield 0; }", { esversion: 9 });

  TestRun(test, "AwaitExpression in parameter list")
    .addError(1, 24, "Unexpected 'await'.")
    .test("async function * f(x = await 0) { await 0; yield 0; }", { esversion: 9 });

  test.done();
};

exports.asyncGenerators.method = function (test) {
  TestRun(test)
    .addError(1, 14, "'async generators' is only available in ES9 (use 'esversion: 9').")
    .test("void { async * m() { await 0; yield 0; } };", { esversion: 8 });

  TestRun(test)
    .test("void { async * m() { await 0; yield 0; } };", { esversion: 9 });

  TestRun(test, "YieldExpression in parameter list")
    .addError(1, 22, "Unexpected 'yield'.")
    .test("void { async * m(x = yield) { await 0; yield 0; } };", { esversion: 9 });

  TestRun(test, "AwaitExpression in parameter list")
    .addError(1, 22, "Unexpected 'await'.")
    .test("void { async * m(x = await 0) { await 0; yield 0; } };", { esversion: 9 });

  test.done();
};

exports.asyncGenerators.classMethod = function (test) {
  TestRun(test)
    .addError(1, 19, "'async generators' is only available in ES9 (use 'esversion: 9').")
    .test("class C { async * m() { await 0; yield 0; } }", { esversion: 8 });

  TestRun(test)
    .test("class C { async * m() { await 0; yield 0; } }", { esversion: 9 });

  TestRun(test, "YieldExpression in parameter list")
    .addError(1, 25, "Unexpected 'yield'.")
    .test("class C { async * m(x = yield) { await 0; yield 0; } }", { esversion: 9 });

  TestRun(test, "AwaitExpression in parameter list")
    .addError(1, 25, "Unexpected 'await'.")
    .test("class C { async * m(x = await 0) { await 0; yield 0; } }", { esversion: 9 });

  TestRun(test, "Illegal constructor")
    .addError(1, 19, "Unexpected 'constructor'.")
    .addError(1, 44, "Expected an identifier and instead saw 'yield' (a reserved word).")
    .addError(1, 44, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 49, "Missing semicolon.")
    .addError(1, 50, "Expected an assignment or function call and instead saw an expression.")
    .test("class C { async * constructor() { await 0; yield 0; } }", { esversion: 9 });

  test.done();
};

exports.asyncIteration = function (test) {
  TestRun(test, "unavailability in prior editions")
    .addError(2, 7, "'asynchronous iteration' is only available in ES9 (use 'esversion: 9').")
    .addError(3, 7, "'asynchronous iteration' is only available in ES9 (use 'esversion: 9').")
    .addError(4, 7, "'asynchronous iteration' is only available in ES9 (use 'esversion: 9').")
    .addError(5, 7, "'asynchronous iteration' is only available in ES9 (use 'esversion: 9').")
    .test([
      "async function f() {",
      "  for await (var x of []) {}",
      "  for await (let x of []) {}",
      "  for await (const x of []) {}",
      "  for await (x of []) {}",
      "}"
    ], { esversion: 8 });

  TestRun(test, "typical usage")
    .test([
      "async function f() {",
      "  for await (var x of []) {}",
      "  for await (let x of []) {}",
      "  for await (const x of []) {}",
      "  for await (x of []) {}",
      "}"
    ], { esversion: 9 });

  TestRun(test, "unavailability in synchronous contexts")
    .addError(2, 7, "Unexpected 'await'.")
    .test([
      "function f() {",
      "  for await (var x of []) {}",
      "}"
    ], { esversion: 9 });

  TestRun(test, "unavailability with for-in statements")
    .addError(2, 20, "Asynchronous iteration is only available with for-of loops.")
    .test([
      "async function f() {",
      "  for await (var x in []) {}",
      "}"
    ], { esversion: 9 });

  TestRun(test, "unavailability with C-style for statements")
    .addError(2, 20, "Asynchronous iteration is only available with for-of loops.")
    .test([
      "async function f() {",
      "  for await (var x ; ;) {}",
      "}"
    ], { esversion: 9 });

  test.done();
};

exports.parensAfterDeclaration = function (test) {
  TestRun(test)
    .addError(1, 17, "Function declarations are not invocable. Wrap the whole function invocation in parens.")
    .addError(1, 18, "Expected an assignment or function call and instead saw an expression.")
    .test("function f () {}();");

  TestRun(test)
    .addError(1, 19, "Expected an assignment or function call and instead saw an expression.")
    .test("function f () {}(0);");

  TestRun(test)
    .addError(1, 24, "Expected an assignment or function call and instead saw an expression.")
    .test("function f () {}() => {};", {esversion: 6});

  test.done();
};

exports.importMeta = function (test) {
  TestRun(test)
    .addError(1, 6, "Expected an identifier and instead saw 'import' (a reserved word).")
    .test("void import;");

  TestRun(test)
    .addError(1, 6, "Expected an identifier and instead saw 'import' (a reserved word).")
    .test(
      "void import;",
      { esversion: 11 }
    );

  TestRun(test)
    .addError(1, 12, "'import.meta' is only available in ES11 (use 'esversion: 11').")
    .addError(1, 12, "import.meta may only be used in module code.")
    .test(
      "void import.meta;",
      { esversion: 10 }
    );

  TestRun(test)
    .addError(1, 12, "import.meta may only be used in module code.")
    .test(
      "void import.meta;",
      { esversion: 11 }
    );

  TestRun(test, "valid usage (expression position)")
    .test(
      "void import.meta;",
      { esversion: 11, module: true }
    );

  TestRun(test, "valid usage (statement position)")
    .addError(1, 8, "Expected an assignment or function call and instead saw an expression.")
    .test(
      "import.meta;",
      { esversion: 11, module: true }
    );

  TestRun(test, "Other property name (expression position)")
    .addError(1, 12, "Invalid meta property: 'import.target'.")
    .test(
      "void import.target;",
      { esversion: 11, module: true }
    );

  TestRun(test, "Other property name (statement position)")
    .addError(1, 7, "Invalid meta property: 'import.target'.")
    .addError(1, 8, "Expected an assignment or function call and instead saw an expression.")
    .test(
      "import.target;",
      { esversion: 11, module: true }
    );

  test.done();
};

exports.nullishCoalescing = {};

exports.nullishCoalescing.positive = function(test) {
  TestRun(test, "requires esversion: 11")
    .addError(1, 3, "'nullish coalescing' is only available in ES11 (use 'esversion: 11').")
    .test([
      "0 ?? 0;"
    ], { esversion: 10, expr: true });

  TestRun(test, "does not stand alone")
    .addError(1, 6, "Expected an assignment or function call and instead saw an expression.")
    .test([
      "0 ?? 0;"
    ], { esversion: 11 });

  TestRun(test, "precedence with bitwise OR")
    .test([
      "0 | 0 ?? 0;"
    ], { esversion: 11, expr: true });

  TestRun(test, "precedence with conditional expression")
    .test([
      "0 ?? 0 ? 0 ?? 0 : 0 ?? 0;"
    ], { esversion: 11, expr: true });

  TestRun(test, "precedence with expression")
    .test([
      "0 ?? 0, 0 ?? 0;"
    ], { esversion: 11, expr: true });

  TestRun(test, "covered")
    .test([
      "0 || (0 ?? 0);",
      "(0 || 0) ?? 0;",
      "(0 ?? 0) || 0;",
      "0 ?? (0 || 0);",
      "0 && (0 ?? 0);",
      "(0 && 0) ?? 0;",
      "(0 ?? 0) && 0;",
      "0 ?? (0 && 0);"
    ], { esversion: 11, expr: true });

  test.done();
};

exports.nullishCoalescing.negative = function(test) {
  TestRun(test, "precedence with logical OR")
    .addError(1, 8, "Unexpected '??'.")
    .test([
      "0 || 0 ?? 0;"
    ], { esversion: 11, expr: true });

  TestRun(test, "precedence with logical OR")
    .addError(1, 8, "Unexpected '||'.")
    .test([
      "0 ?? 0 || 0;"
    ], { esversion: 11, expr: true });

  TestRun(test, "precedence with logical AND")
    .addError(1, 8, "Unexpected '??'.")
    .test([
      "0 && 0 ?? 0;"
    ], { esversion: 11, expr: true });

  TestRun(test, "precedence with logical AND")
    .addError(1, 8, "Unexpected '&&'.")
    .test([
      "0 ?? 0 && 0;"
    ], { esversion: 11, expr: true });

  test.done();
};

exports.optionalChaining = function (test) {
  TestRun(test, "prior language editions")
    .addError(1, 5, "'Optional chaining' is only available in ES11 (use 'esversion: 11').")
    .addError(1, 7, "Expected an assignment or function call and instead saw an expression.")
    .test(
      "true?.x;",
      { esversion: 10 }
    );

  TestRun(test, "literal property name")
    .addError(1, 7, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, 5, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, 7, "Expected an assignment or function call and instead saw an expression.")
    .test([
        "true?.x;",
        "[]?.x;",
        "({}?.x);"
      ], { esversion: 11 }
    );

  TestRun(test, "literal property name restriction")
    .addError(1, 40, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 46, "Strict violation.")
    .test(
      "(function() { 'use strict'; arguments?.callee; })();",
      { esversion: 11 }
    );

  TestRun(test, "dynamic property name")
    .addError(1, 14, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, 11, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, 7, "['x'] is better written in dot notation.")
    .test([
        "true?.[void 0];",
        "true?.['x'];"
      ], { esversion: 11 }
    );

  TestRun(test, "arguments")
    .test([
        "true.x?.();",
        "true.x?.(true);",
        "true.x?.(true, true);",
        "true.x?.(...[]);"
      ], { esversion: 11 }
    );

  TestRun(test, "new")
    .addError(1, 7, "Unexpected '?.'.")
    .test(
      "new {}?.constructor();",
      { esversion: 11 }
    );

  TestRun(test, "template invocation - literal property name")
    .addError(1, 15, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 15, "Unexpected '`'.")
    .test(
      "true?.toString``;",
      { esversion: 11 }
    );

  TestRun(test, "template invocation - dynamic property name")
    .addError(1, 15, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 15, "Unexpected '`'.")
    .test(
      "true?.[void 0]``;",
      { esversion: 11 }
    );

  TestRun(test, "ternary")
    .addError(1, 8, "A leading decimal point can be confused with a dot: '.1'.")
    .addError(1, 11, "Expected an assignment or function call and instead saw an expression.")
    .test(
      "true?.1 : null;",
      { esversion: 11 }
    );

  TestRun(test, "CallExpression")
    .test(
      "true?.false();",
      { esversion: 11 }
    );

  test.done();
};

// gh-3556: "Crash parsing: throw new"
exports.loneNew = function (test) {
  TestRun(test, "as reported")
    .addError(4, 3, "Expected an identifier and instead saw '}'.")
    .addError(4, 4, "Missing semicolon.")
    .addError(1, 21, "Unmatched '{'.")
    .addError(5, 1, "Unrecoverable syntax error. (100% scanned).")
    .test([
      "function code(data) {",
      "  if (data.request === 'foo') {",
      "    throw new ",
      "  }",
      "}"
    ]);

  TestRun(test, "simplified")
    .addError(1, 4, "Expected an identifier and instead saw ';'.")
    .addError(1, 5, "Missing semicolon.")
    .test("new;");

  test.done();
};

// gh-3560: "Logical nullish assignment (??=) throwing error"
exports.loneNullishCoalescing = function (test) {
  TestRun(test, "as reported")
    .addError(2, 8, "Expected an identifier and instead saw '='.")
    .addError(2, 10, "Unexpected '(number)'.")
    .addError(2, 8, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, 9, "Missing semicolon.")
    .addError(2, 10, "Expected an assignment or function call and instead saw an expression.")
    .test([
      "let a = [1,2];",
      "a[0] ??= 0;"
    ], {esversion: 11});

  TestRun(test, "simplified")
    .addError(1, 4, "Expected an identifier and instead saw ';'.")
    .addError(1, 4, "Unexpected '(end)'.")
    .addError(1, 4, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 5, "Missing semicolon.")
    .test("0??;", {esversion: 11});

  test.done();
};
