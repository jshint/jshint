/**
 * Tests for all non-environmental options. Non-environmental options are
 * options that change how JSHint behaves instead of just pre-defining a set
 * of global variables.
 */

"use strict";

var JSHINT = require("../..").JSHINT;
var fs = require('fs');
var TestRun = require('../helpers/testhelper').setup.testRun;
var fixture = require('../helpers/fixture').fixture;

/**
 * Option `shadow` allows you to re-define variables later in code.
 *
 * E.g.:
 *   var a = 1;
 *   if (cond == true)
 *     var a = 2; // Variable a has been already defined on line 1.
 *
 * More often than not it is a typo, but sometimes people use it.
 */
exports.shadow = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/redef.js", "utf8");

  // Do not tolerate variable shadowing by default
  TestRun(test)
    .addError(5, 13, "'a' is already defined.")
    .addError(10, 9, "'foo' is already defined.")
    .test(src, {es3: true});

  TestRun(test)
    .addError(5, 13, "'a' is already defined.")
    .addError(10, 9, "'foo' is already defined.")
    .test(src, {es3: true, shadow: false });

  TestRun(test)
    .addError(5, 13, "'a' is already defined.")
    .addError(10, 9, "'foo' is already defined.")
    .test(src, {es3: true, shadow: "inner" });

  // Allow variable shadowing when shadow is true
  TestRun(test)
    .test(src, { es3: true, shadow: true });

  src = [
    "function f() {",
    "  function inner() {}",
    "}"
  ];
  TestRun(test, "nested functions - 'shadowed' `arguments` - true")
    .test(src, { shadow: true });
  TestRun(test, "nested functions - 'shadowed' `arguments` - false")
    .test(src, { shadow: false });
  TestRun(test, "nested functions - 'shadowed' `arguments` - 'inner'")
    .test(src, { shadow: "inner" });

  test.done();
};

/**
 * Option `shadow:outer` allows you to re-define variables later in inner scopes.
 *
 *  E.g.:
 *    var a = 1;
 *    function foo() {
 *        var a = 2;
 *    }
 */
exports.shadowouter = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/scope-redef.js", "utf8");

  // Do not tolarate inner scope variable shadowing by default
  TestRun(test)
    .addError(5, 13, "'a' is already defined in outer scope.")
    .addError(12, 18, "'b' is already defined in outer scope.")
    .addError(20, 18, "'bar' is already defined in outer scope.")
    .addError(26, 14, "'foo' is already defined.")
    .test(src, { es3: true, shadow: "outer" });

  test.done();
};

exports.shadowInline = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/shadow-inline.js", "utf8");

  TestRun(test)
    .addError(6, 18, "'a' is already defined in outer scope.")
    .addError(7, 13, "'a' is already defined.")
    .addError(7, 13, "'a' is already defined in outer scope.")
    .addError(17, 13, "'a' is already defined.")
    .addError(27, 13, "'a' is already defined.")
    .addError(42, 5, "Bad option value.")
    .addError(47, 13, "'a' is already defined.")
    .test(src);

  test.done();
};

exports.shadowEs6 = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/redef-es6.js", "utf8");

  var commonErrors = [
    [2, 5, "'ga' has already been declared."],
    [5, 7, "'gb' has already been declared."],
    [14, 9, "'gd' has already been declared."],
    [24, 9, "'gf' has already been declared."],
    [110, 5, "'gx' has already been declared."],
    [113, 7, "'gy' has already been declared."],
    [116, 7, "'gz' has already been declared."],
    [119, 5, "'gza' has already been declared."],
    [122, 5, "'gzb' has already been declared."],
    [132, 5, "'gzd' has already been declared."],
    [147, 7, "'gzf' has already been declared."],
    [156, 9, "'a' has already been declared."],
    [159, 11, "'b' has already been declared."],
    [168, 13, "'d' has already been declared."],
    [178, 13, "'f' has already been declared."],
    [264, 9, "'x' has already been declared."],
    [267, 11, "'y' has already been declared."],
    [270, 11, "'z' has already been declared."],
    [273, 9, "'za' has already been declared."],
    [276, 9, "'zb' has already been declared."],
    [286, 9, "'zd' has already been declared."],
    [301, 11, "'zf' has already been declared."],
    [317, 11, "'zi' has already been declared."],
    [344, 9, "'zzi' has already been declared."],
    [345, 11, "'zzj' has already been declared."],
    [349, 24, "'zzl' has already been declared."],
    [349, 30, "'zzl' was used before it was declared, which is illegal for 'const' variables."],
    [350, 22, "'zzm' has already been declared."],
    [350, 28, "'zzm' was used before it was declared, which is illegal for 'let' variables."],
    [364, 7, "'zj' has already been declared."]
  ];

  var innerErrors = [
    [343, 9, "'zzh' is already defined."],
    [348, 22, "'zzk' is already defined."]
  ];

  var outerErrors = [
    /* block scope variables shadowing out of scope */
    [9, 9, "'gc' is already defined."],
    [19, 11, "'ge' is already defined."],
    [28, 9, "'gg' is already defined in outer scope."],
    [32, 11, "'gh' is already defined in outer scope."],
    [36, 9, "'gi' is already defined in outer scope."],
    [40, 3, "'gj' is already defined."],
    [44, 3, "'gk' is already defined."],
    [48, 3, "'gl' is already defined."],
    [53, 7, "'gm' is already defined."],
    [59, 7, "'gn' is already defined."],
    [65, 7, "'go' is already defined."],
    [71, 9, "'gp' is already defined."],
    [76, 9, "'gq' is already defined."],
    [81, 11, "'gr' is already defined."],
    [86, 11, "'gs' is already defined."],
    [163, 13, "'c' is already defined."],
    [173, 15, "'e' is already defined."],
    [182, 13, "'g' is already defined in outer scope."],
    [186, 15, "'h' is already defined in outer scope."],
    [190, 13, "'i' is already defined in outer scope."],
    [194, 6, "'j' is already defined."],
    [198, 6, "'k' is already defined."],
    [202, 6, "'l' is already defined."],
    [207, 10, "'m' is already defined."],
    [213, 10, "'n' is already defined."],
    [219, 10, "'o' is already defined."],
    [225, 13, "'p' is already defined."],
    [230, 13, "'q' is already defined."],
    [235, 15, "'r' is already defined."],
    [240, 15, "'s' is already defined."],
    /* variables shadowing outside of function scope */
    [91, 9, "'gt' is already defined in outer scope."],
    [96, 9, "'gu' is already defined in outer scope."],
    [101, 11, "'gv' is already defined in outer scope."],
    [106, 9, "'gw' is already defined in outer scope."],
    [245, 13, "'t' is already defined in outer scope."],
    [250, 13, "'u' is already defined in outer scope."],
    [255, 15, "'v' is already defined in outer scope."],
    [260, 13, "'w' is already defined in outer scope."],
    /* variables shadowing outside multiple function scopes */
    [332, 17, "'zza' is already defined in outer scope."],
    [333, 17, "'zzb' is already defined in outer scope."],
    [334, 17, "'zzc' is already defined in outer scope."],
    [335, 17, "'zzd' is already defined in outer scope."],
    [336, 17, "'zze' is already defined in outer scope."],
    [337, 17, "'zzf' is already defined in outer scope."],
    [358, 9, "'zzn' is already defined in outer scope."]
  ];

  var testRun = TestRun(test);
  commonErrors.forEach(function(error) { testRun.addError.apply(testRun, error); });
  testRun.test(src, {esnext: true, shadow: true});

  var testRun = TestRun(test);
  commonErrors.concat(innerErrors).forEach(function(error) { testRun.addError.apply(testRun, error); });
  testRun.test(src, {esnext: true, shadow: "inner", maxerr: 100 });

  var testRun = TestRun(test);
  commonErrors.concat(innerErrors, outerErrors).forEach(function(error) { testRun.addError.apply(testRun, error); });
  testRun.test(src, {esnext: true, shadow: "outer", maxerr: 100});

  test.done();
};

/**
 * Option `latedef` allows you to prohibit the use of variable before their
 * definitions.
 *
 * E.g.:
 *   fn(); // fn will be defined later in code
 *   function fn() {};
 *
 * Since JavaScript has function-scope only, you can define variables and
 * functions wherever you want. But if you want to be more strict, use
 * this option.
 */
exports.latedef = function (test) {
  var src  = fs.readFileSync(__dirname + '/fixtures/latedef.js', 'utf8'),
    src1 = fs.readFileSync(__dirname + '/fixtures/redef.js', 'utf8'),
    esnextSrc = fs.readFileSync(__dirname + '/fixtures/latedef-esnext.js', 'utf8');

  // By default, tolerate the use of variable before its definition
  TestRun(test)
    .test(src, {es3: true, funcscope: true});

  TestRun(test)
      .addError(10, 5, "'i' was used before it was declared, which is illegal for 'let' variables.")
      .test(esnextSrc, {esnext: true});

  // However, JSHint must complain if variable is actually missing
  TestRun(test)
    .addError(1, 1, "'fn' is not defined.")
    .test('fn();', { es3: true, undef: true });

  // And it also must complain about the redefinition (see option `shadow`)
  TestRun(test)
    .addError(5, 13, "'a' is already defined.")
    .addError(10, 9, "'foo' is already defined.")
    .test(src1, { es3: true });

  // When latedef is true, JSHint must not tolerate the use before definition
  TestRun(test)
    .addError(10, 9, "'vr' was used before it was defined.")
    .test(src, { es3: true, latedef: "nofunc" });

  // when latedef is true, jshint must not warn if variable is defined.
  TestRun(test)
    .test([
      "if(true) { var a; }",
      "if (a) { a(); }",
      "var a;"], { es3: true, latedef: true});

  // When latedef_func is true, JSHint must not tolerate the use before definition for functions
  TestRun(test)
    .addError(2, 10, "'fn' was used before it was defined.")
    .addError(6, 14, "'fn1' was used before it was defined.")
    .addError(10, 9, "'vr' was used before it was defined.")
    .addError(18, 12, "'bar' was used before it was defined.")
    .addError(18, 3, "Inner functions should be listed at the top of the outer function.")
    .test(src, { es3: true, latedef: true });

  var es2015Errors = TestRun(test)
      .addError(4, 5, "'c' was used before it was defined.")
      .addError(6, 7, "'e' was used before it was defined.")
      .addError(8, 5, "'h' was used before it was defined.")
      .addError(10, 5, "'i' was used before it was declared, which is illegal for 'let' variables.")
      .addError(15, 9, "'ai' was used before it was defined.")
      .addError(20, 13, "'ai' was used before it was defined.")
      .addError(31, 9, "'bi' was used before it was defined.")
      .addError(48, 13, "'ci' was used before it was defined.")
      .addError(75, 10, "'importedName' was used before it was defined.")
      .addError(76, 8, "'importedModule' was used before it was defined.")
      .addError(77, 13, "'importedNamespace' was used before it was defined.");

  es2015Errors
      .test(esnextSrc, {esversion: 2015, latedef: true});
  es2015Errors
      .test(esnextSrc, {esversion: 2015, latedef: "nofunc"});

  TestRun(test, "shouldn't warn when marking a var as exported")
    .test("var a;", { exported: ["a"], latedef: true });

  test.done();
};

exports.latedefInline = function (test) {
  var src  = fs.readFileSync(__dirname + '/fixtures/latedef-inline.js', 'utf8');

  TestRun(test)
    .addError(4, 14, "'foo' was used before it was defined.")
    .addError(6, 9, "'a' was used before it was defined.")
    .addError(22, 9, "'a' was used before it was defined.")
    .addError(26, 5, "Bad option value.")
    .test(src);

  TestRun(test, "shouldn't warn when marking a var as exported")
    .test("/*exported a*/var a;", { latedef: true });

  test.done();
};

exports.notypeof = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/typeofcomp.js', 'utf8');

  TestRun(test)
    .addError(1, 17, "Invalid typeof value 'funtion'")
    .addError(2, 14, "Invalid typeof value 'double'")
    .addError(3, 17, "Invalid typeof value 'bool'")
    .addError(4, 11, "Invalid typeof value 'obj'")
    .addError(13, 17, "Invalid typeof value 'symbol'")
    .addError(14, 21, "'BigInt' is a non-standard language feature. Enable it using the 'bigint' unstable option.")
    .test(src);

  TestRun(test)
    .addError(1, 17, "Invalid typeof value 'funtion'")
    .addError(2, 14, "Invalid typeof value 'double'")
    .addError(3, 17, "Invalid typeof value 'bool'")
    .addError(4, 11, "Invalid typeof value 'obj'")
    .addError(14, 21, "'BigInt' is a non-standard language feature. Enable it using the 'bigint' unstable option.")
    .test(src, { esnext: true });

  TestRun(test)
    .addError(1, 17, "Invalid typeof value 'funtion'")
    .addError(2, 14, "Invalid typeof value 'double'")
    .addError(3, 17, "Invalid typeof value 'bool'")
    .addError(4, 11, "Invalid typeof value 'obj'")
    .test(src, { esnext: true, unstable: { bigint: true } });

  TestRun(test)
    .test(src, { notypeof: true });

  TestRun(test)
    .test(src, { notypeof: true, esnext: true });

  test.done();
}

exports['combination of latedef and undef'] = function (test) {
  var src = fixture('latedefundef.js');

  // Assures that when `undef` is set to true, it'll report undefined variables
  // and late definitions won't be reported as `latedef` is set to false.
  TestRun(test)
    .addError(29, 1, "'hello' is not defined.")
    .addError(35, 5, "'world' is not defined.")
    .test(src, { es3: true, latedef: false, undef: true });

  // When we suppress `latedef` and `undef` then we get no warnings.
  TestRun(test)
    .test(src, { es3: true, latedef: false, undef: false });

  // If we warn on `latedef` but suppress `undef` we only get the
  // late definition warnings.
  TestRun(test)
    .addError(5, 10, "'func2' was used before it was defined.")
    .addError(12, 10, "'foo' was used before it was defined.")
    .addError(18, 14, "'fn1' was used before it was defined.")
    .addError(26, 10, "'baz' was used before it was defined.")
    .addError(34, 14, "'fn' was used before it was defined.")
    .addError(41, 9, "'q' was used before it was defined.")
    .addError(46, 5, "'h' was used before it was defined.")
    .test(src, { es3: true, latedef: true, undef: false });

  // But we get all the functions warning if we disable latedef func
  TestRun(test)
    .addError(41, 9, "'q' was used before it was defined.")
    .addError(46, 5, "'h' was used before it was defined.")
    .test(src, { es3: true, latedef: "nofunc", undef: false });

  // If we warn on both options we get all the warnings.
  TestRun(test)
    .addError(5, 10, "'func2' was used before it was defined.")
    .addError(12, 10, "'foo' was used before it was defined.")
    .addError(18, 14, "'fn1' was used before it was defined.")
    .addError(26, 10, "'baz' was used before it was defined.")
    .addError(29, 1, "'hello' is not defined.")
    .addError(34, 14, "'fn' was used before it was defined.")
    .addError(35, 5, "'world' is not defined.")
    .addError(41, 9, "'q' was used before it was defined.")
    .addError(46, 5, "'h' was used before it was defined.")
    .test(src, { es3: true, latedef: true, undef: true });

  // If we remove latedef_func, we don't get the functions warning
  TestRun(test)
    .addError(29, 1, "'hello' is not defined.")
    .addError(35, 5, "'world' is not defined.")
    .addError(41, 9, "'q' was used before it was defined.")
    .addError(46, 5, "'h' was used before it was defined.")
    .test(src, { es3: true, latedef: "nofunc", undef: true });

  test.done();
};

exports.undefwstrict = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/undefstrict.js', 'utf8');
  TestRun(test).test(src, { es3: true, undef: false });

  test.done();
};

// Regression test for GH-431
exports["implied and unused should respect hoisting"] = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/gh431.js', 'utf8');
  TestRun(test)
    .addError(14, 5, "'fun4' is not defined.")
    .test(src, { undef: true }); // es5

  JSHINT(src, { undef: true });
  var report = JSHINT.data();

  test.equal(report.implieds.length, 1);
  test.equal(report.implieds[0].name, 'fun4');
  test.deepEqual(report.implieds[0].line, [14]);

  test.equal(report.unused.length, 3);

  test.done();
};

/**
 * The `proto` and `iterator` options allow you to prohibit the use of the
 * special `__proto__` and `__iterator__` properties, respectively.
 */
exports.testProtoAndIterator = function (test) {
  var source = fs.readFileSync(__dirname + '/fixtures/protoiterator.js', 'utf8');
  var json = '{"__proto__": true, "__iterator__": false, "_identifier": null, "property": 123}';

  // JSHint should not allow the `__proto__` and
  // `__iterator__` properties by default
  TestRun(test)
    .addError(7, 34, "The '__proto__' property is deprecated.")
    .addError(8, 19, "The '__proto__' property is deprecated.")
    .addError(10, 19, "The '__proto__' property is deprecated.")
    .addError(27, 29, "The '__iterator__' property is deprecated.")
    .addError(27, 53, "The '__iterator__' property is deprecated.")
    .addError(33, 19, "The '__proto__' property is deprecated.")
    .addError(37, 29, "The '__proto__' property is deprecated.")
    .test(source, {es3: true});

  TestRun(test)
    .addError(1, 2, "The '__proto__' key may produce unexpected results.")
    .addError(1, 21, "The '__iterator__' key may produce unexpected results.")
    .test(json, {es3: true});

  // Should not report any errors when proto and iterator
  // options are on
  TestRun("source").test(source, { es3: true, proto: true, iterator: true });
  TestRun("json").test(json, { es3: true, proto: true, iterator: true });

  test.done();
};

/**
 * The `camelcase` option allows you to enforce use of the camel case convention.
 */
exports.testCamelcase = function (test) {
  var source = fs.readFileSync(__dirname + '/fixtures/camelcase.js', 'utf8');

  // By default, tolerate arbitrary identifiers
  TestRun(test)
    .test(source, {es3: true});

  // Require identifiers in camel case if camelcase is true
  TestRun(test)
    .addError(5, 17, "Identifier 'Foo_bar' is not in camel case.")
    .addError(5, 25, "Identifier 'test_me' is not in camel case.")
    .addError(6, 15, "Identifier 'test_me' is not in camel case.")
    .addError(6, 25, "Identifier 'test_me' is not in camel case.")
    .addError(13, 26, "Identifier 'test_1' is not in camel case.")
    .test(source, { es3: true, camelcase: true });


  test.done();
};

/**
 * Option `curly` allows you to enforce the use of curly braces around
 * control blocks. JavaScript allows one-line blocks to go without curly
 * braces but some people like to always use curly bracse. This option is
 * for them.
 *
 * E.g.:
 *   if (cond) return;
 *     vs.
 *   if (cond) { return; }
 */
exports.curly = function (test) {
  var src  = fs.readFileSync(__dirname + '/fixtures/curly.js', 'utf8'),
    src1 = fs.readFileSync(__dirname + '/fixtures/curly2.js', 'utf8');

  // By default, tolerate one-line blocks since they are valid JavaScript
  TestRun(test).test(src, {es3: true});
  TestRun(test).test(src1, {es3: true});

  // Require all blocks to be wrapped with curly braces if curly is true
  TestRun(test)
    .addError(2, 5, "Expected '{' and instead saw 'return'.")
    .addError(5, 5, "Expected '{' and instead saw 'doSomething'.")
    .addError(8, 5, "Expected '{' and instead saw 'doSomething'.")
    .addError(11, 5, "Expected '{' and instead saw 'doSomething'.")
    .test(src, { es3: true, curly: true });

  TestRun(test).test(src1, { es3: true, curly: true });

  test.done();
};

