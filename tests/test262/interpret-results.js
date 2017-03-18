"use strict";

/**
 * Normalize directory name separators to be Unix-like forward slashes. Also
 * condenses repeated slashes to a single slash.
 *
 * Source: https://github.com/jonschlinkert/normalize-path
 */
function normalize(filePath) {
  return filePath.replace(/[\\\/]+/g, "/");
}

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
    var normalizedName = normalize(result.name);
    var isAllowed = allowed[normalizedName];
    delete allowed[normalizedName];

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
