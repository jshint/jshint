/**
 * Tests for the parser/tokenizer
 */

"use strict";

var JSHINT  = require('../../src/jshint.js').JSHINT;
var fs    = require('fs');
var TestRun = require("../helpers/testhelper").setup.testRun;
var path    = require("path");

exports.unsafe = function (test) {
  var code = [
    "var a\u000a = 'Here is a unsafe character';",
  ];

  TestRun(test)
    .addError(1, "This character may get silently deleted by one or more browsers.")
    .test(code, {es3: true});

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
    .addError(2, "Unrecoverable syntax error. (100% scanned).")
    .test(code, {es3: true});

  // GH-818
  TestRun(test)
    .addError(1, "Expected an identifier and instead saw ')'.")
    .addError(1, "Unrecoverable syntax error. (100% scanned).")
    .test("if (product < ) {}", {es3: true});

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

  var run = TestRun(test)
    .addError(1, "Confusing minuses.")
    .addError(2, "Confusing plusses.")
    .addError(3, "Confusing minuses.")
    .addError(4, "Confusing plusses.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  test.done();
};


exports.plusplus = function (test) {
  var run;
  var code = [
    "var a = ++[2];",
    "var b = --(2);",
  ];

  run = TestRun(test)
    .addError(1, "Unexpected use of '++'.")
    .addError(2, "Unexpected use of '--'.");
  run.test(code, { plusplus: true, es3: true });
  run.test(code, { plusplus: true }); // es5
  run.test(code, { plusplus: true, esnext: true });
  run.test(code, { plusplus: true, moz: true });

  run = TestRun(test)
    .addError(2, "Bad operand.");
  run.test(code, { plusplus: false, es3: true });
  run.test(code, { plusplus: false }); // es5
  run.test(code, { plusplus: false, esnext: true });
  run.test(code, { plusplus: false, moz: true });

  test.done();
};

exports.assignment = function (test) {
  var code = [
    "function test() {",
    "arguments.length = 2;",
    "arguments[0] = 3;",
    "}",
    "function test2() {",
    "\"use strict\";",
    "arguments.length = 2;",
    "arguments[0] = 3;",
    "}",
    "a() = 2;",
  ];

  var run = TestRun(test)
    .addError(2, "Bad assignment.")
    .addError(3, "Bad assignment.")
    .addError(10, "Bad assignment.")
    .addError(10, "Expected an assignment or function call and instead saw an expression.")
    .addError(10, "Missing semicolon.");

  run.test(code, { plusplus: true, es3: true });
  run.test(code, { plusplus: true }); // es5
  run.test(code, { plusplus: true, esnext: true });
  run.test(code, { plusplus: true, moz: true });

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

  var run = TestRun(test)
    .addError(1, "Use the isNaN function to compare with NaN.")
    .addError(2, "Use the isNaN function to compare with NaN.")
    .addError(3, "Confusing use of '!'.", {character : 9})
    .addError(4, "Confusing use of '!'.", {character : 13})
    .addError(5, "Confusing use of '!'.", {character : 10})
    .addError(6, "Confusing use of '!'.", {character : 10})
    .addError(7, "Confusing use of '!'.", {character : 16})
    .addError(8, "Confusing use of '!'.", {character : 10})
    .addError(9, "Confusing use of '!'.", {character : 10});
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

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
    "/*jshint white:no */",
    "/*global xxx*/",
    "xxx = 2;",
  ];

  var run = TestRun(test)
    .addError(3, "Unexpected /*member 'c'.")
    .addError(4, "Bad option: '++'.")
    .addError(5, "Expected a small integer or 'false' and instead saw '0'.")
    .addError(6, "Expected a small integer or 'false' and instead saw '-2'.")
    .addError(7, "Expected a small integer or 'false' and instead saw '100.4'.")
    .addError(8, "Expected a small integer or 'false' and instead saw '200.4'.")
    .addError(9, "Expected a small integer or 'false' and instead saw '300.4'.")
    .addError(10, "Expected a small integer or 'false' and instead saw '0'.")
    .addError(13, "Bad option: 'd'.")
    .addError(14, "Bad option value.")
    .addError(16, "Read only.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  TestRun(test).test(fs.readFileSync(__dirname + "/fixtures/gh988.js", "utf8"));

  test.done();
};

exports.shebang = function (test) {
  var code = [
    "#!test",
    "var a = 'xxx';",
    "#!test"
  ];

  var run = TestRun(test)
    .addError(3, "Expected an identifier and instead saw '#'.")
    .addError(3, "Expected an operator and instead saw '!'.")
    .addError(3, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, "Missing semicolon.");
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
    .test(code, {es3: true});

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

  var run = TestRun(test)
    .addError(3, "Unbegun comment.")
    .addError(4, "Unclosed comment.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

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

  var run = TestRun(test)
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
    .addError(24, "Unrecoverable syntax error. (88% scanned).");

  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});


  TestRun(test).test("var y = Math.sqrt(16) / 180;", {es3: true});
  TestRun(test).test("var y = Math.sqrt(16) / 180;", {}); // es5
  TestRun(test).test("var y = Math.sqrt(16) / 180;", {esnext: true});
  TestRun(test).test("var y = Math.sqrt(16) / 180;", {moz: true});

  // GH-803
  TestRun(test).test("var x = [1]; var y = x[0] / 180;", {es3: true});
  TestRun(test).test("var x = [1]; var y = x[0] / 180;", {}); // es5
  TestRun(test).test("var x = [1]; var y = x[0] / 180;", {esnext: true});
  TestRun(test).test("var x = [1]; var y = x[0] / 180;", {moz: true});

  test.done();
};

exports.testRegexRegressions = function (test) {
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

  var run = TestRun(test)
    .addError(1, "Control character in string: <non-printable>.", {character: 10})
    .addError(1, "This character may get silently deleted by one or more browsers.")
    .addError(2, "Bad or unnecessary escaping.")
    .addError(5, "Unclosed string.")
    .addError(5, "Missing semicolon.");
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
    .addError(1, "'hasOwnProperty' is a really bad name.")
    .addError(2, "'hasOwnProperty' is a really bad name.")
    .addError(3, "'hasOwnProperty' is a really bad name.")
    .addError(3, "['hasOwnProperty'] is better written in dot notation.");
  run.test(code, {es3: true});
  run.test(code, {}); // es5
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  test.done();
};

exports.jsonMode = function (test) {
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
    .addError(2, "Expected a string and instead saw a.")
    .addError(3, "Strings must use doublequote.")
    .addError(3, "Avoid \\v.")
    .addError(3, "Avoid \\x-.")
    .addError(3, "Avoid \\'.")
    .addError(4, "Avoid \\v.")
    .addError(4, "Avoid \\x-.")
    .addError(4, "Strings must use doublequote.")
    .addError(5, "Avoid EOL escaping.")
    .addError(7, "Avoid 0x-.");
  run.test(code, {multistr: true, es3: true});
  run.test(code, {multistr: true}); // es5
  run.test(code, {multistr: true, esnext: true});
  run.test(code, {multistr: true, moz: true});

  test.done();
};

exports.comma = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/comma.js", "utf8");

  TestRun(test)
    .addError(2, "Expected an assignment or function call and instead saw an expression.")
    .addError(15, "Expected an assignment or function call and instead saw an expression.")
    .addError(15, "Missing semicolon.")
    .addError(20, "Expected an assignment or function call and instead saw an expression.")
    .addError(30, "Expected an assignment or function call and instead saw an expression.")
    .addError(35, "Expected an assignment or function call and instead saw an expression.")
    .addError(35, "Missing semicolon.")
    .addError(36, "Unexpected 'if'.")
    .addError(43, "Expected an assignment or function call and instead saw an expression.")
    .addError(43, "Missing semicolon.")
    .addError(44, "Unexpected '}'.")
    .test(src, {es3: true});

  // Regression test (GH-56)
  TestRun(test)
    .addError(4, "Expected an assignment or function call and instead saw an expression.")
    .test(fs.readFileSync(__dirname + "/fixtures/gh56.js", "utf8"));

  // Regression test (GH-363)
  TestRun(test)
    .addError(1, "Extra comma. (it breaks older versions of IE)")
    .test("var f = [1,];", {es3: true});

  // Regression test (GH-1108)
  TestRun(test)
    .test("i = 0, g;", {white: true, expr: true});

  test.done();
};

