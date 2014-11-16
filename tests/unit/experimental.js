"use strict";

var JSHINT = require('../../src/jshint.js').JSHINT;
var fs = require('fs');
var TestRun = require('../helpers/testhelper').setup.testRun;

exports["test: asyncawait basics"] = function (test) {
  var options = { esnext: true, experimental: ["asyncawait"]};

  TestRun(test, 1)
    .test(
      "var fn = async function() {" +
      "  await 1;" +
      "  await f();" +
      "  await f(1, '4');" +
      "  await (f());" +
      "  await (function() {})();" +
      "  await (function(a, b) {})(1, 'qwerty');" +
      "  await (async function() { await 1; })();" +
      "  await (async function(a, b) { await 1; })('aaa', 'ccc');" +
      "};", options);

   TestRun(test, 2)
    .test(
      "let fn = async function() {" +
      "  await 1;" +
      "  await f();" +
       "};",
     options);

   TestRun(test, 3)
    .test(
      "async function func() {\n" +
      "  await 1;\n" +
      "  await f();" +
      "  await (f());" +
      "  await (function() {})();" +
      "  await (async function() { await 1; })();" +
      "}\n", options);

   TestRun(test, 4)
    .test(
      "var fn = async () => {\n" +
      "  await 1;\n" +
      "  await (f());" +
      "  await (function() {})();" +
      "  await (async function() { await 1; })();" +
      "};\n", options);

   TestRun(test, 5)
    .test(
      "var fn = async () => {\n" +
      "  await 1;\n" +
      "  await (f());" +
      "  await (function() {})();" +
      "  await (async function() { await 1; })();" +
      "};\n", options);

   TestRun(test, 6)
    .test(
      "var fn = async x => await 2*x;" +
      "var fn = async (x) => await 2*x;" +
      "var fn = async (x,y) => await x + await y;" +
      "var fn = async (x,y) => { return await x + await y; };",
      options);

  TestRun(test, 7)
    .test(
      "let fn = async function() {};",
      options);

  TestRun(test, 8)
    .test(
      "let fn = async x => 2*x;",
      options);

  test.done();
};

exports["test: asyncawait within classes"] = function (test) {
  var options = { esnext: true, experimental: ["asyncawait"] };

  TestRun(test, 1)
     .test(
      "class A {\n" +
      "  async fn1(x) { await x; }\n" +
      "  fn2(x) { return x; }\n" +
      "  async fn3(x) { return await x; }\n" +
      "}\n",
      options);

  TestRun(test, 2)
     .test(
      "class A {\n" +
      "  static async fn1(x) { await x; }\n" +
      "  fn2(x) { return x; }\n" +
      "  static async fn3(x) { return await x; }\n" +
      "}\n",
      options);

  TestRun(test, 3)
     .test(
      "class A {\n" +
      "  async fn1(x) { await x; }\n" +
      "  fn2(x) { return x; }\n" +
      "  static async fn3(x) { return await x; }\n" +
      "}\n",
      options);

  test.done();
}

exports["test: asyncawait errors"] = function (test) {
  var options = { esnext: true, experimental: ["asyncawait", "asyncreqawait"] };

  TestRun(test, 1)
    .addError(1, "An async function shall contain an await statement.")
    .test(
      "let fn = async function() {};",
      options);

  TestRun(test, 2)
    .addError(1, "An async function shall contain an await statement.")
    .test(
      "let fn = async x => 2*x;",
      options);

  TestRun(test, 3)
    .addError(2, "An async function shall contain an await statement.")
    .addError(3, "An async function shall contain an await statement.")
    .test(
      "class A {\n" +
      "  async fn1(x) { }\n" +
      "  static async fn1(x) { }\n" +
      "}\n",
      options);

  options = { esnext: true, experimental: ["asyncawait"] };

  TestRun(test, 4)
    .addError(1, "A await statement shall be within an async function (with syntax: `async function`).")
    .test(
      "let fn = function() { await 1; };",
      options);

  TestRun(test, 5)
    .addError(1, "A await statement shall be within an async function (with syntax: `async function`).")
    .test(
      "let fn = x => await 1;",
      options);

  TestRun(test, 6)
    .addError(2, "A await statement shall be within an async function (with syntax: `async function`).")
    .addError(3, "A await statement shall be within an async function (with syntax: `async function`).")
    .test(
      "class A {\n" +
      "  fn1(x) { await x; }\n" +
      "  static fn1(x) { await x; }\n" +
      "}\n",
      options);

  options = { esnext: true };

  TestRun(test, 7)
    .addError(1, "'async' is available in async/await extension(use asyncawait option).")
    .addError(1, "'await' is available in async/await extension(use asyncawait option).")
     .test(
      "let fn = async function() { await 1; };",
      options);

  TestRun(test, 8)
     .addError(1, "'async' is available in async/await extension(use asyncawait option).")
     .addError(1, "'await' is available in async/await extension(use asyncawait option).")
     .test(
      "let fn = async x => await x;",
      options);

  TestRun(test, 9)
    .addError(2, "'async' is available in async/await extension(use asyncawait option).")
    .addError(2, "'await' is available in async/await extension(use asyncawait option).")
    .addError(3, "'async' is available in async/await extension(use asyncawait option).")
    .addError(3, "'await' is available in async/await extension(use asyncawait option).")
     .test(
      "class A {\n" +
      "  async fn1(x) { await x; }\n" +
      "  static async fn1(x) { await x; }\n" +
      "}\n",
      options);

  test.done();
}
