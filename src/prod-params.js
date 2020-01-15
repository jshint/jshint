/**
 * This module defines a set of enum-like values intended for use as bit
 * "flags" during parsing. The ECMAScript grammar defines a number of such
 * "production parameters" to control how certain forms are parsed in context.
 * JSHint implements additional parameters to facilitate detection of lint
 * warnings.
 *
 * An equivalent implementation which described the context in terms of a
 * "lookup table" object would be more idiomatic for a JavaScript project like
 * JSHint. However, because the number of contexts scales with the number of
 * expressions in the input program, this would have non-negligible impact on
 * the process's memory footprint.
 */
module.exports = {
  /**
   * Enabled when parsing expressions within ES2015 "export" declarations,
   * allowing otherwise-unreferenced bindings to be considered "used".
   */
  export: 1,

  /**
   * Enabled when parsing expressions within the head of `for` statements,
   * allowing to distinguish between `for-in` and "C-style" `for` statements.
   */
  noin: 2,

  /**
   * Enabled when the expression begins the statement, allowing the parser to
   * correctly select between the null denotation ("nud") and first null
   * denotation ("fud") parsing strategy.
   */
  initial: 4,

  preAsync: 8,

  async: 16,

  /**
   * Enabled when any exception thrown by the expression will be caught by a
   * TryStatement.
   */
  tryClause: 32,

  /**
   * Enabled when parsing the body of a generator function.
   */
  yield: 64
};