/** Option `noempty` prohibits the use of empty blocks. */
exports.noempty = function (test) {
  var code = [
    "for (;;) {}",
    "if (true) {",
    "}",
    "foo();"
  ];

  // By default, tolerate empty blocks since they are valid JavaScript
  TestRun(test).test(code, { es3: true });

  // Do not tolerate, when noempty is true
  TestRun(test)
    .addError(1, 10, "Empty block.")
    .addError(2, 11, "Empty block.")
    .test(code, { es3: true, noempty: true });

  test.done();
};

/**
 * Option `noarg` prohibits the use of arguments.callee and arguments.caller.
 * JSHint allows them by default but you have to know what you are doing since:
 *  - They are not supported by all JavaScript implementations
 *  - They might prevent an interpreter from doing some optimization tricks
 *  - They are prohibited in the strict mode
 */
exports.noarg = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/noarg.js', 'utf8');

  // By default, tolerate both arguments.callee and arguments.caller
  TestRun(test).test(src, { es3: true });

  // Do not tolerate both .callee and .caller when noarg is true
  TestRun(test)
    .addError(2, 12, 'Avoid arguments.callee.')
    .addError(6, 12, 'Avoid arguments.caller.')
    .test(src, { es3: true, noarg: true });

  test.done();
};

/** Option `nonew` prohibits the use of constructors for side-effects */
exports.nonew = function (test) {
  var code  = "new Thing();",
    code1 = "var obj = new Thing();";

  TestRun(test).test(code, { es3: true });
  TestRun(test).test(code1, { es3: true });

  TestRun(test)
    .addError(1, 1, "Do not use 'new' for side effects.")
    .test(code, { es3: true, nonew: true });

  test.done();
};

// Option `asi` allows you to use automatic-semicolon insertion
exports.asi = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/asi.js', 'utf8');

  TestRun(test, 1)
    .addError(2, 13, "Missing semicolon.")
    .addError(4, 21, "Missing semicolon.")
    .addError(5, 14, "Missing semicolon.")
    .addError(9, 18, "Line breaking error 'continue'.")
    .addError(9, 26, "Missing semicolon.")
    .addError(10, 14, "Missing semicolon.")
    .addError(11, 18, "Line breaking error 'break'.")
    .addError(11, 23, "Missing semicolon.")
    .addError(12, 14, "Missing semicolon.")
    .addError(16, 23, "Missing semicolon.")
    .addError(17, 19, "Missing semicolon.")
    .addError(19, 13, "Line breaking error 'break'.")
    .addError(19, 18, "Missing semicolon.")
    .addError(21, 13, "Line breaking error 'break'.")
    .addError(21, 18, "Missing semicolon.")
    .addError(25, 6, "Missing semicolon.")
    .addError(26, 10, "Missing semicolon.")
    .addError(27, 12, "Missing semicolon.")
    .addError(28, 12, "Missing semicolon.")
    .test(src, { es3: true });

  TestRun(test, 2)
    .test(src, { es3: true, asi: true });

  var code = [
    "function a() { 'code' }",
    "function b() { 'code'; 'code' }",
    "function c() { 'code', 'code' }",
    "function d() {",
    "  'code' }",
    "function e() { 'code' 'code' }"
  ];

  TestRun(test, "gh-2714")
    .addError(2, 24, "Unnecessary directive \"code\".")
    .addError(3, 24, "Expected an assignment or function call and instead saw an expression.")
    .addError(6, 22, "Missing semicolon.", { code: "E058" })
    .addError(6, 16, "Expected an assignment or function call and instead saw an expression.")
    .addError(6, 23, "Expected an assignment or function call and instead saw an expression.")
    .test(code, { asi: true });

  test.done();
};

// Option `asi` extended for safety -- warn in scenarios that would be unsafe when using asi.
exports.safeasi = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/safeasi.js', 'utf8');

  TestRun(test, 1)
    // TOOD consider setting an option to suppress these errors so that
    // the tests don't become tightly interdependent
    .addError(10, 5, "Misleading line break before '/'; readers may interpret this as an expression boundary.")
    .addError(10, 8, "Expected an identifier and instead saw '.'.")
    .addError(10, 8, "Expected an assignment or function call and instead saw an expression.")
    .addError(10, 9, "Missing semicolon.")
    .addError(10, 30, "Missing semicolon.")
    .addError(11, 5, "Missing semicolon.")
    .addError(21, 2, "Missing semicolon.")
    .test(src, {});

  TestRun(test, 2)
    .addError(5, 1, "Misleading line break before '('; readers may interpret this as an expression boundary.")
    .addError(8, 5, "Misleading line break before '('; readers may interpret this as an expression boundary.")
    .addError(10, 5, "Misleading line break before '/'; readers may interpret this as an expression boundary.")
    .addError(10, 8, "Expected an identifier and instead saw '.'.")
    .addError(10, 8, "Expected an assignment or function call and instead saw an expression.")
    .addError(10, 9, "Missing semicolon.")
    .test(src, { asi: true });

  var afterBracket = [
    'x = []',
    '[1];',
    'x[0]',
    '(2);'
  ];

  TestRun(test, 'following bracket (asi: false)')
    .test(afterBracket);

  TestRun(test, 'following bracket (asi: true)')
    .addError(2, 1, "Misleading line break before '['; readers may interpret this as an expression boundary.")
    .addError(4, 1, "Misleading line break before '('; readers may interpret this as an expression boundary.")
    .test(afterBracket, { asi: true });

  var asClause = [
    'if (true)',
    '  ({x} = {});',
    'if (true)',
    '  [x] = [0];',
    'while (false)',
    '  ({x} = {});',
    'while (false)',
    '  [x] = [0];'
  ];

  // Regression tests for gh-3304
  TestRun(test, 'as clause (asi: false)')
    .test(asClause, { esversion: 6 });

  TestRun(test, 'as clause (asi: true)')
    .test(asClause, { esversion: 6, asi: true });

  test.done();
};

exports["missing semicolons not influenced by asi"] = function (test) {
  // These tests are taken from
  // http://www.ecma-international.org/ecma-262/6.0/index.html#sec-11.9.2

  var code = [
    "void 0;", // Not JSON
    "{ 1 2 } 3"
  ];

  TestRun(test)
    .addError(2, 4, "Missing semicolon.", { code: "E058" })
    .test(code, { expr: true, asi: true });

  code = [
    "void 0;",
    "{ 1",
    "2 } 3"
  ];

  TestRun(test).test(code, { expr: true, asi: true });

  code = "do {} while (false) var a;";

  TestRun(test, "do-while as es5")
    .addError(1, 20, "Missing semicolon.", { code: "E058" })
    .test(code);

  TestRun(test, "do-while as es5+moz")
    .addError(1, 20, "Missing semicolon.", { code: "E058" })
    .test(code, { moz: true });

  TestRun(test, "do-while as es6")
    .addError(1, 20, "Missing semicolon.", { code: "W033" })
    .test(code, { esversion: 6 });

  TestRun(test, "do-while as es6 with asi")
    .test(code, { esversion: 6, asi: true });

  TestRun(test, "do-while false positive")
    .addError(1, 5, "Missing semicolon.", { code: "E058" })
    .test("'do' var x;", { esversion: 6, expr: true });

  test.done();
};

/** Option `lastsemic` allows you to skip the semicolon after last statement in a block,
  * if that statement is followed by the closing brace on the same line. */
exports.lastsemic = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/lastsemic.js', 'utf8');

  // without lastsemic
  TestRun(test)
    .addError(2, 11, "Missing semicolon.") // missing semicolon in the middle of a block
    .addError(4, 45, "Missing semicolon.") // missing semicolon in a one-liner function
    .addError(5, 12, "Missing semicolon.") // missing semicolon at the end of a block
    .test(src, {es3: true});

  // with lastsemic
  TestRun(test)
    .addError(2, 11, "Missing semicolon.")
    .addError(5, 12, "Missing semicolon.")
    .test(src, { es3: true, lastsemic: true });
  // this line is valid now: [1, 2, 3].forEach(function(i) { print(i) });
  // line 5 isn't, because the block doesn't close on the same line

  test.done();
};

/**
 * Option `expr` allows you to use ExpressionStatement as a Program code.
 *
 * Even though ExpressionStatement as a Program (i.e. without assingment
 * of its result) is a valid JavaScript, more often than not it is a typo.
 * That's why by default JSHint complains about it. But if you know what
 * are you doing, there is nothing wrong with it.
 */
exports.expr = function (test) {
  var exps = [
    { character: 33, src: "obj && obj.method && obj.method();" },
    { character: 20, src: "myvar && func(myvar);" },
    { character: 1, src: "1;" },
    { character: 1, src: "true;" },
    { character: 19, src: "+function (test) {};" }
  ];

  for (var i = 0, exp; exp = exps[i]; i += 1) {
    TestRun(test)
      .addError(1, exp.character, 'Expected an assignment or function call and instead saw an expression.')
      .test(exp.src, { es3: true });
  }

  for (i = 0, exp = null; exp = exps[i]; i += 1) {
    TestRun(test).test(exp.src, { es3: true, expr: true });
  }

  test.done();
};

// Option `undef` requires you to always define variables you use.
exports.undef = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/undef.js', 'utf8');

  // Make sure there are no other errors
  TestRun(test).test(src, { es3: true });

  // Make sure it fails when undef is true
  TestRun(test)
    .addError(1, 1, "'undef' is not defined.")
    .addError(5, 12, "'undef' is not defined.")
    .addError(6, 12, "'undef' is not defined.")
    .addError(8, 12, "'undef' is not defined.")
    .addError(9, 12, "'undef' is not defined.")
    .addError(13, 5, "'localUndef' is not defined.")
    .addError(18, 16, "'localUndef' is not defined.")
    .addError(19, 16, "'localUndef' is not defined.")
    .addError(21, 16, "'localUndef' is not defined.")
    .addError(22, 16, "'localUndef' is not defined.")
    .addError(32, 12, "'undef' is not defined.")
    .addError(33, 13, "'undef' is not defined.")
    .addError(34, 12, "'undef' is not defined.")
    .test(src, { es3: true, undef: true });

  // block scope cannot use themselves in the declaration
  TestRun(test)
    .addError(1, 9, "'a' was used before it was declared, which is illegal for 'let' variables.")
    .addError(2, 11, "'b' was used before it was declared, which is illegal for 'const' variables.")
    .addError(5, 7, "'e' is already defined.")
    .test([
      'let a = a;',
      'const b = b;',
      'var c = c;',
      'function f(e) {',
      '  var e;',         // the var does not overwrite the param, the param is used
      '  e = e || 2;',
      '  return e;',
      '}'
    ], { esnext: true, undef: true });

  // Regression test for GH-668.
  src = fs.readFileSync(__dirname + "/fixtures/gh668.js", "utf8");
  test.ok(JSHINT(src, { undef: true }));
  test.ok(!JSHINT.data().implieds);

  test.ok(JSHINT(src));
  test.ok(!JSHINT.data().implieds);

  JSHINT("if (typeof foobar) {}", { undef: true });

  test.strictEqual(JSHINT.data().implieds, undefined);

  // See gh-3055 "Labels Break JSHint"
  TestRun(test, "following labeled block")
    .addError(4, 6, "'x' is not defined.")
    .test([
      "label: {",
      "  let x;",
      "}",
      "void x;"
    ], { esversion: 6, undef: true });

  TestRun(test)
    .addError(1, 1, "'foo' is not defined.")
    .test(['foo.call();',
      '/* exported foo, bar */'],
    {undef: true});

  TestRun(test, "arguments - ES5")
    .addError(6, 6, "'arguments' is not defined.")
    .test([
      "function f() { return arguments; }",
      "void function() { return arguments; };",
      "void function f() { return arguments; };",
      "void { get g() { return arguments; } };",
      "void { get g() {}, set g(_) { return arguments; } };",
      "void arguments;"
    ], { undef: true });

  TestRun(test, "arguments - ES2015")
    .addError(47, 11, "'arguments' is not defined.")
    .addError(48, 21, "'arguments' is not defined.")
    .addError(49, 12, "'arguments' is not defined.")
    .test([
      "function f(_ = arguments) {}",
      "void function (_ = arguments) {};",
      "void function f(_ = arguments) {};",
      "function* g(_ = arguments) { yield; }",
      "void function* (_ = arguments) { yield; };",
      "void function* g(_ = arguments) { yield; };",
      "function* g() { yield arguments; }",
      "void function* () { yield arguments; };",
      "void function* g() { yield arguments; };",
      "void { method(_ = arguments) {} };",
      "void { method() { return arguments; } };",
      "void { *method(_ = arguments) { yield; } };",
      "void { *method() { yield arguments; } };",
      "class C0 { constructor(_ = arguments) {} }",
      "class C1 { constructor() { return arguments; } }",
      "class C2 { method(_ = arguments) {} }",
      "class C3 { method() { return arguments; } }",
      "class C4 { *method(_ = arguments) { yield; } }",
      "class C5 { *method() { yield arguments; } }",
      "class C6 { static method(_ = arguments) {} }",
      "class C7 { static method() { return arguments; } }",
      "class C8 { static *method(_ = arguments) { yield; } }",
      "class C9 { static *method() { yield arguments; } }",
      "void class { constructor(_ = arguments) {} };",
      "void class { constructor() { return arguments; } };",
      "void class { method(_ = arguments) {} };",
      "void class { method() { return arguments; } };",
      "void class { *method(_ = arguments) { yield; } };",
      "void class { *method() { yield arguments; } };",
      "void class { static method(_ = arguments) {} };",
      "void class { static method() { return arguments; } };",
      "void class { static *method(_ = arguments) { yield; } };",
      "void class { static *method() { yield arguments; } };",
      "void class C { constructor(_ = arguments) {} };",
      "void class C { constructor() { return arguments; } };",
      "void class C { method(_ = arguments) {} };",
      "void class C { method() { return arguments; } };",
      "void class C { *method(_ = arguments) { yield; } };",
      "void class C { *method() { yield arguments; } };",
      "void class C { static method(_ = arguments) {} };",
      "void class C { static method() { return arguments; } };",
      "void class C { static *method(_ = arguments) { yield; } };",
      "void class C { static *method() { yield arguments; } };",
      "void function() { void (_ = arguments) => _; };",
      "void function() { void () => { return arguments; }; };",
      "void function() { void () => arguments; };",
      "void (_ = arguments) => _;",
      "void () => { return arguments; };",
      "void () => arguments;"
    ], { undef: true, esversion: 6 });

  test.done();
};

exports.undefToOpMethods = function (test) {
  TestRun(test)
    .addError(2, 12, "'undef' is not defined.")
    .addError(3, 12, "'undef' is not defined.")
    .test([
      "var obj;",
      "obj.delete(undef);",
      "obj.typeof(undef);"
    ], { undef: true });

  test.done();
};

/**
 * In strict mode, the `delete` operator does not accept unresolvable
 * references:
 *
 * http://es5.github.io/#x11.4.1
 *
 * This will only be apparent in cases where the user has suppressed warnings
 * about deleting variables.
 */
exports.undefDeleteStrict = function (test) {
  TestRun(test)
    .addError(3, 10, "'aNullReference' is not defined.")
    .test([
      "(function() {",
      "  'use strict';",
      "  delete aNullReference;",
      "}());"
    ], { undef: true, "-W051": false });

  test.done();
};

exports.unused = {};
exports.unused.basic = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/unused.js', 'utf8');

  var allErrors = [
    [22, 7, "'i' is defined but never used."],
    [101, 5, "'inTry2' used out of scope."],
    [117, 13, "'inTry9' was used before it was declared, which is illegal for 'let' variables."],
    [118, 15, "'inTry10' was used before it was declared, which is illegal for 'const' variables."]
  ];

  var testRun = TestRun(test);
  allErrors.forEach(function (e) {
    testRun.addError.apply(testRun, e);
  });
  testRun.test(src, { esnext: true });

  var var_errors = allErrors.concat([
    [1, 5, "'a' is defined but never used."],
    [7, 9, "'c' is defined but never used."],
    [15, 10, "'foo' is defined but never used."],
    [20, 10, "'bar' is defined but never used."],
    [36, 7, "'cc' is defined but never used."],
    [39, 9, "'dd' is defined but never used."],
    [58, 11, "'constUsed' is defined but never used."],
    [62, 9, "'letUsed' is defined but never used."],
    [63, 9, "'anotherUnused' is defined but never used."],
    [91, 9, "'inTry6' is defined but never used."],
    [94, 9, "'inTry9' is defined but never used."],
    [95, 11, "'inTry10' is defined but never used."],
    [99, 13, "'inTry4' is defined but never used."],
    [122, 10, "'unusedRecurringFunc' is defined but never used."]
  ]);

  var last_param_errors = [
    [6, 18, "'f' is defined but never used."],
    [28, 14, "'a' is defined but never used."],
    [28, 17, "'b' is defined but never used."],
    [28, 20, "'c' is defined but never used."],
    [68, 5, "'y' is defined but never used."],
    [69, 6, "'y' is defined but never used."],
    [70, 9, "'z' is defined but never used."]
  ];

  var all_param_errors = [
    [15, 14, "'err' is defined but never used."],
    [71, 6, "'y' is defined but never used."]
  ];

  var true_run = TestRun(test, {esnext: true});

  var_errors.slice().concat(last_param_errors).forEach(function (e) {
    true_run.addError.apply(true_run, e);
  });

  true_run.test(src, { esnext: true, unused: true });
  test.ok(!JSHINT(src, { esnext: true, unused: true }));

  // Test checking all function params via unused="strict"
  var all_run = TestRun(test);
  var_errors.slice().concat(last_param_errors, all_param_errors).forEach(function (e) {
    all_run.addError.apply(true_run, e);
  });

  all_run.test(src, { esnext: true, unused: "strict"});

  // Test checking everything except function params
  var vars_run = TestRun(test);
  var_errors.forEach(function (e) { vars_run.addError.apply(vars_run, e); });
  vars_run.test(src, { esnext: true, unused: "vars"});

  var unused = JSHINT.data().unused;
  test.equal(24, unused.length);
  test.ok(unused.some(function (err) { return err.line === 1 && err.character == 5 && err.name === "a"; }));
  test.ok(unused.some(function (err) { return err.line === 6 && err.character == 18 && err.name === "f"; }));
  test.ok(unused.some(function (err) { return err.line === 7 && err.character == 9 && err.name === "c"; }));
  test.ok(unused.some(function (err) { return err.line === 15 && err.character == 10 && err.name === "foo"; }));
  test.ok(unused.some(function (err) { return err.line === 68 && err.character == 5 && err.name === "y"; }));

  test.done();
};

// Regression test for gh-3362
exports.unused.es3Reserved = function (test) {
  TestRun(test)
    .addError(1, 5, "'abstract' is defined but never used.")
    .addError(1, 15, "'boolean' is defined but never used.")
    .addError(1, 24, "'byte' is defined but never used.")
    .addError(1, 30, "'char' is defined but never used.")
    .addError(1, 36, "'double' is defined but never used.")
    .addError(1, 44, "'final' is defined but never used.")
    .addError(1, 51, "'float' is defined but never used.")
    .addError(1, 58, "'goto' is defined but never used.")
    .addError(1, 64, "'int' is defined but never used.")
    .addError(2, 5, "'long' is defined but never used.")
    .addError(2, 11, "'native' is defined but never used.")
    .addError(2, 19, "'short' is defined but never used.")
    .addError(2, 26, "'synchronized' is defined but never used.")
    .addError(2, 40, "'transient' is defined but never used.")
    .addError(2, 51, "'volatile' is defined but never used.")
    .test([
      "var abstract, boolean, byte, char, double, final, float, goto, int;",
      "var long, native, short, synchronized, transient, volatile;",
    ], {unused: true});

  TestRun(test)
    .test([
      "var abstract, boolean, byte, char, double, final, float, goto, int;",
      "var long, native, short, synchronized, transient, volatile;",
      "void (abstract + boolean + byte + char + double + final + float + loat + goto + int);",
      "void (long + native + short + synchronized + transient + volatile);"
    ], {unused: true});

  test.done();
};

