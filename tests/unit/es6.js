"use strict";

var JSHINT = require('../../src/jshint.js').JSHINT;
var TestRun = require("../helpers/testhelper").setup.testRun;


exports.testArrowExpression = function (test) {
	TestRun(test)
		.test("const inc = x => x + 1;", { esnext: true, unused: true });

	test.done();
};

exports.testTypoArrowExpression = function (test) {
	TestRun(test)
		.addError(1, "'x' is defined but never used.")
		.addError(1, "'y' is not defined.")
		.test("const inc = x => y + 1;", { esnext: true,
																			 unused: true,
																			 undef: true });

	test.done();
};

exports.testArrowWithParens = function (test) {
	TestRun(test)
		.test("const inc = (x) => x + 1;", { esnext: true, unused: true });

	test.done();
};

exports.testArrowWithNoArgs = function (test) {
	TestRun(test)
		.test("const one = () => 1;", { esnext: true, unused: true });

	test.done();
};


exports.testArrowWithNoArgs = function (test) {
	TestRun(test)
		.test("const one = () => 1;", { esnext: true, unused: true });

	test.done();
};

exports.testArrowWithIgnoredArg = function (test) {
	TestRun(test)
		.addError(1, "'_' is defined but never used.")
		.test("const True = _ => true;", { esnext: true, unused: true });

	test.done();
};

exports.testArrowWithReturn = function (test) {
	TestRun(test)
		.addError(1, "'y' is defined but never used.")
		.test("var y = x => { x = 1; return x; };", { esnext: true, unused: true });

	test.done();
};

exports.testArrowWithUnusedVar = function (test) {
	TestRun(test)
		.addError(1, "'y' is defined but never used.")
		.test("const z = x => { let y = 1; return x; };", { esnext: true,
																												unused: true });

	test.done();
};


exports.testArrowWithRest = function (test) {
	TestRun(test)
		.test("const map = (f, [x, ...xs]) => cons(f(x), map(f, xs));",
					{ esnext: true, unused: true });

	test.done();
};
