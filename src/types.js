"use strict";

exports.register = function (linter) {
  // Check for octal numbers within strings when in strict mode.
  linter.on("String", function (str) {
    str.missedBackslashes.forEach(function (pos) {
      linter.warn("W112", { line: pos.line, char: pos.char });
    });

    if (!str.hasOctal || !linter.isStrictMode())
      return;

    linter.warn("W115", {
      line: str.line,
      char: str.char
    });
  });

  // Check for malformed numbers and octals when in strict mode.
  linter.on("Number", function (num) {
    if (num.isMalformed)
      linter.warn("W045", { line: num.line, char: num.char, data: [ num.value ] });

    if (num.base !== 8 || !linter.isStrictMode())
      return;

    linter.warn("W115", {
      line: num.line,
      char: num.char,
      data: [ num.value ]
    });
  });
};