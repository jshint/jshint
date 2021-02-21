/**
 * Tests for the parser/tokenizer
 */

"use strict";

var JSHINT  = require("../..").JSHINT;
var fs    = require('fs');
var TestRun = require("../helpers/testhelper").setup.testRun;
var path    = require("path");

exports.dynamicImport = {};

exports.dynamicImport.valid = function (test) {
  TestRun(test)
    .test([
        "import(0);",
        "import(0 ? 0 : 0);",
        "(function * () { ",
        "  import(yield);",
        "})();",
        "import(() => {});",
        "import(async () => {});",
        "import(x = 0);",
        "new (import(0))();",
        "import(import(0));",
      ], {esversion: 11});

  test.done();
};

exports.dynamicImport.invalidvalid = function (test) {
  TestRun(test, "empty")
    .addError(1, 8, "Expected an identifier and instead saw ')'.")
    .addError(1, 9, "Expected ')' and instead saw ';'.")
    .addError(1, 10, "Missing semicolon.")
    .test("import();", {esversion: 11});

  TestRun(test, "expression")
    .addError(1, 11, "Expected ')' and instead saw ','.")
    .addError(1, 12, "Missing semicolon.")
    .addError(1, 13, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, 16, "Missing semicolon.")
    .addError(1, 16, "Expected an identifier and instead saw ')'.")
    .addError(1, 16, "Expected an assignment or function call and instead saw an expression.")
    .test("import('a', 'b');", {esversion: 11});

  TestRun(test, "NewExpression")
    .addError(1, 5, "Unexpected 'import'.")
    .addError(1, 13, "Missing '()' invoking a constructor.")
    .test("new import(0);", {esversion: 11});

  test.done();
};

exports.dynamicImport.esversion = function (test) {
  TestRun(test)
    .addError(1, 1, "'dynamic import' is only available in ES11 (use 'esversion: 11').")
    .test("import(0);", {esversion: 10});

  test.done();
};