// Regression test for gh-2784
exports.unused.usedThroughShadowedDeclaration = function (test) {
  var code = [
    "(function() {",
    "  var x;",
    "  {",
    "    var x;",
    "    void x;",
    "  }",
    "}());"
  ];

  TestRun(test)
    .addError(4, 9, "'x' is already defined.")
    .test(code, { unused: true });

  test.done();
};

exports.unused.unusedThroughShadowedDeclaration = function (test) {
  var code = [
    "(function() {",
    "  {",
    "      var x;",
    "      void x;",
    "  }",
    "  {",
    "      var x;",
    "  }",
    "})();"
  ];

  TestRun(test)
    .addError(7, 11, "'x' is already defined.")
    .test(code, { unused: true });

  test.done();
};

exports.unused.hoisted = function (test) {
  var code = [
    "(function() {",
    "  {",
    "    var x;",
    "  }",
    "  {",
    "    var x;",
    "  }",
    "  void x;",
    "}());"
  ];

  TestRun(test)
    .addError(6, 9, "'x' is already defined.")
    .addError(8, 8, "'x' used out of scope.")
    .test(code, { unused: true });

  test.done();
};

exports.unused.crossBlocks = function (test) {
  var code = fs.readFileSync(__dirname + '/fixtures/unused-cross-blocks.js', 'utf8');

  TestRun(test)
    .addError(15, 9, "'func4' is already defined.")
    .addError(18, 9, "'func5' is already defined.")
    .addError(41, 11, "'topBlock6' is already defined.")
    .addError(44, 11, "'topBlock7' is already defined.")
    .addError(56, 13, "'topBlock3' is already defined.")
    .addError(59, 13, "'topBlock4' is already defined.")
    .addError(9, 7, "'unusedFunc' is defined but never used.")
    .addError(27, 9, "'unusedTopBlock' is defined but never used.")
    .addError(52, 11, "'unusedNestedBlock' is defined but never used.")
    .test(code, { unused: true });

  TestRun(test)
    .addError(15, 9, "'func4' is already defined.")
    .addError(18, 9, "'func5' is already defined.")
    .addError(41, 11, "'topBlock6' is already defined.")
    .addError(44, 11, "'topBlock7' is already defined.")
    .addError(56, 13, "'topBlock3' is already defined.")
    .addError(59, 13, "'topBlock4' is already defined.")
    .test(code);

  test.done();
};

// Regression test for gh-3354
exports.unused.methodNames = function (test) {
  TestRun(test, "object methods - ES5")
    .test([
      "var p;",
      "void {",
      "  get p() { void p; },",
      "  set p(_) { void p; void _; }",
      "};"
    ], { unused: true, esversion: 5 });

  TestRun(test, "object methods - ES6")
    .test([
      "var m, g;",
      "void {",
      "  m() { void m; },",
      "  *g() { yield g; }",
      "};"
    ], { unused: true, esversion: 6 });

  TestRun(test, "object methods - ES8")
    .test([
      "var m;",
      "void {",
      "  async m() { void m; }",
      "};"
    ], { unused: true, esversion: 8 });

  TestRun(test, "object methods - ES9")
    .test([
      "var m;",
      "void {",
      "  async * m() { yield m; }",
      "};"
    ], { unused: true, esversion: 9 });

  TestRun(test, "class methods - ES6")
    .test([
      "var m, g, p, s;",
      "void class {",
      "  m() { void m; }",
      "  *g() { yield g; }",
      "  get p() { void p; }",
      "  set p() { void p; }",
      "  static s() { void s; }",
      "};"
    ], { unused: true, esversion: 6 });

  TestRun(test, "class methods - ES8")
    .test([
      "var m;",
      "void class {",
      "  async m() { void m; }",
      "};"
    ], { unused: true, esversion: 8 });

  TestRun(test, "class methods - ES9")
    .test([
      "var m;",
      "void class {",
      "  async * m() { yield m; }",
      "};"
    ], { unused: true, esversion: 9 });

  test.done();
};

exports['param overrides function name expression'] = function (test) {
  TestRun(test)
    .test([
      "var A = function B(B) {",
      "  return B;",
      "};",
      "A();"
    ], { undef: true, unused: "strict" });

  test.done();
};

exports['let can re-use function and class name'] = function (test) {
  TestRun(test)
    .test([
      "var A = function B(C) {",
      "  let B = C;",
      "  return B;",
      "};",
      "A();",
      "var D = class E { constructor(F) { let E = F; return E; }};",
      "D();"
    ], { undef: true, unused: "strict", esnext: true });

  test.done();
};

exports['unused with param destructuring'] = function(test) {
  var code = [
    "let b = ([...args], a) => a;",
    "b = args => true;",
    "b = function([...args], a) { return a; };",
    "b = function([args], a) { return a; };",
    "b = function({ args }, a) { return a; };",
    "b = function({ a: args }, a) { return a; };",
    "b = function({ a: [args] }, a) { return a; };",
    "b = function({ a: [args] }, a) { return a; };"
  ];

  TestRun(test)
    .addError(2, 5, "'args' is defined but never used.")
    .test(code, { esnext: true, unused: true });

  TestRun(test)
    .addError(1, 14, "'args' is defined but never used.")
    .addError(2, 5, "'args' is defined but never used.")
    .addError(3, 18, "'args' is defined but never used.")
    .addError(4, 15, "'args' is defined but never used.")
    .addError(5, 16, "'args' is defined but never used.")
    .addError(6, 19, "'args' is defined but never used.")
    .addError(7, 20, "'args' is defined but never used.")
    .addError(8, 20, "'args' is defined but never used.")
    .test(code, { esnext: true, unused: "strict" });


  test.done();
};

exports['unused data with options'] = function (test) {

  // see gh-1894 for discussion on this test

  var code = [
    "function func(placeHolder1, placeHolder2, used, param) {",
    "  used = 1;",
    "}"
  ];

  var expectedVarUnused = [{ name: 'func', line: 1, character: 10 }];
  var expectedParamUnused = [{ name: 'param', line: 1, character: 49 }];
  var expectedPlaceholderUnused = [{ name: 'placeHolder2', line: 1, character: 29 },
    { name: 'placeHolder1', line: 1, character: 15 }];

  var expectedAllUnused = expectedParamUnused.concat(expectedPlaceholderUnused, expectedVarUnused);
  var expectedVarAndParamUnused = expectedParamUnused.concat(expectedVarUnused);

  // true
  TestRun(test)
    .addError(1, 10, "'func' is defined but never used.")
    .addError(1, 49, "'param' is defined but never used.")
    .test(code, { unused: true });

  var unused = JSHINT.data().unused;
  test.deepEqual(expectedVarAndParamUnused, unused);

  // false
  TestRun(test)
    .test(code, { unused: false });

  unused = JSHINT.data().unused;
  test.deepEqual(expectedVarUnused, unused);

  // strict
  TestRun(test)
    .addError(1, 10, "'func' is defined but never used.")
    .addError(1, 15, "'placeHolder1' is defined but never used.")
    .addError(1, 29, "'placeHolder2' is defined but never used.")
    .addError(1, 49, "'param' is defined but never used.")
    .test(code, { unused: "strict" });

  unused = JSHINT.data().unused;
  test.deepEqual(expectedAllUnused, unused);

  // vars
  TestRun(test)
    .addError(1, 10, "'func' is defined but never used.")
    .test(code, { unused: "vars" });

  unused = JSHINT.data().unused;
  test.deepEqual(expectedAllUnused, unused);

  test.done();
};

exports['unused with global override'] = function (test) {
  var code;

  code = [
    "alert();",
    "function alert() {}"
  ];

  TestRun(test)
    .test(code, { unused: true, undef: true, devel: true, latedef: false });

  test.done();
};

// Regressions for "unused" getting overwritten via comment (GH-778)
exports['unused overrides'] = function (test) {
  var code;

  code = ['function foo(a) {', '/*jshint unused:false */', '}', 'foo();'];
  TestRun(test).test(code, {es3: true, unused: true});

  code = ['function foo(a, b, c) {', '/*jshint unused:vars */', 'var i = b;', '}', 'foo();'];
  TestRun(test)
    .addError(3, 5, "'i' is defined but never used.")
    .test(code, {es3: true, unused: true});

  code = ['function foo(a, b, c) {', '/*jshint unused:true */', 'var i = b;', '}', 'foo();'];
  TestRun(test)
    .addError(1, 20, "'c' is defined but never used.")
    .addError(3, 5, "'i' is defined but never used.")
    .test(code, {es3: true, unused: "strict"});

  code = ['function foo(a, b, c) {', '/*jshint unused:strict */', 'var i = b;', '}', 'foo();'];
  TestRun(test)
    .addError(1, 14, "'a' is defined but never used.")
    .addError(1, 20, "'c' is defined but never used.")
    .addError(3, 5, "'i' is defined but never used.")
    .test(code, {es3: true, unused: true});

  code = ['/*jshint unused:vars */', 'function foo(a, b) {}', 'foo();'];
  TestRun(test).test(code, {es3: true, unused: "strict"});

  code = ['/*jshint unused:vars */', 'function foo(a, b) {', 'var i = 3;', '}', 'foo();'];
  TestRun(test)
    .addError(3, 5, "'i' is defined but never used.")
    .test(code, {es3: true, unused: "strict"});

  code = ['/*jshint unused:badoption */', 'function foo(a, b) {', 'var i = 3;', '}', 'foo();'];
  TestRun(test)
    .addError(1, 1, "Bad option value.")
    .addError(2, 17, "'b' is defined but never used.")
    .addError(2, 14, "'a' is defined but never used.")
    .addError(3, 5, "'i' is defined but never used.")
    .test(code, {es3: true, unused: "strict"});

  test.done();
};

exports['unused overrides esnext'] = function (test) {
  var code;

  code = ['function foo(a) {', '/*jshint unused:false */', '}', 'foo();'];
  TestRun(test).test(code, {esnext: true, unused: true});

  code = ['function foo(a, b, c) {', '/*jshint unused:vars */', 'let i = b;', '}', 'foo();'];
  TestRun(test)
    .addError(3, 5, "'i' is defined but never used.")
    .test(code, {esnext: true, unused: true});

  code = ['function foo(a, b, c) {', '/*jshint unused:true */', 'let i = b;', '}', 'foo();'];
  TestRun(test)
    .addError(1, 20, "'c' is defined but never used.")
    .addError(3, 5, "'i' is defined but never used.")
    .test(code, {esnext: true, unused: "strict"});

  code = ['function foo(a, b, c) {', '/*jshint unused:strict */', 'let i = b;', '}', 'foo();'];
  TestRun(test)
    .addError(1, 14, "'a' is defined but never used.")
    .addError(1, 20, "'c' is defined but never used.")
    .addError(3, 5, "'i' is defined but never used.")
    .test(code, {esnext: true, unused: true});

  code = ['/*jshint unused:vars */', 'function foo(a, b) {', 'let i = 3;', '}', 'foo();'];
  TestRun(test)
    .addError(3, 5, "'i' is defined but never used.")
    .test(code, {esnext: true, unused: "strict"});

  code = ['/*jshint unused:badoption */', 'function foo(a, b) {', 'let i = 3;', '}', 'foo();'];
  TestRun(test)
    .addError(1, 1, "Bad option value.")
    .addError(2, 17, "'b' is defined but never used.")
    .addError(2, 14, "'a' is defined but never used.")
    .addError(3, 5, "'i' is defined but never used.")
    .test(code, {esnext: true, unused: "strict"});

  test.done();
};

exports['unused with latedef function'] = function (test) {
  var code;

  // Regression for gh-2363, gh-2282, gh-2191
  code = ['exports.a = a;',
    'function a() {}',
    'exports.b = function() { b(); };',
    'function b() {}',
    '(function() {',
    '  function c() { d(); }',
    '  window.c = c;',
    '  function d() {}',
    '})();',
    'var e;',
    '(function() {',
    '  e();',
    '  function e(){}',
    '})();',
    ''];

  TestRun(test)
    .addError(10, 5, "'e' is defined but never used.")
    .test(code, {undef: false, unused: true, node: true});

  test.done();
};

// Regression test for `undef` to make sure that ...
exports['undef in a function scope'] = function (test) {
  var src = fixture('undef_func.js');

  // Make sure that the lint is clean with and without undef.
  TestRun(test).test(src, {es3: true});
  TestRun(test).test(src, {es3: true, undef: true });

  test.done();
};

/** Option `scripturl` allows the use of javascript-type URLs */
exports.scripturl = function (test) {
  var code = [
      "var foo = { 'count': 12, 'href': 'javascript:' };",
      "foo = 'javascript:' + 'xyz';"
    ],
    src = fs.readFileSync(__dirname + '/fixtures/scripturl.js', 'utf8');

  // Make sure there is an error
  TestRun(test)
    .addError(1, 47, "Script URL.")
    .addError(2, 20, "Script URL.") // 2 times?
    .addError(2, 7, "JavaScript URL.")
    .test(code, {es3: true});

  // Make sure the error goes away when javascript URLs are tolerated
  TestRun(test).test(code, { es3: true, scripturl: true });

  // Make sure an error does not exist for labels that look like URLs (GH-1013)
  TestRun(test)
    .test(src, {es3: true});

  test.done();
};

/**
 * Option `forin` disallows the use of for in loops without hasOwnProperty.
 *
 * The for in statement is used to loop through the names of properties
 * of an object, including those inherited through the prototype chain.
 * The method hasOwnPropery is used to check if the property belongs to
 * an object or was inherited through the prototype chain.
 */
exports.forin = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/forin.js', 'utf8');
  var msg = 'The body of a for in should be wrapped in an if statement to filter unwanted ' +
        'properties from the prototype.';

  // Make sure there are no other errors
  TestRun(test).test(src, {es3: true});

  // Make sure it fails when forin is true
  TestRun(test)
    .addError(15, 1, msg)
    .addError(23, 1, msg)
    .addError(37, 3, msg)
    .addError(43, 9, msg)
    .addError(73, 1, msg)
    .test(src, { es3: true, forin: true });

  test.done();
};

/**
 * Option `loopfunc` allows you to use function expression in the loop.
 * E.g.:
 *   while (true) x = function (test) {};
 *
 * This is generally a bad idea since it is too easy to make a
 * closure-related mistake.
 */
