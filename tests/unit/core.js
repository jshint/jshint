"use strict";

var JSHINT  = require("../..").JSHINT;
var fs      = require('fs');
var TestRun = require("../helpers/testhelper").setup.testRun;

/**
 * JSHint allows you to specify custom globals as a parameter to the JSHINT
 * function so it is not necessary to spam code with jshint-related comments
 */
exports.testCustomGlobals = function (test) {
  var code   = '(function (test) { return [ fooGlobal, barGlobal ]; }());';
  var custom = { fooGlobal: false, barGlobal: false };

  test.ok(JSHINT(code, {}, custom));

  var report = JSHINT.data();
  test.strictEqual(report.implieds, undefined);
  test.equal(report.globals.length, 2);

  var dict = {};
  for (var i = 0, g; g = report.globals[i]; i += 1)
    dict[g] = true;

  var customKeys = Object.keys(custom);
  for (i = 0, g = null; g = customKeys[i]; i += 1)
    test.ok(g in dict);

  // Regression test (GH-665)
  code = [
    "/*global bar*/",
    "foo = {};",
    "bar = {};"
  ];

  TestRun(test)
    .addError(2, 1, "Read only.")
    .addError(3, 1, "Read only.")
    .test(code, { es3: true, unused: true, predef: { foo: false }});

  JSHINT("x = null;", { undef: true, globals: { x: true } });

  test.ok(!JSHINT.data().errors);

  JSHINT("x = null;", { undef: true, globals: { x: false } });

  test.equal(JSHINT.data().errors.length, 1);

  JSHINT("parseInt('');", { undef: true, globals: { "-parseInt": true } });

  test.equal(JSHINT.data().errors.length, 1);

  JSHINT('x = null;', { undef: true, globals: { x: false } }, { x: true });

  test.ok(
    !JSHINT.data().errors,
    "`predef` parameter takes precedence over `globals` option"
  );

  JSHINT("x = null;", { undef: true, globals: { x: true } }, { x: false });

  test.equal(
    JSHINT.data().errors.length,
    1,
    "`predef` parameter takes precedence over `globals` option"
  );

  test.done();
};

exports.testUnusedDefinedGlobals = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/unusedglobals.js", "utf8");

  TestRun(test)
    .addError(2, 1, "'bar' is defined but never used.")
    .test(src, { es3: true, unused: true });

  test.done();
};

exports.testImplieds = function (test) {
  var src = [
    "f = 0;",
    "(function() {",
    "  g = 0;",
    "}());",
    "h = 0;"
  ];
  var report;

  TestRun(test).test(src);
  report = JSHINT.data();

  test.deepEqual(
    report.implieds,
    [
      { name: "f", line: [1] },
      { name: "g", line: [3] },
      { name: "h", line: [5] }
    ]
  );

  TestRun(test)
    .test("__proto__ = 0;", { proto: true });
  report = JSHINT.data();

  test.deepEqual(report.implieds, [ { name: "__proto__", line: [1] } ]);

  test.done();
};

exports.testExportedDefinedGlobals = function (test) {
  var src = ["/*global foo, bar */",
    "export { bar, foo };"];

  // Test should pass
  TestRun(test).test(src, { esnext: true, unused: true }, {});

  var report = JSHINT.data();
  test.deepEqual(report.globals, ['bar', 'foo']);

  test.done();
};

exports.testGlobalVarDeclarations = function (test) {
  var src = "var a;";

  TestRun(test).test(src, { es3: true }, {});

  var report = JSHINT.data();
  test.deepEqual(report.globals, ['a']);

  TestRun(test).test(src, { es3: true, node: true }, {});

  report = JSHINT.data();
  test.strictEqual(report.globals, undefined);

  TestRun(test).test("var __proto__;", { proto: true });
  report = JSHINT.data();
  test.deepEqual(report.globals, ["__proto__"]);

  test.done();
};

exports.globalDeclarations = function (test) {
  var src = "exports = module.exports = function (test) {};";

  // Test should pass
  TestRun(test).test(src, { es3: true, node: true }, { exports: true });

  // Test should pass as well
  src = [
    "/*jshint node:true */",
    "/*global exports:true */",
    "exports = module.exports = function (test) {};"
  ];

  TestRun(test).test(src.join('\n'));

  test.done();
};

exports.multilineGlobalDeclarations = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/multiline-global-declarations.js", "utf8");

  TestRun(test)
    .addError(12, 1, "'pi' is defined but never used.")
    .test(src, { unused: true });

  test.done();
};

/** Test that JSHint recognizes `new Array(<expr>)` as a valid expression */
exports.testNewArray = function (test) {
  var code  = 'new Array(1);';
  var code1 = 'new Array(v + 1);';
  var code2 = 'new Array("hello", "there", "chaps");';

  TestRun(test).test(code);
  TestRun(test).test(code1);
  TestRun(test).test(code2);

  TestRun(test)
    .addError(1, 10, "The array literal notation [] is preferable.")
    .test('new Array();');

  test.done();
};

/** Test that JSHint recognizes `new foo.Array(<expr>)` as a valid expression #527 **/
exports.testNewNonNativeArray = function (test) {
  var code  = 'new foo.Array();';
  var code1 = 'new foo.Array(1);';
  var code2 = 'new foo.Array(v + 1);';
  var code3 = 'new foo.Array("hello", "there", "chaps");';

  TestRun(test).test(code);
  TestRun(test).test(code1);
  TestRun(test).test(code2);
  TestRun(test).test(code3);

  test.done();
};

exports.testNonNativeArray = function (test) {
  var code1 = 'foo.Array();';
  var code2 = 'foo.Array(v + 1);';
  var code3 = 'foo.Array("hello", "there", "chaps");';

  TestRun(test).test(code1);
  TestRun(test).test(code2);
  TestRun(test).test(code3);

  test.done();
};


/** Test that JSHint recognizes `new Object(<expr>)` as a valid expression */
exports.testNewObject = function (test) {
  var code  = 'Object(1);';
  var code1 = 'new Object(1);';

  TestRun(test).test(code);
  TestRun(test).test(code1);

  TestRun(test)
    .addError(1, 7, "The object literal notation {} is preferable.")
    .test('Object();');

  TestRun(test)
    .addError(1, 11, "The object literal notation {} is preferable.")
    .test('new Object();');

  test.done();
};

/** Test that JSHint recognizes `new foo.Object(<expr>)` as a valid expression #527 **/
exports.testNewNonNativeObject = function (test) {
  var code  = 'new foo.Object();';
  var code1 = 'new foo.Object(1);';
  var code2 = 'foo.Object();';
  var code3 = 'foo.Object(1);';

  TestRun(test).test(code);
  TestRun(test).test(code1);
  TestRun(test).test(code2);
  TestRun(test).test(code3);

  test.done();
};

exports.testNewArrowFn = function (test) {
  TestRun(test)
    .addError(1, 5, "Unexpected '('.")
    .addError(1, 12, "Bad constructor.")
    .addError(1, 12, "Missing '()' invoking a constructor.")
    .test("new () => {};", {esversion: 6});

  test.done();
};

/**
 * Test that JSHint allows `undefined` to be a function parameter.
 * It is a common pattern to protect against the case when somebody
 * overwrites undefined. It also helps with minification.
 *
 * More info: https://gist.github.com/315916
 */
exports.testUndefinedAsParam = function (test) {
  var code  = '(function (undefined) {}());';
  var code1 = 'var undefined = 1;';

  TestRun(test).test(code);

  // But it must never tolerate reassigning of undefined
  TestRun(test)
    .addError(1, 5, "Redefinition of 'undefined'.")
    .test(code1);

  test.done();
};

/** Tests that JSHint accepts new line after a dot (.) operator */
exports.newLineAfterDot = function (test) {
  TestRun(test).test([ "chain().chain().", "chain();" ]);
  test.done();
};

/**
 * JSHint does not tolerate deleting variables.
 * More info: http://perfectionkills.com/understanding-delete/
 */
exports.noDelete = function (test) {
  TestRun(test)
    .addError(1, 21, 'Variables should not be deleted.')
    .test('delete NullReference;');

  test.done();
};

/**
 * JSHint allows case statement fall through only when it is made explicit
 * using special comments.
 */
exports.switchFallThrough = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/switchFallThrough.js', 'utf8');
  TestRun(test)
    .addError(3, 18, "Expected a 'break' statement before 'case'.")
    .addError(40, 12, "Unexpected ':'.")
    .test(src);

  test.done();
};

// GH-490: JSHint shouldn't require break before default if default is
// the first switch statement.
exports.switchDefaultFirst = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/switchDefaultFirst.js", "utf8");

  TestRun(test)
    .addError(5, 16, "Expected a 'break' statement before 'default'.")
    .test(src);

  test.done();
};

exports.testVoid = function (test) {
  var code = [
    "void(0);",
    "void 0;",
    "var a = void(1);"
  ];
  TestRun(test).test(code);

  test.done();
};