exports.withStatement = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/with.js", "utf8");
  var run;

  run = TestRun(test)
    .addError(5, "Don't use 'with'.")
    .addError(5, "Missing space after 'with'.")
    .addError(5, "Unexpected space after '('.")
    .addError(13, "'with' is not allowed in strict mode.")
    .addError(13, "Missing space after ')'.")
    .addError(13, "Unexpected space after '2'.");
  run.test(src, {white: true, es3: true});
  run.test(src, {white: true}); // es5
  run.test(src, {white: true, esnext: true});
  run.test(src, {white: true, moz: true});

  run = TestRun(test)
    .addError(5, "Missing space after 'with'.")
    .addError(5, "Unexpected space after '('.")
    .addError(13, "'with' is not allowed in strict mode.")
    .addError(13, "Missing space after ')'.")
    .addError(13, "Unexpected space after '2'.");
  run.test(src, {white: true, withstmt: true, es3: true});
  run.test(src, {white: true, withstmt: true}); // es5
  run.test(src, {white: true, withstmt: true, esnext: true});
  run.test(src, {white: true, withstmt: true, moz: true});

  test.done();
};

exports.blocks = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/blocks.js", "utf8");

  var run = TestRun(test)
    .addError(29, "Unmatched \'{\'.")
    .addError(31, "Unmatched \'{\'.");
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
    .addError(5, "'unused' is defined but never used.")
    .addError(6, "'isDog' is defined but never used.")
    .addError(13, "'unusedDeclaration' is defined but never used.")
    .addError(14, "'unusedExpression' is defined but never used.")
    .addError(17, "'cannotBeExported' is defined but never used.");

  run.test(src, {es3: true, unused: true });
  run.test(src, {unused: true }); // es5
  run.test(src, {esnext: true, unused: true });
  run.test(src, {moz: true, unused: true });

  run = TestRun(test)
    .addError(1, "'unused' is defined but never used.")
    .test("var unused = 1; var used = 2;", {exported: ["used"], unused: true});

  test.done();
};

exports.testIdentifiers = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/identifiers.js", "utf8");

  TestRun(test).test(src, {es3: true});
  var run = TestRun(test)
    .addError(1, "'ascii' is defined but never used.")
    .addError(2, "'num1' is defined but never used.")
    .addError(3, "'lifé' is defined but never used.")
    .addError(4, "'π' is defined but never used.")
    .addError(5, "'привет' is defined but never used.")
    .addError(6, "'\\u1d44' is defined but never used.")
    .addError(7, "'encoded\\u1d44' is defined but never used.")
    .addError(8, "'\\uFF38' is defined but never used.")
    .addError(9, "'\\uFF58' is defined but never used.")
    .addError(10, "'\\u1FBC' is defined but never used.")
    .addError(11, "'\\uFF70' is defined but never used.")
    .addError(12, "'\\u4DB3' is defined but never used.")
    .addError(13, "'\\u97CA' is defined but never used.")
    .addError(14, "'\\uD7A1' is defined but never used.")
    .addError(15, "'\\uFFDA' is defined but never used.")
    .addError(16, "'\\uA6ED' is defined but never used.")
    .addError(17, "'\\u0024' is defined but never used.")
    .addError(18, "'\\u005F' is defined but never used.")
    .addError(19, "'\\u0024\\uFF38' is defined but never used.")
    .addError(20, "'\\u0024\\uFF58' is defined but never used.")
    .addError(21, "'\\u0024\\u1FBC' is defined but never used.")
    .addError(22, "'\\u0024\\uFF70' is defined but never used.")
    .addError(23, "'\\u0024\\u4DB3' is defined but never used.")
    .addError(24, "'\\u0024\\u97CA' is defined but never used.")
    .addError(25, "'\\u0024\\uD7A1' is defined but never used.")
    .addError(26, "'\\u0024\\uFFDA' is defined but never used.")
    .addError(27, "'\\u0024\\uA6ED' is defined but never used.")
    .addError(28, "'\\u0024\\uFE24' is defined but never used.")
    .addError(29, "'\\u0024\\uABE9' is defined but never used.")
    .addError(30, "'\\u0024\\uFF17' is defined but never used.")
    .addError(31, "'\\u0024\\uFE4E' is defined but never used.")
    .addError(32, "'\\u0024\\u200C' is defined but never used.")
    .addError(33, "'\\u0024\\u200D' is defined but never used.")
    .addError(34, "'\\u0024\\u0024' is defined but never used.")
    .addError(35, "'\\u0024\\u005F' is defined but never used.");
  run.test(src, {es3: true, unused: true });
  run.test(src, {unused: true }); // es5
  run.test(src, {esnext: true, unused: true });
  run.test(src, {moz: true, unused: true });

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
    .addError(1, "Expected an identifier and instead saw '}'.")
    .addError(1, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, "Missing semicolon.")
    .addError(1, "Expected an identifier and instead saw ')'.")
    .addError(1, "Expected an operator and instead saw '('.")
    .addError(1, "Unmatched '{'.")
    .addError(1, "Unmatched '('.")
    .addError(1, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, "Missing semicolon.")
    .test(src, { es3: true, nonew: true });
  test.done();
};

exports.testHtml = function (test) {
  var html = "<html><body>Hello World</body></html>";
  TestRun(test)
    .addError(1, "Expected an identifier and instead saw '<'.")
    .addError(1, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, "Missing semicolon.")
    .addError(1, "Expected an identifier and instead saw '<'.")
    .addError(1, "Unrecoverable syntax error. (100% scanned).")
    .test(html, {});
  test.done();
};