exports.loopfunc = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/loopfunc.js', 'utf8');

  // By default, not functions are allowed inside loops
  TestRun(test)
    .addError(4, 13, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (v)")
    .addError(8, 13, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (v)")
    .addError(20, 11, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (nonExistent)")
    .addError(25, 13, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (p)")
    .addError(12, 5, "Function declarations should not be placed in blocks. Use a function " +
            "expression or move the statement to the top of the outer function.")
    .addError(42, 7, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (i)")
    .test(src, {es3: true});

  // When loopfunc is true, only function declaration should fail.
  // Expressions are okay.
  TestRun(test)
    .addError(12, 5, "Function declarations should not be placed in blocks. Use a function " +
            "expression or move the statement to the top of the outer function.")
    .test(src, { es3: true, loopfunc: true });

  var es6LoopFuncSrc = [
    "for (var i = 0; i < 5; i++) {",
    "  var y = w => i;",
    "}",
    "for (i = 0; i < 5; i++) {",
    "  var z = () => i;",
    "}",
    "for (i = 0; i < 5; i++) {",
    "  y = i => i;", // not capturing
    "}",
    "for (i = 0; i < 5; i++) {",
    "  y = { a() { return i; } };",
    "}",
    "for (i = 0; i < 5; i++) {",
    "  y = class { constructor() { this.i = i; }};",
    "}",
    "for (i = 0; i < 5; i++) {",
    "  y = { a() { return () => i; } };",
    "}"
  ];
  TestRun(test)
    .addError(2, 13, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (i)")
    .addError(5, 11, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (i)")
    .addError(11, 9, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (i)")
    .addError(14, 15, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (i)")
    .addError(17, 9, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (i)")
    .test(es6LoopFuncSrc, {esnext: true});

  // functions declared in the expressions that loop should warn
  var src2 = [
    "for(var i = 0; function a(){return i;}; i++) { break; }",
    "var j;",
    "while(function b(){return j;}){}",
    "for(var c = function(){return j;};;){c();}"];

  TestRun(test)
    .addError(1, 25, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (i)")
    .addError(3, 16, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (j)")
    .test(src2, { es3: true, loopfunc: false, boss: true });

  TestRun(test, "Allows closing over immutable bindings (ES5)")
    .addError(6, 8, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (outerVar)")
    .addError(7, 8, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (innerVar)")
    .test([
        "var outerVar;",
        "",
        "while (false) {",
        "  var innerVar;",
        "",
        "  void function() { var localVar; return outerVar; };",
        "  void function() { var localVar; return innerVar; };",
        "  void function() { var localVar; return localVar; };",
        "",
        "}",
      ]);

  TestRun(test, "Allows closing over immutable bindings (globals)")
    .addError(8, 8, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (mutableGlobal)")
    .addError(15, 10, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (immutableGlobal)")
    .test([
        "/* globals immutableGlobal: false, mutableGlobal: true */",
        "while (false) {",
        "  void function() { return eval; };",
        "  void function() { return Infinity; };",
        "  void function() { return NaN; };",
        "  void function() { return undefined; };",
        "  void function() { return immutableGlobal; };",
        "  void function() { return mutableGlobal; };",
        "}",
        "",
        "// Should recognize shadowing",
        "(function() {",
        "  var immutableGlobal;",
        "  while (false) {",
        "    void function() { return immutableGlobal; };",
        "  }",
        "}());"
      ]);

  TestRun(test, "Allows closing over immutable bindings (ES2015)")
    .addError(10, 8, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (outerLet)")
    .addError(11, 8, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (innerLet)")
    .addError(18, 8, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (OuterClass)")
    .addError(19, 8, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (InnerClass)")
    .test([
        "let outerLet;",
        "const outerConst = 0;",
        "class OuterClass {}",
        "",
        "while (false) {",
        "  let innerLet;",
        "  const innerConst = 0;",
        "  class InnerClass {}",
        "",
        "  void function() { let localLet; return outerLet; };",
        "  void function() { let localLet; return innerLet; };",
        "  void function() { let localLet; return localLet; };",
        "",
        "  void function() { const localConst = 0; return outerConst; };",
        "  void function() { const localConst = 0; return innerConst; };",
        "  void function() { const localConst = 0; return localConst; };",
        "",
        "  void function() { class LocalClass {} return OuterClass; };",
        "  void function() { class LocalClass {} return InnerClass; };",
        "  void function() { class LocalClass {} return LocalClass; };",
        "}"
      ], { esversion: 2015 });

  TestRun(test, "W083 lists multiple outer scope variables")
    .addError(3, 11, "Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (a, b)")
    .test([
        "var a, b;",
        "for (;;) {",
        "  var f = function() {",
        "    return a + b;",
        "  };",
        "}"
      ]);

  test.done();
};

/** Option `boss` unlocks some useful but unsafe features of JavaScript. */
exports.boss = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/boss.js', 'utf8');

  // By default, warn about suspicious assignments
  TestRun(test)
    .addError(1, 7, 'Expected a conditional expression and instead saw an assignment.')
    .addError(4, 12, 'Expected a conditional expression and instead saw an assignment.')
    .addError(7, 15, 'Expected a conditional expression and instead saw an assignment.')
    .addError(12, 12, 'Expected a conditional expression and instead saw an assignment.')

    // GH-657
    .addError(14, 7, 'Expected a conditional expression and instead saw an assignment.')
    .addError(17, 12, 'Expected a conditional expression and instead saw an assignment.')
    .addError(20, 15, 'Expected a conditional expression and instead saw an assignment.')
    .addError(25, 12, 'Expected a conditional expression and instead saw an assignment.')

    // GH-670
    .addError(28, 12, "Did you mean to return a conditional instead of an assignment?")
    .addError(32, 14, "Did you mean to return a conditional instead of an assignment?")
    .test(src, {es3: true});

  // But if you are the boss, all is good
  TestRun(test).test(src, { es3: true, boss: true });

  test.done();
};

/**
 * Options `eqnull` allows you to use '== null' comparisons.
 * It is useful when you want to check if value is null _or_ undefined.
 */
exports.eqnull = function (test) {
  var code = [
    'if (e == null) doSomething();',
    'if (null == e) doSomething();',
    'if (e != null) doSomething();',
    'if (null != e) doSomething();',
  ];

  // By default, warn about `== null` comparison
  /**
   * This test previously asserted the issuance of warning W041.
   * W041 has since been removed, but the test is maintained in
   * order to discourage regressions.
   */
  TestRun(test)
    .test(code, {es3: true});

  // But when `eqnull` is true, no questions asked
  TestRun(test).test(code, { es3: true, eqnull: true });

  // Make sure that `eqnull` has precedence over `eqeqeq`
  TestRun(test).test(code, { es3: true, eqeqeq: true, eqnull: true });

  test.done();
};

/**
 * Option `supernew` allows you to use operator `new` with anonymous functions
 * and objects without invocation.
 *
 * Ex.:
 *   new function (test) { ... };
 *   new Date;
 */
exports.supernew = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/supernew.js', 'utf8');

  TestRun(test)
    .addError(1, 9, "Weird construction. Is 'new' necessary?")
    .addError(9, 1, "Missing '()' invoking a constructor.")
    .addError(11, 13, "Missing '()' invoking a constructor.")
    .test(src, {es3: true});

  TestRun(test).test(src, { es3: true, supernew: true });

  test.done();
};

/** Option `bitwise` disallows the use of bitwise operators. */
exports.bitwise = function (test) {
  var unOps = [ "~" ];
  var binOps = [ "&",  "|",  "^",  "<<",  ">>",  ">>>" ];
  var modOps = [ "&=", "|=", "^=", "<<=", ">>=", ">>>=" ];

  var i, op;

  for (i = 0; i < unOps.length; i += 1) {
    op = unOps[i];

    TestRun(test)
      .test("var b = " + op + "a;", {es3: true});

    TestRun(test)
      .addError(1, 9, "Unexpected use of '" + op + "'.")
      .test("var b = " + op + "a;", {es3: true, bitwise: true});
  }

  for (i = 0; i < binOps.length; i += 1) {
    op = binOps[i];

    TestRun(test)
      .test("var c = a " + op + " b;", {es3: true});

    TestRun(test)
      .addError(1, 11, "Unexpected use of '" + op + "'.")
      .test("var c = a " + op + " b;", {es3: true, bitwise: true});
  }

  for (i = 0; i < modOps.length; i += 1) {
    op = modOps[i];

    TestRun(test)
      .test("b " + op + " a;", {es3: true});

    TestRun(test)
      .addError(1, 3, "Unexpected use of '" + op + "'.")
      .test("b " + op + " a;", {es3: true, bitwise: true});
  }

  test.done();
};

/** Option `debug` allows the use of debugger statements. */
exports.debug = function (test) {
  var code = 'function test () { debugger; return true; }';

  // By default disallow debugger statements.
  TestRun(test)
    .addError(1, 20, "Forgotten 'debugger' statement?")
    .test(code, {es3: true});

  // But allow them if debug is true.
  TestRun(test).test(code, { es3: true, debug: true });

  test.done();
};

/** `debugger` statements without semicolons are found on the correct line */
exports.debuggerWithoutSemicolons = function (test) {
  var src = [
    "function test () {",
    "debugger",
    "return true; }"
  ];

  // Ensure we mark the correct line when finding debugger statements
  TestRun(test)
    .addError(2, 1, "Forgotten 'debugger' statement?")
    .test(src, {es3: true, asi: true});

  test.done();
};

/** Option `eqeqeq` requires you to use === all the time. */
exports.eqeqeq = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/eqeqeq.js', 'utf8');

  /**
   * This test previously asserted the issuance of warning W041.
   * W041 has since been removed, but the test is maintained in
   * order to discourage regressions.
   */
  TestRun(test)
    .test(src, {es3: true});

  TestRun(test)
    .addError(2, 13, "Expected '===' and instead saw '=='.")
    .addError(5, 13, "Expected '!==' and instead saw '!='.")
    .addError(8, 13, "Expected '===' and instead saw '=='.")
    .test(src, { es3: true, eqeqeq: true });

  test.done();
};

/** Option `evil` allows the use of eval. */
exports.evil = function (test) {
  var src = [
    "eval('hey();');",
    "document.write('');",
    "document.writeln('');",
    "window.execScript('xyz');",
    "new Function('xyz();');",
    "setTimeout('xyz();', 2);",
    "setInterval('xyz();', 2);",
    "var t = document['eval']('xyz');"
  ];

  TestRun(test)
    .addError(1, 1, "eval can be harmful.")
    .addError(2, 1, "document.write can be a form of eval.")
    .addError(3, 1, "document.write can be a form of eval.")
    .addError(4, 18, "eval can be harmful.")
    .addError(5, 13, "The Function constructor is a form of eval.")
    .addError(6, 1, "Implied eval. Consider passing a function instead of a string.")
    .addError(7, 1, "Implied eval. Consider passing a function instead of a string.")
    .addError(8, 24, "eval can be harmful.")
    .test(src, { es3: true, browser: true });

  TestRun(test).test(src, { es3: true, evil: true, browser: true });

  test.done();
};

/**
 * Option `immed` forces you to wrap immediate invocations in parens.
 *
 * Functions in JavaScript can be immediately invoce but that can confuse
 * readers of your code. To make it less confusing, wrap the invocations in
 * parens.
 *
 * E.g. (note the parens):
 *   var a = (function (test) {
 *     return 'a';
 *   }());
 *   console.log(a); // --> 'a'
 */
exports.immed = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/immed.js', 'utf8');

  TestRun(test).test(src, {es3: true});

  TestRun(test)
    .addError(3, 3, "Wrap an immediate function invocation in parens " +
           "to assist the reader in understanding that the expression " +
           "is the result of a function, and not the function itself.")
    .addError(13, 9, "Wrapping non-IIFE function literals in parens is unnecessary.")
    .test(src, { es3: true, immed: true });

  // Regression for GH-900
  TestRun(test)
    //.addError(1, 23232323, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 31, "Expected an identifier and instead saw ')'.")
    .addError(1, 30, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 14, "Unmatched '{'.")
    .addError(1, 31, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 31, "Missing semicolon.")
    .addError(1, 32, "Unrecoverable syntax error. (100% scanned).")
    .test("(function () { if (true) { }());", { es3: true, immed: true });

  test.done();
};

/** Option `plusplus` prohibits the use of increments/decrements. */
exports.plusplus = function (test) {
  var ops = [ '++', '--' ];

  for (var i = 0, op; op = ops[i]; i += 1) {
    TestRun(test).test('var i = j' + op + ';', {es3: true});
    TestRun(test).test('var i = ' + op + 'j;', {es3: true});
  }

  for (i = 0, op = null; op = ops[i]; i += 1) {
    TestRun(test)
      .addError(1, 10, "Unexpected use of '" + op + "'.")
      .test('var i = j' + op + ';', { es3: true, plusplus: true });

    TestRun(test)
      .addError(1, 9, "Unexpected use of '" + op + "'.")
      .test('var i = ' + op + 'j;', { es3: true, plusplus: true });
  }

  test.done();
};

/**
 * Option `newcap` requires constructors to be capitalized.
 *
 * Constructors are functions that are designed to be used with the `new` statement.
 * `new` creates a new object and binds it to the implied this parameter.
 * A constructor executed without new will have its this assigned to a global object,
 * leading to errors.
 *
 * Unfortunately, JavaScript gives us absolutely no way of telling if a function is a
 * constructor. There is a convention to capitalize all constructor names to prevent
 * those mistakes. This option enforces that convention.
 */
exports.newcap = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/newcap.js', 'utf8');

  TestRun(test).test(src, {es3: true}); // By default, everything is fine

  // When newcap is true, enforce the conventions
  TestRun(test)
    .addError(1, 15, 'A constructor name should start with an uppercase letter.')
    .addError(5, 7, "Missing 'new' prefix when invoking a constructor.")
    .addError(10, 15, "A constructor name should start with an uppercase letter.")
    .addError(14, 13, "A constructor name should start with an uppercase letter.")
    .test(src, { es3: true, newcap: true });

  test.done();
};

/** Option `sub` allows all forms of subscription. */
exports.sub = function (test) {
  TestRun(test)
    .addError(1, 17, "['prop'] is better written in dot notation.")
    .test("window.obj = obj['prop'];", {es3: true});

  TestRun(test).test("window.obj = obj['prop'];", { es3: true, sub: true });

  test.done();
};

/** Option `strict` requires you to use "use strict"; */
exports.strict = function (test) {
  var code  = "(function (test) { return; }());";
  var code1 = '(function (test) { "use strict"; return; }());';
  var code2 = "var obj = Object({ foo: 'bar' });";
  var code3 = "'use strict'; \n function hello() { return; }";
  var src = fs.readFileSync(__dirname + '/fixtures/strict_violations.js', 'utf8');
  var src2 = fs.readFileSync(__dirname + '/fixtures/strict_incorrect.js', 'utf8');
  var src3 = fs.readFileSync(__dirname + '/fixtures/strict_newcap.js', 'utf8');

  TestRun(test).test(code, {es3: true});
  TestRun(test).test(code1, {es3: true});

  var run = TestRun(test)
    .addError(1, 20, 'Missing "use strict" statement.');
  run.test(code, { es3: true, strict: true });
  run
    .addError(1, 26, 'Missing "use strict" statement.')
    .test(code, { es3: true, strict: "global" });

  TestRun(test).test(code, { es3: true, strict: "implied" });

  TestRun(test).test(code1, { es3: true, strict: true });
  TestRun(test).test(code1, { es3: true, strict: "global" });
  TestRun(test)
    .addError(1, 20, 'Unnecessary directive "use strict".')
    .test(code1, { es3: true, strict: "implied" });

  // Test for strict mode violations
  run = TestRun(test)
    .addError(4, 36, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .addError(7, 52, 'Strict violation.')
    .addError(8, 52, 'Strict violation.');
  run.test(src, { es3: true, strict: true });
  run.test(src, { es3: true, strict: "global" });

  run = TestRun(test)
    .addError(4, 5, 'Expected an assignment or function call and instead saw an expression.')
    .addError(9, 17, 'Missing semicolon.')
    .addError(28, 9, 'Expected an assignment or function call and instead saw an expression.')
    .addError(53, 9, 'Expected an assignment or function call and instead saw an expression.');
  run.test(src2, { es3: true, strict: false });

  TestRun(test)
    .test(src3, {es3 : true});

  TestRun(test).test(code2, { es3: true, strict: true });
  TestRun(test)
    .addError(1, 33, 'Missing "use strict" statement.')
    .test(code2, { es3: true, strict: "global" });

  TestRun(test).test(code3, { strict: "global"});
  run = TestRun(test)
    .addError(1, 1, 'Use the function form of "use strict".');
  run.test(code3, { strict: true });
  run.addError(1, 1, 'Unnecessary directive "use strict".')
    .test(code3, { strict: "implied" });

  [ true, false, "global", "implied" ].forEach(function(val) {
    JSHINT("/*jshint strict: " + val + " */");
    test.strictEqual(JSHINT.data().options.strict, val);
  });

  TestRun(test)
    .addError(1, 1, "Bad option value.")
    .test("/*jshint strict: foo */");

  TestRun(test, "environments have precedence over 'strict: true'")
    .test(code3, { strict: true, node: true });

  TestRun(test, "gh-2668")
    .addError(1, 6, "Missing \"use strict\" statement.")
    .test("a = 2;", { strict: "global" });

  test.done();
};

/**
 * This test asserts sub-optimal behavior.
 *
 * In the "browserify", "node" and "phantomjs" environments, user code is not
 * executed in the global scope directly. This means that top-level `use
 * strict` directives, although seemingly global, do *not* enable ES5 strict
 * mode for other scripts executed in the same environment. Because of this,
 * the `strict` option should enforce a top-level `use strict` directive in
 * those environments.
 *
 * The `strict` option was implemented without consideration for these
 * environments, so the sub-optimal behavior must be preserved for backwards
 * compatability.
 *
 * TODO: Interpret `strict: true` as `strict: global` in the Browserify,
 * Node.js, and PhantomJS environments, and remove this test in JSHint 3
 */
exports.strictEnvs = function (test) {
  var partialStrict = [
    "void 0;",
    "(function() { void 0; }());",
    "(function() { 'use strict'; void 0; }());"
  ];
  TestRun(test, "")
    .addError(2, 15, "Missing \"use strict\" statement.")
    .test(partialStrict, { strict: true, browserify: true });
  TestRun(test, "")
    .addError(2, 15, "Missing \"use strict\" statement.")
    .test(partialStrict, { strict: true, node: true });
  TestRun(test, "")
    .addError(2, 15, "Missing \"use strict\" statement.")
    .test(partialStrict, { strict: true, phantom: true });

  partialStrict = [
    '(() =>',
    '  void 0',
    ')();',
  ]

  TestRun(test, "Block-less arrow functions in the Browserify env")
    .addError(3, 1, "Missing \"use strict\" statement.")
    .test(partialStrict, { esversion: 6, strict: true, browserify: true });
  TestRun(test, "Block-less arrow function in the Node.js environment")
    .addError(3, 1, "Missing \"use strict\" statement.")
    .test(partialStrict, { esversion: 6, strict: true, node: true });
  TestRun(test, "Block-less arrow function in the PhantomJS environment")
    .addError(3, 1, "Missing \"use strict\" statement.")
    .test(partialStrict, { esversion: 6, strict: true, phantom: true });

  test.done();
};

/**
 * The following test asserts sub-optimal behavior.
 *
 * Through the `strict` and `globalstrict` options, JSHint can be configured to
 * issue warnings when code is not in strict mode. Historically, JSHint has
 * issued these warnings on a per-statement basis in global code, leading to
 * "noisy" output through the repeated reporting of the missing directive.
 */
exports.strictNoise = function (test) {
  TestRun(test, "global scope")
    .addError(1, 7, "Missing \"use strict\" statement.")
    .addError(2, 7, "Missing \"use strict\" statement.")
    .test([
      "void 0;",
      "void 0;",
    ], { strict: true, globalstrict: true });

  TestRun(test, "function scope")
    .addError(2, 3, "Missing \"use strict\" statement.")
    .test([
      "(function() {",
      "  void 0;",
      "  void 0;",
      "}());",
    ], { strict: true });

  TestRun(test, "function scope")
    .addError(2, 3, "Missing \"use strict\" statement.")
    .test([
      "(function() {",
      "  (function() {",
      "    void 0;",
      "    void 0;",
      "  }());",
      "}());",
    ], { strict: true });

  test.done();
};

/** Option `globalstrict` allows you to use global "use strict"; */
exports.globalstrict = function (test) {
  var code = [
    '"use strict";',
    'function hello() { return; }'
  ];

  TestRun(test)
    .addError(1, 1, 'Use the function form of "use strict".')
    .test(code, { es3: true, strict: true });

  TestRun(test).test(code, { es3: true, globalstrict: true });

  // Check that globalstrict also enabled strict
  TestRun(test)
    .addError(1, 26, 'Missing "use strict" statement.')
    .test(code[1], { es3: true, globalstrict: true });

  // Don't enforce "use strict"; if strict has been explicitly set to false
  TestRun(test).test(code[1], { es3: true, globalstrict: true, strict: false });

  TestRun(test, "co-occurence with 'strict: global' (via configuration)")
    .addError(0, 0, "Incompatible values for the 'strict' and 'globalstrict' linting options. (0% scanned).")
    .test("this is not JavaScript", { strict: "global", globalstrict: false });

  TestRun(test, "co-occurence with 'strict: global' (via configuration)")
    .addError(0, 0, "Incompatible values for the 'strict' and 'globalstrict' linting options. (0% scanned).")
    .test("this is not JavaScript", { strict: "global", globalstrict: true });

  TestRun(test, "co-occurence with 'strict: global' (via in-line directive")
    .addError(2, 1, "Incompatible values for the 'strict' and 'globalstrict' linting options. (66% scanned).")
    .test([
      "",
      "// jshint globalstrict: true",
      "this is not JavaScript"
    ], { strict: "global" });

  TestRun(test, "co-occurence with 'strict: global' (via in-line directive")
    .addError(2, 1, "Incompatible values for the 'strict' and 'globalstrict' linting options. (66% scanned).")
    .test([
      "",
      "// jshint globalstrict: false",
      "this is not JavaScript"
    ], { strict: "global" });

  TestRun(test, "co-occurence with 'strict: global' (via in-line directive")
    .addError(2, 1, "Incompatible values for the 'strict' and 'globalstrict' linting options. (66% scanned).")
    .test([
      "",
      "// jshint strict: global",
      "this is not JavaScript"
    ], { globalstrict: true });

  TestRun(test, "co-occurence with 'strict: global' (via in-line directive")
    .addError(2, 1, "Incompatible values for the 'strict' and 'globalstrict' linting options. (66% scanned).")
    .test([
      "",
      "// jshint strict: global",
      "this is not JavaScript"
    ], { globalstrict: false });

  TestRun(test, "co-occurence with internally-set 'strict: gobal' (module code)")
    .test(code, { strict: true, globalstrict: false, esnext: true, module: true });

  TestRun(test, "co-occurence with internally-set 'strict: gobal' (Node.js code)")
    .test(code, { strict: true, globalstrict: false, node: true });

  TestRun(test, "co-occurence with internally-set 'strict: gobal' (Phantom.js code)")
    .test(code, { strict: true, globalstrict: false, phantom: true });

  TestRun(test, "co-occurence with internally-set 'strict: gobal' (Browserify code)")
    .test(code, { strict: true, globalstrict: false, browserify: true });

  // Check that we can detect missing "use strict"; statement for code that is
  // not inside a function
  code = [
    "var a = 1;",
    "a += 1;",
    "function func() {}"
  ];
  TestRun(test)
    .addError(1, 10, 'Missing "use strict" statement.')
    .addError(2, 7, 'Missing "use strict" statement.')
    .test(code, { globalstrict: true, strict: true });

  // globalscript does not prevent you from using only the function-mode
  // "use strict";
  code = '(function (test) { "use strict"; return; }());';
  TestRun(test).test(code, { globalstrict: true, strict: true });

  TestRun(test, "gh-2661")
    .test("'use strict';", { strict: false, globalstrict: true });

  TestRun(test, "gh-2836 (1)")
    .test([
      "// jshint globalstrict: true",
      // The specific option set by the following directive is not relevant.
      // Any option set by another directive will trigger the regression.
      "// jshint undef: true"
    ]);

  TestRun(test, "gh-2836 (2)")
    .test([
      "// jshint strict: true, globalstrict: true",
      // The specific option set by the following directive is not relevant.
      // Any option set by another directive will trigger the regression.
      "// jshint undef: true"
    ]);

  test.done();
};

/** Option `laxbreak` allows you to insert newlines before some operators. */
exports.laxbreak = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/laxbreak.js', 'utf8');

  TestRun(test)
    .addError(2, 5, "Misleading line break before ','; readers may interpret this as an expression boundary.")
    .addError(3, 3, "Comma warnings can be turned off with 'laxcomma'.")
    .addError(12, 10, "Misleading line break before ','; readers may interpret this as an expression boundary.")
    .test(src, { es3: true });

  var ops = [ '||', '&&', '*', '/', '%', '+', '-', '>=',
        '==', '===', '!=', '!==', '>', '<', '<=', 'instanceof' ];

  for (var i = 0, op, code; op = ops[i]; i += 1) {
    code = ['var a = b ', op + ' c;'];
    TestRun(test)
      .addError(2, 1, "Misleading line break before '" + op + "'; readers may interpret this as an expression boundary.")
      .test(code, { es3: true });

    TestRun(test).test(code, { es3: true, laxbreak: true });
  }

  code = [ 'var a = b ', '? c : d;' ];
  TestRun(test)
    .addError(2, 1, "Misleading line break before '?'; readers may interpret this as an expression boundary.")
    .test(code, { es3: true });

  TestRun(test).test(code, { es3: true, laxbreak: true });

  test.done();
};

exports.validthis = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/strict_this.js', 'utf8');

  TestRun(test)
    .addError(8, 9, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .addError(9, 19, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .addError(11, 19, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .test(src, {es3: true});

  src = fs.readFileSync(__dirname + '/fixtures/strict_this2.js', 'utf8');
  TestRun(test).test(src, {es3: true});

  // Test for erroneus use of validthis

  var code = ['/*jshint validthis:true */', 'hello();'];
  TestRun(test)
    .addError(1, 1, "Option 'validthis' can't be used in a global scope.")
    .test(code, {es3: true});

  code = ['function x() {', '/*jshint validthis:heya */', 'hello();', '}'];
  TestRun(test)
    .addError(2, 1, "Bad option value.")
    .test(code, {es3: true});

  test.done();
};

/*
 * Test string relevant options
 *   multistr   allows multiline strings
 */
exports.strings = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/strings.js', 'utf8');

  TestRun(test)
    .addError(9, 20, "Unclosed string.")
    .addError(10, 1, "Unclosed string.")
    .addError(15, 1, "Unclosed string.")
    .addError(25, 16, "Octal literals are not allowed in strict mode.")
    .test(src, { es3: true, multistr: true });

  TestRun(test)
    .addError(3, 21, "Bad escaping of EOL. Use option multistr if needed.")
    .addError(4, 2, "Bad escaping of EOL. Use option multistr if needed.")
    .addError(9, 20, "Unclosed string.")
    .addError(10, 1, "Unclosed string.")
    .addError(14, 21, "Bad escaping of EOL. Use option multistr if needed.")
    .addError(15, 1, "Unclosed string.")
    .addError(25, 16, "Octal literals are not allowed in strict mode.")
    .addError(29, 36, "Bad escaping of EOL. Use option multistr if needed.")
    .test(src, { es3: true });

  test.done();
};

/*
 * Test the `quotmark` option
 *   quotmark   quotation mark or true (=ensure consistency)
 */
exports.quotes = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/quotes.js', 'utf8');
  var src2 = fs.readFileSync(__dirname + '/fixtures/quotes2.js', 'utf8');

  TestRun(test)
    .test(src, { es3: true });

  TestRun(test)
    .addError(3, 21, "Mixed double and single quotes.")
    .test(src, { es3: true, quotmark: true });

  TestRun(test)
    .addError(3, 21, "Strings must use singlequote.")
    .test(src, { es3: true, quotmark: 'single' });

  TestRun(test)
    .addError(2, 21, "Strings must use doublequote.")
    .test(src, { es3: true, quotmark: 'double' });

  // test multiple runs (must have the same result)
  TestRun(test)
    .addError(3, 21, "Mixed double and single quotes.")
    .test(src, { es3: true, quotmark: true });

  TestRun(test)
    .addError(3, 21, "Mixed double and single quotes.")
    .test(src2, { es3: true, quotmark: true });

  test.done();
};

// Test the `quotmark` option when defined as a JSHint comment.
exports.quotesInline = function (test) {
  TestRun(test)
    .addError(6, 24, "Strings must use doublequote.")
    .addError(14, 24, "Strings must use singlequote.")
    .addError(21, 24, "Mixed double and single quotes.")
    .addError(32, 5, "Bad option value.")
    .test(fs.readFileSync(__dirname + "/fixtures/quotes3.js", "utf8"));

  test.done();
};

// Test the `quotmark` option along with TemplateLiterals.
exports.quotesAndTemplateLiterals = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/quotes4.js', 'utf8');

  // Without esnext
  TestRun(test)
    .addError(2, 13, "'template literal syntax' is only available in ES6 (use 'esversion: 6').")
    .test(src);

  // With esnext
  TestRun(test)
    .test(src, {esnext: true});

  // With esnext and single quotemark
  TestRun(test)
    .test(src, {esnext: true, quotmark: 'single'});

  // With esnext and double quotemark
  TestRun(test)
    .addError(1, 21, "Strings must use doublequote.")
    .test(src, {esnext: true, quotmark: 'double'});

  test.done();
};

exports.scope = {};
exports.scope.basic = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/scope.js', 'utf8');

  TestRun(test, 1)
    .addError(11, 14, "'j' used out of scope.")
    .addError(11, 21, "'j' used out of scope.")
    .addError(11, 28, "'j' used out of scope.")
    .addError(12, 13, "'x' used out of scope.")
    .addError(20, 9, "'aa' used out of scope.")
    .addError(27, 9, "'bb' used out of scope.")
    .addError(37, 9, "'cc' is not defined.")
    .addError(42, 5, "'bb' is not defined.")
    .addError(53, 5, "'xx' used out of scope.")
    .addError(54, 5, "'yy' used out of scope.")
    .test(src, {es3: true});

  TestRun(test, 2)
    .addError(37, 9, "'cc' is not defined.")
    .addError(42, 5, "'bb' is not defined.")
    .test(src, { es3: true, funcscope: true });

  test.done();
};

exports.scope.crossBlocks = function (test) {
  var code = fs.readFileSync(__dirname + '/fixtures/scope-cross-blocks.js', 'utf8');

  TestRun(test)
    .addError(3, 8, "'topBlockBefore' used out of scope.")
    .addError(4, 8, "'nestedBlockBefore' used out of scope.")
    .addError(11, 10, "'nestedBlockBefore' used out of scope.")
    .addError(27, 10, "'nestedBlockAfter' used out of scope.")
    .addError(32, 8, "'nestedBlockAfter' used out of scope.")
    .addError(33, 8, "'topBlockAfter' used out of scope.")
    .test(code);

  TestRun(test)
    .test(code, { funcscope: true });


  test.done();
};

/*
 * Tests `esnext` and `moz` options.
 *
 * This test simply makes sure that options are recognizable
 * and do not reset ES5 mode (see GH-1068)
 *
 */
exports.esnext = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/const.js', 'utf8');

  var code = [
    'const myConst = true;',
    'const foo = 9;',
    'var myConst = function (test) { };',
    'foo = "hello world";',
    'var a = { get x() {} };'
  ];

  TestRun(test)
    .addError(21, 7, "const 'immutable4' is initialized to 'undefined'.")
    .test(src, { esnext: true });

  TestRun(test)
    .addError(21, 7, "const 'immutable4' is initialized to 'undefined'.")
    .test(src, { moz: true });

  TestRun(test)
    .addError(3, 5, "'myConst' has already been declared.")
    .addError(4, 1, "Attempting to override 'foo' which is a constant.")
    .test(code, { esnext: true });

  TestRun(test)
    .addError(3, 5, "'myConst' has already been declared.")
    .addError(4, 1, "Attempting to override 'foo' which is a constant.")
    .test(code, { moz: true });

  test.done();
};

// The `moz` option should not preclude ES6
exports.mozAndEs6 = function (test) {
  var src = [
   "var x = () => {};",
   "function* toArray(...rest) {",
   "  void new.target;",
   "  yield rest;",
   "}",
   "var y = [...x];"
  ];

  TestRun(test)
    .test(src, { esversion: 6 });

  TestRun(test)
    .test(src, { esversion: 6, moz: true });

  test.done();
};

/*
 * Tests the `maxlen` option
 */
exports.maxlen = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/maxlen.js', 'utf8');

  TestRun(test)
    .addError(3, 24, "Line is too long.")
    .addError(4, 29, "Line is too long.")
    .addError(5, 40, "Line is too long.")
    .addError(6, 46, "Line is too long.")
    // line 7 and more are exceptions and won't trigger the error
    .test(src, { es3: true, maxlen: 23 });

  test.done();
};

/*
 * Tests the `laxcomma` option
 */
exports.laxcomma = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/laxcomma.js', 'utf8');

  // All errors.
  TestRun(test)
    .addError(1, 9, "Misleading line break before ','; readers may interpret this as an expression boundary.")
    .addError(2, 3, "Comma warnings can be turned off with 'laxcomma'.")
    .addError(2, 9, "Misleading line break before ','; readers may interpret this as an expression boundary.")
    .addError(6, 10, "Misleading line break before ','; readers may interpret this as an expression boundary.")
    .addError(10, 3, "Misleading line break before '&&'; readers may interpret this as an expression boundary.")
    .addError(15, 9, "Misleading line break before '?'; readers may interpret this as an expression boundary.")
    .test(src, {es3: true});

  // Allows bad line breaking, but not on commas.
  TestRun(test)
    .addError(1, 9, "Misleading line break before ','; readers may interpret this as an expression boundary.")
    .addError(2, 3, "Comma warnings can be turned off with 'laxcomma'.")
    .addError(2, 9, "Misleading line break before ','; readers may interpret this as an expression boundary.")
    .addError(6, 10, "Misleading line break before ','; readers may interpret this as an expression boundary.")
    .test(src, {es3: true, laxbreak: true });

  // Allows comma-first style but warns on bad line breaking
  TestRun(test)
    .addError(10, 3, "Misleading line break before '&&'; readers may interpret this as an expression boundary.")
    .addError(15, 9, "Misleading line break before '?'; readers may interpret this as an expression boundary.")
    .test(src, {es3: true, laxcomma: true });

  // No errors if both laxbreak and laxcomma are turned on
  TestRun(test).test(src, {es3: true, laxbreak: true, laxcomma: true });

  test.done();
};

exports.unnecessarysemicolon = function (test) {
  var code = [
    "function foo() {",
    "    var a;;",
    "}"
  ];

  TestRun(test)
    .addError(2, 11, "Unnecessary semicolon.")
    .test(code, {es3: true});

  test.done();
};

exports.blacklist = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/browser.js', 'utf8');
  var code = [
    '/*jshint browser: true */',
    '/*global -event, bar, -btoa */',
    'var a = event.hello();',
    'var c = foo();',
    'var b = btoa(1);',
    'var d = bar();'
  ];

  // make sure everything is ok
  TestRun(test).test(src, { es3: true, undef: true, browser: true });

  // disallow Node in a predef Object
  TestRun(test)
    .addError(15, 19, "'Node' is not defined.")
    .test(src, {
      undef: true,
      browser: true,
      predef: { '-Node': false }
    });
  // disallow Node and NodeFilter in a predef Array
  TestRun(test)
    .addError(14, 20, "'NodeFilter' is not defined.")
    .addError(15, 19, "'Node' is not defined.")
    .test(src, {
      undef: true,
      browser: true,
      predef: ['-Node', '-NodeFilter']
    });

  TestRun(test)
    .addError(3, 9, "'event' is not defined.")
    .addError(4, 9, "'foo' is not defined.")
    .addError(5, 9, "'btoa' is not defined.")
    .test(code, { es3: true, undef: true });

  test.done();
};

/*
 * Tests the `maxstatements` option
 */
exports.maxstatements = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/max-statements-per-function.js', 'utf8');

  TestRun(test)
    .addError(1, 33, "This function has too many statements. (8)")
    .test(src, { es3: true, maxstatements: 7 });

  TestRun(test)
    .test(src, { es3: true, maxstatements: 8 });

  TestRun(test)
    .test(src, { es3: true });

  test.done();
};

/*
 * Tests the `maxdepth` option
 */
exports.maxdepth = function (test) {
  var fixture = '/fixtures/max-nested-block-depth-per-function.js';
  var src = fs.readFileSync(__dirname + fixture, 'utf8');

  TestRun(test)
    .addError(5, 27, "Blocks are nested too deeply. (2)")
    .addError(14, 26, "Blocks are nested too deeply. (2)")
    .test(src, { es3: true, maxdepth: 1 });

  TestRun(test)
    .addError(9, 28, "Blocks are nested too deeply. (3)")
    .test(src, { es3: true, maxdepth: 2 });

  TestRun(test)
    .test(src, { es3: true, maxdepth: 3 });

  TestRun(test)
    .test(src, { es3: true });

  test.done();
};

/*
 * Tests the `maxparams` option
 */
exports.maxparams = function (test) {
  var fixture = '/fixtures/max-parameters-per-function.js';
  var src = fs.readFileSync(__dirname + fixture, 'utf8');

  TestRun(test)
    .addError(4, 33, "This function has too many parameters. (3)")
    .addError(10, 10, "This function has too many parameters. (3)")
    .addError(16, 11, "This function has too many parameters. (3)")
    .test(src, { esnext: true, maxparams: 2 });

  TestRun(test)
    .test(src, { esnext: true, maxparams: 3 });

  TestRun(test)
    .addError(4, 33, "This function has too many parameters. (3)")
    .addError(8, 10, "This function has too many parameters. (1)")
    .addError(9, 14, "This function has too many parameters. (1)")
    .addError(10, 10, "This function has too many parameters. (3)")
    .addError(11, 10, "This function has too many parameters. (1)")
    .addError(13, 11, "This function has too many parameters. (2)")
    .addError(16, 11, "This function has too many parameters. (3)")
    .test(src, {esnext: true, maxparams: 0 });

  TestRun(test)
    .test(src, { esnext: true });

  var functions = JSHINT.data().functions;
  test.equal(functions.length, 9);
  test.equal(functions[0].metrics.parameters, 0);
  test.equal(functions[1].metrics.parameters, 3);
  test.equal(functions[2].metrics.parameters, 0);
  test.equal(functions[3].metrics.parameters, 1);
  test.equal(functions[4].metrics.parameters, 1);
  test.equal(functions[5].metrics.parameters, 3);
  test.equal(functions[6].metrics.parameters, 1);
  test.equal(functions[7].metrics.parameters, 2);
  test.equal(functions[8].metrics.parameters, 3);

  test.done();
};

/*
 * Tests the `maxcomplexity` option
 */
exports.maxcomplexity = function (test) {
  var fixture = '/fixtures/max-cyclomatic-complexity-per-function.js';
  var src = fs.readFileSync(__dirname + fixture, 'utf8');

  TestRun(test)
    .addError(8, 44, "This function's cyclomatic complexity is too high. (2)")
    .addError(15, 44, "This function's cyclomatic complexity is too high. (2)")
    .addError(25, 54, "This function's cyclomatic complexity is too high. (2)")
    .addError(47, 44, "This function's cyclomatic complexity is too high. (8)")
    .addError(76, 66, "This function's cyclomatic complexity is too high. (2)")
    .addError(80, 60, "This function's cyclomatic complexity is too high. (2)")
    .test(src, { es3: true, maxcomplexity: 1 });

  TestRun(test)
    .test(src, { es3: true, maxcomplexity: 8 });

  TestRun(test)
    .test(src, { es3: true });

  test.done();
};

// Metrics output per function.
exports.fnmetrics = function (test) {
  JSHINT([
    "function foo(a, b) { if (a) return b; }",
    "function bar() { var a = 0; a += 1; return a; }",
    "function hasTryCatch() { try { } catch(e) { }}",
    "try { throw e; } catch(e) {}"
  ]);

  test.equal(JSHINT.data().functions.length, 3);

  test.deepEqual(JSHINT.data().functions[0].metrics, {
    complexity: 2,
    parameters: 2,
    statements: 1
  });

  test.deepEqual(JSHINT.data().functions[1].metrics, {
    complexity: 1,
    parameters: 0,
    statements: 3
  });

  test.deepEqual(JSHINT.data().functions[2].metrics, {
    complexity: 2,
    parameters: 0,
    statements: 1
  });

  test.done();
};

/*
 * Tests ignored warnings.
 */
exports.ignored = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/ignored.js", "utf-8");

  TestRun(test)
    .addError(4, 12, "A trailing decimal point can be confused with a dot: '12.'.")
    .addError(12, 11, "Missing semicolon.")
    .test(src, { es3: true });

  TestRun(test)
    .addError(12, 11, "Missing semicolon.")
    .test(src, { es3: true, "-W047": true });

  test.done();
};

/*
 * Tests ignored warnings being unignored.
 */
exports.unignored = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/unignored.js", "utf-8");

  TestRun(test)
    .addError(5, 12, "A leading decimal point can be confused with a dot: '.12'.")
    .test(src, { es3: true });

  test.done();
};

/*
 * Tests that the W117 and undef can be toggled per line.
 */
exports['per-line undef / -W117'] = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/ignore-w117.js", "utf-8");

  TestRun(test)
    .addError(5, 3, "'c' is not defined.")
    .addError(11, 3, "'c' is not defined.")
    .addError(15, 3, "'c' is not defined.")
    .test(src, { undef:true });

  test.done();
};

/*
* Tests the `freeze` option -- Warn if native object prototype is assigned to.
*/
exports.freeze = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/nativeobject.js", "utf-8");

  TestRun(test)
    .addError(3, 16, "Extending prototype of native object: 'Array'.")
    .addError(13, 8, "Extending prototype of native object: 'Boolean'.")
    .test(src, { freeze: true, esversion: 6 });

  TestRun(test)
    .test(src, { esversion: 6 });

  test.done();
};

exports.nonbsp = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/nbsp.js', 'utf8');

  TestRun(test)
    .test(src, { sub: true });

  TestRun(test)
    .addError(1, 19, "This line contains non-breaking spaces: http://jshint.com/docs/options/#nonbsp")
    .test(src, { nonbsp: true, sub: true });

  test.done();
};

/** Option `nocomma` disallows the use of comma operator. */
exports.nocomma = function (test) {
  // By default allow comma operator
  TestRun(test, "nocomma off by default")
    .test("return 2, 5;", {});

  TestRun(test, "nocomma main case")
    .addError(1, 9, "Unexpected use of a comma operator.")
    .test("return 2, 5;", { nocomma: true });

  TestRun(test, "nocomma in an expression")
    .addError(1, 3, "Unexpected use of a comma operator.")
    .test("(2, 5);", { expr: true, nocomma: true });

  TestRun(test, "avoid nocomma false positives in value literals")
    .test("return { a: 2, b: [1, 2] };", { nocomma: true });

  TestRun(test, "avoid nocomma false positives in for statements")
    .test("for(;;) { return; }", { nocomma: true });

  TestRun(test, "avoid nocomma false positives in function expressions")
    .test("return function(a, b) {};", { nocomma: true });

  TestRun(test, "avoid nocomma false positives in arrow function expressions")
    .test("return (a, b) => a;", { esnext: true, nocomma: true });

  TestRun(test, "avoid nocomma false positives in destructuring arrays")
    .test("var [a, b] = [1, 2];", { esnext: true, nocomma: true });

  TestRun(test, "avoid nocomma false positives in destructuring objects")
    .test("var {a, b} = {a:1, b:2};", { esnext: true, nocomma: true });

  test.done();
};

exports.enforceall = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/enforceall.js", "utf8");

  // Throws errors not normally on be default
  TestRun(test)
    .addError(1, 19, "This line contains non-breaking spaces: http://jshint.com/docs/options/#nonbsp")
    .addError(1, 18, "['key'] is better written in dot notation.")
    .addError(1, 15, "'obj' is not defined.")
    .addError(1, 32, "Missing semicolon.")
    .test(src, { enforceall: true });

  // Can override default hard
  TestRun(test)
    .test(src, { enforceall: true, nonbsp: false, bitwise: false, sub: true, undef: false, unused: false, asi:true });

  TestRun(test, "Does not enable 'regexpu'.")
    .test('void /./;', { enforceall: true });

  test.done();
};

exports.removeglobal = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/removeglobals.js", "utf8");

  TestRun(test)
    .addError(1, 1, "'JSON' is not defined.")
    .test(src, { undef: true, predef: ["-JSON", "myglobal"] });

  test.done();
};

