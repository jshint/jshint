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

/**
 * Option `latedef` allows you to prohibit the use of variable before their
 * definitions.
 *
 * E.g.:
 *   fn(); // fn will be defined later in code
 *   function fn() {};
 *
 * Since JavaScript has function-scope only, you can define variables and
 * functions wherever you want. But if you want to be more strict, use
 * this option.
 */
exports.latedef = function () {
    var src  = fs.readFileSync(__dirname + '/fixtures/latedef.js', 'utf8'),
        src1 = fs.readFileSync(__dirname + '/fixtures/redef.js', 'utf8');

    // By default, tolerate the use of variable before its definition
    assert.ok(JSHINT(src));

    // However, JSHint must complain if variable is actually missing
    assert.ok(!JSHINT('fn()', { undef: true }));
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, "'fn' is not defined.");

    // And it also must complain about the redefinition (see option `shadow`)
    assert.ok(!JSHINT(src1));

    // When latedef is true, JSHint must not tolerate the use before definition
    assert.ok(!JSHINT(src, { latedef: true }));
    assert.eql(JSHINT.errors[0].line, 2);
    assert.eql(JSHINT.errors[0].reason, "'fn' was used before it was defined.");
    assert.eql(JSHINT.errors[1].line, 6);
    assert.eql(JSHINT.errors[1].reason, "'fn1' was used before it was defined.");
    assert.eql(JSHINT.errors[2].line, 10);
    assert.eql(JSHINT.errors[2].reason, "'vr' was used before it was defined.");
};

/**
 * Option `curly` allows you to enforce the use of curly braces around
 * control blocks. JavaScript allows one-line blocks to go without curly
 * braces but some people like to always use curly bracse. This option is
 * for them.
 *
 * E.g.:
 *   if (cond) return;
 *     vs.
 *   if (cond) { return; }
 */
exports.curly = function () {
    var src  = fs.readFileSync(__dirname + '/fixtures/curly.js', 'utf8'),
        src1 = fs.readFileSync(__dirname + '/fixtures/curly2.js', 'utf8');

    // By default, tolerate one-line blocks since they are valid JavaScript
    assert.ok(JSHINT(src));
    assert.ok(JSHINT(src1));

    // Require all blocks to be wrapped with curly braces if curly is true
    assert.ok(!JSHINT(src, { curly: true }));
    assert.eql(JSHINT.errors[0].line, 2);
    assert.eql(JSHINT.errors[0].reason, "Expected '{' and instead saw 'return'.");
    assert.eql(JSHINT.errors[1].line, 5);
    assert.eql(JSHINT.errors[1].reason, "Expected '{' and instead saw 'doSomething'.");
    assert.eql(JSHINT.errors[2].line, 8);
    assert.eql(JSHINT.errors[2].reason, "Expected '{' and instead saw 'doSomething'.");

    assert.ok(JSHINT(src1, { curly: true }));
};

/** Option `noempty` prohibits the use of empty blocks. */
exports.noempty = function () {
    var code = 'for (;;) {}';

    // By default, tolerate empty blocks since they are valid JavaScript
    assert.ok(JSHINT(code));

    // Do not tolerate, when noempty is true
    assert.ok(!JSHINT(code, { noempty: true }));
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, 'Empty block.');
};

/**
 * Option `noarg` prohibits the use of arguments.callee and arguments.caller.
 * JSHint allows them by default but you have to know what you are doing since:
 *  - They are not supported by all JavaScript implementations
 *  - They might prevent an interpreter from doing some optimization tricks
 *  - They are prohibited in the strict mode
 */
exports.noarg = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/noarg.js', 'utf8');

    // By default, tolerate both arguments.callee and arguments.caller
    assert.ok(JSHINT(src));

    // Do not tolerate both .callee and .caller when noarg is true
    assert.ok(!JSHINT(src, { noarg: true }));
    assert.eql(JSHINT.errors[0].line, 2);
    assert.eql(JSHINT.errors[0].reason, 'Avoid arguments.callee.');
    assert.eql(JSHINT.errors[1].line, 6);
    assert.eql(JSHINT.errors[1].reason, 'Avoid arguments.caller.');
};

/** Option `nonew` prohibits the use of constructors for side-effects */
exports.nonew = function () {
    var code  = "new Thing();",
        code1 = "var obj = new Thing();";

    assert.ok(JSHINT(code));
    assert.ok(JSHINT(code1));

    assert.ok(!JSHINT(code, { nonew: true }));
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, "Do not use 'new' for side effects.");
    assert.ok(JSHINT(code1, { nonew: true }));
};

/** Option `asi` allows you to use automatic-semicolon insertion */
exports.asi = function () {
    var code = 'hello()';

    assert.ok(!JSHINT(code));
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, 'Missing semicolon.');

    assert.ok(JSHINT(code, { asi: true }));
};

/**
 * Option `expr` allows you to use ExpressionStatement as a Program code.
 *
 * Even though ExpressionStatement as a Program (i.e. without assingment
 * of its result) is a valid JavaScript, more often than not it is a typo.
 * That's why by default JSHint complains about it. But if you know what
 * are you doing, there is nothing wrong with it.
 */
exports.expr = function () {
    var exps = [
        "obj && obj.method && obj.method();",
        "myvar && func(myvar);",
        "1;",
        "true;",
        "+function () {};"
    ];

    for (var i = 0, exp; exp = exps[i]; i++) {
        assert.ok(!JSHINT(exp));
        assert.eql(JSHINT.errors[0].line, 1);
        assert.eql(JSHINT.errors[0].reason, 'Expected an assignment or function call and instead saw an expression.');
    }

    for (i = 0, exp = null; exp = exps[i]; i++)
        assert.ok(JSHINT(exp, { expr: true }));
};

exports.undef = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/undef.js', 'utf8');

    // Make sure there are no other errors
    assert.ok(JSHINT(src));

    // Make sure it fails when undef is true
    assert.ok(!JSHINT(src, { undef: true }));
    assert.eql(JSHINT.errors.length, 2);
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, "'undef' is not defined.");
    assert.eql(JSHINT.errors[1].line, 6);
    assert.eql(JSHINT.errors[1].reason, "'localUndef' is not defined.");
};