exports["test: destructuring var in function scope"] = function (test) {
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

exports["test: destructuring var as moz"] = function (test) {
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
    .addError(3,  "'z' is not defined.")
    .addError(8,  "'a' is defined but never used.")
    .addError(6,  "'b' is defined but never used.")
    .addError(6,  "'c' is defined but never used.")
    .addError(4,  "'h' is defined but never used.")
    .addError(4,  "'w' is defined but never used.")
    .addError(5,  "'o' is defined but never used.")
    .addError(6,  "'d' is defined but never used.")
    .addError(8,  "'bar' is defined but never used.")
    .test(code, {moz: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring var as esnext"] = function (test) {
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
    .addError(3,  "'z' is not defined.")
    .addError(8,  "'a' is defined but never used.")
    .addError(6,  "'b' is defined but never used.")
    .addError(6,  "'c' is defined but never used.")
    .addError(4,  "'h' is defined but never used.")
    .addError(4,  "'w' is defined but never used.")
    .addError(5,  "'o' is defined but never used.")
    .addError(6,  "'d' is defined but never used.")
    .addError(8,  "'bar' is defined but never used.")
    .test(code, {esnext: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring var as es5"] = function (test) {
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
    .addError(1, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3,  "'z' is not defined.")
    .addError(8,  "'a' is defined but never used.")
    .addError(6,  "'b' is defined but never used.")
    .addError(6,  "'c' is defined but never used.")
    .addError(4,  "'h' is defined but never used.")
    .addError(4,  "'w' is defined but never used.")
    .addError(5,  "'o' is defined but never used.")
    .addError(6,  "'d' is defined but never used.")
    .addError(8,  "'bar' is defined but never used.")
    .test(code, {unused: true, undef: true}); // es5

  test.done();
};

exports["test: destructuring var as legacy JS"] = function (test) {
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
    .addError(1, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3,  "'z' is not defined.")
    .addError(8,  "'a' is defined but never used.")
    .addError(6,  "'b' is defined but never used.")
    .addError(6,  "'c' is defined but never used.")
    .addError(4,  "'h' is defined but never used.")
    .addError(4,  "'w' is defined but never used.")
    .addError(5,  "'o' is defined but never used.")
    .addError(6,  "'d' is defined but never used.")
    .addError(8,  "'bar' is defined but never used.")
    .test(code, {es3: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring var errors"] = function (test) {
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

exports["test: destructuring const as moz"] = function (test) {
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
    .addError(1, "'a' is defined but never used.")
    .addError(1, "'b' is defined but never used.")
    .addError(1, "'c' is defined but never used.")
    .addError(2, "'d' is defined but never used.")
    .addError(3, "'e' is defined but never used.")
    .addError(4, "'hel' is defined but never used.")
    .addError(4, "'wor' is defined but never used.")
    .addError(5, "'o' is defined but never used.")
    .addError(6, "'f' is defined but never used.")
    .addError(6, "'g' is defined but never used.")
    .addError(6, "'h' is defined but never used.")
    .addError(6, "'i' is defined but never used.")
    .addError(7, "'bar' is defined but never used.")
    .addError(8, "'j' is defined but never used.")
    .addError(8, "'foobar' is defined but never used.")
    .addError(9, "'aa' is defined but never used.")
    .addError(9, "'bb' is defined but never used.")
    .addError(3, "'z' is not defined.")
    .addError(9, "'func' is not defined.")
    .test(code, {moz: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring const as esnext"] = function (test) {
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
    .addError(1, "'a' is defined but never used.")
    .addError(1, "'b' is defined but never used.")
    .addError(1, "'c' is defined but never used.")
    .addError(2, "'d' is defined but never used.")
    .addError(3, "'e' is defined but never used.")
    .addError(4, "'hel' is defined but never used.")
    .addError(4, "'wor' is defined but never used.")
    .addError(5, "'o' is defined but never used.")
    .addError(6, "'f' is defined but never used.")
    .addError(6, "'g' is defined but never used.")
    .addError(6, "'h' is defined but never used.")
    .addError(6, "'i' is defined but never used.")
    .addError(7, "'bar' is defined but never used.")
    .addError(8, "'j' is defined but never used.")
    .addError(8, "'foobar' is defined but never used.")
    .addError(3, "'z' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring const as es5"] = function (test) {
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
    .addError(1, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'a' is defined but never used.")
    .addError(1, "'b' is defined but never used.")
    .addError(1, "'c' is defined but never used.")
    .addError(2, "'d' is defined but never used.")
    .addError(3, "'e' is defined but never used.")
    .addError(4, "'hel' is defined but never used.")
    .addError(4, "'wor' is defined but never used.")
    .addError(5, "'o' is defined but never used.")
    .addError(6, "'f' is defined but never used.")
    .addError(6, "'g' is defined but never used.")
    .addError(6, "'h' is defined but never used.")
    .addError(6, "'i' is defined but never used.")
    .addError(7, "'bar' is defined but never used.")
    .addError(8, "'j' is defined but never used.")
    .addError(8, "'foobar' is defined but never used.")
    .addError(3, "'z' is not defined.")
    .test(code, {unused: true, undef: true}); // es5

  test.done();
};

exports["test: destructuring const as legacy JS"] = function (test) {
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
    .addError(1, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'a' is defined but never used.")
    .addError(1, "'b' is defined but never used.")
    .addError(1, "'c' is defined but never used.")
    .addError(2, "'d' is defined but never used.")
    .addError(3, "'e' is defined but never used.")
    .addError(4, "'hel' is defined but never used.")
    .addError(4, "'wor' is defined but never used.")
    .addError(5, "'o' is defined but never used.")
    .addError(6, "'f' is defined but never used.")
    .addError(6, "'g' is defined but never used.")
    .addError(6, "'h' is defined but never used.")
    .addError(6, "'i' is defined but never used.")
    .addError(7, "'bar' is defined but never used.")
    .addError(8, "'j' is defined but never used.")
    .addError(8, "'foobar' is defined but never used.")
    .addError(3, "'z' is not defined.")
    .test(code, {es3: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring const errors"] = function (test) {
  var code = [
    "const [ a, b, c ] = [ 1, 2, 3 ];",
    "const [ a, b, c ] = [ 1, 2, 3 ];",
    "const [ 1 ] = [ a ];",
    "const [ k, l; m ] = [ 1, 2, 3 ];",
    "const [ n, o, p ] = [ 1, 2; 3 ];"
  ];

  TestRun(test)
    .addError(2, "'b' is defined but never used.")
    .addError(2, "'c' is defined but never used.")
    .addError(4, "'k' is defined but never used.")
    .addError(4, "'l' is defined but never used.")
    .addError(4, "'m' is defined but never used.")
    .addError(5, "'n' is defined but never used.")
    .addError(5, "'o' is defined but never used.")
    .addError(5, "'p' is defined but never used.")
    .addError(2, "const 'a' has already been declared.")
    .addError(2, "const 'b' has already been declared.")
    .addError(2, "const 'c' has already been declared.")
    .addError(3, "Expected an identifier and instead saw '1'.")
    .addError(3, "Expected ',' and instead saw '1'.")
    .addError(3, "Expected an identifier and instead saw ']'.")
    .addError(4, "Expected ',' and instead saw ';'.")
    .addError(5, "Expected ']' to match '[' from line 5 and instead saw ';'.")
    .addError(5, "Missing semicolon.")
    .addError(5, "Expected an assignment or function call and instead saw an expression.")
    .addError(5, "Missing semicolon.")
    .addError(5, "Expected an identifier and instead saw ']'.")
    .addError(5, "Expected an assignment or function call and instead saw an expression.")
    .addError(5, "Missing semicolon.")
    .test(code, {es3: true, esnext: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring globals as moz"] = function (test) {
  var code = [
    "var a, b, c, d, h, w, o;",
    "[ a, b, c ] = [ 1, 2, 3 ];",
    "[ a ] = [ 1 ];",
    "[ a ] = [ z ];",
    "[ h, w ] = [ 'hello', 'world' ]; ",
    "[ o ] = [ { o : 1 } ];",
    "[ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "[ a, { foo : b } ] = [ 2, { foo : 1 } ];",
  ];

  TestRun(test)
    .addError(4,  "'z' is not defined.")
    .test(code, {moz: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring globals as esnext"] = function (test) {
  var code = [
    "var a, b, c, d, h, w, o;",
    "[ a, b, c ] = [ 1, 2, 3 ];",
    "[ a ] = [ 1 ];",
    "[ a ] = [ z ];",
    "[ h, w ] = [ 'hello', 'world' ]; ",
    "[ o ] = [ { o : 1 } ];",
    "[ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "[ a, { foo : b } ] = [ 2, { foo : 1 } ];",
  ];

  TestRun(test)
    .addError(4,  "'z' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring globals as es5"] = function (test) {
  var code = [
    "var a, b, c, d, h, w, o;",
    "[ a, b, c ] = [ 1, 2, 3 ];",
    "[ a ] = [ 1 ];",
    "[ a ] = [ z ];",
    "[ h, w ] = [ 'hello', 'world' ]; ",
    "[ o ] = [ { o : 1 } ];",
    "[ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "[ a, { foo : b } ] = [ 2, { foo : 1 } ];",
  ];

  TestRun(test)
    .addError(4,  "'z' is not defined.")
    .addError(2, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true}); // es5

  test.done();
};

exports["test: destructuring globals as legacy JS"] = function (test) {
  var code = [
    "var a, b, c, d, h, w, o;",
    "[ a, b, c ] = [ 1, 2, 3 ];",
    "[ a ] = [ 1 ];",
    "[ a ] = [ z ];",
    "[ h, w ] = [ 'hello', 'world' ]; ",
    "[ o ] = [ { o : 1 } ];",
    "[ a, [ [ [ b ], c ], d ] ] = [ 1, [ [ [ 2 ], 3], 4 ] ];",
    "[ a, { foo : b } ] = [ 2, { foo : 1 } ];",
  ];

  TestRun(test)
    .addError(4,  "'z' is not defined.")
    .addError(2, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring globals with syntax error"] = function (test) {
  var code = [
    "var a, b, c;",
    "[ a ] = [ z ];",
    "[ 1 ] = [ a ];",
    "[ a, b; c ] = [ 1, 2, 3 ];",
    "[ a, b, c ] = [ 1, 2; 3 ];"
  ];

  TestRun(test)
    .addError(4, "Expected ']' to match '[' from line 4 and instead saw ';'.")
    .addError(4, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, "Missing semicolon.")
    .addError(4, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, "Missing semicolon.")
    .addError(4, "Expected an identifier and instead saw ']'.")
    .addError(4, "Expected an operator and instead saw '='.")
    .addError(4, "Expected an operator and instead saw '['.")
    .addError(4, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, "Missing semicolon.")
    .addError(4, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, "Expected an assignment or function call and instead saw an expression.")
    .addError(4, "Missing semicolon.")
    .addError(4, "Expected an identifier and instead saw ']'.")
    .addError(4, "Expected an assignment or function call and instead saw an expression.")
    .addError(5, "Expected ']' to match '[' from line 5 and instead saw ';'.")
    .addError(5, "Missing semicolon.")
    .addError(5, "Expected an assignment or function call and instead saw an expression.")
    .addError(5, "Missing semicolon.")
    .addError(5, "Expected an identifier and instead saw ']'.")
    .addError(5, "Expected an assignment or function call and instead saw an expression.")
    .addError(2,  "'z' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring assign of empty values as moz"] = function (test) {
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
    .test(code, {moz: true, unused: true, undef: true, laxcomma: true});

  test.done();
};

exports["test: destructuring assign of empty values as esnext"] = function (test) {
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
    .test(code, {esnext: true, unused: true, undef: true});

  test.done();
};

exports["test: destructuring assign of empty values as es5"] = function (test) {
  var code = [
    "var [ a ] = [ 1, 2 ];",
    "var [ c, d ] = [ 1 ];",
    "var [ e, , f ] = [ 3, , 4 ];"
  ];

  TestRun(test)
    .addError(1, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'a' is defined but never used.")
    .addError(2, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'c' is defined but never used.")
    .addError(2, "'d' is defined but never used.")
    .addError(3, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'e' is defined but never used.")
    .addError(3, "'f' is defined but never used.")
    .test(code, {unused: true, undef: true}); // es5

  test.done();
};

exports["test: destructuring assign of empty values as JS legacy"] = function (test) {
  var code = [
    "var [ a ] = [ 1, 2 ];",
    "var [ c, d ] = [ 1 ];",
    "var [ e, , f ] = [ 3, , 4 ];"
  ];

  TestRun(test)
    .addError(1, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'a' is defined but never used.")
    .addError(2, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'c' is defined but never used.")
    .addError(2, "'d' is defined but never used.")
    .addError(3, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'e' is defined but never used.")
    .addError(3, "'f' is defined but never used.")
    .addError(3, "Extra comma. (it breaks older versions of IE)")
    .test(code, {es3: true, unused: true, undef: true});

  test.done();
};

exports["test: array element assignment inside array"] = function (test) {
  var code = [
    "var a1 = {};",
    "var a2 = [function f() {a1[0] = 1;}];",
  ];

  TestRun(test)
    .test(code);

  test.done();
};

exports["test: let statement as moz"] = function (test) {
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

exports["test: let statement as esnext"] = function (test) {
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
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: let statement as es5"] = function (test) {
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
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: let statement as legacy JS"] = function (test) {
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
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: let statement out of scope as moz"] = function (test) {
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
    .addError(1, "'x' is defined but never used.")
    .addError(5, "'z' is defined but never used.")
    .addError(3, "'y' is defined but never used.")
    .addError(7, "'z' is not defined.")
    .addError(9, "'y' is not defined.")
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: let statement out of scope as esnext"] = function (test) {
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
    .addError(1, "'x' is defined but never used.")
    .addError(5, "'z' is defined but never used.")
    .addError(3, "'y' is defined but never used.")
    .addError(7, "'z' is not defined.")
    .addError(9, "'y' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: let statement out of scope as es5"] = function (test) {
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
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'x' is defined but never used.")
    .addError(5, "'z' is defined but never used.")
    .addError(3, "'y' is defined but never used.")
    .addError(7, "'z' is not defined.")
    .addError(9, "'y' is not defined.")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: let statement out of scope as legacy JS"] = function (test) {
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
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'x' is defined but never used.")
    .addError(5, "'z' is defined but never used.")
    .addError(3, "'y' is defined but never used.")
    .addError(7, "'z' is not defined.")
    .addError(9, "'y' is not defined.")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: let statement in functions as moz"] = function (test) {
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

exports["test: let statement in functions as esnext"] = function (test) {
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

exports["test: let statement in functions as es5"] = function (test) {
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
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: let statement in functions as legacy JS"] = function (test) {
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
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: let statement not in scope as moz"] = function (test) {
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
    .addError(6, "'z' is defined but never used.")
    .addError(3, "'y' is defined but never used.")
    .addError(4, "'bar' is defined but never used.")
    .addError(8, "'z' is not defined.")
    .addError(10, "'y' is not defined.")
    .addError(11, "'bar' is not defined.")
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: let statement not in scope as esnext"] = function (test) {
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
    .addError(6, "'z' is defined but never used.")
    .addError(3, "'y' is defined but never used.")
    .addError(4, "'bar' is defined but never used.")
    .addError(8, "'z' is not defined.")
    .addError(10, "'y' is not defined.")
    .addError(11, "'bar' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: let statement not in scope as es5"] = function (test) {
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
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'z' is defined but never used.")
    .addError(3, "'y' is defined but never used.")
    .addError(4, "'bar' is defined but never used.")
    .addError(8, "'z' is not defined.")
    .addError(10, "'y' is not defined.")
    .addError(11, "'bar' is not defined.")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: let statement not in scope as legacy JS"] = function (test) {
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
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'z' is defined but never used.")
    .addError(3, "'y' is defined but never used.")
    .addError(4, "'bar' is defined but never used.")
    .addError(8, "'z' is not defined.")
    .addError(10, "'y' is not defined.")
    .addError(11, "'bar' is not defined.")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: let statement in for loop as moz"] = function (test) {
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
    "for (let i=i ; i < 10 ; i++ ) {",
    "print(i);",
    "}"
  ];

  TestRun(test)
    .test(code, {moz: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  test.done();
};

exports["test: let statement in for loop as esnext"] = function (test) {
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
    "for (let i=i ; i < 10 ; i++ ) {",
    "print(i);",
    "}"
  ];

  TestRun(test)
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  test.done();
};

exports["test: let statement in for loop as es5"] = function (test) {
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
    "for (let i=i ; i < 10 ; i++ ) {",
    "print(i);",
    "}"
  ];

  TestRun(test)
    .addError(2, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(11, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(14, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print", "Iterator"]}); // es5

  test.done();
};

exports["test: let statement in for loop as legacy JS"] = function (test) {
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
    "for (let i=i ; i < 10 ; i++ ) {",
    "print(i);",
    "}"
  ];

  TestRun(test)
    .addError(2, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(11, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(14, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  test.done();
};

exports["test: let statement in destructured for loop as moz"] = function (test) {
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

exports["test: let statement in destructured for loop as esnext"] = function (test) {
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

exports["test: let statement in destructured for loop as es5"] = function (test) {
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
    .addError(21, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(21, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: let statement in destructured for loop as legacy JS"] = function (test) {
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
    .addError(21, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(21, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: let statement (as seen in jetpack)"] = function (test) {
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

exports["test: let statement (as seen in jetpack) as esnext"] = function (test) {
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
    .addError(3, "'let block' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {esnext: true, unused: true, undef: true,
           predef: ["require", "xferable", "options"]});
  test.done();
};

exports["test: let statement (as seen in jetpack) as es5"] = function (test) {
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
    .addError(1, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let block' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {unused: true, undef: true,
           predef: ["require", "xferable", "options"]}); // es5
  test.done();
};

exports["test: let statement (as seen in jetpack) as legacy JS"] = function (test) {
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
    .addError(1, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let block' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {es3: true, unused: true, undef: true,
           predef: ["require", "xferable", "options"]});
  test.done();
};

exports["test: let block and let expression"] = function (test) {
  // Example taken from jetpack/addons sdk library from Mozilla project
  var code = [
    "let (x=1, y=2, z=3)",
    "{",
    "  let(t=4) print(x, y, z, t);",
    "  print(let(u=4) u,x);",
    "}"
  ];

  TestRun(test)
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});
  test.done();
};

exports["test: let block and let expression as esnext"] = function (test) {
  // Example taken from jetpack/addons sdk library from Mozilla project
  var code = [
    "let (x=1, y=2, z=3)",
    "{",
    "  let(t=4) print(x, y, z, t);",
    "  print(let(u=4) u,x);",
    "}"
  ];

  TestRun(test)
    .addError(1, "'let block' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, "'let block' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(4, "'let expressions' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});
  test.done();
};

exports["test: let block and let expression as es5"] = function (test) {
  // Example taken from jetpack/addons sdk library from Mozilla project
  var code = [
    "let (x=1, y=2, z=3)",
    "{",
    "  let(t=4) print(x, y, z, t);",
    "  print(let(u=4) u,x);",
    "}"
  ];

  TestRun(test)
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'let block' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let block' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(4, "'let expressions' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .addError(4, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5
  test.done();
};

exports["test: let block and let expression as legacy JS"] = function (test) {
  // Example taken from jetpack/addons sdk library from Mozilla project
  var code = [
    "let (x=1, y=2, z=3)",
    "{",
    "  let(t=4) print(x, y, z, t);",
    "  print(let(u=4) u,x);",
    "}"
  ];

  TestRun(test)
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'let block' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let block' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(4, "'let expressions' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .addError(4, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
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
    .addError(1, "'a' is defined but never used.")
    .addError(2, "'b' is defined but never used.")
    .addError(3, "'c' is defined but never used.")
    .addError(7, "'d' is defined but never used.")
    .test(code, { esnext: true, unused: true, undef: true, funcscope: true });

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
    .addError(1, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
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
    .addError(1, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: invalid for each"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "for each (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}"
  ];

  TestRun(test)
    .addError(1, "Invalid for each loop.")
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: invalid for each as esnext"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "for each (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}"
  ];

  TestRun(test)
    .addError(1, "Invalid for each loop.")
    .addError(1, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: invalid for each as ES5"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "for each (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}"
  ];

  TestRun(test)
    .addError(1, "Invalid for each loop.")
    .addError(1, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: invalid for each as legacy JS"] = function (test) {
  // example taken from https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7
  var code = [
    "for each (let i = 0; i<15; ++i) {",
    "  print(i);",
    "}"
  ];
  TestRun(test)
    .addError(1, "Invalid for each loop.")
    .addError(1, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: esnext generator"] = function (test) {
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

  test.done();
};

exports["test: esnext generator as moz extension"] = function (test) {
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
    .addError(1, "'function*' is only available in ES6 (use esnext option).")
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: esnext generator as es5"] = function (test) {
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
    .addError(1, "'function*' is only available in ES6 (use esnext option).")
    .addError(4, "'yield' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: esnext generator as legacy JS"] = function (test) {
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
    .addError(1, "'function*' is only available in ES6 (use esnext option).")
    .addError(4, "'yield' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: esnext generator without yield"] = function (test) {
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
    .addError(7, "A generator function shall contain a yield statement.")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: esnext generator without yield and check turned off"] = function (test) {
  var code = [
    "function* emptyGenerator() {}",

    "emptyGenerator();"
  ];
  TestRun(test)
    .test(code, {esnext: true, noyield: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: mozilla generator"] = function (test) {
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

exports["test: mozilla generator as esnext"] = function (test) {
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
    .addError(4,
     "A yield statement shall be within a generator function (with syntax: `function*`)")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  test.done();
};

exports["test: yield statement within try-catch"] = function (test) {
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

exports["test: mozilla generator as es5"] = function (test) {
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
    .addError(4, "'yield' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(9, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {unused: true, undef: true, predef: ["print", "Iterator"]}); // es5

  test.done();
};

exports["test: mozilla generator as legacy JS"] = function (test) {
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
    .addError(4, "'yield' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring assignment' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(9, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print", "Iterator"]});

  test.done();
};

exports["test: array comprehension"] = function (test) {
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
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: moz-style array comprehension"] = function (test) {
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

exports["test: array comprehension with for..of"] = function (test) {
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

exports["test: moz-style array comprehension with for..of"] = function (test) {
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

exports["test: array comprehension with unused variables"] = function (test) {
  var code = [
    "var ret = [for (i of unknown) i];",
    "print('ret:', ret);",
  ];
  TestRun(test)
    .addError(1, "'unknown' is not defined.")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: moz-style array comprehension with unused variables"] = function (test) {
  var code = [
    "var ret = [i for (i of unknown)];",
    "print('ret:', ret);",
  ];
  TestRun(test)
    .addError(1, "'unknown' is not defined.")
    .test(code, {moz: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: moz-style array comprehension as esnext"] = function (test) {
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
    .addError(3, "A yield statement shall be within a generator function (with syntax: " +
      "`function*`)")
    .addError(6, "Expected 'for' and instead saw 'i'.")
    .addError(6, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(7, "Expected 'for' and instead saw 'i'.")
    .addError(7, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {esnext: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: array comprehension as es5"] = function (test) {
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
    .addError(1, "'function*' is only available in ES6 (use esnext option).")
    .addError(2, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'yield' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(7, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: moz-style array comprehension as es5"] = function (test) {
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
    .addError(2, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'yield' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(6, "Expected 'for' and instead saw 'i'.")
    .addError(6, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(7, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(7, "Expected 'for' and instead saw 'i'.")
    .addError(7, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {unused: true, undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: array comprehension as legacy JS"] = function (test) {
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
    .addError(2, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'yield' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(7, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: moz-style array comprehension as legacy JS"] = function (test) {
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
    .addError(2, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'yield' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(6, "Expected 'for' and instead saw 'i'.")
    .addError(6, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(7, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(7, "Expected 'for' and instead saw 'i'.")
    .addError(7, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {es3: true, unused: true, undef: true, predef: ["print"]});

  test.done();
};

exports['test: array comprehension with dest array at global scope'] = function (test) {
  var code = [
    "[for ([i, j] of [[0,0], [1,1], [2,2]]) [i, j] ];",
    "var destarray_comparray_1 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, [j, j] ]];",
    "var destarray_comparray_2 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, {i: [i, j]} ]];",
  ];
  TestRun(test)
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports['test: moz-style array comprehension with dest array at global scope'] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_1 = [ [i, [j, j] ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_2 = [ [i, {i: [i, j]} ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
  ];
  TestRun(test)
    .test(code, {moz: true, undef: true, predef: ["print"]});

  test.done();
};

exports['test: moz-style array comprehension with dest array at global scope as esnext'] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_1 = [ [i, [j, j] ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_2 = [ [i, {i: [i, j]} ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
  ];
  TestRun(test)
    .addError(1, "Expected 'for' and instead saw '['.")
    .addError(1, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(2, "Expected 'for' and instead saw '['.")
    .addError(2, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, "Expected 'for' and instead saw '['.")
    .addError(3, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports['test: array comprehension with dest array at global scope as es5'] = function (test) {
  var code = [
    "[for ([i, j] of [[0,0], [1,1], [2,2]]) [i, j] ];",
    "var destarray_comparray_1 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, [j, j] ] ];",
    "var destarray_comparray_2 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, {i: [i, j]} ] ];",
  ];
  TestRun(test)
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(2, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(3, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports['test: moz-style array comprehension with dest array at global scope as es5'] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_1 = [ [i, [j, j] ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_2 = [ [i, {i: [i, j]} ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
  ];
  TestRun(test)
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(1, "Expected 'for' and instead saw '['.")
    .addError(1, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(2, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(2, "Expected 'for' and instead saw '['.")
    .addError(2, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(3, "Expected 'for' and instead saw '['.")
    .addError(3, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports['test: array comprehension with dest array at global scope as JS legacy'] = function (test) {
  var code = [
    "[for ([i, j] of [[0,0], [1,1], [2,2]]) [i, j] ];",
    "var destarray_comparray_1 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, [j, j] ] ];",
    "var destarray_comparray_2 = [for ([i, j] of [[0,0], [1,1], [2,2]]) [i, {i: [i, j]} ] ];",
  ];
  TestRun(test)
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(2, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(3, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports['test: moz-style array comprehension with dest array at global scope as JS legacy'] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_1 = [ [i, [j, j] ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
    "var destarray_comparray_2 = [ [i, {i: [i, j]} ] for each ([i, j] in [[0,0], [1,1], [2,2]])];",
  ];
  TestRun(test)
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(1, "Expected 'for' and instead saw '['.")
    .addError(1, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(2, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(2, "Expected 'for' and instead saw '['.")
    .addError(2, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .addError(3, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(3, "Expected 'for' and instead saw '['.")
    .addError(3, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: array comprehension imbrication with dest array"] = function (test) {
  var code = [
    "[for ([i, j] of [for ([a, b] of [[2,2], [3,4]]) [a, b] ]) [i, j] ];"
  ];

  TestRun(test)
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: moz-style array comprehension imbrication with dest array"] = function (test) {
  var code = [
    "[ [i, j] for ([i, j] in [[a, b] for each ([a, b] in [[2,2], [3,4]])]) ];"
  ];

  TestRun(test)
    .test(code, {moz: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: moz-style array comprehension imbrication with dest array using for..of"] = function (test) {
  var code = [
    "[ [i, j] for ([i, j] of [[a, b] for ([a, b] of [[2,2], [3,4]])]) ];"
  ];

  TestRun(test)
    .test(code, {moz: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: moz-style array comprehension imbrication with dest array as esnext"] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[a, b] for each ([a, b] in [[2,2], [3,4]])]) ];"
  ];
  TestRun(test)
    .addError(1, "Expected 'for' and instead saw '['.")
    .addError(1, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: array comprehension imbrication with dest array as es5"] = function (test) {
  var code = [
    "[for ([i, j] of [for ([a, b] of [[2,2], [3,4]]) [a, b] ]) [i, j] ];"
  ];
  TestRun(test)
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: moz-style array comprehension imbrication with dest array as es5"] = function (test) {
  var code = [
    "[for ([i, j] of [for ([a, b] of [[2,2], [3,4]]) [a, b] ]) [i, j] ];"
  ];
  TestRun(test)
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: array comprehension imbrication with dest array as legacy JS"] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[a, b] for each ([a, b] in [[2,2], [3,4]])]) ];"

  ];
  TestRun(test)
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(1, "Expected 'for' and instead saw '['.")
    .addError(1, "Expected 'for' and instead saw '['.")
    .addError(1, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: moz-style array comprehension imbrication with dest array as legacy JS"] = function (test) {
  var code = [
    "[ [i, j] for each ([i, j] in [[a, b] for each ([a, b] in [[2,2], [3,4]])]) ];"

  ];
  TestRun(test)
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(1, "'array comprehension' is only available in ES6 " +
      "(use esnext option).")
    .addError(1, "Expected 'for' and instead saw '['.")
    .addError(1, "Expected 'for' and instead saw '['.")
    .addError(1, "'for each' is only available in Mozilla JavaScript extensions (use moz option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: no false positive array comprehension"] = function (test) {
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
    .addError(4, "'catch filter' is only available in Mozilla JavaScript extensions " +
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
    .addError(4, "'catch filter' is only available in Mozilla JavaScript extensions " +
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
    .addError(4, "'catch filter' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: function closure expression"] = function (test) {
  var code = [
    "let (arr = [1,2,3]) {",
    "  arr.every(function (o) o instanceof Object);",
    "}"
  ];
  TestRun(test)
    .test(code, {es3: true, moz: true, undef: true});

  test.done();
};

exports["test: function closure expression as esnext"] = function (test) {
  var code = [
    "var arr = [1,2,3];",
    "arr.every(function (o) o instanceof Object);",
  ];
  TestRun(test)
    .addError(2, "'function closure expressions' is only available in Mozilla JavaScript " +
      "extensions (use moz option).")
    .test(code, {esnext: true, undef: true});

  test.done();
};

exports["test: function closure expression as es5"] = function (test) {
  var code = [
    "var arr = [1,2,3];",
    "arr.every(function (o) o instanceof Object);",
  ];
  TestRun(test)
    .addError(2, "'function closure expressions' is only available in Mozilla JavaScript " +
      "extensions (use moz option).")
    .test(code, {undef: true}); // es5

  test.done();
};

exports["test: function closure expression as legacy JS"] = function (test) {
  var code = [
    "var arr = [1,2,3];",
    "arr.every(function (o) o instanceof Object);",
  ];
  TestRun(test)
    .addError(2, "'function closure expressions' is only available in Mozilla JavaScript " +
      "extensions (use moz option).")
    .test(code, {es3: true, undef: true});

  test.done();
};

exports["test: for of as esnext"] = function (test) {
  var code = [
    "for (let x of [1,2,3,4]) {",
    "    print(x);",
    "}",
    "for (let x of [1,2,3,4]) print(x);"
  ];
  TestRun(test)
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: for of as es5"] = function (test) {
  var code = [
    "for (let x of [1,2,3,4]) {",
    "    print(x);",
    "}",
    "for (let x of [1,2,3,4]) print(x);"
  ];
  TestRun(test)
    .addError(1, "'for of' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'for of' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: for of as legacy JS"] = function (test) {
  var code = [
    "for (let x of [1,2,3,4]) {",
    "    print(x);",
    "}",
    "for (let x of [1,2,3,4]) print(x);"
  ];
  TestRun(test)
    .addError(1, "'for of' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'for of' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: try multi-catch for moz extensions"] = function (test) {
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

exports["test: try multi-catch as esnext"] = function (test) {
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
    .addError(5, "'multiple catch blocks' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .test(code, {esnext: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: try multi-catch as es5"] = function (test) {
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
    .addError(5, "'multiple catch blocks' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .test(code, {undef: true, predef: ["print"]}); // es5

  test.done();
};

exports["test: try multi-catch as legacy JS"] = function (test) {
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
    .addError(5, "'multiple catch blocks' is only available in Mozilla JavaScript extensions " +
      "(use moz option).")
    .test(code, {es3: true, undef: true, predef: ["print"]});

  test.done();
};

exports["test: no let not directly within a block"] = function (test) {
  var code = [
    "if (true) let x = 1;",
    "function foo() {",
    "   if (true)",
    "       let x = 1;",
    "}",
    "if (true) let (x = 1) print(x);",
    "for (let x = 0; x < 42; ++x) let a = 1;",
    "for (let x in [1, 2, 3, 4] ) let a = 1;",
    "for (let x of [1, 2, 3, 4] ) let a = 1;",
    "while (true) let a = 1;",
    "if (false) let a = 1; else if (true) let a = 1; else let a = 2;"
  ];

  TestRun(test)
    .addError(1, "Let declaration not directly within block.")
    .addError(4, "Let declaration not directly within block.")
    .addError(7, "Let declaration not directly within block.")
    .addError(8, "Let declaration not directly within block.")
    .addError(9, "Let declaration not directly within block.")
    .addError(10, "Let declaration not directly within block.")
    .addError(11, "Let declaration not directly within block.")
    .addError(11, "Let declaration not directly within block.")
    .addError(11, "Let declaration not directly within block.")
    .test(code, {moz: true, predef: ["print"]});

  test.done();
};

exports["regression test for crash from GH-964"] = function (test) {
  var code = [
    "function test(a, b) {",
    "  return a[b] || a[b] = new A();",
    "}"
  ];

  TestRun(test)
    .addError(2, "Bad assignment.")
    .addError(2, "Expected an operator and instead saw 'new'.")
    .addError(2, "Missing semicolon.")
    .test(code);

  test.done();
};

exports["regression test for GH-890"] = function (test) {
  var code = [
    "var a = 1; ",
    "  ",
    "var b;"
  ];

  TestRun(test)
    .addError(1, "Trailing whitespace.")
    .test(code, { trailing: true });

  test.done();
};

exports["automatic comma insertion GH-950"] = function (test) {
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
  ];

  var run = TestRun(test)
    .addError(2, "Bad line breaking before 'instanceof'.")
    .addError(6, "Bad line breaking before '&&'.")
    .addError(8, "Line breaking error 'return'.")
    .addError(9, "Label 'a' on 1 statement.")
    .addError(9, "Expected an assignment or function call and instead saw an expression.");

  run.test(code, {es3: true, asi: true});
  run.test(code, {asi: true}); // es5
  run.test(code, {esnext: true, asi: true});
  run.test(code, {moz: true, asi: true});

  run = TestRun(test)
    .addError(2, "Bad line breaking before 'instanceof'.")
    .addError(3, "Missing semicolon.")
    .addError(4, "Missing semicolon.")
    .addError(6, "Bad line breaking before '&&'.")
    .addError(8, "Line breaking error 'return'.")
    .addError(8, "Missing semicolon.")
    .addError(9, "Label 'a' on 1 statement.")
    .addError(9, "Expected an assignment or function call and instead saw an expression.")
    .addError(9, "Missing semicolon.");

  run.test(code, {es3: true, asi: false});
  run.test(code, {asi: false}); // es5
  run.test(code, {esnext: true, asi: false});
  run.test(code, {moz: true, asi: false});

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
  ];

  var run = TestRun(test)
    .addError(5, "'evens' is not defined.")
    .addError(6, "'nats' is not defined.")
    .addError(8, "'print' is not defined.")
    .addError(9, "'print' is not defined.")
    .addError(9, "'j' is not defined.")
    .addError(8, "'z' is not defined.");

  run.test(code, { undef: true, esnext: true });
  run.test(code, { undef: true, moz: true });

  run = TestRun(test)
    .addError(1, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(1, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(2, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(3, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(11, "'const' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(13, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).");

  run.test(code); // es5
  run.test(code, {es3: true});

  test.done();
};

exports["concise methods support"] = function (test) {
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
    .addError(2, "'concise methods' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'generator functions' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'concise methods' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'yield' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).");

  run.test(code); // es5
  run.test(code, {es3: true});

  test.done();
};

exports["concise methods support for 'get' and 'set' function names"] = function (test) {
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

exports["concise methods support for 'get' without 'set'"] = function (test) {
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

exports["concise methods support for 'set' without 'get'"] = function (test) {
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

exports["spread rest operator support"] = function (test) {
  var code = [
    // spread operator
    "function foo(a, b, c) {",
    "    console.log(a, b, c); ",
    "}",
    "var args = [ 0, 1, 2 ];",
    "foo(...args);",

    // spread operator
    "let initial = [ 1, 2, 3, 4, 5 ];",
    "let extended = [ ...initial, 6, 7, 8, 9 ];",

    // rest operator
    "(function foo(i, j, ...args) {",
    "    return args;",
    "}());",

    // rest operator on a fat arrow function
    "let bar = (...args) => args;"
  ];

  var run = TestRun(test);
  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  run = TestRun(test)
    .addError(5, "'spread/rest operator' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'spread/rest operator' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(8, "'spread/rest operator' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
     .addError(11, "'let' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
     .addError(11, "'spread/rest operator' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
     .addError(11, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
     .addError(11, "'spread/rest operator' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).");

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
    .addError(cdecl + 4, "Expected an identifier and instead saw 'package' (a reserved word).")
    .addError(cexpr + 4, "Expected an identifier and instead saw 'package' (a reserved word).");

  run.test(code, {esnext: true});
  run.test(code, {moz: true});

  run
    .addError(cdecl + 1, "'Foo0' is defined but never used.")
    .addError(cdecl + 3, "Expected an identifier and instead saw 'protected' (a reserved word).")
    .addError(cdecl + 3, "'protected' is defined but never used.")
    .addError(cdecl + 4, "'package' is defined but never used.");
  run
    .addError(cexpr + 1, "'Foo7' is defined but never used.")
    .addError(cexpr + 3, "Expected an identifier and instead saw 'static' (a reserved word).")
    .addError(cexpr + 3, "'static' is defined but never used.")
    .addError(cexpr + 3, "Expected an identifier and instead saw 'protected' (a reserved word).")
    .addError(cexpr + 4, "'package' is defined but never used.");

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
    "}"
  ];
  var run = TestRun(test)
    .addError(1, "Expected an identifier and instead saw 'eval' (a reserved word).")
    .addError(2, "Expected an identifier and instead saw 'arguments' (a reserved word).")
    .addError(4, "A class getter method cannot be named 'constructor'.")
    .addError(5, "A class setter method cannot be named 'constructor'.")
    .addError(7, "A class method cannot be named 'prototype'.");

  run.test(code, {esnext: true});

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

  for (var i = 0; i < code.length; i++) {
    run.addError(i + 1, "Expected a conditional expression and instead saw an assignment.");
  }

  run.test(code);

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
    .addError(1, "Expected a conditional expression and instead saw an assignment.")
    .addError(4, "Expected a conditional expression and instead saw an assignment.");

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
    .addError(9, "Expected an assignment or function call and instead saw an expression.");

  run.test(code, {moz: true});

  run
    .addError(4, "'function closure expressions' is only available in Mozilla JavaScript " +
        "extensions (use moz option).");
  run.test(code);

  test.done();
};

exports["test for GH-1103"] = function (test) {
  var code = [ "var ohnoes = 42;" ];

  var run = TestRun(test);

  var patch = true;

  JSHINT.addModule(function (linter) {
    if (!patch) {
      return;
    }
    patch = false;

    var ohnoes = "oh noes";
    Array.prototype.ohnoes = function () {
      linter.warn("E024", { line: 1, char: 1, data: [ ohnoes += "!" ] });
    };
  });

  run.test(code);

  test.done();

  delete Array.prototype.ohnoes;
};

exports["test for GH-1105"] = function (test) {
  var code = [
    "while (true) {",
    "    if (true) { break }",
    "}"
  ];

  var run = TestRun(test)
    .addError(2, "Missing semicolon.");

  run.test(code);
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
    .addError(1, "Expected an identifier and instead saw ')'.")
    .addError(1, "Expected ')' to match '(' from line 1 and instead saw ';'.")
    .addError(2, "Expected an identifier and instead saw ','.")
    .addError(3, "Unexpected ')'.")
    .addError(4, "Expected an identifier and instead saw ','.")
    .addError(4, "Expected ')' to match '(' from line 4 and instead saw 'b'.")
    .addError(4, "Expected an identifier and instead saw ')'.")
    .addError(6, "Expected an identifier and instead saw ','.")
    .addError(7, "Unexpected ')'.")
    .addError(7, "Expected an identifier and instead saw ')'.")
    .addError(7, "Expected ')' to match '(' from line 7 and instead saw ';'.")
    .addError(8, "Expected an identifier and instead saw ','.")
    .addError(8, "Expected ')' to match '(' from line 8 and instead saw 'b'.")
    .addError(8, "Expected an identifier and instead saw ')'.");

  run.test(code, {asi: true, expr: true});
  test.done();
};

exports["test 'yield' in compound expressions."] = function (test) {
  var code = fs.readFileSync(path.join(__dirname, "./fixtures/yield-expressions.js"), "utf8");

  var run = TestRun(test)
    .addError(22, "Did you mean to return a conditional instead of an assignment?")
    .addError(31, "Did you mean to return a conditional instead of an assignment?");

  run.test(code, {maxerr: 1000, expr: true, esnext: true});

  // These are line-column pairs for the Mozilla paren errors.
  var needparen = [
    // comma
    [ 5,  5], [ 6,  8], [ 7,  5], [11,  5], [12,  8], [13,  5],
    // yield in yield
    [18, 11], [19, 17], [19, 11], [20, 11], [20,  5], [21, 11], [21,  5], [21, 26], [22, 22],
    [23, 22], [23, 11], [27, 11], [28, 17], [28, 11], [29, 11], [29,  5], [30, 11], [30,  5],
    [30, 24], [31, 22], [32, 11], [32, 20],
    // infix
    [51, 10], [53, 10], [54, 16], [57, 10], [58,  5], [59, 10], [60,  5], [60, 14],
    // prefix
    [64,  6], [65,  7], [66,  6], [67,  7], [70,  6], [71,  7],
    // ternary
    [77,  5], [78,  5], [78, 13], [79,  5], [79, 13], [79, 41], [82,  5], [83,  5], [83, 13],
    [84,  5], [84, 13], [84, 37]
  ];

  needparen.forEach(function (lc) {
    run.addError(lc[0], "Mozilla requires the yield expression to be parenthesized here.",
                 {character: lc[1]});
  });

  run
    .addError(1, "'function*' is only available in ES6 (use esnext option).")
    .addError(74, "'function*' is only available in ES6 (use esnext option).");

  run.test(code, {maxerr: 1000, expr: true, moz: true});

  test.done();
};

exports["test for GH-387"] = function (test) {
  var code = [
    "var foo = a",
    "delete foo.a;"
  ];

  var run = TestRun(test)
    .addError(1, "Missing semicolon.");

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
    .addError(3, "Bad line breaking before 'c'.")
    .addError(6, "Bad line breaking before '+'.")
    .addError(8, "Comma warnings can be turned off with 'laxcomma'.")
    .addError(7, "Bad line breaking before ','.")
    .addError(10, "Bad line breaking before '?'.")
    .addError(14, "Bad line breaking before '+'.");

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
    .addError(1, "'function*' is only available in ES6 (use esnext option).")
    .addError(3, "Expected ')' to match '(' from line 2 and instead saw 'c'.")
    .addError(4, "Expected an identifier and instead saw ')'.")
    .addError(4, "Expected an assignment or function call and instead saw an expression.")
    .addError(6, "Expected an assignment or function call and instead saw an expression.")
    .addError(8, "Comma warnings can be turned off with 'laxcomma'.")
    .addError(7, "Bad line breaking before ','.")
    .addError(10, "Expected an identifier and instead saw '?'.")
    .addError(10, "Expected an assignment or function call and instead saw an expression.")
    .addError(10, "Label 'i' on j statement.")
    .addError(10, "Expected an assignment or function call and instead saw an expression.")
    .addError(14, "Expected an assignment or function call and instead saw an expression.");

  run.test(code, {moz: true, asi: true});

  run
    .addError(2, "Line breaking error 'yield'.")
    .addError(3, "Missing semicolon.")
    .addError(5, "Line breaking error 'yield'.")
    .addError(5, "Missing semicolon.")
    .addError(7, "Line breaking error 'yield'.")
    .addError(9, "Line breaking error 'yield'.")
    .addError(9, "Missing semicolon.")
    .addError(10, "Missing semicolon.")
    .addError(11, "Line breaking error 'yield'.")
    .addError(13, "Line breaking error 'yield'.")
    .addError(13, "Missing semicolon.");

  run.test(code, {moz: true});
  test.done();
};

exports["regression for GH-1227"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/gh1227.js", "utf8");

  TestRun(test)
    .addError(14, "Unreachable 'return' after 'return'.")
    .test(src);

  test.done();
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
    .addError(9, "Expected a 'break' statement before 'default'.")
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
    .addError(11, "Expected a 'break' statement before 'default'.")
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

exports["/*jshint ignore */ should be a good option and only accept start, end or line as values"] = function (test) {
  var code = [
    "/*jshint ignore:start*/",
    "/*jshint ignore:end*/",
    "/*jshint ignore:line*/",
    "/*jshint ignore:badvalue*/"
  ];

  TestRun(test)
    .addError(4, "Bad option value.")
    .test(code);

  test.done();
};

exports["/*jshint ignore */ should allow the linter to skip blocked-out lines to continue finding errors in the rest of the code"] = function (test) {
  var code = fs.readFileSync(__dirname + "/fixtures/gh826.js", "utf8");

  TestRun(test)
    .addError(33, "Mixed spaces and tabs.")
    .test(code);

  test.done();
};

exports["/*jshint ignore */ should be detected even with leading and/or trailing whitespace"] = function (test) {
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
    .addError(4, "Missing semicolon.")
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
    .addError(1, "Use '!==' to compare with 'null'.")
    .addError(1, "Expected ';' and instead saw ')'.")
    .addError(1, "Expected ')' and instead saw ';'.")
    .addError(1, "Expected an identifier and instead saw ';'.")
    .addError(1, "Expected ')' to match '(' from line 1 and instead saw 'i'.")
    .addError(1, "Expected an identifier and instead saw ')'.")
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
    .addError(4, "'b' is defined but never used.")
    .test(code, { unused: true });

  test.done();
};

exports["test destructuring function parameters as es5"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/destparam.js", "utf8");
  TestRun(test)
    .addError(4, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(10, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(10, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(11, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(11, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(14, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(14, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(15, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(15, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(16, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(16, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(16, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(17, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(17, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(18, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(18, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(21, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(21, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(21, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(22, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(22, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(22, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(23, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(23, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(23, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(24, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(24, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(24, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(27, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(27, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(27, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(28, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(28, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(28, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(29, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(29, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(29, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(30, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(30, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(30, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(31, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(31, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(31, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
  .test(src, {unused: true, undef: true, maxerr: 100});

  test.done();
};

exports["test destructuring function parameters as legacy JS"] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/destparam.js", "utf8");
  TestRun(test)
    .addError(4, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(4, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(5, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(6, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(7, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(10, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(10, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(11, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(11, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(14, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(14, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(15, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(15, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(16, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(16, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(16, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(17, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(17, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(18, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(18, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(21, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(21, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(21, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(22, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(22, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(22, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(23, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(23, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(23, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(24, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(24, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(24, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(27, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(27, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(27, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(28, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(28, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(28, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(29, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(29, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(29, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(30, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(30, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(30, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(31, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(31, "'destructuring expression' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(31, "'arrow function syntax (=>)' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
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
    .addError(1, "Expected an identifier and instead saw 'var'.")
    .addError(1, "Expected ']' to match '[' from line 1 and instead saw 'foo'.")
    .addError(1, "Expected an identifier and instead saw ']'.")
    .addError(1, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, "Missing semicolon.")
    .test("[var foo = 1;]");
  test.done();
};

exports["make sure we don't throw errors on removed options"] = function (test) {
  TestRun(test).test("a();", { nomen: true });
  test.done();
};