exports.ignoreDelimiters = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/ignoreDelimiters.js", "utf8");

  TestRun(test)
    // make sure line/column are still reported properly
    .addError(6, 37, "Missing semicolon.")
    .test(src, {
      ignoreDelimiters: [
        { start: "<%=", end: "%>" },
        { start: "<%", end: "%>" },
        { start: "<?php", end: "?>" },
        // make sure single tokens are ignored
        { start: "foo" },
        { end: "bar" }
      ]
    });

  test.done();
};

exports.esnextPredefs = function (test) {
  var code = [
    '/* global alert: true */',
    'var mySym = Symbol("name");',
    'var myBadSym = new Symbol("name");',
    'alert(Reflect);'
  ];

  TestRun(test)
    .addError(3, 16, "Do not use Symbol as a constructor.")
    .test(code, { esnext: true, undef: true });

  test.done();
};

var singleGroups = exports.singleGroups = {};

singleGroups.loneIdentifier = function (test) {
  var code = [
    "if ((a)) {}",
    "if ((a) + b + c) {}",
    "if (a + (b) + c) {}",
    "if (a + b + (c)) {}",
  ];

  TestRun(test)
    .addError(1, 5, "Unnecessary grouping operator.")
    .addError(2, 5, "Unnecessary grouping operator.")
    .addError(3, 9, "Unnecessary grouping operator.")
    .addError(4, 13, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true });

  test.done();
};

