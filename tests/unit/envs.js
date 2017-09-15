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

exports.shelljs = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/shelljs.js', 'utf8');

  TestRun(test, 1)
    .addError(1, 1, "'target' is not defined.")
    .addError(3, 1, "'echo' is not defined.")
    .addError(4, 1, "'exit' is not defined.")
    .addError(5, 1, "'cd' is not defined.")
    .addError(6, 1, "'pwd' is not defined.")
    .addError(7, 1, "'ls' is not defined.")
    .addError(8, 1, "'find' is not defined.")
    .addError(9, 1, "'cp' is not defined.")
    .addError(10, 1, "'rm' is not defined.")
    .addError(11, 1, "'mv' is not defined.")
    .addError(12, 1, "'mkdir' is not defined.")
    .addError(13, 1, "'test' is not defined.")
    .addError(14, 1, "'cat' is not defined.")
    .addError(15, 1, "'sed' is not defined.")
    .addError(16, 1, "'grep' is not defined.")
    .addError(17, 1, "'which' is not defined.")
    .addError(18, 1, "'dirs' is not defined.")
    .addError(19, 1, "'pushd' is not defined.")
    .addError(20, 1, "'popd' is not defined.")
    .addError(21, 1, "'env' is not defined.")
    .addError(22, 1, "'exec' is not defined.")
    .addError(23, 1, "'chmod' is not defined.")
    .addError(24, 1, "'config' is not defined.")
    .addError(25, 1, "'error' is not defined.")
    .addError(26, 1, "'tempdir' is not defined.")
    .addError(29, 1, "'require' is not defined.")
    .addError(30, 1, "'module' is not defined.")
    .addError(31, 1, "'process' is not defined.")
    .test(src, { undef: true });

  TestRun(test, 2)
    .test(src, { undef: true, shelljs: true });

  test.done();
};

exports.browser = function (test) {
  var src = fs.readFileSync(__dirname + '/fixtures/browser.js', 'utf8');

  TestRun(test)
    .addError(2, 9, "'atob' is not defined.")
    .addError(3, 9, "'btoa' is not defined.")
    .addError(6, 14, "'DOMParser' is not defined.")
    .addError(10, 14, "'XMLSerializer' is not defined.")
    .addError(14, 20, "'NodeFilter' is not defined.")
    .addError(15, 19, "'Node' is not defined.")
    .addError(18, 28, "'MutationObserver' is not defined.")
    .addError(21, 16, "'SVGElement' is not defined.")
    .addError(24, 19, "'Comment' is not defined.")
    .addError(25, 14, "'DocumentFragment' is not defined.")
    .addError(26, 17, "'Range' is not defined.")
    .addError(27, 16, "'Text' is not defined.")
    .addError(31, 15, "'document' is not defined.")
    .addError(32, 1, "'fetch' is not defined.")
    .addError(35, 19, "'URL' is not defined.")
    .test(src, {es3: true, undef: true });

  TestRun(test).test(src, {es3: true, browser: true, undef: true });

  test.done();
};

exports.couch = function (test) {

  var globals = [
    "require",
    "respond",
    "getRow",
    "emit",
    "send",
    "start",
    "sum",
    "log",
    "exports",
    "module",
    "provides"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { couch: true });

  test.done();
};

exports.qunit = function (test) {

  var globals = [
    "asyncTest",
    "deepEqual",
    "equal",
    "expect",
    "module",
    "notDeepEqual",
    "notEqual",
    "notPropEqual",
    "notStrictEqual",
    "ok",
    "propEqual",
    "QUnit",
    "raises",
    "start",
    "stop",
    "strictEqual",
    "test",
    "throws"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { qunit: true });

  test.done();
};

