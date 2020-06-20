"use strict";

var TestRun = require("../helpers/testhelper").setup.testRun;

exports.enabling = function (test) {
  TestRun(test, "Not enabled")
    .addError(1, 6, "'BigInt' is only available in ES11 (use 'esversion: 11').")
    .test("void 1n;", {esversion: 10});

  TestRun(test, "Enabled via inline directive")
    .test([
      "// jshint esversion: 11",
      "void 1n;"
    ], {esversion: 10});

  TestRun(test, "Enabled via configuration object")
    .test([
      "void 1n;"
    ], {esversion: 11});

  test.done();
};

exports.validUsage = function(test) {
  TestRun(test)
    .test([
      "void 0n;",
      "void 9n;",
      "void 0x0n;",
      "void 0xfn;",
      "void 0o0n;",
      "void 0o7n;",
      "void 0b0n;",
      "void 0b1n;",
      "void 0b01n;",
      "void 0b10n;",
    ], {esversion: 11});

  TestRun(test, 'No warnings for values that would otherwise coerce to Infinity')
    .test([
      "void " +
        "1000000000000000000000000000000000000000000000000000000000000000000" +
        "0000000000000000000000000000000000000000000000000000000000000000000" +
        "0000000000000000000000000000000000000000000000000000000000000000000" +
        "0000000000000000000000000000000000000000000000000000000000000000000" +
        "000000000000000000000000000000000000000000n;"
    ], {esversion: 11});

  test.done();
};

exports.invalid = function (test) {
  TestRun(test, "preceding decimal point")
    .addError(1, 10, "A leading decimal point can be confused with a dot: '.1'.")
    .addError(1, 8, "Missing semicolon.")
    .addError(1, 8, "Expected an assignment or function call and instead saw an expression.")
    .test("void 1n.1;", {esversion: 11});

  TestRun(test, "following decimal point")
    .addError(1, 6, "Unexpected '1'.")
    .addError(1, 1, "Unexpected early end of program.")
    .addError(1, 6, "Unrecoverable syntax error. (100% scanned).")
    .test("void 1.1n;", {esversion: 11});

  TestRun(test, "preceding exponent")
    .addError(1, 6, "Unexpected '1'.")
    .addError(1, 1, "Unexpected early end of program.")
    .addError(1, 6, "Unrecoverable syntax error. (100% scanned).")
    .test("void 1ne3;", {esversion: 11});

  TestRun(test, "following exponent")
    .addError(1, 6, "Unexpected '1'.")
    .addError(1, 1, "Unexpected early end of program.")
    .addError(1, 6, "Unrecoverable syntax error. (100% scanned).")
    .test("void 1e3n;", {esversion: 11});

  TestRun(test, "invalid hex digit")
    .addError(1, 8, "Malformed numeric literal: '0x'.")
    .addError(1, 8, "Missing semicolon.")
    .addError(1, 8, "Expected an assignment or function call and instead saw an expression.")
    .test("void 0xgn;", {esversion: 11});

  TestRun(test, "invalid binary digit")
    .addError(1, 8, "Malformed numeric literal: '0b'.")
    .addError(1, 8, "Missing semicolon.")
    .addError(1, 8, "Expected an assignment or function call and instead saw an expression.")
    .test("void 0b2n;", {esversion: 11});

  TestRun(test, "invalid octal digit")
    .addError(1, 8, "Malformed numeric literal: '0o'.")
    .addError(1, 8, "Missing semicolon.")
    .addError(1, 8, "Expected an assignment or function call and instead saw an expression.")
    .test("void 0o8n;", {esversion: 11});

  test.done();
};