singleGroups.neighborless = function (test) {
  var code = [
    "if ((a instanceof b)) {}",
    "if ((a in b)) {}",
    "if ((a + b)) {}"
  ];

  TestRun(test)
    .addError(1, 5, "Unnecessary grouping operator.")
    .addError(2, 5, "Unnecessary grouping operator.")
    .addError(3, 5, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true });

  test.done();
};

singleGroups.bindingPower = {};

singleGroups.bindingPower.singleExpr = function (test) {
  var code = [
    "var a = !(a instanceof b);",
    "var b = !(a in b);",
    "var c = !!(a && a.b);",
    "var d = (1 - 2) * 3;",
    "var e = 3 * (1 - 2);",
    "var f = a && (b || c);",
    "var g = ~(a * b);",
    "var h = void (a || b);",
    "var i = 2 * (3 - 4 - 5) * 6;",
    "var j = (a = 1) + 2;",
    "var j = (a += 1) / 2;",
    "var k = 'foo' + ('bar' ? 'baz' : 'qux');",
    "var l = 1 + (0 || 3);",
    "var u = a / (b * c);",
    "var v = a % (b / c);",
    "var w = a * (b * c);",
    "var x = z === (b === c);",
    "x = typeof (a + b);",
    // Invalid forms:
    "var j = 2 * ((3 - 4) - 5) * 6;",
    "var l = 2 * ((3 - 4 - 5)) * 6;",
    "var m = typeof(a.b);",
    "var n = 1 - (2 * 3);",
    "var o = (3 * 1) - 2;",
    "var p = ~(Math.abs(a));",
    "var q = -(a[b]);",
    "var r = +(a.b);",
    "var s = --(a.b);",
    "var t = ++(a[b]);",
    "if (a in c || (b in c)) {}",
    "if ((a in c) || b in c) {}",
    "if ((a in c) || (b in c)) {}",
    "if ((a * b) * c) {}",
    "if (a + (b * c)) {}",
    "(a ? a : (a=[])).push(b);",
    "if (a || (1 / 0 == 1 / 0)) {}",
  ];

  TestRun(test)
    .addError(19, 14, "Unnecessary grouping operator.")
    .addError(20, 14, "Unnecessary grouping operator.")
    .addError(21, 15, "Unnecessary grouping operator.")
    .addError(22, 13, "Unnecessary grouping operator.")
    .addError(23, 9, "Unnecessary grouping operator.")
    .addError(24, 10, "Unnecessary grouping operator.")
    .addError(25, 10, "Unnecessary grouping operator.")
    .addError(26, 10, "Unnecessary grouping operator.")
    .addError(27, 11, "Unnecessary grouping operator.")
    .addError(28, 11, "Unnecessary grouping operator.")
    .addError(29, 15, "Unnecessary grouping operator.")
    .addError(30, 5, "Unnecessary grouping operator.")
    .addError(31, 5, "Unnecessary grouping operator.")
    .addError(31, 17, "Unnecessary grouping operator.")
    .addError(32, 5, "Unnecessary grouping operator.")
    .addError(33, 9, "Unnecessary grouping operator.")
    .addError(34, 10, "Unnecessary grouping operator.")
    .addError(35, 10, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true });

  code = [
    "var x;",
    "x = (printA || printB)``;",
    "x = (printA || printB)`${}`;",
    "x = (new X)``;",
    "x = (new X)`${}`;",
    // Should warn:
    "x = (x.y)``;",
    "x = (x.y)`${}`;",
    "x = (x[x])``;",
    "x = (x[x])`${}`;",
    "x = (x())``;",
    "x = (x())`${}`;"
  ];

  TestRun(test)
    .addError(6, 5, "Unnecessary grouping operator.")
    .addError(7, 5, "Unnecessary grouping operator.")
    .addError(8, 5, "Unnecessary grouping operator.")
    .addError(9, 5, "Unnecessary grouping operator.")
    .addError(10, 5, "Unnecessary grouping operator.")
    .addError(11, 5, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true, esversion: 6, supernew: true });

  test.done();
};

singleGroups.bindingPower.multiExpr = function (test) {
  var code = [
    "var j = (a, b);",
    "var k = -(a, b);",
    "var i = (1, a = 1) + 2;",
    "var k = a ? (b, c) : (d, e);",
    "var j = (a, b + c) * d;",
    "if (a, (b * c)) {}",
    "if ((a * b), c) {}",
    "if ((a, b, c)) {}",
    "if ((a + 1)) {}"
  ];

  TestRun(test)
    .addError(6, 8, "Unnecessary grouping operator.")
    .addError(7, 5, "Unnecessary grouping operator.")
    .addError(8, 5, "Unnecessary grouping operator.")
    .addError(9, 5, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true });

  test.done();
};

singleGroups.multiExpr = function (test) {
  var code = [
    "var a = (1, 2);",
    "var b = (true, false) ? 1 : 2;",
    "var c = true ? (1, 2) : false;",
    "var d = true ? false : (1, 2);",
    "foo((1, 2));"
  ];

  TestRun(test)
    .test(code, { singleGroups: true });

  test.done();
};

// Although the following form is redundant in purely mathematical terms, type
// coercion semantics in JavaScript make it impossible to statically determine
// whether the grouping operator is necessary. JSHint should err on the side of
// caution and allow this form.
singleGroups.concatenation = function (test) {
  var code = [
    "var a = b + (c + d);",
    "var e = (f + g) + h;"
  ];

  TestRun(test)
    .addError(2, 9, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true });

  test.done();
};

singleGroups.functionExpression = function (test) {
  var code = [
    "(function() {})();",
    "(function() {}).call();",
    "(function() {}());",
    "(function() {}.call());",
    "if (true) {} (function() {}());",
    "(function() {}());",
    // These usages are not technically necessary, but parenthesis are commonly
    // used to signal that a function expression is going to be invoked
    // immediately.
    "var a = (function() {})();",
    "var b = (function() {}).call();",
    "var c = (function() {}());",
    "var d = (function() {}.call());",
    "var e = { e: (function() {})() };",
    "var f = { f: (function() {}).call() };",
    "var g = { g: (function() {}()) };",
    "var h = { h: (function() {}.call()) };",
    "if ((function() {})()) {}",
    "if ((function() {}).call()) {}",
    "if ((function() {}())) {}",
    "if ((function() {}.call())) {}",
    // Invalid forms:
    "var i = (function() {});"
  ];

  TestRun(test)
    .addError(19, 9, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true, asi: true });

  test.done();
};

singleGroups.generatorExpression = function (test) {
  var code = [
    "(function*() { yield; })();",
    "(function*() { yield; }).call();",
    "(function*() { yield; }());",
    "(function*() { yield; }.call());",
    "if (true) {} (function*() { yield; }());",
    "(function*() { yield; }());",
    // These usages are not technically necessary, but parenthesis are commonly
    // used to signal that a function expression is going to be invoked
    // immediately.
    "var a = (function*() { yield; })();",
    "var b = (function*() { yield; }).call();",
    "var c = (function*() { yield; }());",
    "var d = (function*() { yield; }.call());",
    "var e = { e: (function*() { yield; })() };",
    "var f = { f: (function*() { yield; }).call() };",
    "var g = { g: (function*() { yield; }()) };",
    "var h = { h: (function*() { yield; }.call()) };",
    "if ((function*() { yield; })()) {}",
    "if ((function*() { yield; }).call()) {}",
    "if ((function*() { yield; }())) {}",
    "if ((function*() { yield; }.call())) {}",
    // Invalid forms:
    "var i = (function*() { yield; });"
  ];

  TestRun(test)
    .addError(19, 9, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true, asi: true, esnext: true });

  test.done();
};

singleGroups.yield = function (test) {
  TestRun(test, "otherwise-invalid position")
    .test([
      "function* g() {",
      "  var x;",
      "  x = 0 || (yield);",
      "  x = 0 || (yield 0);",
      "  x = 0 && (yield);",
      "  x = 0 && (yield 0);",
      "  x = !(yield);",
      "  x = !(yield 0);",
      "  x = !!(yield);",
      "  x = !!(yield 0);",
      "  x = 0 + (yield);",
      "  x = 0 + (yield 0);",
      "  x = 0 - (yield);",
      "  x = 0 - (yield 0);",
      "}"
    ], { singleGroups: true, esversion: 6 });

  TestRun(test, "operand delineation")
    .test([
      "function* g() {",
      "  (yield).x = 0;",
      "  x = (yield) ? 0 : 0;",
      "  x = (yield 0) ? 0 : 0;",
      "  x = (yield) / 0;",
      "}"
    ], { singleGroups: true, esversion: 6 });

  TestRun(test)
    .addError(2, 3, "Unnecessary grouping operator.")
    .addError(3, 3, "Unnecessary grouping operator.")
    .addError(4, 11, "Unnecessary grouping operator.")
    .addError(5, 11, "Unnecessary grouping operator.")
    .addError(6, 7, "Unnecessary grouping operator.")
    .addError(7, 7, "Unnecessary grouping operator.")
    .addError(8, 8, "Unnecessary grouping operator.")
    .addError(9, 8, "Unnecessary grouping operator.")
    .addError(10, 8, "Unnecessary grouping operator.")
    .addError(11, 8, "Unnecessary grouping operator.")
    .addError(12, 8, "Unnecessary grouping operator.")
    .addError(13, 8, "Unnecessary grouping operator.")
    .addError(14, 8, "Unnecessary grouping operator.")
    .addError(15, 8, "Unnecessary grouping operator.")
    .addError(16, 8, "Unnecessary grouping operator.")
    .addError(17, 8, "Unnecessary grouping operator.")
    .addError(18, 9, "Unnecessary grouping operator.")
    .addError(19, 9, "Unnecessary grouping operator.")
    .addError(20, 9, "Unnecessary grouping operator.")
    .addError(21, 9, "Unnecessary grouping operator.")
    .addError(22, 10, "Unnecessary grouping operator.")
    .addError(23, 10, "Unnecessary grouping operator.")
    .addError(24, 8, "Unnecessary grouping operator.")
    .addError(25, 8, "Unnecessary grouping operator.")
    .addError(26, 8, "Unnecessary grouping operator.")
    .addError(27, 8, "Unnecessary grouping operator.")
    .addError(28, 8, "Unnecessary grouping operator.")
    .addError(29, 8, "Unnecessary grouping operator.")
    .addError(30, 11, "Unnecessary grouping operator.")
    .addError(31, 11, "Unnecessary grouping operator.")
    .addError(32, 15, "Unnecessary grouping operator.")
    .addError(33, 15, "Unnecessary grouping operator.")
    .addError(34, 9, "Unnecessary grouping operator.")
    .test([
      "function* g() {",
      "  (yield);",
      "  (yield 0);",
      "  var x = (yield);",
      "  var y = (yield 0);",
      "  x = (yield);",
      "  x = (yield 0);",
      "  x += (yield);",
      "  x += (yield 0);",
      "  x -= (yield);",
      "  x -= (yield 0);",
      "  x *= (yield);",
      "  x *= (yield 0);",
      "  x /= (yield);",
      "  x /= (yield 0);",
      "  x %= (yield);",
      "  x %= (yield 0);",
      "  x <<= (yield 0);",
      "  x <<= (yield);",
      "  x >>= (yield);",
      "  x >>= (yield 0);",
      "  x >>>= (yield);",
      "  x >>>= (yield 0);",
      "  x &= (yield);",
      "  x &= (yield 0);",
      "  x ^= (yield);",
      "  x ^= (yield 0);",
      "  x |= (yield);",
      "  x |= (yield 0);",
      "  x = 0 ? (yield) : 0;",
      "  x = 0 ? (yield 0) : 0;",
      "  x = 0 ? 0 : (yield);",
      "  x = 0 ? 0 : (yield 0);",
      "  yield (yield);",
      "}"
    ], { singleGroups: true, esversion: 6 });

  test.done();
};

singleGroups.arrowFunctions = function (test) {
  var code = [
    "var a = () => ({});",
    "var b = (c) => {};",
    "var g = (() => 3)();",
    "var h = (() => ({}))();",
    "var i = (() => 3).length;",
    "var j = (() => ({})).length;",
    "var k = (() => 3)[prop];",
    "var l = (() => ({}))[prop];",
    "var m = (() => 3) || 3;",
    "var n = (() => ({})) || 3;",
    "var o = (() => {})();",
    "var p = (() => {})[prop];",
    "var q = (() => {}) || 3;",
    "(() => {})();",
    // Invalid forms:
    "var d = () => (e);",
    "var f = () => (3);",
    "var r = (() => 3);",
    "var s = (() => {});"
  ];

  TestRun(test)
    .addError(15, 15, "Unnecessary grouping operator.")
    .addError(16, 15, "Unnecessary grouping operator.")
    .addError(17, 9, "Unnecessary grouping operator.")
    .addError(18, 9, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true, esnext: true });

  test.done();
};

singleGroups.exponentiation = function (test) {
  TestRun(test)
    .addError(1, 1, "Unnecessary grouping operator.")
    .addError(2, 6, "Unnecessary grouping operator.")
    .test([
      "(2) ** 2;",
      "2 ** (2);",
    ], { singleGroups: true, expr: true, esversion: 7 });

  TestRun(test, "UpdateExpression")
    .addError(2, 1, "Unnecessary grouping operator.")
    .addError(3, 1, "Unnecessary grouping operator.")
    .addError(4, 1, "Unnecessary grouping operator.")
    .addError(5, 1, "Unnecessary grouping operator.")
    .addError(6, 6, "Unnecessary grouping operator.")
    .addError(7, 6, "Unnecessary grouping operator.")
    .addError(8, 6, "Unnecessary grouping operator.")
    .addError(9, 6, "Unnecessary grouping operator.")
    .test([
      "var x;",
      "(++x) ** 2;",
      "(x++) ** 2;",
      "(--x) ** 2;",
      "(x--) ** 2;",
      "2 ** (++x);",
      "2 ** (x++);",
      "2 ** (--x);",
      "2 ** (x--);"
    ], { singleGroups: true, expr: true, esversion: 7 });

  TestRun(test, "UnaryExpression")
    .addError(1, 16, "Variables should not be deleted.")
    .addError(8, 10, "Variables should not be deleted.")
    .test([
      "delete (2 ** 3);",
      "void (2 ** 3);",
      "typeof (2 ** 3);",
      "+(2 ** 3);",
      "-(2 ** 3);",
      "~(2 ** 3);",
      "!(2 ** 3);",
      "(delete 2) ** 3;",
      "(void 2) ** 3;",
      "(typeof 2) ** 3;",
      "(+2) ** 3;",
      "(-2) ** 3;",
      "(~2) ** 3;",
      "(!2) ** 3;"
    ], { singleGroups: true, expr: true, esversion: 7 });

  TestRun(test, "MultiplicativeExpression")
    .addError(2, 5, "Unnecessary grouping operator.")
    .addError(4, 1, "Unnecessary grouping operator.")
    .addError(6, 5, "Unnecessary grouping operator.")
    .addError(8, 1, "Unnecessary grouping operator.")
    .addError(10, 5, "Unnecessary grouping operator.")
    .addError(12, 1, "Unnecessary grouping operator.")
    .test([
      "(2 * 3) ** 4;",
      "2 * (3 ** 4);",
      "2 ** (3 * 4);",
      "(2 ** 3) * 4;",
      "(2 / 3) ** 4;",
      "2 / (3 ** 4);",
      "2 ** (3 / 4);",
      "(2 ** 3) / 4;",
      "(2 % 3) ** 4;",
      "2 % (3 ** 4);",
      "2 ** (3 % 4);",
      "(2 ** 3) % 4;"
    ], { singleGroups: true, expr: true, esversion: 7 });

  TestRun(test, "AdditiveExpression")
    .addError(2, 5, "Unnecessary grouping operator.")
    .addError(4, 1, "Unnecessary grouping operator.")
    .addError(6, 5, "Unnecessary grouping operator.")
    .addError(8, 1, "Unnecessary grouping operator.")
    .test([
      "(2 + 3) ** 4;",
      "2 + (3 ** 4);",
      "2 ** (3 + 4);",
      "(2 ** 3) + 4;",
      "(2 - 3) ** 4;",
      "2 - (3 ** 4);",
      "2 ** (3 - 4);",
      "(2 ** 3) - 4;"
    ], { singleGroups: true, expr: true, esversion: 7 });

  TestRun(test, "Exponentiation")
    .addError(2, 6, "Unnecessary grouping operator.")
    .test([
      "(2 ** 3) ** 4;",
      "2 ** (3 ** 4);"
    ], { singleGroups: true, expr: true, esversion: 7 });

  test.done();
};

singleGroups.asyncFunction = function (test) {
  TestRun(test, "Async Function Expression")
    .test([
      "(async function() {})();",
      "(async function a() {})();"
    ], { singleGroups: true, esversion: 8 });

  TestRun(test, "Async Generator Function Expression")
    .test([
      "(async function * () { yield; })();",
      "(async function * a() { yield; })();"
    ], { singleGroups: true, esversion: 9 });


  TestRun(test, "Async Arrow Function")
    .test([
      "(async () => {})();",
      "(async x => x)();"
    ], { singleGroups: true, esversion: 8 });

  TestRun(test, "async identifier")
    .addError(1, 1, "Unnecessary grouping operator.")
    .addError(2, 1, "Unnecessary grouping operator.")
    .test([
      "(async());",
      "(async(x, y, z));"
    ], { singleGroups: true, esversion: 8 });

  test.done();
};

