"use strict";
// Replacement for the npm `exit` package when running under Rhino.
module.exports = function(code) {
  /* global java */
  java.lang.System.exit(code || 0);
};
