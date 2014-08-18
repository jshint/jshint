"use strict";

var JSHINT  = require('../../src/jshint.js').JSHINT;
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

  for (i = 0, g = null; g = custom[i]; i += 1)
    test.ok(g in dict);

  // Regression test (GH-665)
  code = [
    "/*global bar*/",
    "foo = {};",
    "bar = {};"
  ];

  TestRun(test)
    .addError(2, "Read only.")
    .addError(3, "Read only.")
    .test(code, { es3: true, unused: true, predef: { foo: false }});

  test.done();
};

exports.testUnusedDefinedGlobals = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/unusedglobals.js", "utf8");

  TestRun(test)
    .addError(2, "'bar' is defined but never used.")
    .test(src, { es3: true, unused: true });

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

  TestRun(test).test(src);

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
    .addError(1, "The array literal notation [] is preferable.")
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
    .addError(1, "The object literal notation {} is preferable.")
    .test('Object();');

  TestRun(test)
    .addError(1, "The object literal notation {} is preferable.")
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
    .addError(1, "Expected an identifier and instead saw 'undefined' (a reserved word).")
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
    .addError(1, 'Variables should not be deleted.')
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
    .addError(3, "Expected a 'break' statement before 'case'.")
    .addError(18, "Expected a 'break' statement before 'default'.")
    .addError(40, "Unexpected ':'.")
    .test(src);

  test.done();
};

// GH-490: JSHint shouldn't require break before default if default is
// the first switch statement.
exports.switchDefaultFirst = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/switchDefaultFirst.js", "utf8");

  TestRun(test)
    .addError(5, "Expected a 'break' statement before 'default'.")
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
    .addError(1, "eval can be harmful.")
    .addError(8, "eval can be harmful.")
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
    .addError(4, "Expected '===' and instead saw '=='.")
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
    .addError(3, "Did you mean to return a conditional instead of an assignment?")
    .addError(38, "Line breaking error 'return'.")
    .addError(38, "Missing semicolon.")
    .addError(39, "Unnecessary semicolon.")
    .test(src, { es3: true });

  test.done();
};

exports.argsInCatchReused = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/trycatch.js', 'utf8');
  TestRun(test)
    .addError(6, "'e' is already defined.")
    .addError(12, "Do not assign to the exception parameter.")
    .addError(23, "'e' is not defined.")
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
    .addError(1, "Expected an identifier and instead saw ';'.")
    .addError(6, "Expected an assignment or function call and instead saw an expression.")
    .addError(10, "Unnecessary semicolon.")
    .addError(17, "Unnecessary semicolon.")
    .test(src, { es3: true, curly: false });

  TestRun(test)
    .addError(1, "Expected an identifier and instead saw ';'.")
    .addError(10, "Unnecessary semicolon.")
    .addError(17, "Unnecessary semicolon.")
    .test(src, { es3: true, curly: false, expr: true });

  test.done();
};

exports.insideEval = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/insideEval.js', 'utf8');

  TestRun(test)
    .addError(1, "eval can be harmful.")
    .addError(3, "eval can be harmful.")
    .addError(5, "eval can be harmful.")
    .addError(7, "eval can be harmful.")
    .addError(9, "eval can be harmful.")
    .addError(11, "Implied eval. Consider passing a function instead of a string.")
    .addError(13, "Implied eval. Consider passing a function instead of a string.")
    .addError(15, "Implied eval. Consider passing a function instead of a string.")
    .addError(17, "Implied eval. Consider passing a function instead of a string.")

    // The "TestRun" class (and these errors) probably needs some
    // facility for checking the expected scope of the error
    .addError(1, "Unexpected early end of program.")
    .addError(1, "Expected an identifier and instead saw '(end)'.")
    .addError(1, "Expected ')' and instead saw ''.")
    .addError(1, "Missing semicolon.")

    .test(src, { es3: true, evil: false });

  // Regression test for bug GH-714.
  JSHINT(src, { evil: false, maxerr: 1 });
  var err = JSHINT.data().errors[1];
  test.equal(err.raw, "Too many errors.");
  test.equal(err.scope, "(main)");

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
    .addError(1, "'a' is not defined.")
    .addError(1, "'b' is not defined.")
    .test(code, { es3: true, undef: true });

  test.done();
};

exports.defensiveSemicolon = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/gh-226.js', 'utf8');

  TestRun(test)
    .addError(16, "Unnecessary semicolon.")
    .addError(17, "Unnecessary semicolon.")
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
    .addError(0, "Bad option: 'invalid'.")
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
    .addError(0, "Input is neither a string nor an array of strings.")
    .test(undefined);

  TestRun(test)
    .addError(0, "Input is neither a string nor an array of strings.")
    .test(null);

  TestRun(test)
    .addError(0, "Input is neither a string nor an array of strings.")
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
    .addError(1, "Do not use Number as a constructor.", {
      character: 1
    })
    .test(code, {es3: true});

  test.done();
};