singleGroups.await = function (test) {
  TestRun(test, "MultiplicativeExpression")
    .addError(2, 3, "Unnecessary grouping operator.")
    .test([
      "(async function() {",
      "  (await 2) * 3;",
      "})();"
    ], { singleGroups: true, expr: true, esversion: 8 });

  TestRun(test, "ExponentiationExpression")
    .addError(2, 3, "Unnecessary grouping operator.")
    .test([
      "(async function() {",
      "  (await 2) ** 3;",
      "})();"
    ], { singleGroups: true, expr: true, esversion: 8 });

  TestRun(test, "CallExpression")
    .test([
      "(async function() {",
      "  (await 2)();",
      "})();"
    ], { singleGroups: true, expr: true, esversion: 8 });

  TestRun(test, "EqualityExpression")
    .addError(2, 3, "Unnecessary grouping operator.")
    .addError(3, 3, "Unnecessary grouping operator.")
    .addError(4, 3, "Unnecessary grouping operator.")
    .addError(5, 3, "Unnecessary grouping operator.")
    .test([
      "(async function() {",
      "  (await 2) == 2;",
      "  (await 2) != 2;",
      "  (await 2) === 2;",
      "  (await 2) !== 2;",
      "})();"
    ], { singleGroups: true, expr: true, esversion: 8 });

  TestRun(test, "Expression")
    .addError(2, 3, "Unnecessary grouping operator.")
    .test([
      "(async function() {",
      "  (await 0), 0;",
      "})();"
    ], { singleGroups: true, expr: true, esversion: 8 });

  test.done();
};

singleGroups.objectLiterals = function (test) {
  var code = [
    "({}).method();",
    "if(true) {} ({}).method();",
    "g(); ({}).method();",

    // Invalid forms
    "var a = ({}).method();",
    "if (({}).method()) {}",
    "var b = { a: ({}).method() };",
    "for (({}); ;) {}",
    "for (; ;({})) {}"
  ];

  TestRun(test, "grouping operator not required")
    .addError(4, 9, "Unnecessary grouping operator.")
    .addError(5, 5, "Unnecessary grouping operator.")
    .addError(6, 14, "Unnecessary grouping operator.")
    .addError(7, 6, "Unnecessary grouping operator.")
    .addError(8, 9, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true });

  test.done();
};

singleGroups.newLine = function(test) {
  var code = [
    "function x() {",
    "  return f",
    "    ();",
    "}",
    "x({ f: null });"
  ];

  TestRun(test)
    .test(code, { singleGroups: true });

  test.done();
};

singleGroups.lineNumber = function (test) {
  var code = [
    "var x = (",
    "  1",
    ")",
    ";"
  ];

  TestRun(test)
    .addError(1, 9, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true });

  test.done();
};

singleGroups.unary = function (test) {
  var code = [
    "(-3).toString();",
    "(+3)[methodName]();",
    "(!3).toString();",
    "(~3).toString();",
    "(typeof x).toString();",
    "(new x).method();",

    // Unnecessary:
    "x = (-3) + 5;",
    "x = (+3) - 5;",
    "x = (!3) / 5;",
    "x = (~3) << 5;",
    "x = (typeof x) === 'undefined';",
    "x = (new x) + 4;",
  ];

  TestRun(test)
    .addError(6, 6, "Missing '()' invoking a constructor.")
    .addError(7, 5, "Unnecessary grouping operator.")
    .addError(8, 5, "Unnecessary grouping operator.")
    .addError(9, 5, "Unnecessary grouping operator.")
    .addError(10, 5, "Unnecessary grouping operator.")
    .addError(11, 5, "Unnecessary grouping operator.")
    .addError(12, 5, "Unnecessary grouping operator.")
    .addError(12, 10, "Missing '()' invoking a constructor.")
    .test(code, { singleGroups: true });

  test.done();
};

singleGroups.numberLiterals = function (test) {
  var code = [
    "(3).toString();",
    "(3.1).toString();",
    "(.3).toString();",
    "(3.).toString();",
    "(1e3).toString();",
    "(1e-3).toString();",
    "(1.1e3).toString();",
    "(1.1e-3).toString();",
    "(3)[methodName]();",
    "var x = (3) + 3;",
    "('3').toString();"
  ];

  TestRun(test)
    .addError(2, 1, "Unnecessary grouping operator.")
    .addError(3, 1, "Unnecessary grouping operator.")
    .addError(3, 4, "A leading decimal point can be confused with a dot: '.3'.")
    .addError(4, 1, "Unnecessary grouping operator.")
    .addError(4, 4, "A trailing decimal point can be confused with a dot: '3.'.")
    .addError(5, 1, "Unnecessary grouping operator.")
    .addError(6, 1, "Unnecessary grouping operator.")
    .addError(7, 1, "Unnecessary grouping operator.")
    .addError(8, 1, "Unnecessary grouping operator.")
    .addError(9, 1, "Unnecessary grouping operator.")
    .addError(10, 9, "Unnecessary grouping operator.")
    .addError(11, 1, "Unnecessary grouping operator.")
    .test(code, { singleGroups: true });

  test.done();
};

singleGroups.postfix = function (test) {
  var code = [
    "var x;",
    "(x++).toString();",
    "(x--).toString();"
  ];

  TestRun(test)
    .test(code, { singleGroups: true });

  test.done();
};

singleGroups.destructuringAssign = function (test) {

  var code = [
    // statements
    "({ x } = { x : 1 });",
    "([ x ] = [ 1 ]);",
    // expressions
    "1, ({ x } = { x : 1 });",
    "1, ([ x ] = [ 1 ]);",
    "for (({ x } = { X: 1 }); ;) {}",
    "for (; ;({ x } = { X: 1 })) {}"
  ];

  TestRun(test)
    .addError(2, 1, "Unnecessary grouping operator.")
    .addError(3, 4, "Unnecessary grouping operator.")
    .addError(4, 4, "Unnecessary grouping operator.")
    .addError(5, 6, "Unnecessary grouping operator.")
    .addError(6, 9, "Unnecessary grouping operator.")
    .test(code, { esversion: 6, singleGroups: true, expr: true });

  test.done();
};

exports.elision = function (test) {
  var code = [
    "var a = [1,,2];",
    "var b = [1,,,,2];",
    "var c = [1,2,];",
    "var d = [,1,2];",
    "var e = [,,1,2];",
  ];

  TestRun(test, "elision=false ES5")
    .addError(1, 12, "Empty array elements require elision=true.")
    .addError(2, 12, "Empty array elements require elision=true.")
    .addError(4, 10, "Empty array elements require elision=true.")
    .addError(5, 10, "Empty array elements require elision=true.")
    .test(code, { elision: false, es3: false });

  TestRun(test, "elision=false ES3")
    .addError(1, 12, "Extra comma. (it breaks older versions of IE)")
    .addError(2, 12, "Extra comma. (it breaks older versions of IE)")
    .addError(2, 13, "Extra comma. (it breaks older versions of IE)")
    .addError(2, 14, "Extra comma. (it breaks older versions of IE)")
    .addError(3, 13, "Extra comma. (it breaks older versions of IE)")
    .addError(4, 10, "Extra comma. (it breaks older versions of IE)")
    .addError(5, 10, "Extra comma. (it breaks older versions of IE)")
    .addError(5, 11, "Extra comma. (it breaks older versions of IE)")
    .test(code, { elision: false, es3: true });

  TestRun(test, "elision=true ES5")
    .test(code, { elision: true, es3: false });

  TestRun(test, "elision=true ES3")
    .addError(3, 13, "Extra comma. (it breaks older versions of IE)")
    .test(code, { elision: true, es3: true });

  test.done();
};

exports.badInlineOptionValue = function (test) {
  var src = [ "/* jshint bitwise:batcrazy */" ];

  TestRun(test)
    .addError(1, 1, "Bad option value.")
    .test(src);

  test.done();
};

