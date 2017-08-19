/**
 * Helper for JSHint-tests.
 * Export itself as function in setup.testhelper to
 * prevent expresso to use it as test...
 *
 * Use it with method chaining, so you get something like
 *
 *    var TestRun = require("./testhelper").setup.testRun;
 *
 *    TestRun(test, name)
 *      .addError(line, errorMessage)
 *      .test(source, options);
 *
 * TestRun(test, name)
 *     test:       nodeunit test object
 *     name:       optional. name of the test run
 *             with a name, it's easier to identify a test run
 *
 * .addError(line, errorMessage)
 *     line:       line of the error message
 *     errorMessage:   the message of the reported error
 *
 * .test(source, options)
 *             starts the test run
 *     source:       source of the test file
 *     options:       optional. the options for jshint
 */

/*jshint node: true, eqnull: true*/

'use strict';

var JSHINT = require("../..").JSHINT;

if (exports.setup === undefined || exports.setup === null) {
  exports.setup = {};
}

exports.setup.testRun = function (test, name) {
  var definedErrors = [];

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
      var ret = !!JSHINT(source, options, globals);
      var errors = JSHINT.errors;

      if (errors.length === 0 && definedErrors.length === 0) {
        return;
      }

      // filter all thrown errors
      var undefinedErrors = errors.filter(function (er) {
        return !definedErrors.some(function (def) {
          var result = def.line === er.line &&
            def.message === er.reason;

          if (!result) {
            return result;
          }

          if (def.extras) {
            for (var extra in def.extras) {
              if (def.extras.hasOwnProperty(extra) &&
                  er.hasOwnProperty(extra)) {
                result = (def.extras[extra] === er[extra]);
                if (!result) {
                  return result;
                }
              }
            }
          }
          return result;
        });
      });

      // filter all defined errors
      var unthrownErrors = definedErrors.filter(function (def) {
        return !errors.some(function (er) {
          return def.line === er.line &&
            def.message === er.reason;
        });
      });

      // elements that only differs in line number
      var wrongLineNumbers = undefinedErrors.map(function (er) {
        var lines = unthrownErrors.filter(function (def) {
          return def.line !== er.line &&
            def.message === er.reason;
        }).map(function (def) {
          return def.line;
        });

        if (lines.length) {
          return {
            line: er.line,
            character: er.character,
            message: er.reason,
            definedIn: lines
          };
        }
        return null;
      }).filter(function (er) {
        return !!er;
      });
      var duplicateErrors = errors.filter(function (er) {
        return errors.filter(function (other) {
          return er.line === other.line && er.character === other.character &&
            er.reason === other.reason;
        }).length > 1;
      });

      // remove undefined errors, if there is a definition with wrong line number
      undefinedErrors = undefinedErrors.filter(function (er) {
        return !wrongLineNumbers.some(function (def) {
          return def.message === er.reason;
        });
      });
      unthrownErrors = unthrownErrors.filter(function (er) {
        return !wrongLineNumbers.some(function (def) {
          return def.message === er.message;
        });
      });

      var errorDetails = "";

      if (unthrownErrors.length > 0) {
        errorDetails += "\n  Errors defined, but not thrown by JSHint:\n" +
          unthrownErrors.map(function (el) {
            return "    {Line " + el.line + ", Char " + el.character + "} " + el.message;
          }).join("\n");
      }

      if (undefinedErrors.length > 0) {
        errorDetails += "\n  Errors thrown by JSHint, but not defined in test run:\n" +
          undefinedErrors.map(function (el) {
            return "    {Line " + el.line + ", Char " + el.character + "} " + el.reason;
          }).join("\n");
      }

      if (wrongLineNumbers.length > 0) {
        errorDetails += "\n  Errors with wrong line number:\n" +
          wrongLineNumbers.map(function (el) {
            return "    {Line " + el.line + ", Char " + el.character + "} " + el.message + " {not in line(s)} {" + el.definedIn.join(", ") + "}";
          }).join("\n");
      }

      if (duplicateErrors.length > 0) {
        errorDetails += "\n  Duplicated errors:\n" +
          duplicateErrors.map(function (el) {
            return "    {Line " + el.line + ", Char " + el.character + "} " + el.reason;
          }).join("\n");
      }

      test.ok(
        errorDetails === "",
        (name ? "\n  TestRun: '" + name + "'" : "") + errorDetails
      );
    }
  };

  return helperObj;
};