exports.functionScopedOptions = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/functionScopedOptions.js', 'utf8');
  TestRun(test)
    .addError(1, 1, "eval can be harmful.")
    .addError(8, 1, "eval can be harmful.")
    .test(src);

  test.done();
};

/** JSHint should not only read jshint, but also jslint options */
exports.jslintOptions = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/jslintOptions.js', 'utf8');
  TestRun(test).test(src);

  test.done();
};

exports.jslintInverted = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/jslintInverted.js', 'utf8');
  TestRun(test).test(src);

  test.done();
};

exports.jslintRenamed = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/jslintRenamed.js', 'utf8');
  TestRun(test)
    .addError(4, 9, "Expected '===' and instead saw '=='.")
    .test(src);

  test.done();
};

exports.jslintSloppy = function (test) {
  var src = "/*jslint sloppy:true */ function test() { return 1; }";

  TestRun(test)
    .test(src);

  test.done();
};

/** JSHint should ignore unrecognized jslint options */
exports.jslintUnrecognized = function (test) {
  var src = "/*jslint closure:true */ function test() { return 1; }";

  TestRun(test)
    .test(src);

  test.done();
};

exports.caseExpressions = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/caseExpressions.js', 'utf8');
  TestRun(test)
    .test(src);

  test.done();
};

exports.returnStatement = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/return.js', 'utf8');

  TestRun(test)
    .addError(3, 14, "Did you mean to return a conditional instead of an assignment?")
    .addError(38, 5, "Line breaking error 'return'.")
    .addError(38, 11, "Missing semicolon.")
    .addError(39, 7, "Unnecessary semicolon.")
    .test(src, { es3: true });

  test.done();
};

exports.argsInCatchReused = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/trycatch.js', 'utf8');
  TestRun(test)
    .addError(6, 13, "'e' is already defined.")
    .addError(12, 9, "Do not assign to the exception parameter.")
    .addError(13, 9, "Do not assign to the exception parameter.")
    .addError(24, 9, "'e' is not defined.")
    .test(src, { es3: true, undef: true });

  test.done();
};

exports.testRawOnError = function (test) {
  JSHINT(';', { maxerr: 1 });
  test.equal(JSHINT.errors[0].raw, 'Unnecessary semicolon.');
  test.equal(JSHINT.errors[1].raw, 'Too many errors.');
  test.equal(JSHINT.errors[2], null);

  test.done();
};

exports.yesEmptyStmt = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/emptystmt.js', 'utf8');

  TestRun(test)
    .addError(1, 4, "Expected an identifier and instead saw ';'.")
    .addError(6, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(10, 2, "Unnecessary semicolon.")
    .addError(17, 11, "Unnecessary semicolon.")
    .test(src, { es3: true, curly: false });

  TestRun(test)
    .addError(1, 4, "Expected an identifier and instead saw ';'.")
    .addError(10, 2, "Unnecessary semicolon.")
    .addError(17, 11, "Unnecessary semicolon.")
    .test(src, { es3: true, curly: false, expr: true });

  test.done();
};

exports.insideEval = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/insideEval.js', 'utf8');

  TestRun(test)
    .addError(1, 1, "eval can be harmful.")
    .addError(3, 1, "eval can be harmful.")
    .addError(5, 1, "eval can be harmful.")
    .addError(7, 1, "eval can be harmful.")
    .addError(9, 1, "eval can be harmful.")
    .addError(11, 1, "Implied eval. Consider passing a function instead of a string.")
    .addError(13, 1, "Implied eval. Consider passing a function instead of a string.")
    .addError(15, 7, "Implied eval. Consider passing a function instead of a string.")
    .addError(17, 7, "Implied eval. Consider passing a function instead of a string.")

    // The "TestRun" class (and these errors) probably needs some
    // facility for checking the expected scope of the error
    .addError(13, 17, "Unexpected early end of program.")
    .addError(13, 17, "Unrecoverable syntax error. (100% scanned).")
    .addError(17, 17, "Unexpected early end of program.")
    .addError(17, 17, "Unrecoverable syntax error. (100% scanned).")

    .test(src, { es3: true, evil: false });

  // Regression test for bug GH-714.
  JSHINT(src, { evil: false, maxerr: 1 });
  var err = JSHINT.data().errors[1];
  test.equal(err.raw, "Too many errors.");
  test.equal(err.scope, "(main)");

  test.done();
};

exports.escapedEvil = function (test) {
  var code = [
    "\\u0065val(\"'test'\");"
  ];

  TestRun(test)
    .addError(1, 1, "eval can be harmful.")
    .test(code, { evil: false });

  test.done();
};

// Regression test for GH-394.
exports.noExcOnTooManyUndefined = function (test) {
  var code = 'a(); b();';

  try {
    JSHINT(code, {undef: true, maxerr: 1});
  } catch (e) {
    test.ok(false, 'Exception was thrown');
  }

  TestRun(test)
    .addError(1, 1, "'a' is not defined.")
    .addError(1, 6, "'b' is not defined.")
    .test(code, { es3: true, undef: true });

  test.done();
};

exports.defensiveSemicolon = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/gh-226.js', 'utf8');

  TestRun(test)
    .addError(16, 1, "Unnecessary semicolon.")
    .addError(17, 2, "Unnecessary semicolon.")
    .test(src, { es3: true, expr: true, laxbreak: true });

  test.done();
};

// Test different variants of IIFE
exports.iife = function (test) {
  var iife = [
    '(function (test) { return; }());',
    '(function (test) { return; })();'
  ];

  TestRun(test).test(iife.join('\n'));

  test.done();
};

// Tests invalid options when they're passed as function arguments
// For code that tests /*jshint ... */ see parser.js
exports.invalidOptions = function (test) {
  TestRun(test)
    .addError(0, 0, "Bad option: 'invalid'.")
    .test("function test() {}", { es3: true, devel: true, invalid: true });

  test.done();
};

exports.multilineArray = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/gh-334.js', 'utf8');

  TestRun(test).test(src);

  test.done();
};

exports.testInvalidSource = function (test) {
  TestRun(test)
    .addError(0, undefined, "Input is neither a string nor an array of strings.")
    .test(undefined);

  TestRun(test)
    .addError(0, undefined, "Input is neither a string nor an array of strings.")
    .test(null);

  TestRun(test)
    .addError(0, undefined, "Input is neither a string nor an array of strings.")
    .test({}, {es3: true});

  TestRun(test)
    .test("", {es3: true});

  TestRun(test)
    .test([], {es3: true});

  test.done();
};

exports.testConstructor = function (test) {
  var code = "new Number(5);";

  TestRun(test)
    .addError(1, 1, "Do not use Number as a constructor.")
    .test(code, {es3: true});

  test.done();
};

exports.missingRadix = function (test) {
  var code = "parseInt(20);";

  TestRun(test)
    .addError(1, 12, "Missing radix parameter.")
    .test(code, {es3: true});

  TestRun(test).test(code);

  test.done();
};

exports.NumberNaN = function (test) {
  var code = "(function (test) { return Number.NaN; })();";
  TestRun(test).test(code, {es3: true});

  test.done();
};

exports.htmlEscapement = function (test) {
  TestRun(test).test("var a = '<\\!--';", {es3: true});
  TestRun(test)
    .test("var a = '\\!';", {es3: true});

  test.done();
};

// GH-551 regression test.
exports.testSparseArrays = function (test) {
  var src = "var arr = ['a',, null,, '',, undefined,,];";

  TestRun(test)
    .addError(1, 16, "Extra comma. (it breaks older versions of IE)")
    .addError(1, 23, "Extra comma. (it breaks older versions of IE)")
    .addError(1, 28, "Extra comma. (it breaks older versions of IE)")
    .addError(1, 40, "Extra comma. (it breaks older versions of IE)")
    .test(src, {es3: true});

  TestRun(test)
    .test(src, { elision: true }); // es5

  test.done();
};

exports.testReserved = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/reserved.js", "utf8");

  TestRun(test)
    .addError(1, 1, "Expected an identifier and instead saw 'volatile' (a reserved word).")
    .addError(13, 13, "Expected an identifier and instead saw 'class' (a reserved word).")
    .addError(14, 5, "Expected an identifier and instead saw 'else' (a reserved word).")
    .addError(15, 5, "Expected an identifier and instead saw 'protected' (a reserved word).")
    .test(src, {es3: true});

  TestRun(test)
    .addError(10, 7, "Expected an identifier and instead saw 'let' (a reserved word).")
    .test(src, {}); // es5

  test.done();
};