exports.futureHostile = function (test) {
  var code = [
    "var JSON = {};",
    "var Map = function() {};",
    "var Promise = function() {};",
    "var Proxy = function() {};",
    "var Reflect = function() {};",
    "var Set = function() {};",
    "var Symbol = function() {};",
    "var WeakMap = function() {};",
    "var WeakSet = function() {};",
    "var ArrayBuffer = function() {};",
    "var DataView = function() {};",
    "var Int8Array = function() {};",
    "var Int16Array = function() {};",
    "var Int32Array = function() {};",
    "var Uint8Array = function() {};",
    "var Uint16Array = function() {};",
    "var Uint32Array = function() {};",
    "var Uint8ClampedArray = function() {};",
    "var Float32Array = function() {};",
    "var Float64Array = function() {};"
  ];

  TestRun(test, "ES3 without option")
    .addError(1, 5, "'JSON' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(2, 5, "'Map' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(3, 5, "'Promise' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(4, 5, "'Proxy' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(5, 5, "'Reflect' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(6, 5, "'Set' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(7, 5, "'Symbol' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(8, 5, "'WeakMap' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(9, 5, "'WeakSet' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(10, 5, "'ArrayBuffer' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(11, 5, "'DataView' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(12, 5, "'Int8Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(13, 5, "'Int16Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(14, 5, "'Int32Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(15, 5, "'Uint8Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(16, 5, "'Uint16Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(17, 5, "'Uint32Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(18, 5, "'Uint8ClampedArray' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(19, 5, "'Float32Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(20, 5, "'Float64Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .test(code, { es3: true, es5: false, futurehostile: false });

  TestRun(test, "ES3 with option")
    .test(code, { es3: true, es5: false });

  TestRun(test, "ES5 without option")
    .addError(1, 5, "Redefinition of 'JSON'.")
    .addError(2, 5, "'Map' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(3, 5, "'Promise' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(4, 5, "'Proxy' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(5, 5, "'Reflect' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(6, 5, "'Set' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(7, 5, "'Symbol' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(8, 5, "'WeakMap' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(9, 5, "'WeakSet' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(10, 5, "'ArrayBuffer' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(11, 5, "'DataView' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(12, 5, "'Int8Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(13, 5, "'Int16Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(14, 5, "'Int32Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(15, 5, "'Uint8Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(16, 5, "'Uint16Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(17, 5, "'Uint32Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(18, 5, "'Uint8ClampedArray' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(19, 5, "'Float32Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .addError(20, 5, "'Float64Array' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.")
    .test(code, { futurehostile: false });

  TestRun(test, "ES5 with option")
    .addError(1, 5, "Redefinition of 'JSON'.")
    .test(code, {});

  TestRun(test, "ES5 with opt-out")
    .test(code, {
      predef: ["-JSON"]
    });

  TestRun(test, "ESNext without option")
    .addError(1, 5, "Redefinition of 'JSON'.")
    .addError(2, 5, "Redefinition of 'Map'.")
    .addError(3, 5, "Redefinition of 'Promise'.")
    .addError(4, 5, "Redefinition of 'Proxy'.")
    .addError(5, 5, "Redefinition of 'Reflect'.")
    .addError(6, 5, "Redefinition of 'Set'.")
    .addError(7, 5, "Redefinition of 'Symbol'.")
    .addError(8, 5, "Redefinition of 'WeakMap'.")
    .addError(9, 5, "Redefinition of 'WeakSet'.")
    .addError(10, 5, "Redefinition of 'ArrayBuffer'.")
    .addError(11, 5, "Redefinition of 'DataView'.")
    .addError(12, 5, "Redefinition of 'Int8Array'.")
    .addError(13, 5, "Redefinition of 'Int16Array'.")
    .addError(14, 5, "Redefinition of 'Int32Array'.")
    .addError(15, 5, "Redefinition of 'Uint8Array'.")
    .addError(16, 5, "Redefinition of 'Uint16Array'.")
    .addError(17, 5, "Redefinition of 'Uint32Array'.")
    .addError(18, 5, "Redefinition of 'Uint8ClampedArray'.")
    .addError(19, 5, "Redefinition of 'Float32Array'.")
    .addError(20, 5, "Redefinition of 'Float64Array'.")
    .test(code, { esnext: true, futurehostile: false });

  TestRun(test, "ESNext with option")
    .addError(1, 5, "Redefinition of 'JSON'.")
    .addError(2, 5, "Redefinition of 'Map'.")
    .addError(3, 5, "Redefinition of 'Promise'.")
    .addError(4, 5, "Redefinition of 'Proxy'.")
    .addError(5, 5, "Redefinition of 'Reflect'.")
    .addError(6, 5, "Redefinition of 'Set'.")
    .addError(7, 5, "Redefinition of 'Symbol'.")
    .addError(8, 5, "Redefinition of 'WeakMap'.")
    .addError(9, 5, "Redefinition of 'WeakSet'.")
    .addError(10, 5, "Redefinition of 'ArrayBuffer'.")
    .addError(11, 5, "Redefinition of 'DataView'.")
    .addError(12, 5, "Redefinition of 'Int8Array'.")
    .addError(13, 5, "Redefinition of 'Int16Array'.")
    .addError(14, 5, "Redefinition of 'Int32Array'.")
    .addError(15, 5, "Redefinition of 'Uint8Array'.")
    .addError(16, 5, "Redefinition of 'Uint16Array'.")
    .addError(17, 5, "Redefinition of 'Uint32Array'.")
    .addError(18, 5, "Redefinition of 'Uint8ClampedArray'.")
    .addError(19, 5, "Redefinition of 'Float32Array'.")
    .addError(20, 5, "Redefinition of 'Float64Array'.")
    .test(code, { esnext: true });

  TestRun(test, "ESNext with opt-out")
    .test(code, {
      esnext: true,
      futurehostile: false,
      predef: [
        "-JSON",
        "-Map",
        "-Promise",
        "-Proxy",
        "-Reflect",
        "-Set",
        "-Symbol",
        "-WeakMap",
        "-WeakSet",
        "-ArrayBuffer",
        "-DataView",
        "-Int8Array",
        "-Int16Array",
        "-Int32Array",
        "-Uint8Array",
        "-Uint16Array",
        "-Uint32Array",
        "-Uint8ClampedArray",
        "-Float32Array",
        "-Float64Array"
      ]
    });

  code = [
    "let JSON = {};",
    "let Map = function() {};",
    "let Promise = function() {};",
    "let Proxy = function() {};",
    "let Reflect = function() {};",
    "let Set = function() {};",
    "let Symbol = function() {};",
    "let WeakMap = function() {};",
    "let WeakSet = function() {};",
    "let ArrayBuffer = function() {};",
    "let DataView = function() {};",
    "let Int8Array = function() {};",
    "let Int16Array = function() {};",
    "let Int32Array = function() {};",
    "let Uint8Array = function() {};",
    "let Uint16Array = function() {};",
    "let Uint32Array = function() {};",
    "let Uint8ClampedArray = function() {};",
    "let Float32Array = function() {};",
    "let Float64Array = function() {};"
  ];

  TestRun(test, "ESNext with option")
    .addError(1, 5, "Redefinition of 'JSON'.")
    .addError(2, 5, "Redefinition of 'Map'.")
    .addError(3, 5, "Redefinition of 'Promise'.")
    .addError(4, 5, "Redefinition of 'Proxy'.")
    .addError(5, 5, "Redefinition of 'Reflect'.")
    .addError(6, 5, "Redefinition of 'Set'.")
    .addError(7, 5, "Redefinition of 'Symbol'.")
    .addError(8, 5, "Redefinition of 'WeakMap'.")
    .addError(9, 5, "Redefinition of 'WeakSet'.")
    .addError(10, 5, "Redefinition of 'ArrayBuffer'.")
    .addError(11, 5, "Redefinition of 'DataView'.")
    .addError(12, 5, "Redefinition of 'Int8Array'.")
    .addError(13, 5, "Redefinition of 'Int16Array'.")
    .addError(14, 5, "Redefinition of 'Int32Array'.")
    .addError(15, 5, "Redefinition of 'Uint8Array'.")
    .addError(16, 5, "Redefinition of 'Uint16Array'.")
    .addError(17, 5, "Redefinition of 'Uint32Array'.")
    .addError(18, 5, "Redefinition of 'Uint8ClampedArray'.")
    .addError(19, 5, "Redefinition of 'Float32Array'.")
    .addError(20, 5, "Redefinition of 'Float64Array'.")
    .test(code, { esnext: true });

  TestRun(test, "ESNext with opt-out")
    .test(code, {
      esnext: true,
      futurehostile: false,
      predef: [
        "-JSON",
        "-Map",
        "-Promise",
        "-Proxy",
        "-Reflect",
        "-Set",
        "-Symbol",
        "-WeakMap",
        "-WeakSet",
        "-ArrayBuffer",
        "-DataView",
        "-Int8Array",
        "-Int16Array",
        "-Int32Array",
        "-Uint8Array",
        "-Uint16Array",
        "-Uint32Array",
        "-Uint8ClampedArray",
        "-Float32Array",
        "-Float64Array"
      ]
    });

  code = [
    "const JSON = {};",
    "const Map = function() {};",
    "const Promise = function() {};",
    "const Proxy = function() {};",
    "const Reflect = function() {};",
    "const Set = function() {};",
    "const Symbol = function() {};",
    "const WeakMap = function() {};",
    "const WeakSet = function() {};",
    "const ArrayBuffer = function() {};",
    "const DataView = function() {};",
    "const Int8Array = function() {};",
    "const Int16Array = function() {};",
    "const Int32Array = function() {};",
    "const Uint8Array = function() {};",
    "const Uint16Array = function() {};",
    "const Uint32Array = function() {};",
    "const Uint8ClampedArray = function() {};",
    "const Float32Array = function() {};",
    "const Float64Array = function() {};"
  ];

  TestRun(test, "ESNext with option")
    .addError(1, 7, "Redefinition of 'JSON'.")
    .addError(2, 7, "Redefinition of 'Map'.")
    .addError(3, 7, "Redefinition of 'Promise'.")
    .addError(4, 7, "Redefinition of 'Proxy'.")
    .addError(5, 7, "Redefinition of 'Reflect'.")
    .addError(6, 7, "Redefinition of 'Set'.")
    .addError(7, 7, "Redefinition of 'Symbol'.")
    .addError(8, 7, "Redefinition of 'WeakMap'.")
    .addError(9, 7, "Redefinition of 'WeakSet'.")
    .addError(10, 7, "Redefinition of 'ArrayBuffer'.")
    .addError(11, 7, "Redefinition of 'DataView'.")
    .addError(12, 7, "Redefinition of 'Int8Array'.")
    .addError(13, 7, "Redefinition of 'Int16Array'.")
    .addError(14, 7, "Redefinition of 'Int32Array'.")
    .addError(15, 7, "Redefinition of 'Uint8Array'.")
    .addError(16, 7, "Redefinition of 'Uint16Array'.")
    .addError(17, 7, "Redefinition of 'Uint32Array'.")
    .addError(18, 7, "Redefinition of 'Uint8ClampedArray'.")
    .addError(19, 7, "Redefinition of 'Float32Array'.")
    .addError(20, 7, "Redefinition of 'Float64Array'.")
    .test(code, { esnext: true });

  TestRun(test, "ESNext with opt-out")
    .test(code, {
      esnext: true,
      futurehostile: false,
      predef: [
        "-JSON",
        "-Map",
        "-Promise",
        "-Proxy",
        "-Reflect",
        "-Set",
        "-Symbol",
        "-WeakMap",
        "-WeakSet",
        "-ArrayBuffer",
        "-DataView",
        "-Int8Array",
        "-Int16Array",
        "-Int32Array",
        "-Uint8Array",
        "-Uint16Array",
        "-Uint32Array",
        "-Uint8ClampedArray",
        "-Float32Array",
        "-Float64Array"
      ]
    });

  test.done();
};


exports.varstmt = function (test) {
  var code = [
    "var x;",
    "var y = 5;",
    "var fn = function() {",
    "  var x;",
    "  var y = 5;",
    "};",
    "for (var a in x);"
  ];

  TestRun(test)
    .addError(1, 1, "`var` declarations are forbidden. Use `let` or `const` instead.")
    .addError(2, 1, "`var` declarations are forbidden. Use `let` or `const` instead.")
    .addError(3, 1, "`var` declarations are forbidden. Use `let` or `const` instead.")
    .addError(4, 3, "`var` declarations are forbidden. Use `let` or `const` instead.")
    .addError(5, 3, "`var` declarations are forbidden. Use `let` or `const` instead.")
    .addError(7, 6, "`var` declarations are forbidden. Use `let` or `const` instead.")
    .test(code, { varstmt: true });

  test.done();
};

exports.module = {};
exports.module.behavior = function(test) {
  var code = [
    "var package = 3;",
    "function f() { return this; }"
  ];

  TestRun(test)
    .test(code, {});

  TestRun(test)
    .addError(0, 0, "The 'module' option is only available when linting ECMAScript 6 code.")
    .addError(1, 5, "Expected an identifier and instead saw 'package' (a reserved word).")
    .addError(2, 23, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .test(code, { module: true });

  TestRun(test)
    .addError(1, 5, "Expected an identifier and instead saw 'package' (a reserved word).")
    .addError(2, 23, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .test(code, { module: true, esnext: true });

  code = [
    "/* jshint module: true */",
    "var package = 3;",
    "function f() { return this; }"
  ];

  TestRun(test)
    .addError(1, 1, "The 'module' option is only available when linting ECMAScript 6 code.")
    .addError(2, 5, "Expected an identifier and instead saw 'package' (a reserved word).")
    .addError(3, 23, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .test(code);

  code[0] = "/* jshint module: true, esnext: true */";

  TestRun(test)
    .addError(2, 5, "Expected an identifier and instead saw 'package' (a reserved word).")
    .addError(3, 23, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .test(code);

  test.done();
};

exports.module.declarationRestrictions = function( test ) {
  TestRun(test)
    .addError(2, 3, "The 'module' option cannot be set after any executable code.")
    .test([
      "(function() {",
      "  /* jshint module: true */",
      "})();"
    ], { esnext: true });

  TestRun(test)
    .addError(2, 1, "The 'module' option cannot be set after any executable code.")
    .test([
      "void 0;",
      "/* jshint module: true */"
    ], { esnext: true });

  TestRun(test)
    .addError(3, 1, "The 'module' option cannot be set after any executable code.")
    .test([
      "void 0;",
      "// hide",
      "/* jshint module: true */"
    ], { esnext: true });

  TestRun(test, "First line (following statement)")
    .addError(1, 20, "The 'module' option cannot be set after any executable code.")
    .test([
      "(function() {})(); /* jshint module: true */"
    ], { esnext: true });

  TestRun(test, "First line (within statement)")
    .addError(1, 15, "The 'module' option cannot be set after any executable code.")
    .test([
      "(function() { /* jshint module: true */",
      "})();"
    ], { esnext: true });

  TestRun(test, "First line (before statement)")
    .test([
      "/* jshint module: true */ (function() {",
      "})();"
    ], { esnext: true });

  TestRun(test, "First line (within expression)")
    .addError(1, 10, "The 'module' option cannot be set after any executable code.")
    .test("Math.abs(/*jshint module: true */4);", { esnext: true });

  TestRun(test, "Following single-line comment")
    .test([
      "// License boilerplate",
      "/* jshint module: true */"
    ], { esnext: true });

  TestRun(test, "Following multi-line comment")
    .test([
      "/**",
      " * License boilerplate",
      " */",
      "  /* jshint module: true */"
    ], { esnext: true });

  TestRun(test, "Following shebang")
    .test([
      "#!/usr/bin/env node",
      "/* jshint module: true */"
    ], { esnext: true });

  TestRun(test, "Not re-applied with every directive (gh-2560)")
    .test([
      "/* jshint module:true */",
      "function bar() {",
      "  /* jshint validthis:true */",
      "}"
    ], { esnext: true });

  test.done();
};

exports.module.newcap = function(test) {
  var code = [
    "var ctor = function() {};",
    "var Ctor = function() {};",
    "var c1 = new ctor();",
    "var c2 = Ctor();"
  ];

  TestRun(test, "The `newcap` option is not automatically enabled for module code.")
    .test(code, { esversion: 6, module: true });

  test.done();
};

exports.module.await = function(test) {
  var allPositions = [
    "var await;",
    "function await() {}",
    "await: while (false) {}",
    "void { await: null };",
    "void {}.await;"
  ];

  TestRun(test)
    .test(allPositions, { esversion: 3 });
  TestRun(test)
    .test(allPositions);
  TestRun(test)
    .test(allPositions, { esversion: 6 });

  TestRun(test)
    .addError(1, 5, "Expected an identifier and instead saw 'await' (a reserved word).")
    .test("var await;", { esversion: 6, module: true });

  TestRun(test)
    .addError(1, 10, "Expected an identifier and instead saw 'await' (a reserved word).")
    .test("function await() {}", { esversion: 6, module: true });

  TestRun(test)
    .addError(1, 1, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 1, "Expected an identifier and instead saw 'await' (a reserved word).")
    .addError(1, 6, "Missing semicolon.")
    .addError(1, 1, "Unrecoverable syntax error. (100% scanned).")
    .test("await: while (false) {}", { esversion: 6, module: true });

  TestRun(test)
    .test([
      "void { await: null };",
      "void {}.await;"
    ], { esversion: 6, module: true });

  test.done();
};

exports.esversion = function(test) {
  var code = [
    "// jshint esversion: 3",
    "// jshint esversion: 4",
    "// jshint esversion: 5",
    "// jshint esversion: 6",
    "// jshint esversion: 2015",
    "// jshint esversion: 7",
    "// jshint esversion: 2016",
    "// jshint esversion: 8",
    "// jshint esversion: 2017",
    "// jshint esversion: 9",
    "// jshint esversion: 2018",
    "// jshint esversion: 10",
    "// jshint esversion: 2019",
    "// jshint esversion: 11",
    "// jshint esversion: 2020"
  ];

  TestRun(test, "Value")
    .addError(2, 1, "Bad option value.")
    .addError(14, 1, "Bad option value.")
    .addError(15, 1, "Bad option value.")
    .test(code);

  var es5code = [
    "var a = {",
    "  get b() {}",
    "};"
  ];

  TestRun(test, "ES5 syntax as ES3")
    .addError(2, 7, "get/set are ES5 features.")
    .test(es5code, { esversion: 3 });

  TestRun(test, "ES5 syntax as ES5")
    .test(es5code); // esversion: 5 (default)

  TestRun(test, "ES5 syntax as ES6")
    .test(es5code, { esversion: 6 });

  var es6code = [
    "var a = {",
    "  ['b']: 1",
    "};",
    "var b = () => {};"
  ];

  TestRun(test, "ES6 syntax as ES3")
    .addError(2, 3, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 10, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .test(es6code, { esversion: 3 });

  TestRun(test, "ES6 syntax as ES5")
    .addError(2, 3, "'computed property names' is only available in ES6 (use 'esversion: 6').")
    .addError(4, 10, "'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').")
    .test(es6code); // esversion: 5 (default)

  TestRun(test, "ES6 syntax as ES6")
    .test(es6code, { esversion: 6 });


  TestRun(test, "ES6 syntax as ES6 (via option value `2015`)")
    .test(es5code, { esversion: 2015 });

  TestRun(test, "ES6 syntax as ES7")
    .test(es6code, { esversion: 7 });

  TestRun(test, "ES6 syntax as ES8")
    .test(es6code, { esversion: 8 });


  // Array comprehensions aren't defined in ECMAScript 6,
  // but they can be enabled using the `esnext` option
  var arrayComprehension = [
    "var a = [ 1, 2, 3 ];",
    "var b = [ for (i of a) i ];"
  ];

  TestRun(test, "array comprehensions - esversion: 6")
    .addError(2, 9, "'array comprehension' is only available in Mozilla JavaScript extensions " +
                 "(use moz option).")
    .test(arrayComprehension, { esversion: 6 });

  TestRun(test, "array comprehensions - esversion: 7")
    .addError(2, 9, "'array comprehension' is only available in Mozilla JavaScript extensions " +
                 "(use moz option).")
    .test(arrayComprehension, { esversion: 7 });

  TestRun(test, "array comprehensions - esversion: 8")
    .addError(2, 9, "'array comprehension' is only available in Mozilla JavaScript extensions " +
                 "(use moz option).")
    .test(arrayComprehension, { esversion: 8 });

  TestRun(test, "array comprehensions - esnext: true")
    .test(arrayComprehension, { esnext: true });


  TestRun(test, "incompatibility with `es3`") // TODO: Remove in JSHint 3
    .addError(0, 0, "Incompatible values for the 'esversion' and 'es3' linting options. (0% scanned).")
    .test(es6code, { esversion: 6, es3: true });

  TestRun(test, "incompatibility with `es5`") // TODO: Remove in JSHint 3
    .addError(0, 0, "Incompatible values for the 'esversion' and 'es5' linting options. (0% scanned).")
    .test(es6code, { esversion: 6, es5: true });

  TestRun(test, "incompatibility with `esnext`") // TODO: Remove in JSHint 3
    .addError(0, 0, "Incompatible values for the 'esversion' and 'esnext' linting options. (0% scanned).")
    .test(es6code, { esversion: 3, esnext: true });

  TestRun(test, "imcompatible option specified in-line")
    .addError(2, 1, "Incompatible values for the 'esversion' and 'es3' linting options. (66% scanned).")
    .test(["", "// jshint esversion: 3", ""], { es3: true });

  TestRun(test, "incompatible option specified in-line")
    .addError(2, 1, "Incompatible values for the 'esversion' and 'es3' linting options. (66% scanned).")
    .test(["", "// jshint es3: true", ""], { esversion: 3 });

  TestRun(test, "compatible option specified in-line")
    .addError(3, 1, "'class' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(["", "// jshint esversion: 3", "class A {}"], { esversion: 3 });

  TestRun(test, "compatible option specified in-line")
    .addError(3, 1, "'class' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).")
    .test(["", "// jshint esversion: 3", "class A {}"], { esversion: 6 });

  TestRun(test, "compatible option specified in-line")
    .test(["", "// jshint esversion: 6", "class A {}"], { esversion: 3 });

  var code2 = [ // TODO: Remove in JSHint 3
    "/* jshint esversion: 3, esnext: true */"
  ].concat(es6code);

  TestRun(test, "incompatible options specified in-line") // TODO: Remove in JSHint 3
    .addError(1, 1, "Incompatible values for the 'esversion' and 'esnext' linting options. (20% scanned).")
    .test(code2);

  var code3 = [
    "var someCode;",
    "// jshint esversion: 3"
  ];

  TestRun(test, "cannot be set after any executable code")
    .addError(2, 1, "The 'esversion' option cannot be set after any executable code.")
    .test(code3);

  var code4 = [
    "#!/usr/bin/env node",
    "/**",
    " * License",
    " */",
    "// jshint esversion: 3",
    "// jshint esversion: 6"
  ];

  TestRun(test, "can follow shebang or comments")
    .test(code4);

  var code5 = [
    "// jshint moz: true",
    "// jshint esversion: 3",
    "var x = {",
    "  get a() {}",
    "};",
    "// jshint moz: true",
    "var x = {",
    "  get a() {}",
    "};"
  ];

  TestRun(test, "correctly swap between moz and esversion")
    .addError(4, 7, "get/set are ES5 features.")
    .test(code5);

  test.done();
};

// Option `trailingcomma` requires a comma after each element in an array or
// object literal.
exports.trailingcomma = function (test) {
  var code = [
    "var a = [];",
    "var b = [1];",
    "var c = [1,];",
    "var d = [1,2];",
    "var e = [1,2,];",
    "var f = {};",
    "var g = {a: 1};",
    "var h = {a: 1,};",
    "var i = {a: 1, b: 2};",
    "var j = {a: 1, b: 2,};"
  ];

  TestRun(test, "trailingcomma=true ES6")
    .addError(2, 11, "Missing comma.")
    .addError(4, 13, "Missing comma.")
    .addError(7, 14, "Missing comma.")
    .addError(9, 20, "Missing comma.")
    .test(code, { trailingcomma: true, esversion: 6 });

  TestRun(test, "trailingcomma=true ES5")
    .addError(2, 11, "Missing comma.")
    .addError(4, 13, "Missing comma.")
    .addError(7, 14, "Missing comma.")
    .addError(9, 20, "Missing comma.")
    .test(code, { trailingcomma: true });

  TestRun(test, "trailingcomma=true ES3")
    .addError(3, 11, "Extra comma. (it breaks older versions of IE)")
    .addError(5, 13, "Extra comma. (it breaks older versions of IE)")
    .addError(8, 14, "Extra comma. (it breaks older versions of IE)")
    .addError(10, 20, "Extra comma. (it breaks older versions of IE)")
    .test(code, { trailingcomma: true, es3: true });

  test.done();
};

exports.unstable = function (test) {
  TestRun(test, "Accepts programmatic configuration.")
    .test("", { unstable: {} });

  TestRun(test, "Accepts empty in-line directive (single-line comment).")
    .test("// jshint.unstable");

  TestRun(test, "Rejects empty in-line directive (multi-line comment).")
    .addError(1, 1, "Bad unstable option: ''.")
    .test("/* jshint.unstable */");

  TestRun(test, "Rejects non-existent names specified via programmatic configuration.")
    .addError(0, 0, "Bad unstable option: 'nonExistentOptionName'.")
    .test("", { unstable: { nonExistentOptionName: true } });

  TestRun(test, "Rejects non-existent names specified via in-line directive (single-line comment).")
    .addError(1, 1, "Bad unstable option: 'nonExistentOptionName'.")
    .test("// jshint.unstable nonExistentOptionName: true");

  TestRun(test, "Rejects non-existent names specified via in-line directive (multi-line comment).")
    .addError(1, 1, "Bad unstable option: 'nonExistentOptionName'.")
    .test("/* jshint.unstable nonExistentOptionName: true */");

  TestRun(test, "Rejects stable names specified via programmatic configuration.")
    .addError(0, 0, "Bad unstable option: 'undef'.")
    .test("", { unstable: { undef: true } });

  TestRun(test, "Rejects stable names specified via in-line directive (single-line comment).")
    .addError(1, 1, "Bad unstable option: 'undef'.")
    .test("// jshint.unstable undef: true");

  TestRun(test, "Rejects stable names specified via in-line directive (multi-line comment).")
    .addError(1, 1, "Bad unstable option: 'undef'.")
    .test("/* jshint.unstable undef: true */");

  test.done();
};

exports.leanswitch = function (test) {
  var code = [
      "switch (0) {",
      "  case 0:",
      "  default:",
      "    break;",
      "}"
    ];
  TestRun(test, "empty case clause followed by default")
    .test(code);
  TestRun(test, "empty case clause followed by default")
    .addError(2, 9, "Superfluous 'case' clause.")
    .test(code, { leanswitch: true });

  code = [
      "switch (0) {",
      "  case 0:",
      "  case 1:",
      "    break;",
      "}"
    ];
  TestRun(test, "empty case clause followed by case")
    .test(code);
  TestRun(test, "empty case clause followed by case")
    .test(code, { leanswitch: true });

  code = [
      "switch (0) {",
      "  default:",
      "  case 0:",
      "    break;",
      "}"
    ];
  TestRun(test, "empty default clause followed by case")
    .test(code);
  TestRun(test, "empty default clause followed by case")
    .addError(3, 3, "Superfluous 'case' clause.")
    .test(code, { leanswitch: true });

  code = [
      "switch (0) {",
      "  case 0:",
      "    void 0;",
      "  default:",
      "    break;",
      "}"
    ];
  TestRun(test, "non-empty case clause followed by default")
    .addError(3, 11, "Expected a 'break' statement before 'default'.")
    .test(code);
  TestRun(test, "non-empty case clause followed by default")
    .addError(3, 11, "Expected a 'break' statement before 'default'.")
    .test(code, { leanswitch: true });

  code = [
      "switch (0) {",
      "  case 0:",
      "    void 0;",
      "  case 1:",
      "    break;",
      "}"
    ];
  TestRun(test, "non-empty case clause followed by case")
    .addError(3, 11, "Expected a 'break' statement before 'case'.")
    .test(code);
  TestRun(test, "non-empty case clause followed by case")
    .addError(3, 11, "Expected a 'break' statement before 'case'.")
    .test(code, { leanswitch: true });

  code = [
      "switch (0) {",
      "  default:",
      "    void 0;",
      "  case 0:",
      "    break;",
      "}"
    ];
  TestRun(test, "non-empty default clause followed by case")
    .addError(3, 11, "Expected a 'break' statement before 'case'.")
    .test(code);
  TestRun(test, "non-empty default clause followed by case")
    .addError(3, 11, "Expected a 'break' statement before 'case'.")
    .test(code, { leanswitch: true });

  test.done();
};

exports.noreturnawait = function(test) {
  var code = [
    "void function() {",
    "  return await;",
    "};",
    "void function() {",
    "  return await(null);",
    "};",
    "void async function() {",
    "  return null;",
    "};",
    "void async function() {",
    "  return 'await';",
    "};",
    "void async function() {",
    "  try {",
    "    return await null;",
    "  } catch (err) {}",
    "};",
    "void async function() {",
    "  try {",
    "    void async function() {",
    "      return await null;",
    "    };",
    "  } catch (err) {}",
    "};",
    "void async function() {",
    "  return await null;",
    "};"
  ];

  TestRun(test, "function expression (disabled)")
    .test(code, { esversion: 8 });

  TestRun(test, "function expression (enabled)")
    .addError(21, 14, "Unnecessary `await` expression.")
    .addError(26, 10, "Unnecessary `await` expression.")
    .test(code, { esversion: 8, noreturnawait: true });

  code = [
    "void (() => await);",
    "void (() => await(null));",
    "void (async () => null);",
    "void (async () => 'await');",
    "void (async () => await null);",
    "void (async () => { await null; });"
  ];

  TestRun(test, "arrow function (disabled)")
    .test(code, { esversion: 8 });

  TestRun(test, "arrow function (enabled)")
    .addError(5, 19, "Unnecessary `await` expression.")
    .test(code, { esversion: 8, noreturnawait: true });


  test.done();
};

exports.regexpu = function (test) {
  TestRun(test, "restricted outside of ES6 - via API")
    .addError(0, 0, "The 'regexpu' option is only available when linting ECMAScript 6 code.")
    .test("void 0;", { regexpu: true })

  TestRun(test, "restricted outside of ES6 - via directive")
    .addError(1, 1, "The 'regexpu' option is only available when linting ECMAScript 6 code.")
    .test([
      "// jshint regexpu: true",
      "void 0;"
    ]);

  TestRun(test, "missing")
    .addError(1, 6, "Regular expressions should include the 'u' flag.")
    .addError(2, 6, "Regular expressions should include the 'u' flag.")
    .addError(3, 6, "Regular expressions should include the 'u' flag.")
    .test([
      "void /./;",
      "void /./g;",
      "void /./giym;",
    ], { regexpu: true, esversion: 6 });

  TestRun(test, "in use")
    .test([
      "void /./u;",
      "void /./ugiym;",
      "void /./guiym;",
      "void /./giuym;",
      "void /./giyum;",
      "void /./giymu;"
    ], { esversion: 6 });

  TestRun(test, "missing - option set when parsing precedes option enablement")
    .addError(3, 8, "Regular expressions should include the 'u' flag.")
    .test([
      "(function() {",
      "  // jshint regexpu: true",
      "  void /./;",
      "}());"
    ], { esversion: 6 });

  test.done();
};
