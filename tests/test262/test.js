"use strict";
var JSHint = require("../../").JSHINT;
var find = require("lodash").find;

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

function isFailure(errors) {
  return errors && !!find(errors, function(msg) {
    if (msg.code[0] === "W") {
      return msg.code in incorrectSeverity;
    } else if (msg.code[0] === "I") {
      return false;
    }

    return !(msg.code in incorrectSeverity);
  });
}

module.exports = function(test) {
  var isModule = !!test.attrs.flags.module;

  try {
    JSHint(test.contents, { esversion: 9, maxerr: Infinity, module: isModule });
  } catch (e) {
    return false;
  }

  return !isFailure(JSHint.data().errors);
};
