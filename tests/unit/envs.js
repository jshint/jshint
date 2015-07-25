/**
 * Tests for the environmental (browser, jquery, etc.) options
 */

"use strict";

var JSHINT  = require("../..").JSHINT;
var fs      = require('fs');
var TestRun = require("../helpers/testhelper").setup.testRun;

function wrap(globals) {
  return '(function () { return [ ' + globals.join(',') + ' ]; }());';
}

function globalsKnown(test, globals, options) {
  JSHINT(wrap(globals), options || {});
  var report = JSHINT.data();

  test.ok(report.implied === undefined);
  test.equal(report.globals.length, globals.length);

  for (var i = 0, g; g = report.globals[i]; i += 1)
    globals[g] = true;

  for (i = 0, g = null; g = globals[i]; i += 1)
    test.ok(g in globals);
}

function globalsImplied(test, globals, options) {
  JSHINT(wrap(globals), options || {});
  var report = JSHINT.data();

  test.ok(report.implieds != null);
  test.ok(report.globals === undefined);

  var implieds = [];
  for (var i = 0, warn; warn = report.implieds[i]; i += 1)
    implieds.push(warn.name);

  test.equal(implieds.length, globals.length);
}

/*
 * Option `node` predefines Node.js (v 0.5.9) globals
 *
 * More info:
 *  + http://nodejs.org/docs/v0.5.9/api/globals.html
 */
exports.node = function (test) {
  // Node environment assumes `globalstrict`
  var globalStrict = [
    '"use strict";',
    "function test() { return; }",
  ].join('\n');

  TestRun(test)
    .addError(1, 'Use the function form of "use strict".')
    .test(globalStrict, { es3: true, strict: true });

  TestRun(test)
    .test(globalStrict, { es3: true, node: true, strict: true });

  TestRun(test)
    .test(globalStrict, { es3: true, browserify: true, strict: true });

  // Don't assume strict:true for Node environments. See bug GH-721.
  TestRun(test)
    .test("function test() { return; }", { es3: true, node: true });

  TestRun(test)
    .test("function test() { return; }", { es3: true, browserify: true });

  // Make sure that we can do fancy Node export

  var overwrites = [
    "global = {};",
    "Buffer = {};",
    "exports = module.exports = {};"
  ];

  TestRun(test)
    .addError(1, "Read only.")
    .test(overwrites, { es3: true, node: true });

  TestRun(test)
    .addError(1, "Read only.")
    .test(overwrites, { es3: true, browserify: true });

  test.done();
};

exports.typed = function (test) {
  var globals = [
    "ArrayBuffer",
    "ArrayBufferView",
    "DataView",
    "Float32Array",
    "Float64Array",
    "Int16Array",
    "Int32Array",
    "Int8Array",
    "Uint16Array",
    "Uint32Array",
    "Uint8Array",
    "Uint8ClampedArray"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { browser: true });
  globalsKnown(test, globals, { node: true });
  globalsKnown(test, globals, { typed: true });

  test.done();
};

exports.es5 = function (test) {
  var src = fs.readFileSync(__dirname + "/fixtures/es5.js", "utf8");

  TestRun(test)
    .addError(3, "Extra comma. (it breaks older versions of IE)")
    .addError(8, "Extra comma. (it breaks older versions of IE)")
    .addError(15, "get/set are ES5 features.")
    .addError(16, "get/set are ES5 features.")
    .addError(20, "get/set are ES5 features.")
    .addError(22, "get/set are ES5 features.")
    .addError(26, "get/set are ES5 features.")
    .addError(30, "get/set are ES5 features.")
    .addError(31, "get/set are ES5 features.")
    .addError(36, "get/set are ES5 features.")
    .addError(41, "get/set are ES5 features.")
    .addError(42, "get/set are ES5 features.")
    .addError(43, "Duplicate key 'x'.")
    .addError(47, "get/set are ES5 features.")
    .addError(48, "get/set are ES5 features.")
    .addError(48, "Duplicate key 'x'.")
    .addError(52, "get/set are ES5 features.")
    .addError(53, "get/set are ES5 features.")
    .addError(54, "get/set are ES5 features.")
    .addError(54, "Duplicate key 'x'.")
    .addError(58, "get/set are ES5 features.")
    .addError(58, "Unexpected parameter 'a' in get x function.")
    .addError(59, "get/set are ES5 features.")
    .addError(59, "Unexpected parameter 'a' in get y function.")
    .addError(60, "get/set are ES5 features.")
    .addError(62, "get/set are ES5 features.")
    .addError(62, "Expected a single parameter in set x function.")
    .addError(63, "get/set are ES5 features.")
    .addError(64, "get/set are ES5 features.")
    .addError(64, "Expected a single parameter in set z function.")
    .addError(68, "get/set are ES5 features.")
    .addError(69, "get/set are ES5 features.")
    .addError(68, "Missing property name.")
    .addError(69, "Missing property name.")
    .addError(75, "get/set are ES5 features.")
    .addError(76, "get/set are ES5 features.")
    .addError(80, "get/set are ES5 features.")
    .test(src, { es3: true });

  TestRun(test)
    .addError(36, "Setter is defined without getter.")
    .addError(43, "Duplicate key 'x'.")
    .addError(48, "Duplicate key 'x'.")
    .addError(54, "Duplicate key 'x'.")
    .addError(58, "Unexpected parameter 'a' in get x function.")
    .addError(59, "Unexpected parameter 'a' in get y function.")
    .addError(62, "Expected a single parameter in set x function.")
    .addError(64, "Expected a single parameter in set z function.")
    .addError(68, "Missing property name.")
    .addError(69, "Missing property name.")
    .addError(80, "Setter is defined without getter.")
    .test(src, {  }); // es5

  // JSHint should not throw "Missing property name" error on nameless getters/setters
  // using Method Definition Shorthand if esnext flag is enabled.
  TestRun(test)
    .addError(36, "Setter is defined without getter.")
    .addError(43, "Duplicate key 'x'.")
    .addError(48, "Duplicate key 'x'.")
    .addError(54, "Duplicate key 'x'.")
    .addError(58, "Unexpected parameter 'a' in get x function.")
    .addError(59, "Unexpected parameter 'a' in get y function.")
    .addError(62, "Expected a single parameter in set x function.")
    .addError(64, "Expected a single parameter in set z function.")
    .addError(80, "Setter is defined without getter.")
    .test(src, { esnext: true });

  // Make sure that JSHint parses getters/setters as function expressions
  // (https://github.com/jshint/jshint/issues/96)
  src = fs.readFileSync(__dirname + "/fixtures/es5.funcexpr.js", "utf8");
  TestRun(test).test(src, {  }); // es5

  test.done();
};

