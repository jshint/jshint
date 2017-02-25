"use strict";

/**
 * A "test expectations" file contains a newline-separated list of file names
 * with support for pound-sign (`#`) delimited comments. Translate the contents
 * of such a file into a lookup table--an object whose keys are file names and
 * whose key-values are the `true` value.
 */
module.exports = function(src) {
  return src.split("\n").reduce(function(memo, line) {
    var parts;
    line = line.replace(/\s*#.*$/, "").trim();
    if (!line) {
      return memo;
    }
    memo[line] = true;

    return memo;
  }, Object.create(null));
};
