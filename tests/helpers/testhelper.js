/**
 * Helper for JSHint-tests.
 * Export itself as function in setup.testhelper to
 * prevent expresso to use it as test...
 *
 * Use it with method chaining, so you get something like
 *
 *		var TestRun = require("./testhelper").setup.testRun;
 *
 *		TestRun(test, name)
 *			.addError(line, errorMessage)
 *			.test(source, options);
 *
 * TestRun(test, name)
 *	   test:		   nodeunit test object
 *	   name:		   optional. name of the test run
 *					   with a name, it's easier to identify a test run
 *
 * .addError(line, errorMessage)
 *	   line:		   line of the error message
 *	   errorMessage:   the message of the reported error
 *
 * .test(source, options)
 *					   starts the test run
 *	   source:		   source of the test file
 *	   options:		   optional. the options for jshint
 */

/*jshint node: true, eqnull: true*/

var _ = require("underscore");
var jshint = require('../../src/jshint.js');

if (exports.setup === undefined || exports.setup === null) {
	exports.setup = {};
}

exports.setup.testRun = function (test, name) {
	var initCounter = 0, runCounter = 0, seq = 0, checked = [], definedErrors = [];

	var helperObj = {
		addError: function (line, message, extras) {
			definedErrors.push({
				line: line,
				message: message,
				extras: extras
			});

			return helperObj;
		},

		test: function (source, options, globals) {
			var data = jshint.run(source, options, globals).data;
			var errors = _.compact(data.errors);

			if (errors.length === 0 && definedErrors.length === 0)
				return;

			var undefinedErrors = errors.reduce(function (acc, curr) {
				var isdef = definedErrors.some(function (err) {
					if (err.line !== curr.line || err.message !== curr.message)
						return false;

					if (err.extras) {
						return _.every(err.extras, function (val, key) {
							return curr[key] === val;
						});
					}

					return true;
				});

				if (!isdef) acc.push(curr);
				return acc;
			}, []);

			// filter all defined errors
			var unthrownErrors = definedErrors.filter(function (def) {
				return !errors.some(function (er) {
					return def.line === er.line &&
						def.message === er.message;
				});
			});

			// elements that only differs in line number
			var wrongLineNumbers = undefinedErrors.map(function (er) {
				var lines = unthrownErrors.filter(function (def) {
					return def.line !== er.line &&
						def.message === er.message;
				}).map(function (def) {
					return def.line;
				});

				if (lines.length) {
					return {
						line: er.line,
						message: er.message,
						definedIn: lines
					};
				}
				return null;
			}).filter(function (er) {
				return !!er;
			});

			// remove undefined errors, if there is a definition with wrong line number
			undefinedErrors = undefinedErrors.filter(function (er) {
				return !wrongLineNumbers.some(function (def) {
					return def.message === er.message;
				});
			});
			unthrownErrors = unthrownErrors.filter(function (er) {
				return !wrongLineNumbers.some(function (def) {
					return def.message === er.message;
				});
			});

			test.ok(
				undefinedErrors.length === 0 && unthrownErrors.length === 0 && wrongLineNumbers.length === 0,

				(name == null ? "" : "\n  TestRun: [bold]{" + name + "}") +
				unthrownErrors.map(function (el, idx) {
					return (idx === 0 ? "\n	[yellow]{Errors defined, but not thrown by JSHint}\n" : "") +
						" [bold]{Line " + el.line + ", Char " + el.ch + "} " + el.message;
				}).join("\n") +
				undefinedErrors.map(function (el, idx) {
					return (idx === 0 ? "\n	[yellow]{Errors thrown by JSHint, but not defined in test run}\n" : "") +
						"	[bold]{Line " + el.line + ", Char " + el.ch + "} " + el.message;
				}).join("\n") +
				wrongLineNumbers.map(function (el, idx) {
					return (idx === 0 ? "\n	[yellow]{Errors with wrong line number}\n" : "") +
						"	[bold]{Line " + el.line + "} " + el.message + " [red]{not in line(s)} [bold]{" + el.definedIn.join(", ") + "}";
				}).join("\n") + "\n"
			);
		}
	};

	return helperObj;
};
