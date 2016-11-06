"use strict";
var JSHint = require("../../").JSHINT;
var find = require("lodash").find;

var modulePattern = /^\s*-\s*module\s*$|^\s*flags\s*:.*\bmodule\b/m;
var noStrictPattern = /^\s*-\s*noStrict\s*$|^\s*flags\s*:.*\bnoStrict\b/m;
var onlyStrictPattern = /^\s*-\s*onlyStrict\s*$|^\s*flags\s*:.*\bonlyStrict\b/m;

function hasEarlyError(src) {
  return !!(src.match(/^\s*negative:\s*$/m) && src.match(/^\s+phase: early\s*$/m));
}

/**
 * Given the source of a Test262 test, invoke the provided callback once for
 * each valid "version" of that program as defined by its meta data.
 */
function forEachVersion(src, run) {
  var onlyStrict = onlyStrictPattern.test(src);
  var noStrict = noStrictPattern.test(src);
  var results = [];

  if (!onlyStrict) {
    results.push(run(src));
  }

  if (!noStrict) {
    results.push(run("'use strict';\n" + src));
  }

  return results;
}

/**
 * JSHint "error" messages generally indicate a parsing failure and "warning"
 * messages generally indicate more objective problems with technically-valid
 * programs. This convention is not consistently honored, however, so
 * interpreting parsing success/failure from message code requires the
 * following list of "contradictory" codes.
 */
var incorrectSeverity = {
  E007: true,
  // E013 describes a runtime error: the modification of a constant binding.
  // Although (unlike the other errors referenced in this object) this
  // condition is guaranteed to produce errors, it is not technically an early
  // error and should therefore be ignored when interpreting Test262 tests.
  E013: true,
  E034: true,

  W024: true,
  W025: true,
  W052: true,
  W067: true,
  W076: true,
  W077: true,
  W090: true,
  W094: true,
  W095: true,
  W112: true,
  W115: true,
  W130: true,
  W131: true,
  W133: true,
  W136: true
};

function isFailure(result) {
  if (result.exception) {
    return true;
  }

  return result.errors && !!find(result.errors, function(msg) {
    if (msg.code[0] === "W") {
      return msg.code in incorrectSeverity;
    }

    return !(msg.code in incorrectSeverity);
  });
}

module.exports = function test(src) {
  var isModule = modulePattern.test(src);
  var expected = hasEarlyError(src);
  var parseFailure = false;
  var results = forEachVersion(src, function(src) {
    var result, exception;

    try {
      JSHint(src, { esversion: 7, maxerr: Infinity, module: isModule });
    } catch (e) {
      exception = e;
    }

    result = {
      exception: exception,
      errors: JSHint.data().errors
    };

    result.parseFailure = isFailure(result);

    return result;
  });

  parseFailure = results.reduce(function(memo, result) {
      return memo || result.parseFailure;
    }, false);

  return {
    expected: expected,
    parseFailure: parseFailure,
    results: results
  };
};