exports.phantom = function (test) {
  // Phantom environment assumes `globalstrict`
  var globalStrict = [
    '"use strict";',
    "function test() { return; }",
  ].join('\n');

  TestRun(test)
    .addError(1, 'Use the function form of "use strict".')
    .test(globalStrict, { es3: true, strict: true });

  TestRun(test)
    .test(globalStrict, { es3: true, phantom: true, strict: true });


  test.done();
};

exports.shelljs = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/shelljs.js', 'utf8');

  TestRun(test, 1)
    .addError(1, "'target' is not defined.")
    .addError(3, "'echo' is not defined.")
    .addError(4, "'exit' is not defined.")
    .addError(5, "'cd' is not defined.")
    .addError(6, "'pwd' is not defined.")
    .addError(7, "'ls' is not defined.")
    .addError(8, "'find' is not defined.")
    .addError(9, "'cp' is not defined.")
    .addError(10, "'rm' is not defined.")
    .addError(11, "'mv' is not defined.")
    .addError(12, "'mkdir' is not defined.")
    .addError(13, "'test' is not defined.")
    .addError(14, "'cat' is not defined.")
    .addError(15, "'sed' is not defined.")
    .addError(16, "'grep' is not defined.")
    .addError(17, "'which' is not defined.")
    .addError(18, "'dirs' is not defined.")
    .addError(19, "'pushd' is not defined.")
    .addError(20, "'popd' is not defined.")
    .addError(21, "'env' is not defined.")
    .addError(22, "'exec' is not defined.")
    .addError(23, "'chmod' is not defined.")
    .addError(24, "'config' is not defined.")
    .addError(25, "'error' is not defined.")
    .addError(26, "'tempdir' is not defined.")
    .addError(29, "'require' is not defined.")
    .addError(30, "'module' is not defined.")
    .addError(31, "'process' is not defined.")
    .test(src, { undef: true });

  TestRun(test, 2)
    .test(src, { undef: true, shelljs: true });

  test.done();
};

/*
 * Tests the `browser` option
 */
exports.browser = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/browser.js', 'utf8');

  TestRun(test)
    .addError(2, "'atob' is not defined.")
    .addError(3, "'btoa' is not defined.")
    .addError(6, "'DOMParser' is not defined.")
    .addError(10, "'XMLSerializer' is not defined.")
    .addError(14, "'NodeFilter' is not defined.")
    .addError(15, "'Node' is not defined.")
    .addError(18, "'MutationObserver' is not defined.")
    .addError(21, "'SVGElement' is not defined.")
    .addError(24, "'Comment' is not defined.")
    .addError(25, "'DocumentFragment' is not defined.")
    .addError(26, "'Range' is not defined.")
    .addError(27, "'Text' is not defined.")
    .addError(31, "'document' is not defined.")
    .addError(32, "'fetch' is not defined.")
    .addError(35, "'URL' is not defined.")
    .test(src, {es3: true, undef: true });

  TestRun(test).test(src, {es3: true, browser: true, undef: true });

  test.done();
};