// GH-744: Prohibit the use of reserved words as non-property
// identifiers.
exports.testES5Reserved = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/es5Reserved.js", "utf8");

  TestRun(test)
    .addError(2, 3, "Expected an identifier and instead saw 'default' (a reserved word).")
    .addError(3, 3, "Unexpected 'in'.")
    .addError(3, 3, "Expected an identifier and instead saw 'in' (a reserved word).")
    .addError(6, 5, "Expected an identifier and instead saw 'default' (a reserved word).")
    .addError(7, 10, "Expected an identifier and instead saw 'new' (a reserved word).")
    .addError(8, 12, "Expected an identifier and instead saw 'class' (a reserved word).")
    .addError(9, 3, "Expected an identifier and instead saw 'default' (a reserved word).")
    .addError(10, 3, "Expected an identifier and instead saw 'in' (a reserved word).")
    .addError(11, 10, "Expected an identifier and instead saw 'in' (a reserved word).")
    .test(src, {es3: true});

  TestRun(test)
    .addError(6, 5, "Expected an identifier and instead saw 'default' (a reserved word).")
    .addError(7, 10, "Expected an identifier and instead saw 'new' (a reserved word).")
    .addError(8, 12, "Expected an identifier and instead saw 'class' (a reserved word).")
    .addError(11, 10, "Expected an identifier and instead saw 'in' (a reserved word).")
    .test(src, {}); // es5

  test.done();
};

exports.testCatchBlocks = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/gh247.js', 'utf8');

  TestRun(test)
    .addError(19, 13, "'w' is already defined.")
    .addError(35, 19, "'u2' used out of scope.")
    .addError(36, 19, "'w2' used out of scope.")
    .test(src, { es3: true, undef: true, devel: true });

  src = fs.readFileSync(__dirname + '/fixtures/gh618.js', 'utf8');

  TestRun(test)
    .addError(5, 11, "Value of 'x' may be overwritten in IE 8 and earlier.")
    .addError(15, 11, "Value of 'y' may be overwritten in IE 8 and earlier.")
    .test(src, { es3: true, undef: true, devel: true });

  TestRun(test)
    .test(src, { es3: true, undef: true, devel: true, node: true });

  var code = "try {} catch ({ message }) {}";

  TestRun(test, "destructuring in catch blocks' parameter")
    .test(code, { esnext: true });

  test.done();
};

exports.testNumericParams = function (test) {
  TestRun(test)
    .test("/*jshint maxparams:4, indent:3, maxlen:false */");

  TestRun(test)
    .addError(1, 1, "Expected a small integer or 'false' and instead saw 'face'.")
    .test("/*jshint maxparams:face */");

  test.done();
};

exports.testForIn = function (test) {
  var src = [
    "(function (o) {",
    "for (var i in o) { i(); }",
    "}());"
  ];

  TestRun(test)
    .test(src, {es3: true});

  src = [
    "(function (o) {",
    "for (i in o) { i(); }",
    "}());"
  ];

  TestRun(test)
    .addError(2, 6, "Creating global 'for' variable. Should be 'for (var i ...'.")
    .test(src, {es3: true});

  src = [
    "(function (o) {",
    "for ('i' in o) { i(); }",
    "}());"
  ];

  TestRun(test)
    .addError(2, 10, "Bad assignment.")
    .test(src);

  src = [
    "(function (o) {",
    "for (i, j in o) { i(); }",
    "for (var x, u in o) { x(); }",
    "for (z = 0 in o) { z(); }",
    "for (var q = 0 in o) { q(); }",
    "})();"
  ];

  TestRun(test, "bad lhs errors")
    .addError(2, 7, "Invalid for-in loop left-hand-side: more than one ForBinding.")
    .addError(3, 6, "Invalid for-in loop left-hand-side: more than one ForBinding.")
    .addError(4, 8, "Invalid for-in loop left-hand-side: initializer is forbidden.")
    .addError(5, 6, "Invalid for-in loop left-hand-side: initializer is forbidden.")
    .test(src);

  src = [
    "(function (o) {",
    "for (let i, j in o) { i(); }",
    "for (const x, u in o) { x(); }",
    "for (let z = 0 in o) { z(); }",
    "for (const q = 0 in o) { q(); }",
    "})();"
  ];

  TestRun(test, "bad lhs errors (lexical)")
    .addError(2, 6, "Invalid for-in loop left-hand-side: more than one ForBinding.")
    .addError(3, 6, "Invalid for-in loop left-hand-side: more than one ForBinding.")
    .addError(4, 6, "Invalid for-in loop left-hand-side: initializer is forbidden.")
    .addError(5, 6, "Invalid for-in loop left-hand-side: initializer is forbidden.")
    .test(src, { esnext: true });

  TestRun(test, "Left-hand side as MemberExpression")
    .test([
      "for (x.y in {}) {}",
      "for (x[z] in {}) {}",
    ]);

  TestRun(test, "Left-hand side as MemberExpression (invalid)")
    .addError(1, 10, "Bad assignment.")
    .addError(2, 13, "Bad assignment.")
    .test([
      "for (x+y in {}) {}",
      "for ((this) in {}) {}"
    ]);

  TestRun(test, "expression context")
    .test([
      "for (0 ? 0 in {} : 0 ; false; false ) {}",
      "for (x[0 in {}] ; false; false ) {}",
      "for (x = function() { return 0 in {}; } ; false; false ) {}"
    ]);

  TestRun(test, "expression context (ES2015 forms)")
    .test([
      "for (({ [x in {}]: null }); false; false ) {}",
      "for (var { prop = 'x' in {} } of [{}]) {}",
      "for (x = () => { return 0 in {}; } ; false; false ) {}",
      "for (x = function(x = 0 in {}) {} ; false; false ) {}"
    ], { esversion: 2015 });

  test.done();
};

exports.testRegexArray = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/regex_array.js", "utf8");

  TestRun(test)
    .test(src, {es3: true});

  test.done();
};

// Regression test for GH-1070
exports.testUndefinedAssignment = function (test) {
  var src = [
    "var x = undefined;",
    "const y = undefined;",
    "let z = undefined;",
    "for(var a = undefined; a < 9; a++) {",
    "  var b = undefined;", // necessary - see gh-1191
    "  const c = undefined;",
    "  let d = undefined;",
    "  var e = function() {",
    "    var f = undefined;",
    "    const g = undefined;",
    "    let h = undefined;",
    "  };",
    "}",
    "// jshint -W080",
    "var i = undefined;",
    "const j = undefined;",
    "let k = undefined;",
    "// jshint +W080",
    "var l = undefined === 0;",
    "const m = undefined === 0;",
    "let n = undefined === 0;",
    "let [ o = undefined === 0 ] = [];",
    "[ o = undefined === 0] = [];",
    "let { p = undefined === 0, x: q = undefined === 0 } = {};",
    "({ p = undefined === 0, x: q = undefined === 0 } = {});"
  ];

  TestRun(test)
    .addError(1, 5, "It's not necessary to initialize 'x' to 'undefined'.")
    .addError(2, 7, "It's not necessary to initialize 'y' to 'undefined'.")
    .addError(3, 5, "It's not necessary to initialize 'z' to 'undefined'.")
    .addError(4, 9, "It's not necessary to initialize 'a' to 'undefined'.")
    .addError(6, 9, "It's not necessary to initialize 'c' to 'undefined'.")
    .addError(7, 7, "It's not necessary to initialize 'd' to 'undefined'.")
    .addError(9, 9, "It's not necessary to initialize 'f' to 'undefined'.")
    .addError(10, 11, "It's not necessary to initialize 'g' to 'undefined'.")
    .addError(11, 9, "It's not necessary to initialize 'h' to 'undefined'.")
    .test(src, {esnext: true});

  test.done();
};

