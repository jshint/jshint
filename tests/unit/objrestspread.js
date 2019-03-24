"use strict";

var TestRun = require("../helpers/testhelper").setup.testRun;

exports.enabling = function (test) {
  TestRun(test, "Not enabled")
    .addError(1, 11, "'object spread property' is only available in ES9 (use 'esversion: 9').")
    .test("void { ...x };", { esversion: 8 });

  TestRun(test, "Not enabled")
    .addError(1, 7, "'object rest property' is only available in ES9 (use 'esversion: 9').")
    .test("({ ...x } = {});", { esversion: 8 });

  test.done();
};

exports.spread = function (test) {
  var code = [
    "var o;",
    "o = { ...o };",
    "o = { set x(_) {}, ...o, get x() {} };",
    "o = { *gen() { yield; }, ...o, [o]() {} };",
    "o = { ...o, };"
  ];

  TestRun(test, "identifier")
    .test(code, { esversion: 9 });

  code = [
    "var o;",
    "o = { ...this };",
    "o = { ...[] };",
    "o = { ...'string' };",
    "o = { ...o = {} };",
    "o = { ...() => {} };",
    "o = { ...o => {} };"
  ];

  TestRun(test, "expression")
    .test(code, { esversion: 9 });

  test.done();
};

exports.rest = function (test) {
  var code = [
    "({ ...x } = {});",
    "({ a, ...x } = {});",
    "({ a = 0, ...x } = {});",
    "({ a: A, ...x } = {});",
    "({ a: A = 0, ...x } = {});"
  ];

  TestRun(test, "identifier, final")
    .test(code, { esversion: 9 });

  code = [
    "({ ...x, } = {});",
    "({ a, ...x, b } = {});",
    "({ a = 0, ...x, b = 1 } = {});",
    "({ a: A, ...x, b: B } = {});",
    "({ a: A = 0, ...x, b: B = 0 } = {});"
  ];

  TestRun(test, "identifier, not final")
    .addError(1, 8, "Invalid element after rest element.")
    .addError(2, 11, "Invalid element after rest element.")
    .addError(3, 15, "Invalid element after rest element.")
    .addError(4, 14, "Invalid element after rest element.")
    .addError(5, 18, "Invalid element after rest element.")
    .test(code, { esversion: 9 });

  code = [
    "({ ...[a, b, c] } = {});",
    "({ a, ...[b, c, d] } = {});",
    "({ a = 0, ...[b, c, d] } = {});",
    "({ a: A, ...[b, c, d] } = {});",
    "({ a: A = 0, ...[b, c, d] } = {});"
  ];

  TestRun(test, "nested array pattern, final")
    .addError(1, 7, "Expected an identifier and instead saw '['.")
    .addError(2, 10, "Expected an identifier and instead saw '['.")
    .addError(3, 14, "Expected an identifier and instead saw '['.")
    .addError(4, 13, "Expected an identifier and instead saw '['.")
    .addError(5, 17, "Expected an identifier and instead saw '['.")
    .test(code, { esversion: 9 });

  code = [
    "({ ...[a, b, c], } = {});",
    "({ a, ...[b, c, d], e } = {});",
    "({ a = 0, ...[b, c, d], e = 0 } = {});",
    "({ a: A, ...[b, c, d], e: E } = {});",
    "({ a: A = 0, ...[b, c, d], e: E = 0 } = {});",
  ];

  TestRun(test, "nested array pattern, not final")
    .addError(1, 7, "Expected an identifier and instead saw '['.")
    .addError(1, 16, "Invalid element after rest element.")
    .addError(2, 10, "Expected an identifier and instead saw '['.")
    .addError(2, 19, "Invalid element after rest element.")
    .addError(3, 14, "Expected an identifier and instead saw '['.")
    .addError(3, 23, "Invalid element after rest element.")
    .addError(4, 13, "Expected an identifier and instead saw '['.")
    .addError(4, 22, "Invalid element after rest element.")
    .addError(5, 17, "Expected an identifier and instead saw '['.")
    .addError(5, 26, "Invalid element after rest element.")
    .test(code, { esversion: 9 });

  TestRun(test, "nested array pattern, empty")
    .addError(1, 7, "Expected an identifier and instead saw '['.")
    .test("({ ...[] } = {});", { esversion: 9 });

  TestRun(test, "nested object pattern, empty")
    .addError(1, 7, "Expected an identifier and instead saw '{'.")
    .test("({ ...{} } = {});", { esversion: 9 });

  TestRun(test, "gh-3377 - identifier interpreted as new binding, not reference")
    .addError(1, 10, "'x' is defined but never used.")
    .test("var { ...x } = {};", { esversion: 9, unused: true, undef: true });

  test.done();
};
