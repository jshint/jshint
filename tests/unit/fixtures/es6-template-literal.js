var one = 1, two = 2;

var string = `  ${one} + ${two}
= ${one + two}`;

var literal = `because I
can`;

var escaped = `one = \`${one}\``;

function octal_strictmode() {
  "use strict";

  var test = `\033\t`;
}

var unterminated = `${one}