exports.testES6Modules = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/es6-import-export.js", "utf8");

  var importConstErrors = [
    [51, 1, "Attempting to override '$' which is a constant."],
    [52, 1, "Attempting to override 'emGet' which is a constant."],
    [53, 1, "Attempting to override 'one' which is a constant."],
    [54, 1, "Attempting to override '_' which is a constant."],
    [55, 1, "Attempting to override 'ember2' which is a constant."],
    [57, 8, "'$' has already been declared."],
    [58, 17, "'emGet' has already been declared."],
    [58, 24, "'set' has already been declared."],
    [59, 21, "'_' has already been declared."],
    [60, 13, "'ember2' has already been declared."]
  ];

  var testRun = TestRun(test)
    .addError(75, 1, "Empty export: this is unnecessary and can be removed.")
    .addError(76, 1, "Empty export: consider replacing with `import 'source';`.");
  importConstErrors.forEach(function(error) { testRun.addError.apply(testRun, error); });
  testRun.test(src, {esnext: true});

  testRun
    .addError(3, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(5, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(6, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(7, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(8, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(9, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(10, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(11, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(22, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(30, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(31, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(32, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(36, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(40, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(44, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(46, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(47, 8, "'class' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(47, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(46, 8, "'class' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(57, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(58, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(59, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(60, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(65, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(67, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(67, 16, "'function*' is only available in ES6 (use 'esversion: 6').")
    .addError(67, 26, "'yield' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .addError(71, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(72, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .addError(75, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(76, 1, "'export' is only available in ES6 (use 'esversion: 6').")
    .addError(77, 1, "'import' is only available in ES6 (use 'esversion: 6').")
    .test(src);

  var src2 = [
    "var a = {",
    "import: 'foo',",
    "export: 'bar'",
    "};"
  ];

  TestRun(test)
    .test(src2, {});

  TestRun(test)
    .test([
      "export default function() {",
      "  return 'foobar';",
      "}"
    ], {esversion: 6});

  TestRun(test)
    .test([
      "export default class Bar {}"
    ], {esversion: 6});

  // See gh-3055 "Labels Break JSHint"
  TestRun(test, "following labeled block")
    .test([
      "label: {}",
      "export function afterLabelExported() {}",
      "import afterLabelImported from 'elsewhere';"
    ], { esversion: 6 });

  TestRun(test, "invalid ImportsList")
    .addError(1, 12, "Unexpected 'y'.")
    .addError(1, 12, "Expected 'from' and instead saw 'y'.")
    .addError(1, 14, "Expected '(string)' and instead saw '}'.")
    .addError(1, 15, "Missing semicolon.")
    .addError(1, 16, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 20, "Missing semicolon.")
    .addError(1, 21, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 16, "'from' is not defined.")
    .test([
      "import { x y } from 'elsewhere';"
    ], { esversion: 6, module: true });

  TestRun(test, "async as Identifier")
    .test([
      "var async;",
      "export default async;"
    ], { esversion: 6, module: true });

  TestRun(test, "async in CallExpression")
    .test([
      "var async, x, y, z;",
      "export default async(x, y, z);"
    ], { esversion: 6, module: true });

  TestRun(test, "async functions")
    .test([
      "export async function f() { await 0; }",
      "export default async function() { await 0; }",
    ], { esversion: 8, module: true });

  TestRun(test, "async arrow function - zero arguments")
    .test([
      "export default async () => {};"
    ], { esversion: 8, module: true });

  TestRun(test, "async arrow function - concise argument")
    .test([
      "export default async _ => {};"
    ], { esversion: 8, module: true });

  TestRun(test, "async arrow function - many arguments")
    .test([
      "export default async (x, y, z) => {};"
    ], { esversion: 8, module: true });


  TestRun(test, "async generator functions")
    .test([
      "export async function * f() { yield 0; await 0; }",
      "export default async function * () { yield 0; await 0; }",
    ], { esversion: 9, module: true });

  TestRun(test, "IdentifierName in renamed import/export")
    .test([
      "import { if as x } from '.';",
      "export { x as if } from '.';"
    ], { esversion: 6, module: true });

  test.done();
};

exports.testES6ModuleDuplicateExport = function (test) {
  TestRun(test, "Same declaration, adjacent")
    .addError(2, 13, "Duplicate exported binding: 'x'.")
    .test([
      "var x;",
      "export { x, x };"
    ], { esversion: 6, module: true });

  TestRun(test, "Same declaration, removed")
    .addError(2, 16, "Duplicate exported binding: 'y'.")
    .test([
      "var y, z;",
      "export { y, z, y };"
    ], { esversion: 6, module: true });

  TestRun(test, "Same declaration, renamed")
    .addError(2, 18, "Duplicate exported binding: 'y'.")
    .test([
      "var y, z;",
      "export { y, z as y };"
    ], { esversion: 6, module: true });

  TestRun(test, "Distinct declarations, by reference")
    .addError(3, 10, "Duplicate exported binding: 'z'.")
    .test([
      "var z;",
      "export { z };",
      "export { z };"
    ], { esversion: 6, module: true });

  TestRun(test, "Distinct declarations, by reference, renamed")
    .addError(3, 15, "Duplicate exported binding: 'y'.")
    .test([
      "var y, z;",
      "export { y };",
      "export { z as y };"
    ], { esversion: 6, module: true });

  TestRun(test, "Distinct declarations, default")
    .addError(2, 8, "Duplicate exported binding: 'default'.")
    .test([
      "export default 0;",
      "export default 0;"
    ], { esversion: 6, module: true });

  TestRun(test, "Distinct declarations, by reference, default/renamed")
    .addError(3, 15, "Duplicate exported binding: 'default'.")
    .test([
      "var x;",
      "export default 0;",
      "export { x as default };"
    ], { esversion: 6, module: true });

  TestRun(test, "Distinct declarations, by reference, renamed/default")
    .addError(3, 8, "Duplicate exported binding: 'default'.")
    .test([
      "var x;",
      "export { x as default };",
      "export default 0;"
    ], { esversion: 6, module: true });

  TestRun(test, "Distinct declarations, by statement - var")
    .addError(2, 10, "Duplicate exported binding: 'a'.")
    .test([
      "export var a;",
      "export { a };"
    ], { esversion: 6, module: true });

  TestRun(test, "Distinct declarations, by statement - let")
    .addError(2, 10, "Duplicate exported binding: 'b'.")
    .test([
      "export let b;",
      "export { b };"
    ], { esversion: 6, module: true });

  TestRun(test, "Distinct declarations, by statement - const")
    .addError(2, 10, "Duplicate exported binding: 'c'.")
    .test([
      "export const c = null;",
      "export { c };"
    ], { esversion: 6, module: true });

  TestRun(test, "Distinct declarations, by statement - function")
    .addError(2, 10, "Duplicate exported binding: 'd'.")
    .test([
      "export function d() {}",
      "export { d };"
    ], { esversion: 6, module: true });

  TestRun(test, "Distinct declarations, by statement - class")
    .addError(2, 10, "Duplicate exported binding: 'e'.")
    .test([
      "export class e {}",
      "export { e };"
    ], { esversion: 6, module: true });

  test.done();
};

exports.testES6ModulesNamedExportsAffectUnused = function (test) {
  // Named Exports should count as used
  var src1 = [
    "var a = {",
    "  foo: 'foo',",
    "  bar: 'bar'",
    "};",
    "var x = 23;",
    "var z = 42;",
    "let c = 2;",
    "const d = 7;",
    "export { c, d };",
    "export { a, x };",
    "export var b = { baz: 'baz' };",
    "export function boo() { return z; }",
    "export class MyClass { }",
    "export var varone = 1, vartwo = 2;",
    "export const constone = 1, consttwo = 2;",
    "export let letone = 1, lettwo = 2;",
    "export var v1u, v2u;",
    "export let l1u, l2u;",
    "export const c1u, c2u;",
    "export function* gen() { yield 1; }",
    "export var { varX } = 0;",
    "export let { letX } = 0;",
    "export const { constX } = 0;"
  ];

  TestRun(test)
    .addError(19, 14, "const 'c1u' is initialized to 'undefined'.")
    .addError(19, 19, "const 'c2u' is initialized to 'undefined'.")
    .test(src1, {
      esnext: true,
      unused: true
    });

  test.done();
};

exports.testConstRedeclaration = function (test) {

  // consts cannot be redeclared, but they can shadow
  var src = [
    "const a = 1;",
    "const a = 2;",
    "if (a) {",
    "  const a = 3;",
    "}",
    "for(const a in a) {",
    "  const a = 4;",
    "}",
    "function a() {",
    "}",
    "function b() {",
    "}",
    "const b = 1;"
  ];

  TestRun(test)
    .addError(2, 7, "'a' has already been declared.")
    .addError(6, 16, "'a' was used before it was declared, which is illegal for 'const' variables.")
    .addError(9, 10, "'a' has already been declared.")
    .addError(13, 7, "'b' has already been declared.")
    .test(src, {
      esnext: true
    });

  test.done();
};

exports["test typeof in TDZ"] = function (test) {

  var src = [
    "let a = typeof b;", // error, use in TDZ
    "let b;",
    "function d() { return typeof c; }", // d may be called after declaration, no error
    "let c = typeof e;", // e is not in scope, no error
    "{",
    "  let e;",
    "}"
  ];

  TestRun(test)
    .addError(2, 5, "'b' was used before it was declared, which is illegal for 'let' variables.")
    .test(src, {
      esnext: true
    });

  test.done();
};

exports.testConstModification = function (test) {

  var src = [
    "const a = 1;",
    "const b = { a: 2 };",
    // const errors
    "a = 2;",
    "b = 2;",
    "a++;",
    "--a;",
    "a += 1;",
    "let y = a = 3;",
    // valid const access
    "b.a++;",
    "--b.a;",
    "b.a = 3;",
    "a.b += 1;",
    "const c = () => 1;",
    "c();",
    "const d = [1, 2, 3];",
    "d[0] = 2;",
    "let x = -a;",
    "x = +a;",
    "x = a + 1;",
    "x = a * 2;",
    "x = a / 2;",
    "x = a % 2;",
    "x = a & 1;",
    "x = a ^ 1;",
    "x = a === true;",
    "x = a == 1;",
    "x = a !== true;",
    "x = a != 1;",
    "x = a > 1;",
    "x = a >= 1;",
    "x = a < 1;",
    "x = a <= 1;",
    "x = 1 + a;",
    "x = 2 * a;",
    "x = 2 / a;",
    "x = 2 % a;",
    "x = 1 & a;",
    "x = 1 ^ a;",
    "x = true === a;",
    "x = 1 == a;",
    "x = true !== a;",
    "x = 1 != a;",
    "x = 1 > a;",
    "x = 1 >= a;",
    "x = 1 < a;",
    "x = 1 <= a;",
    "x = typeof a;",
    "x = a.a;",
    "x = a[0];",
    "delete a.a;",
    "delete a[0];",
    "new a();",
    "new a;",
    "function e() {",
    "  f++;",
    "}",
    "const f = 1;",
    "e();"
  ];

  TestRun(test)
      .addError(3, 1, "Attempting to override 'a' which is a constant.")
      .addError(4, 1, "Attempting to override 'b' which is a constant.")
      .addError(5, 1, "Attempting to override 'a' which is a constant.")
      .addError(6, 3, "Attempting to override 'a' which is a constant.")
      .addError(7, 1, "Attempting to override 'a' which is a constant.")
      .addError(8, 9, "Attempting to override 'a' which is a constant.")
      .addError(8, 9, "You might be leaking a variable (a) here.")
      .addError(53, 5, "Missing '()' invoking a constructor.")
      .addError(55, 3, "Attempting to override 'f' which is a constant.")
      .test(src, {
        esnext: true
      });

  test.done();
};

exports["class declaration export"] = function (test) {
  var source = fs.readFileSync(__dirname + "/fixtures/class-declaration.js", "utf8");

  TestRun(test).test(source, {
    esnext: true,
    undef: true
  });

  test.done();
};

exports["function declaration export"] = function (test) {
  var source = fs.readFileSync(__dirname + "/fixtures/function-declaration.js", "utf8");

  TestRun(test).test(source, {
    esnext: true,
    undef: true
  });

  test.done();
};

exports.classIsBlockScoped = function (test) {
  var code = [
    "new A();", // use in TDZ
    "class A {}",
    "class B extends C {}", // use in TDZ
    "class C {}",
    "new D();", // not defined
    "let E = class D {" +
    "  constructor() { D.static(); }",
    "  myfunc() { return D; }",
    "};",
    "new D();", // not defined
    "if (true) {",
    "  class F {}",
    "}",
    "new F();" // not defined
  ];

  TestRun(test)
    .addError(2, 7, "'A' was used before it was declared, which is illegal for 'class' variables.")
    .addError(4, 7, "'C' was used before it was declared, which is illegal for 'class' variables.")
    .addError(5, 5, "'D' is not defined.")
    .addError(9, 5, "'D' is not defined.")
    .addError(13, 5, "'F' is not defined.")
    .test(code, { esnext: true, undef: true });

  test.done();
};

exports.testES6ModulesNamedExportsAffectUndef = function (test) {
  // The identifier "foo" is expected to have been defined in the scope
  // of this file in order to be exported.
  // The example below is roughly similar to this Common JS:
  //
  //     exports.foo = foo;
  //
  // Thus, the "foo" identifier should be seen as undefined.
  var src1 = [
    "export { foo };"
  ];

  TestRun(test)
    .addError(1, 10, "'foo' is not defined.")
    .test(src1, {
      esnext: true,
      undef: true
    });

  test.done();
};

exports.testES6ModulesThroughExportDoNotAffectUnused = function (test) {
  // "Through" exports do not alter the scope of this file, but instead pass
  // the exports from one source on through this source.
  // The example below is roughly similar to this Common JS:
  //
  //     var foo;
  //     exports.foo = require('source').foo;
  //
  // Thus, the "foo" identifier should be seen as unused.
  var src1 = [
    "var foo;",
    "export { foo } from \"source\";"
  ];

  TestRun(test)
    .addError(1, 5, "'foo' is defined but never used.")
    .test(src1, {
      esnext: true,
      unused: true
    });

  test.done();
};

exports.testES6ModulesThroughExportDoNotAffectUndef = function (test) {
  // "Through" exports do not alter the scope of this file, but instead pass
  // the exports from one source on through this source.
  // The example below is roughly similar to this Common JS:
  //
  //     exports.foo = require('source').foo;
  //     var bar = foo;
  //
  // Thus, the "foo" identifier should be seen as undefined.
  var src1 = [
    "export { foo } from \"source\";",
    "var bar = foo;"
  ];

  TestRun(test)
    .addError(2, 11, "'foo' is not defined.")
    .test(src1, {
      esnext: true,
      undef: true
    });

  test.done();
};

exports.testES6ModulesDefaultExportsAffectUnused = function (test) {
  // Default Exports should count as used
  var src1 = [
    "var a = {",
    "  foo: 'foo',",
    "  bar: 'bar'",
    "};",
    "var x = 23;",
    "export default { a: a, x: x };"
  ];

  TestRun(test)
    .test(src1, {
      esnext: true,
      unused: true
    });

  TestRun(test)
    .test([
      "var x = 23;",
      "var z = 42;",
      "export default function boo() { return x + z; }"
    ], {
      esnext: true,
      unused: true
    });

  TestRun(test)
    .test("export default class MyClass { }", {
      esnext: true,
      unused: true
    });

  TestRun(test)
    .test("export default class {}", {
      esnext: true,
      unused: true
    });

  test.done();
};

exports.testES6ModulesDefaultExportAssignmentExpr = function (test) {
  // The identifier in the exported AssignmentExpression should not be
  // interpreted as a declaration.
  var src = [
    "let x = 1;",
    "export default -x;"
  ];

  TestRun(test)
    .test(src, { unused: true, esnext: true });

  test.done();
};

exports.testES6ModulesNameSpaceImportsAffectUnused = function (test) {
  var src = [
    "import * as angular from 'angular';"
  ];

  TestRun(test)
    .addError(1, 13, "'angular' is defined but never used.")
    .test(src, {
      esnext: true,
      unused: true
    });

  test.done();
};

exports.testES6TemplateLiterals = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/es6-template-literal.js", "utf8");
  var run = TestRun(test)
    .addError(14, 16, "Octal literals are not allowed in strict mode.")
    .addError(21, 20, "Unclosed template literal.");
  run.test(src, { esnext: true });
  run.test("/* jshint esnext: true */" + src);

  test.done();
};

exports.testES6TaggedTemplateLiterals = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/es6-template-literal-tagged.js", "utf8");
  TestRun(test)
    .addError(16, 19, "Octal literals are not allowed in strict mode.")
    .addError(23, 23, "Unclosed template literal.")
    .test(src, { esnext: true });
  test.done();
};

exports.testES6TemplateLiteralsUnused = function (test) {
  var src = [
    "var a = 'hello';",
    "alert(`${a} world`);"
  ];
  TestRun(test)
    .test(src, { esnext: true, unused: true });

  test.done();
};

exports.testES6TaggedTemplateLiteralsUnused = function (test) {
  var src = [
    "function tag() {}",
    "var a = 'hello';",
    "alert(tag`${a} world`);"
  ];
  TestRun(test)
    .test(src, { esnext: true, unused: true });

  test.done();
};


exports.testES6TemplateLiteralsUndef = function (test) {
  var src = [
    "/* global alert */",
    "alert(`${a} world`);"
  ];
  TestRun(test)
    .addError(2, 10, "'a' is not defined.")
    .test(src, { esnext: true, undef: true });

  test.done();
};


exports.testES6TaggedTemplateLiteralsUndef = function (test) {
  var src = [
    "/* global alert */",
    "alert(tag`${a} world`);"
  ];
  TestRun(test)
    .addError(2, 7, "'tag' is not defined.")
    .addError(2, 13, "'a' is not defined.")
    .test(src, { esnext: true, undef: true });

  test.done();
};


exports.testES6TemplateLiteralMultiline = function (test) {
  var src = [
    'let multiline = `',
    'this string spans',
    'multiple lines',
    '`;'
  ];

  TestRun(test).test(src, { esnext: true });

  test.done();
};

exports.testES6TemplateLiteralsAreNotDirectives = function (test) {
  var src = [
    "function fn() {",
    "`use strict`;",
    "return \"\\077\";",
    "}"
  ];

  TestRun(test)
    .addError(2, 1, "Expected an assignment or function call and instead saw an expression.")
    .test(src, { esnext: true });

  var src2 = [
    "function fn() {",
    "`${\"use strict\"}`;",
    "return \"\\077\";",
    "}"
  ];

  TestRun(test)
    .addError(2, 16, "Expected an assignment or function call and instead saw an expression.")
    .test(src2, { esnext: true });

  test.done();
};

exports.testES6TemplateLiteralReturnValue = function (test) {
  var src = [
    'function sayHello(to) {',
    '  return `Hello, ${to}!`;',
    '}',
    'print(sayHello("George"));'
  ];

  TestRun(test).test(src, { esnext: true });

  var src = [
    'function* sayHello(to) {',
    '  yield `Hello, ${to}!`;',
    '}',
    'print(sayHello("George"));'
  ];

  TestRun(test).test(src, { esnext: true });

  test.done();
};

exports.testES6TemplateLiteralMultilineReturnValue = function (test) {
  var src = [
    'function sayHello(to) {',
    '  return `Hello, ',
    '    ${to}!`;',
    '}',
    'print(sayHello("George"));'
  ];

  TestRun(test).test(src, { esnext: true });

  var src = [
    'function* sayHello(to) {',
    '  yield `Hello, ',
    '    ${to}!`;',
    '}',
    'print(sayHello("George"));'
  ];

  TestRun(test).test(src, { esnext: true });

  test.done();
};


exports.testES6TaggedTemplateLiteralMultilineReturnValue = function (test) {
  var src = [
    'function tag() {}',
    'function sayHello(to) {',
    '  return tag`Hello, ',
    '    ${to}!`;',
    '}',
    'print(sayHello("George"));'
  ];

  TestRun(test).test(src, { esnext: true });

  var src = [
    'function tag() {}',
    'function* sayHello(to) {',
    '  yield tag`Hello, ',
    '    ${to}!`;',
    '}',
    'print(sayHello("George"));'
  ];

  TestRun(test).test(src, { esnext: true });

  test.done();
};


exports.testES6TemplateLiteralMultilineReturnValueWithFunctionCall = function (test) {
  var src = [
    'function sayHello() {',
    '  return `Helo',
    '      monkey`',
    '    .replace(\'l\', \'ll\');',
    '}',
    'print(sayHello());',
  ];

  TestRun(test).test(src, { esnext: true });

  test.done();
};


exports.testES6TaggedTemplateLiteralMultilineReturnValueWithFunctionCall = function (test) {
  var src = [
    'function tag() {}',
    'function sayHello() {',
    '  return tag`Helo',
    '    monkey!!`',
    '    .replace(\'l\', \'ll\');',
    '}',
    'print(sayHello());',
  ];

  TestRun(test).test(src, { esnext: true });

  test.done();
};


exports.testMultilineReturnValueStringLiteral = function (test) {
  var src = [
    'function sayHello(to) {',
    '  return "Hello, \\',
    '    " + to;',
    '}',
    'print(sayHello("George"));'
  ];

  TestRun(test).test(src, { multistr: true });

  var src = [
    'function* sayHello(to) {',
    '  yield "Hello, \\',
    '    " + to;',
    '}',
    'print(sayHello("George"));'
  ];

  TestRun(test).test(src, { esnext: true, multistr: true });

  test.done();
};

exports.testES6ExportStarFrom = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/es6-export-star-from.js", "utf8");
  TestRun(test)
    .addError(2, 10, "Expected 'from' and instead saw 'foo'.")
    .addError(2, 13, "Expected '(string)' and instead saw ';'.")
    .addError(2, 14, "Missing semicolon.")
    .addError(3, 15, "Expected '(string)' and instead saw '78'.")
    .test(src, { esnext: true });
  test.done();
};

exports.testPotentialVariableLeak = function (test) {
  var a = fs.readFileSync(__dirname + "/fixtures/leak.js", "utf8");
  var b = fs.readFileSync(__dirname + "/fixtures/gh1802.js", "utf8");

  // Real Error
  TestRun(test)
    .addError(2, 11, "You might be leaking a variable (b) here.")
    .addError(3, 13, "You might be leaking a variable (d) here.")
    .addError(4, 11, "You might be leaking a variable (f) here.")
    .test(a, { esnext: true });

  // False Positive
  TestRun(test)
    .test(b);

  test.done();
};

exports.testDefaultArguments = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/default-arguments.js", "utf8");
  TestRun(test)
    .addError(14, 39, "'bar' is not defined.")
    .addError(14, 32, "'num3' was used before it was declared, which is illegal for 'param' variables.")
    .addError(15, 32, "'num4' was used before it was declared, which is illegal for 'param' variables.")
    .addError(18, 41, "Regular parameters should not come after default parameters.")
    .addError(27, 10, "'c' is not defined.")
    .addError(33, 4, "'d' was used before it was defined.")
    .addError(36, 16, "'e' was used before it was declared, which is illegal for 'param' variables.")
    .test(src, { esnext: true, undef: true, latedef: true });

  TestRun(test)
    .addError(14, 32, "'num3' was used before it was declared, which is illegal for 'param' variables.")
    .addError(15, 32, "'num4' was used before it was declared, which is illegal for 'param' variables.")
    .addError(18, 41, "Regular parameters should not come after default parameters.")
    .addError(36, 16, "'e' was used before it was declared, which is illegal for 'param' variables.")
    .test(src, { moz: true });

  TestRun(test)
    .addError(7, 27, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(7, 35, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(11, 36, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(12, 37, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(13, 37, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(14, 37, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(14, 32, "'num3' was used before it was declared, which is illegal for 'param' variables.")
    .addError(15, 37, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(15, 32, "'num4' was used before it was declared, which is illegal for 'param' variables.")
    .addError(18, 37, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(18, 41, "Regular parameters should not come after default parameters.")
    .addError(26, 18, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(31, 18, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(33, 6, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(35, 18, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(36, 18, "'default parameters' is only available in ES6 (use 'esversion: 6').")
    .addError(36, 16, "'e' was used before it was declared, which is illegal for 'param' variables.")
    .test(src, {  });

  test.done();
};

exports.testEarlyCatchParam = function (test) {
  TestRun(test)
    .addError(2, 18, "'y' was used before it was declared, which is illegal for 'exception' variables.")
    .test([
      "try {",
      "} catch ([x = y, y]) {",
      "}"
    ], { esversion: 6 });

  test.done();
};

exports.testDuplicateParamNames = function (test) {
  var src = [
  "(function() {",
  "  (function(a, a) { // warns only with shadow",
  "  })();",
  "})();",
  "(function() {",
  "  'use strict';",
  "  (function(a, a) { // errors because of strict mode",
  "  })();",
  "})();",
  "(function() {",
  "  (function(a, a) { // errors because of strict mode",
  "  'use strict';",
  "  })();",
  "})();",
  "(function() {",
  "  'use strict';",
  "  (function(a, a) { // errors *once* because of strict mode",
  "  'use strict';",
  "  })();",
  "})();"
  ];

  TestRun(test)
    .addError(7, 13, "'a' has already been declared.")
    .addError(11, 13, "'a' has already been declared.")
    .addError(17, 13, "'a' has already been declared.")
    .addError(18, 3, "Unnecessary directive \"use strict\".")
    .test(src, { shadow: true });

  TestRun(test)
    .addError(2, 13, "'a' is already defined.")
    .addError(7, 13, "'a' has already been declared.")
    .addError(11, 13, "'a' has already been declared.")
    .addError(17, 13, "'a' has already been declared.")
    .addError(18, 3, "Unnecessary directive \"use strict\".")
    .test(src, { shadow: "inner" });

  TestRun(test)
    .addError(2, 13, "'a' is already defined.")
    .addError(7, 13, "'a' has already been declared.")
    .addError(11, 13, "'a' has already been declared.")
    .addError(17, 13, "'a' has already been declared.")
    .addError(18, 3, "Unnecessary directive \"use strict\".")
    .test(src, { shadow: "outer" });

  TestRun(test)
    .addError(2, 13, "'a' is already defined.")
    .addError(7, 13, "'a' has already been declared.")
    .addError(11, 13, "'a' has already been declared.")
    .addError(17, 13, "'a' has already been declared.")
    .addError(18, 3, "Unnecessary directive \"use strict\".")
    .test(src, { shadow: false });

  src = [
    "void ((x, x) => null);",
    "void ((x, x) => {});",
    "void ((x, x) => { 'use strict'; });",
    "function f() {",
    "  'use strict';",
    "  void ((x, x) => null);",
    "  void ((x, x) => {});",
    "  void ((x, x) => { 'use strict'; });",
    "}"
  ];

  TestRun(test, "Arrow functions - strict mode restriction")
    .addError(1, 8, "'x' has already been declared.")
    .addError(2, 8, "'x' has already been declared.")
    .addError(3, 8, "'x' has already been declared.")
    .addError(6, 10, "'x' has already been declared.")
    .addError(7, 10, "'x' has already been declared.")
    .addError(8, 10, "'x' has already been declared.")
    .addError(8, 21, "Unnecessary directive \"use strict\".")
    .test(src, { esversion: 6 });

  test.done();
};

// Issue #1324: Make sure that we're not mutating passed options object.
exports.testClonePassedObjects = function (test) {
  var options = { predef: ["sup"] };
  JSHINT("", options);
  test.ok(options.predef.length == 1);
  test.done();
};

exports.testMagicProtoVariable = function (test) {
  JSHINT("__proto__ = 1;");
  test.done();
};

// Issue #1371: column number at end of non-strict comparison (for usability reasons)
exports.testColumnNumAfterNonStrictComparison = function (test) {
  var src =  "if (1 == 1) {\n" +
        "  var foo = 2;\n" +
        "  if (1 != 1){\n" +
        "    var bar = 3;\n" +
        "  }\n"+
        "}";
  TestRun(test)
    .addError(1, 9, "Expected '===' and instead saw '=='.")
    .addError(3, 11, "Expected '!==' and instead saw '!='.")
    .test(src, {eqeqeq: true});
  test.done();
};


exports.testArrayPrototypeExtensions = function (test) {
  Array.prototype.undefinedPrototypeProperty = undefined;

  JSHINT("var x = 123;\nlet y = 456;\nconst z = 123;");
  delete Array.prototype.undefinedPrototypeProperty;
  test.done();
};

// Issue #1446, PR #1688
exports.testIncorrectJsonDetection = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/mappingstart.js", "utf8");
  // Without the bug fix, a JSON lint error will be raised because the parser
  // thinks it is rendering JSON instead of JavaScript.
  TestRun(test).test(src);
  test.done();
};

exports.testEscapedReservedWords = function (test) {
  var code = [
    'var v\u0061r = 42;',
    'alert(va\u0072);'
  ];

  TestRun(test)
    .addError(1, 5, "Expected an identifier and instead saw 'var' (a reserved word).")
    .addError(2, 7, "Expected an identifier and instead saw 'var'.")
    .test(code);

  test.done();
};

exports.testUnnamedFuncStatement = function (test) {
  TestRun(test)
    .addError(1, 9, "Missing name in function declaration.")
    .test("function() {}");

  TestRun(test, "with 'unused' option")
    .addError(1, 9, "Missing name in function declaration.")
    .test("function() {}", { unused: true });

  test.done();
};

// GH-1976 "Fixed set property 'type' of undefined in `if` blockstmt"
exports.testUnCleanedForinifcheckneeded = function (test) {
  var forinCode = [
    "for (var key in a) {",
    "  console.log(key);",
    "}"
  ];

  var ifCode = [
    "if(true) {",
    "}"
  ];

  try {
    JSHINT(forinCode, { maxerr: 1, forin: true });
    // Prior to the fix, if the final `forin` check reached the `maxerr` limit,
    // the internal `state.forinifcheckneeded` maintained its previous value
    // and triggered an error in subsequent invocations of JSHint.
    JSHINT(ifCode, { maxerr: 1, forin: true });
  } catch(e) {
    test.ok(false, "Exception was thrown");
  }

  test.done();
};

// gh-738 "eval" as an object key should not cause `W061` warnngs
exports.testPermitEvalAsKey = function (test) {
  var srcNode = fs.readFileSync(__dirname + "/fixtures/gh-738-node.js", "utf8");
  var srcBrowser = fs.readFileSync(__dirname + "/fixtures/gh-738-browser.js", "utf8");
  // global calls to eval should still cause warning.
  // test a mixture of permitted and disallowed calls
  // `global#eval` in `node:true` should still cause warning
  // `(document|window)#eval` in `browser:true` should still cause warning

  // browser globals
  TestRun(test)
  .addError(17, 1, "eval can be harmful.")
  .addError(19, 12, "eval can be harmful.")
  .addError(20, 14, "eval can be harmful.")
  .addError(22, 14, "eval can be harmful.")
  .addError(23, 16, "eval can be harmful.")
  .addError(25, 10, "eval can be harmful.")
  .test(srcBrowser, { browser: true });

  // node globals
  TestRun(test)
  .addError(18, 14, "eval can be harmful.")
  .addError(19, 12, "eval can be harmful.")
  .addError(20, 1, "eval can be harmful.")
  .addError(22, 10, "eval can be harmful.")
  .test(srcNode, { node: true });

  test.done();

};

// gh-2194 jshint confusing arrays at beginning of file with JSON
exports.beginningArraysAreNotJSON = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/gh-2194.js", "utf8");

  TestRun(test)
  .test(src);

  test.done();

};

exports.labelsOutOfScope = function (test) {
  var src = [
    "function a() {",
    "  if (true) {",
    "    bar: switch(2) {",
    "    }",
    "    foo: switch(1) {",
    "      case 1:",
    "        (function () {",
    "          baz: switch(3) {",
    "            case 3:",
    "              break foo;",
    "            case 2:",
    "              break bar;",
    "            case 3:",
    "              break doesnotexist;",
    "          }",
    "        })();",
    "        if (true) {",
    "          break foo;",
    "        }",
    "        break foo;",
    "      case 2:",
    "        break bar;",
    "      case 3:",
    "        break baz;",
    "    }",
    "  }",
    "}"
  ];

  TestRun(test)
    .addError(10, 21, "'foo' is not a statement label.")
    .addError(12, 21, "'bar' is not a statement label.")
    .addError(14, 21, "'doesnotexist' is not a statement label.")
    .addError(22, 15, "'bar' is not a statement label.")
    .addError(24, 15, "'baz' is not a statement label.")
    .test(src);

  // See gh-3055 "Labels Break JSHint"
  TestRun(test, "following labeled block")
    .addError(2, 7, "'x' is not a statement label.")
    .test([
      "x: {}",
      "break x;"
    ]);

  test.done();
};

exports.labelThroughCatch = function (test) {
  var src = [
    "function labelExample() {",
    "  'use strict';",
    "  var i;",
    "  example:",
    "    for (i = 0; i < 10; i += 1) {",
    "      try {",
    "        if (i === 5) {",
    "          break example;",
    "        } else {",
    "          throw new Error();",
    "        }",
    "      } catch (e) {",
    "        continue example;",
    "      }",
    "    }",
    "}"
  ];

  TestRun(test)
    .test(src);

  test.done();
};

exports.labelDoesNotExistInGlobalScope = function (test) {
  var src = [
    "switch(1) {",
    "  case 1:",
    "    break nonExistent;",
    "}"
  ];

  TestRun(test)
    .addError(3, 11, "'nonExistent' is not a statement label.")
    .test(src);

  test.done();
};

exports.labeledBreakWithoutLoop = function (test) {
  var src = [
    "foo: {",
    "  break foo;",
    "}"
  ];

  TestRun(test)
    .test(src);

  test.done();
};

// ECMAScript 5.1 § 12.7: labeled continue must refer to an enclosing
// IterationStatement, as opposed to labeled break which is only required to
// refer to an enclosing Statement.
exports.labeledContinueWithoutLoop = function (test) {
  var src = [
    "foo: switch (i) {",
    "  case 1:",
    "    continue foo;",
    "}"
  ];

  TestRun(test)
    .addError(3, 14, "Unexpected 'continue'.")
    .test(src);

  test.done();
};

exports.unlabeledBreakWithoutLoop = function(test) {
  var src = [
    "if (1 == 1) {",
    "  break;",
    "}",
  ];

  TestRun(test)
    .addError(2, 8, "Unexpected 'break'.")
    .test(src);

  test.done();
}

exports.unlabeledContinueWithoutLoop = function(test) {
  var src = [
    "switch (i) {",
    "  case 1:",
    "    continue;", // breakage but not loopage
    "}",
    "continue;"
  ];

  TestRun(test)
    .addError(3, 13, "Unexpected 'continue'.")
    .addError(5, 9, "Unexpected 'continue'.")
    .test(src);

  test.done();
}

exports.labelsContinue = function (test) {
  var src = [
    "exists: while(true) {",
    "  if (false) {",
    "    continue exists;",
    "  }",
    "  continue nonExistent;",
    "}"
  ];

  TestRun(test)
    .addError(5, 12, "'nonExistent' is not a statement label.")
    .test(src);

  test.done();
};

exports.catchWithNoParam = function (test) {
  var src = [
    "try{}catch(){}"
  ];

  TestRun(test)
    .addError(1, 12, "Expected an identifier and instead saw ')'.")
    .test(src);

  test.done();
};

exports.tryWithoutCatch = function (test) {
  var src = [
    "try{}",
    "if (true) { console.log(); }"
  ];

  TestRun(test)
    .addError(2, 1, "Expected 'catch' and instead saw 'if'.")
    .test(src);

  var src = [
    "try{}"
  ];

  TestRun(test)
    .addError(1, 5, "Expected 'catch' and instead saw ''.")
    .test(src);

  test.done();
};

exports["gh-1920"] = function (test) {
  var src = [
    "for (var key in objects) {",
    "  if (!objects.hasOwnProperty(key)) {",
    "    switch (key) {",
    "    }",
    "  }",
    "}"
  ];

  TestRun(test)
    .addError(1, 1, "The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype.")
    .test(src, { forin: true });

  test.done();
};

exports.duplicateProto = function (test) {
  var src = [
    "(function() {",
    "  var __proto__;",
    "  var __proto__;",
    "}());"
  ];

  // TODO: Enable this expected warning in the next major release
  TestRun(test, "Duplicate `var`s")
    //.addError(3, 23232323, "'__proto__' is already defined.")
    .test(src, { proto: true });

  src = [
    "(function() {",
    "  let __proto__;",
    "  let __proto__;",
    "}());"
  ];

  TestRun(test, "Duplicate `let`s")
    .addError(3, 7, "'__proto__' has already been declared.")
    .test(src, { proto: true, esnext: true });

  src = [
    "(function() {",
    "  const __proto__ = null;",
    "  const __proto__ = null;",
    "}());"
  ];

  TestRun(test, "Duplicate `const`s")
    .addError(3, 9, "'__proto__' has already been declared.")
    .test(src, { proto: true, esnext: true });

  src = [
    "void {",
    "  __proto__: null,",
    "  __proto__: null",
    "};"
  ];

  // TODO: Enable this expected warning in the next major release
  TestRun(test, "Duplicate keys (data)")
    //.addError(3, 23232323, "Duplicate key '__proto__'.")
    .test(src, { proto: true });

  src = [
    "void {",
    "  __proto__: null,",
    "  get __proto__() {}",
    "};"
  ];

  // TODO: Enable this expected warning in the next major release
  TestRun(test, "Duplicate keys (data and accessor)")
    //.addError(3, 23232323, "Duplicate key '__proto__'.")
    .test(src, { proto: true });

  src = [
    "__proto__: while (true) {",
    "  __proto__: while (true) {",
    "    break;",
    "  }",
    "}"
  ];

  TestRun(test, "Duplicate labels")
    .addError(2, 12, "'__proto__' has already been declared.")
    .test(src, { proto: true });

  test.done();
};

exports["gh-2761"] = function (test) {
  var code = [
    "/* global foo: false */",
    "foo = 2;",
    "// jshint -W020",
    "foo = 3;",
    "// jshint +W020",
    "foo = 4;"
  ];

  TestRun(test, "W020")
    .addError(2, 1, "Read only.")
    .addError(6, 1, "Read only.")
    .test(code);

  code = [
    "function a() {}",
    "a = 2;",
    "// jshint -W021",
    "a = 3;",
    "// jshint +W021",
    "a = 4;"
  ];

  TestRun(test, "W021")
    .addError(2, 1, "Reassignment of 'a', which is a function. " +
              "Use 'var' or 'let' to declare bindings that may change.")
    .addError(6, 1, "Reassignment of 'a', which is a function. " +
              "Use 'var' or 'let' to declare bindings that may change.")
    .test(code);

  test.done();
};

exports["gh-2838"] = function (test) {

  var code = [
    "function foo() {",
    "  return a + b;",
    "}",
    "function bar() {",
    "  return a + b;",
    "}",
    "let a = 1;",
    "const b = 2;"
  ];

  TestRun(test).test(code, { esversion: 6 });

  code = [
    "function x() {",
    "  return c;",
    "}",
    "void c;",
    "let c;"
  ];

  TestRun(test, "Same-scope reference following sub-scope reference")
    .addError(5, 5, "'c' was used before it was declared, which is illegal for 'let' variables.")
    .test(code, { esversion: 6 });

  code = [
    "function x() {",
    "  return d;",
    "}",
    "({ d } = {});",
    "let d;"
  ];

  TestRun(test, "Same-scope assignment following sub-scope reference")
    .addError(5, 5, "'d' was used before it was declared, which is illegal for 'let' variables.")
    .test(code, { esversion: 6 });

  test.done();
};

exports["destructuring in setter parameter"] = function (test) {

  TestRun(test).test([
    "var a = {",
    "  get x() {},",
    "  set x({ a, b }) {}",
    "};"
  ], { esversion: 6 });

  test.done();
};

exports["TDZ within initializer of lexical declarations"] = function(test) {
  var code = [
    "let a = a;",
    "const b = b;",
    "let c = () => c;",
    "const d = () => d;",
    // line 5
    "let e = {",
    "  x: e,",
    "  y: () => e",
    "};",
    "const f = {",
    "  x: f,",
    "  y: () => f",
    "};",
    // line 13
    "let g, h = g;",
    "const i = 0, j = i;",
    "let [ k, l ] = l;",
    "const [ m, n ] = n;",
    // line 17
    "let o = (() => o) + o;",
    "const p = (() => p) + p;"
  ];

  TestRun(test)
    .addError(1, 9, "'a' was used before it was declared, which is illegal for 'let' variables.")
    .addError(2, 11, "'b' was used before it was declared, which is illegal for 'const' variables.")
    .addError(6, 6, "'e' was used before it was declared, which is illegal for 'let' variables.")
    .addError(10, 6, "'f' was used before it was declared, which is illegal for 'const' variables.")
    .addError(15, 16, "'l' was used before it was declared, which is illegal for 'let' variables.")
    .addError(16, 18, "'n' was used before it was declared, which is illegal for 'const' variables.")
    .addError(17, 21, "'o' was used before it was declared, which is illegal for 'let' variables.")
    .addError(18, 23, "'p' was used before it was declared, which is illegal for 'const' variables.")
    .test(code, { esversion: 6 });

  test.done();
};

exports["TDZ within class heritage definition"] = function(test) {
  var code = [
    "let A = class extends A {};",
    "let B = class extends { B } {};",
    "let C = class extends { method() { return C; } } {};",
    // line 4
    "const D = class extends D {};",
    "const E = class extends { E } {};",
    "const F = class extends { method() { return F; } } {};",
    // line 7
    "class G extends G {}",
    "class H extends { H } {}",
    "class I extends { method() { return I; }} {}"
  ];

  TestRun(test)
    .addError(1, 23, "'A' was used before it was declared, which is illegal for 'let' variables.")
    .addError(2, 25, "'B' was used before it was declared, which is illegal for 'let' variables.")
    .addError(4, 25, "'D' was used before it was declared, which is illegal for 'const' variables.")
    .addError(5, 27, "'E' was used before it was declared, which is illegal for 'const' variables.")
    .addError(7, 17, "'G' was used before it was declared, which is illegal for 'class' variables.")
    .addError(8, 19, "'H' was used before it was declared, which is illegal for 'class' variables.")
    .test(code, { esversion: 6 });

  test.done();
};

exports["TDZ within for in/of head"] = function(test) {
  var code = [
    "for (let a   in a);",
    "for (const b in b);",
    "for (let c   of c);",
    "for (const d of d);",

    // line 5
    "for (let e   in { e });",
    "for (const f in { f });",
    "for (let g   of { g });",
    "for (const h of { h });",

    // line 9
    "for (let i   in { method() { return i; } });",
    "for (const j in { method() { return j; } });",
    "for (let k   of { method() { return k; } });",
    "for (const l of { method() { return l; } });"
  ];

  TestRun(test)
    .addError(1, 17, "'a' was used before it was declared, which is illegal for 'let' variables.")
    .addError(2, 17, "'b' was used before it was declared, which is illegal for 'const' variables.")
    .addError(3, 17, "'c' was used before it was declared, which is illegal for 'let' variables.")
    .addError(4, 17, "'d' was used before it was declared, which is illegal for 'const' variables.")
    .addError(5, 19, "'e' was used before it was declared, which is illegal for 'let' variables.")
    .addError(6, 19, "'f' was used before it was declared, which is illegal for 'const' variables.")
    .addError(7, 19, "'g' was used before it was declared, which is illegal for 'let' variables.")
    .addError(8, 19, "'h' was used before it was declared, which is illegal for 'const' variables.")
    .test(code, { esversion: 6 });

  test.done();
};

// regression test for gh-3370
exports.initializeCStyle = function(test) {
  TestRun(test)
    .test([
      "for (let x, y = x; ;) {}",
      "for (const x = 0, y = x; ;) {}"
    ], { esversion: 6 });

  test.done();
};

// regression test for gh-3455
exports.constWithoutVar = function(test) {
  TestRun(test)
    .addError(1, 11, "Expected an identifier and instead saw ';'.")
    .addError(1, 12, "Expected an identifier and instead saw ')'.")
    .addError(1, 12, "Expected ';' and instead saw ''.")
    .addError(1, 12, "Unrecoverable syntax error. (100% scanned).")
    .test([
      "for (const;)"
    ], { esversion: 6 });

  test.done();
};

exports.constWithoutInit = function(test) {
  TestRun(test, "single binding")
    .addError(1, 6, "const 'x' is initialized to 'undefined'.")
    .test([
      "for (const x; ;) {",
      "  void x;",
      "}"
    ], { esversion: 6 });

  TestRun(test, "multiple bindings")
    .addError(1, 6, "const 'y' is initialized to 'undefined'.")
    .test([
      "for (const y, z; ;) {",
      "  void (y, z);",
      "}"
    ], { esversion: 6 });

  test.done();
};
