/**
 * The NameStack class is used to approximate function name inference as
 * introduced by ECMAScript 2015. In that edition, the `name` property of
 * function objects is set according to the function's syntactic form. For
 * certain forms, this value depends on values available to the runtime during
 * execution. For example:
 *
 *     var fnName = function() {};
 *
 * In the program code above, the function object's `name` property is set to
 * `"fnName"` during execution.
 *
 * This general "name inference" behavior extends to a number of additional
 * syntactic forms, not all of which can be implemented statically. `NameStack`
 * is a support class representing a "best-effort" attempt to implement the
 * specified behavior in cases where this may be done statically.
 *
 * For more information on this behavior, see the following blog post:
 * https://bocoup.com/blog/whats-in-a-function-name
 */
"use strict";

function NameStack() {
  this._stack = [];
}

Object.defineProperty(NameStack.prototype, "length", {
  get: function() {
    return this._stack.length;
  }
});

/**
 * Create a new entry in the stack. Useful for tracking names across
 * expressions.
 */
NameStack.prototype.push = function() {
  this._stack.push(null);
};

/**
 * Discard the most recently-created name on the stack.
 */
NameStack.prototype.pop = function() {
  this._stack.pop();
};

/**
 * Update the most recent name on the top of the stack.
 *
 * @param {object} token The token to consider as the source for the most
 *                       recent name.
 */
NameStack.prototype.set = function(token) {
  this._stack[this.length - 1] = token;
};

/**
 * Generate a string representation of the most recent name.
 *
 * @returns {string}
 */
NameStack.prototype.infer = function() {
  var nameToken = this._stack[this.length - 1];
  var prefix = "";
  var type;

  // During expected operation, the topmost entry on the stack will only
  // reflect the current function's name when the function is declared without
  // the `function` keyword (i.e. for in-line accessor methods). In other
  // cases, the `function` expression itself will introduce an empty entry on
  // the top of the stack, and this should be ignored.
  if (!nameToken || nameToken.type === "class") {
    nameToken = this._stack[this.length - 2];
  }

  if (!nameToken) {
    return "(empty)";
  }

  type = nameToken.type;

  if (type !== "(string)" && type !== "(number)" && type !== "(identifier)" && type !== "default") {
    return "(expression)";
  }

  if (nameToken.accessorType) {
    prefix = nameToken.accessorType + " ";
  }

  return prefix + nameToken.value;
};

module.exports = NameStack;
