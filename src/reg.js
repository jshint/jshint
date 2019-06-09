/*
 * Regular expressions. Some of these are stupidly long.
 */

/*jshint maxlen:1000 */

"use strict";

// Unsafe comment or string (ax)
exports.unsafeString =
  /@cc|<\/?|script|\]\s*\]|<\s*!|&lt/i;

// Characters in strings that need escaping (nx and nxg)
exports.needEsc =
  /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;

exports.needEscGlobal =
  /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

// Star slash (lx)
exports.starSlash = /\*\//;

// Identifier (ix)
exports.identifier = /^([a-zA-Z_$][a-zA-Z0-9_$]*)$/;

// JavaScript URL (jx)
exports.javascriptURL = /^(?:javascript|jscript|ecmascript|vbscript|livescript)\s*:/i;

// Catches /* falls through */ comments (ft)
exports.fallsThrough = /^\s*falls?\sthrough\s*$/;

// very conservative rule (eg: only one space between the start of the comment and the first character)
// to relax the maxlen option
exports.maxlenException = /^(?:(?:\/\/|\/\*|\*) ?)?[^ ]+$/;

// Node.js releases prior to version 8 include a version of the V8 engine which
// incorrectly interprets the character class escape `\s`. The following
// regular expression may be replaced with `/\s/` when JSHint removes support
// for Node.js versions prior to 8.
// Source:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
exports.whitespace = /[ \f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/;

exports.nonzeroDigit = /^[1-9]$/;

exports.decimalDigit = /^[0-9]$/;

exports.regexpSyntaxChars = /[\^$\\.*+?()[\]{}|]/;

exports.regexpQuantifiers = /[*+?{]/;

exports.regexpControlEscapes = /[fnrtv]/;

exports.regexpCharClasses = /[dDsSwW]/;

// Identifies the "dot" atom in regular expressions
exports.regexpDot = /(^|[^\\])(\\\\)*\./;