exports.missingRadix = function (test) {
  var code = "parseInt(20);";

  TestRun(test)
    .addError(1, "Missing radix parameter.", {
      character: 12
    })
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
    .addError(1, "Bad or unnecessary escaping.")
    .test("var a = '\\!';", {es3: true});

  test.done();
};

// GH-551 regression test.
exports.testSparseArrays = function (test) {
  var src = "var arr = ['a',, null,, '',, undefined,,];";

  TestRun(test)
    .addError(1, "Extra comma. (it breaks older versions of IE)")
    .addError(1, "Extra comma. (it breaks older versions of IE)")
    .addError(1, "Extra comma. (it breaks older versions of IE)")
    .addError(1, "Extra comma. (it breaks older versions of IE)")
    .test(src, {es3: true});

  TestRun(test)
    .test(src, {}); // es5

  test.done();
};

exports.testReserved = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/reserved.js", "utf8");

  TestRun(test)
    .addError(1, "Expected an identifier and instead saw 'volatile' (a reserved word).")
    .addError(5, "Expected an identifier and instead saw 'let' (a reserved word).")
    .addError(10, "Expected an identifier and instead saw 'let' (a reserved word).")
    .addError(13, "Expected an identifier and instead saw 'class' (a reserved word).")
    .addError(14, "Expected an identifier and instead saw 'else' (a reserved word).")
    .addError(15, "Expected an identifier and instead saw 'protected' (a reserved word).")
    .test(src, {es3: true});

  TestRun(test)
    .addError(5, "Expected an identifier and instead saw 'let' (a reserved word).")
    .addError(10, "Expected an identifier and instead saw 'let' (a reserved word).")
    .test(src, {}); // es5

  test.done();
};

// GH-744: Prohibit the use of reserved words as non-property
// identifiers.
exports.testES5Reserved = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/es5Reserved.js", "utf8");

  TestRun(test)
    .addError(2, "Expected an identifier and instead saw 'default' (a reserved word).")
    .addError(3, "Unexpected 'in'.")
    .addError(3, "Expected an identifier and instead saw 'in' (a reserved word).")
    .addError(6, "Expected an identifier and instead saw 'default' (a reserved word).")
    .addError(7, "Expected an identifier and instead saw 'new' (a reserved word).")
    .addError(8, "Expected an identifier and instead saw 'class' (a reserved word).")
    .addError(9, "Expected an identifier and instead saw 'default' (a reserved word).")
    .addError(10, "Expected an identifier and instead saw 'in' (a reserved word).")
    .addError(11, "Expected an identifier and instead saw 'in' (a reserved word).")
    .test(src, {es3: true});

  TestRun(test)
    .addError(6, "Expected an identifier and instead saw 'default' (a reserved word).")
    .addError(7, "Expected an identifier and instead saw 'new' (a reserved word).")
    .addError(8, "Expected an identifier and instead saw 'class' (a reserved word).")
    .addError(11, "Expected an identifier and instead saw 'in' (a reserved word).")
    .test(src, {}); // es5

  test.done();
};

exports.testCatchBlocks = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/gh247.js', 'utf8');

  TestRun(test)
    .addError(11, "'w' is not defined.")
    .test(src, { es3: true, undef: true, devel: true });

  src = fs.readFileSync(__dirname + '/fixtures/gh618.js', 'utf8');

  TestRun(test)
    .addError(5, "Value of 'x' may be overwritten in IE 8 and earlier.")
    .test(src, { es3: true, undef: true, devel: true });

  TestRun(test)
    .test(src, { es3: true, undef: true, devel: true, node: true });

  test.done();
};

exports.testNumericParams = function (test) {
  TestRun(test)
    .test("/*jshint maxparams:4, indent:3, maxlen:false */");

  TestRun(test)
    .addError(1, "Expected a small integer or 'false' and instead saw 'face'.")
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
    .addError(2, "Creating global 'for' variable. Should be 'for (var i ...'.")
    .test(src, {es3: true});

  src = [
    "(function (o) {",
    "for ('i' in o) { i(); }",
    "}());"
  ];

  TestRun(test)
    .addError(2, "Expected an identifier and instead saw '(string)'.")
    .test(src);

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
    "let z = undefined;"
  ];

  TestRun(test)
    .addError(1, "It's not necessary to initialize 'x' to 'undefined'.")
    .addError(2, "It's not necessary to initialize 'y' to 'undefined'.")
    .addError(3, "It's not necessary to initialize 'z' to 'undefined'.")
    .test(src, {esnext: true});

  test.done();
};

