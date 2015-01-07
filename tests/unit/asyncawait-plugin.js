"use strict";

var TestRun = require('../helpers/testhelper').setup.testRun,
    clearJSHINT = require('../helpers/testhelper').setup.clearJSHINT;

exports["test: asyncawait basics"] = function (test) {
  clearJSHINT();
  var options = { esnext: true, experimental: ["asyncawait"]};

  TestRun(test, 1)
    .test(
      "var fn = async function() {\n" +
      "  await 1;\n" +
      "  await f();\n" +
      "  await f(1, '4');\n" +
      "  await (f());\n" +
      "  await (function() {})();\n" +
      "  await (function(a, b) {})(1, 'qwerty');\n" +
      "  await (async function() { await 1; })();\n" +
      "  await (async function(a, b) { await 1; })('aaa', 'ccc');\n" +
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

  TestRun(test, 9)
    .test(
      "export async function myFunc() {}",
      options);

  TestRun(test, 10)
    .test(
      "var fn = async (aaa) => {\n" +
      "  await 1;\n" +
      "};\n", options);

  TestRun(test, 11)
    .test(
      "var fn = async (aaa, b, ccc) => {\n" +
      "  await 1;\n" +
      "};\n", options);

  clearJSHINT();
  options = { unused: true, esnext: true, experimental: ["asyncawait"]};

  TestRun(test, 12)
    .test(
      "export async function myFunct() {}",
      options);


  clearJSHINT();
  test.done();
};

exports["test: async option not set"] = function (test) {
  clearJSHINT();
  var options = { esnext: true,  experimental: ["asyncawait"] };
  TestRun(test, 1)
    .test(
      "var async = require('async');\n" +
      "async([]);\n",
      options);

  clearJSHINT();
  options = { esnext: true };
  TestRun(test, 2)
    .test(
      "var async = require('async');\n" +
      "async([]);\n",
      options);

  clearJSHINT();
  options = {};
  TestRun(test, 3)
    .test(
      "var async = require('async');\n" +
      "async([]);\n",
      options);


  clearJSHINT();
  test.done();
};

exports["test: async disambiguation"] = function (test) {
  clearJSHINT();
  var options = { esnext: true, experimental: ["asyncawait"]};

  TestRun(test, 1)
    .test(
      "var async = require(\"async\");\n" +
      "async([]);\n",
      options);

  TestRun(test, 2)
    .test(
      "function async() {\n" +
      "}",
      options);

  TestRun(test, 3)
    .test(
      "let a = async () => 1;",
      options);

  TestRun(test, 4)
    .test(
      "let b = async _ => 1;",
      options);

  TestRun(test, 5)
    .test(
      "let c = async async => 1;",
      options);

  TestRun(test, 6)
    .test(
      "async();",
      options);

  TestRun(test, 7)
    .test(
      "async\n" +
      "();",
      options);

  TestRun(test, 8)
    .test(
      "async function async() {\n\n\n" +
      "}",
      options);

  TestRun(test, 9)
    .test(
      "async function async\n" +
      "()\n" +
      "{}\n",
      options);

  TestRun(test, 10)
    .test(
      "function async\n" +
      "()\n" +
      "{}\n",
      options);

  clearJSHINT();
  test.done();
};

exports["test: asyncawait within classes"] = function (test) {
  clearJSHINT();
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

  clearJSHINT();
  test.done();
};

exports["test: asyncawait errors"] = function (test) {
  clearJSHINT();
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

  clearJSHINT();
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

  clearJSHINT();
  options = { esnext: true };

  TestRun(test, 7)
    .addError(1, "Missing semicolon.")
    .addError(1, "Missing name in function declaration.")
    .addError(1, "Expected an assignment or function call and instead saw an expression.")
    .addError(1, "Missing semicolon.")
    .addError(1, "Unnecessary semicolon.")
    .test(
      "let fn = async function() { await 1; };",
      options);

  TestRun(test, 8)
     .addError(1, "Missing semicolon.")
     .addError(1, "Expected an assignment or function call and instead saw an expression.")
     .test(
      "let fn = async x => await x;",
      options);

  TestRun(test, 9)
    .addError(2, "Expected an assignment or function call and instead saw an expression.")
    .addError(2, "Missing semicolon.")
    .addError(2, "Class properties must be methods. Expected '(' but instead saw 'fn1'.")
    .addError(3, "Expected an assignment or function call and instead saw an expression.")
    .addError(3, "Missing semicolon.")
    .addError(3, "Class properties must be methods. Expected '(' but instead saw 'fn1'.")
     .test(
      "class A {\n" +
      "  async fn1(x) { await x; }\n" +
      "  static async fn1(x) { await x; }\n" +
      "}\n",
      options);

  clearJSHINT();
  test.done();
};