exports.rhino = function (test) {

  var globals = [
    "defineClass",
    "deserialize",
    "gc",
    "help",
    "importClass",
    "importPackage",
    "java",
    "load",
    "loadClass",
    "Packages",
    "print",
    "quit",
    "readFile",
    "readUrl",
    "runCommand",
    "seal",
    "serialize",
    "spawn",
    "sync",
    "toint32",
    "version"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { rhino: true });

  test.done();
};

exports.prototypejs = function (test) {

  var globals = [
    "$",
    "$$",
    "$A",
    "$F",
    "$H",
    "$R",
    "$break",
    "$continue",
    "$w",
    "Abstract",
    "Ajax",
    "Class",
    "Enumerable",
    "Element",
    "Event",
    "Field",
    "Form",
    "Hash",
    "Insertion",
    "ObjectRange",
    "PeriodicalExecuter",
    "Position",
    "Prototype",
    "Selector",
    "Template",
    "Toggle",
    "Try",
    "Autocompleter",
    "Builder",
    "Control",
    "Draggable",
    "Draggables",
    "Droppables",
    "Effect",
    "Sortable",
    "SortableObserver",
    "Sound",
    "Scriptaculous"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { prototypejs: true });

  test.done();
};

exports.dojo = function (test) {

  var globals = [
    "dojo",
    "dijit",
    "dojox",
    "define",
    "require"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { dojo: true });

  test.done();
};

exports.nonstandard = function (test) {

  var globals = [
    "escape",
    "unescape"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { nonstandard: true });

  test.done();
};

exports.jasmine = function (test) {

  var globals = [
    "jasmine",
    "describe",
    "xdescribe",
    "it",
    "xit",
    "beforeEach",
    "afterEach",
    "setFixtures",
    "loadFixtures",
    "spyOn",
    "spyOnProperty",
    "expect",
    "runs",
    "waitsFor",
    "waits",
    "beforeAll",
    "afterAll",
    "fail",
    "fdescribe",
    "fit"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { jasmine: true });

  test.done();
};

exports.mootools = function (test) {

  var globals = [
    "$",
    "$$",
    "Asset",
    "Browser",
    "Chain",
    "Class",
    "Color",
    "Cookie",
    "Core",
    "Document",
    "DomReady",
    "DOMEvent",
    "DOMReady",
    "Drag",
    "Element",
    "Elements",
    "Event",
    "Events",
    "Fx",
    "Group",
    "Hash",
    "HtmlTable",
    "IFrame",
    "IframeShim",
    "InputValidator",
    "instanceOf",
    "Keyboard",
    "Locale",
    "Mask",
    "MooTools",
    "Native",
    "Options",
    "OverText",
    "Request",
    "Scroller",
    "Slick",
    "Slider",
    "Sortables",
    "Spinner",
    "Swiff",
    "Tips",
    "Type",
    "typeOf",
    "URI",
    "Window"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { mootools: true });

  test.done();
};

exports.worker = function (test) {

  var globals = [
    "importScripts",
    "postMessage",
    "self",
    "FileReaderSync"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { worker: true });

  test.done();
};

exports.wsh = function (test) {

  var globals = [
    "ActiveXObject",
    "Enumerator",
    "GetObject",
    "ScriptEngine",
    "ScriptEngineBuildVersion",
    "ScriptEngineMajorVersion",
    "ScriptEngineMinorVersion",
    "VBArray",
    "WSH",
    "WScript",
    "XDomainRequest"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { wsh: true });

  test.done();
};

exports.yui = function (test) {

  var globals = [
    "YUI",
    "Y",
    "YUI_config"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { yui: true });

  test.done();
};

exports.mocha = function (test) {

  var globals = [
    "mocha",
    "describe",
    "xdescribe",
    "it",
    "xit",
    "context",
    "xcontext",
    "before",
    "after",
    "beforeEach",
    "afterEach",
    "suite",
    "test",
    "setup",
    "teardown",
    "suiteSetup",
    "suiteTeardown"
  ];

  globalsImplied(test, globals);
  globalsKnown(test, globals, { mocha: true });

  test.done();
};