exports.testES6Modules = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/es6-import-export.js", "utf8");

  TestRun(test)
    .test(src, {esnext: true});

  TestRun(test)
    .addError(3, "'import' is only available in ES6 (use esnext option).")
    .addError(4, "'import' is only available in ES6 (use esnext option).")
    .addError(5, "'import' is only available in ES6 (use esnext option).")
    .addError(6, "'import' is only available in ES6 (use esnext option).")
    .addError(7, "'import' is only available in ES6 (use esnext option).")
    .addError(8, "'import' is only available in ES6 (use esnext option).")
    .addError(19, "'export' is only available in ES6 (use esnext option).")
    .addError(23, "'export' is only available in ES6 (use esnext option).")
    .addError(27, "'export' is only available in ES6 (use esnext option).")
    .addError(28, "'export' is only available in ES6 (use esnext option).")
    .addError(32, "'export' is only available in ES6 (use esnext option).")
    .addError(36, "'export' is only available in ES6 (use esnext option).")
    .addError(40, "'export' is only available in ES6 (use esnext option).")
    .addError(42, "'export' is only available in ES6 (use esnext option).")
    .addError(42, "'class' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(43, "'export' is only available in ES6 (use esnext option).")
    .addError(43, "'class' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .addError(44, "'export' is only available in ES6 (use esnext option).")
    .addError(44, "'class' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).")
    .test(src, {});

  var src2 = [
    "var a = {",
    "import: 'foo',",
    "export: 'bar'",
    "};"
  ];

  TestRun(test)
    .test(src2, {});

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
    "export { a, x };",
    "export var b = { baz: 'baz' };",
    "export function boo() { return z; }",
    "export class MyClass { }"
  ];

  TestRun(test)
    .test(src1, {
      esnext: true,
      unused: true
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
    "var z = 42;",
    "export default { a: a, x: x };",
    "export default function boo() { return x + z; }",
    "export default class MyClass { }"
  ];

  TestRun(test)
    .test(src1, {
      esnext: true,
      unused: true
    });

  test.done();
};

exports.testES6TemplateLiterals = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/es6-template-literal.js", "utf8");
  TestRun(test)
    .addError(6, "Unclosed template literal.")
    .addError(6, "Expected an identifier and instead saw '(end)'.")
    .addError(6, "Missing semicolon.")
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

exports.testES6TemplateLiteralsUndef = function (test) {
  var src = [
    "/* global alert */",
    "alert(`${a} world`);"
  ];
  TestRun(test)
    .addError(2, "'a' is not defined.")
    .test(src, { esnext: true, undef: true });

  test.done();
};

exports.testES6ExportStarFrom = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/es6-export-star-from.js", "utf8");
  TestRun(test)
    .addError(2, "Expected 'from' and instead saw 'foo'.")
    .addError(2, "Expected '(string)' and instead saw ';'.")
    .addError(2, "Missing semicolon.")
    .addError(3, "Expected '(string)' and instead saw '78'.")
    .test(src, { esnext: true });
  test.done();
};

exports.testPotentialVariableLeak = function (test) {
  var a = fs.readFileSync(__dirname + "/fixtures/leak.js", "utf8");
  var b = fs.readFileSync(__dirname + "/fixtures/gh1802.js", "utf8");

  // Real Error
  TestRun(test)
    .addError(2, "You might be leaking a variable (b) here.")
    .addError(3, "You might be leaking a variable (d) here.")
    .addError(4, "You might be leaking a variable (f) here.")
    .test(a, { esnext: true });

  // False Positive
  TestRun(test)
    .test(b);

  test.done();
};

exports.testDefaultArguments = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/default-arguments.js", "utf8");
  TestRun(test)
    .addError(11, "Regular parameters cannot come after default parameters.")
    .test(src, { esnext: true });

  TestRun(test)
    .addError(11, "Regular parameters cannot come after default parameters.")
    .test(src, { moz: true });

  TestRun(test)
    .addError(7, "'default parameters' is only available in ES6 (use esnext option).")
    .addError(11, "'default parameters' is only available in ES6 (use esnext option).")
    .addError(11, "Regular parameters cannot come after default parameters.")
    .test(src, {  });

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
    .addError(1, "Expected '===' and instead saw '=='.", {character: 9})
    .addError(3, "Expected '!==' and instead saw '!='.", {character: 11})
    .test(src, {eqeqeq: true});
  test.done();
};


exports.testArrayPrototypeExtensions = function (test) {
  Array.prototype.undefinedPrototypeProperty = undefined;

  JSHINT("var x = 123;\nlet y = 456;\nconst z = 123;");
  delete Array.prototype.undefinedPrototypeProperty;
  test.done();
};

exports.testModuleKeyword = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/module-keyword.js", "utf8");

  TestRun(test)
    .addError(4, "Missing semicolon.")
    .test(src, { esnext: true });

  TestRun(test)
    .test(src, { esnext: true, asi: true });

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
