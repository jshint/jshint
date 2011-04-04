/**
 * Tests for all non-environmental options. Non-environmental options are
 * options that change how JSHint behaves instead of just pre-defining a set
 * of global variables.
 */

/*jshint boss: true, laxbreak: true, node: true */

var JSHINT = require('../jshint.js').JSHINT,
    assert = require('assert'),
    fs     = require('fs');

/**
 * Option `shadow` allows you to re-define variables later in code.
 *
 * E.g.:
 *   var a = 1;
 *   if (cond == true)
 *       var a = 2; // Variable a has been already defined on line 1.
 *
 * More often than not it is a typo, but sometimes people use it.
 */
exports.shadow = function () {
    var src = fs.readFileSync(__dirname + "/fixtures/redef.js", "utf8");

    // Do not tolerate variable shadowing by default
    assert.ok(!JSHINT(src));
    assert.eql(JSHINT.errors[0].line, 5);
    assert.eql(JSHINT.errors[0].reason, "'a' is already defined.");
    assert.eql(JSHINT.errors[1].line, 10);
    assert.eql(JSHINT.errors[1].reason, "'foo' is already defined.");

    // Allow variable shadowing when shadow is true
    assert.ok(JSHINT(src, { shadow: true }));
};