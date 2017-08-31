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

  test.ok(report.implieds === undefined);
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
    .addError(1, 1, 'Use the function form of "use strict".')
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
    .addError(1, 1, "Read only.")
    .test(overwrites, { es3: true, node: true });

  TestRun(test)
    .addError(1, 1, "Read only.")
    .test(overwrites, { es3: true, browserify: true });

  TestRun(test, "gh-2657")
    .test("'use strict';var a;", { node: true });

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
    .addError(3, 6, "Extra comma. (it breaks older versions of IE)")
    .addError(8, 9, "Extra comma. (it breaks older versions of IE)")
    .addError(15, 13, "get/set are ES5 features.")
    .addError(16, 13, "get/set are ES5 features.")
    .addError(20, 13, "get/set are ES5 features.")
    .addError(22, 13, "get/set are ES5 features.")
    .addError(26, 13, "get/set are ES5 features.")
    .addError(30, 13, "get/set are ES5 features.")
    .addError(31, 13, "get/set are ES5 features.")
    .addError(36, 13, "get/set are ES5 features.")
    .addError(41, 13, "get/set are ES5 features.")
    .addError(42, 13, "get/set are ES5 features.")
    .addError(43, 10, "Duplicate key 'x'.")
    .addError(47, 13, "get/set are ES5 features.")
    .addError(48, 13, "get/set are ES5 features.")
    .addError(48, 14, "Duplicate key 'x'.")
    .addError(52, 13, "get/set are ES5 features.")
    .addError(53, 13, "get/set are ES5 features.")
    .addError(54, 13, "get/set are ES5 features.")
    .addError(54, 14, "Duplicate key 'x'.")
    .addError(58, 13, "get/set are ES5 features.")
    .addError(58, 14, "Unexpected parameter 'a' in get x function.")
    .addError(59, 13, "get/set are ES5 features.")
    .addError(59, 14, "Unexpected parameter 'a' in get y function.")
    .addError(60, 13, "get/set are ES5 features.")
    .addError(62, 13, "get/set are ES5 features.")
    .addError(62, 14, "Expected a single parameter in set x function.")
    .addError(63, 13, "get/set are ES5 features.")
    .addError(64, 13, "get/set are ES5 features.")
    .addError(64, 14, "Expected a single parameter in set z function.")
    .addError(68, 13, "get/set are ES5 features.")
    .addError(69, 13, "get/set are ES5 features.")
    .addError(68, 13, "Missing property name.")
    .addError(69, 13, "Missing property name.")
    .addError(75, 13, "get/set are ES5 features.")
    .addError(76, 13, "get/set are ES5 features.")
    .addError(80, 13, "get/set are ES5 features.")
    .test(src, { es3: true });

  TestRun(test)
    .addError(36, 13, "Setter is defined without getter.")
    .addError(43, 10, "Duplicate key 'x'.")
    .addError(48, 14, "Duplicate key 'x'.")
    .addError(54, 14, "Duplicate key 'x'.")
    .addError(58, 14, "Unexpected parameter 'a' in get x function.")
    .addError(59, 14, "Unexpected parameter 'a' in get y function.")
    .addError(62, 14, "Expected a single parameter in set x function.")
    .addError(64, 14, "Expected a single parameter in set z function.")
    .addError(68, 13, "Missing property name.")
    .addError(69, 13, "Missing property name.")
    .addError(80, 13, "Setter is defined without getter.")
    .test(src, {  }); // es5

  // JSHint should not throw "Missing property name" error on nameless getters/setters
  // using Method Definition Shorthand if esnext flag is enabled.
  TestRun(test)
    .addError(36, 13, "Setter is defined without getter.")
    .addError(43, 10, "Duplicate key 'x'.")
    .addError(48, 14, "Duplicate key 'x'.")
    .addError(54, 14, "Duplicate key 'x'.")
    .addError(58, 14, "Unexpected parameter 'a' in get x function.")
    .addError(59, 14, "Unexpected parameter 'a' in get y function.")
    .addError(62, 14, "Expected a single parameter in set x function.")
    .addError(64, 14, "Expected a single parameter in set z function.")
    .addError(80, 13, "Setter is defined without getter.")
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
    .addError(1, 1, 'Use the function form of "use strict".')
    .test(globalStrict, { es3: true, strict: true });

  TestRun(test)
    .test(globalStrict, { es3: true, phantom: true, strict: true });


  test.done();
};

exports.globals = function (test) {
  var src = [
    "/* global first */",
    "var first;"
  ];

  TestRun(test)
    .addError(2, 5, "Redefinition of 'first'.")
    .test(src);
  TestRun(test)
    .test(src, { browserify: true });
  TestRun(test)
    .test(src, { node: true });
  TestRun(test)
    .test(src, { phantom: true });

  TestRun(test, "Late configuration of `browserify`")
    .test([
      "/* global first */",
      "void 0;",
      "// jshint browserify: true",
      "var first;"
    ]);

  TestRun(test)
    .test([
      "// jshint browserify: true",
      "/* global first */",
      "var first;"
    ]);

  TestRun(test)
    .test([
      "/* global first */",
      "// jshint browserify: true",
      "var first;"
    ]);

  TestRun(test, "Late configuration of `node`")
    .test([
      "/* global first */",
      "void 0;",
      "// jshint node: true",
      "var first;"
    ]);

  TestRun(test)
    .test([
      "// jshint node: true",
      "/* global first */",
      "var first;"
    ]);

  TestRun(test)
    .test([
      "/* global first */",
      "// jshint node: true",
      "var first;"
    ]);

  TestRun(test, "Late configuration of `phantom`")
    .test([
      "/* global first */",
      "void 0;",
      "// jshint phantom: true",
      "var first;"
    ]);

  TestRun(test)
    .test([
      "// jshint phantom: true",
      "/* global first */",
      "var first;"
    ]);

  TestRun(test)
    .test([
      "/* global first */",
      "// jshint phantom: true",
      "var first;"
    ]);

  test.done();
};
