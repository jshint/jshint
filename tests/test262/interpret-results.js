"use strict";

module.exports = function report(results, allowed) {
  var expected = {
    success: [],
    failure: [],
    falsePositive: [],
    falseNegative: []
  };
  var unexpected = {
    success: [],
    failure: [],
    falsePositive: [],
    falseNegative: [],
    unrecognized: null
  };
  var totalUnexpected;

  results.forEach(function(result) {
    var isAllowed = allowed[result.name];
    delete allowed[result.name];

    if (!!result.parseFailure === result.expected) {
      if (isAllowed) {
        if (result.parseFailure) {
          unexpected.failure.push(result.name);
        } else {
          unexpected.success.push(result.name);
        }
      } else {
        if (result.parseFailure) {
          expected.failure.push(result.name);
        } else {
          expected.success.push(result.name);
        }
      }
    } else {
      if (isAllowed) {
        if (result.parseFailure) {
          expected.falsePositive.push(result.name);
        } else {
          expected.falseNegative.push(result.name);
        }
      } else {
        if (result.parseFailure) {
          unexpected.falseNegative.push(result.name);
        } else {
          unexpected.falsePositive.push(result.name);
        }
      }
    }
  });
  unexpected.unrecognized = Object.keys(allowed);
  totalUnexpected = unexpected.success.length + unexpected.failure.length +
    unexpected.falsePositive.length + unexpected.falseNegative.length +
    unexpected.unrecognized.length;

  return {
    totalTests: results.length,
    totalUnexpected: totalUnexpected,
    expected: expected,
    unexpected: unexpected
  };
};
