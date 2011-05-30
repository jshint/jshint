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

/** Option `lastsemic` allows you to skip the semicolon after last statement in a block,
  * if that statement is followed by the closing brace on the same line. */
exports.lastsemic = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/lastsemic.js', 'utf8');

    // without lastsemic
    assert.eql(false, JSHINT(src));
    assert.eql(JSHINT.errors.length, 3);
    assert.eql(JSHINT.errors[0].line, 2);
    assert.eql(JSHINT.errors[0].reason, 'Missing semicolon.');  // missing semicolon in the middle of a block
    assert.eql(JSHINT.errors[1].line, 4);
    assert.eql(JSHINT.errors[1].reason, 'Missing semicolon.');  // missing semicolon in a one-liner function
    assert.eql(JSHINT.errors[2].line, 5);
    assert.eql(JSHINT.errors[2].reason, 'Missing semicolon.');  // missing semicolon at the end of a block

    // with lastsemic
    assert.eql(false, JSHINT(src, { lastsemic: true }));
    assert.eql(JSHINT.errors.length, 2);
    assert.eql(JSHINT.errors[0].line, 2);
    assert.eql(JSHINT.errors[0].reason, 'Missing semicolon.');
    assert.eql(JSHINT.errors[1].line, 5);
    assert.eql(JSHINT.errors[1].reason, 'Missing semicolon.');
    // this line is valid now: [1, 2, 3].forEach(function(i) { print(i) });
    // line 5 isn't, because the block doesn't close on the same line

    // it shouldn't interfere with asi option
    assert.eql(true, JSHINT(src, { lastsemic: true, asi: true }));
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

/** Option `undef` requires you to always define variables you use */
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

/** Option `scripturl` allows the use of javascript-type URLs */
exports.scripturl = function() {
    var code = "var foo = { 'count': 12, 'href': 'javascript:' };",
        src = fs.readFileSync(__dirname + '/fixtures/scripturl.js', 'utf8');

    // Make sure there is an error
    assert.ok(!JSHINT(code));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, 'Script URL.');

    // Make sure the error goes away when javascript URLs are tolerated
    assert.ok(JSHINT(code, { scripturl: true }));

    // Make sure an error exists for labels that look like URLs
    assert.ok(!JSHINT(src));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].line, 2);
    assert.eql(JSHINT.errors[0].reason, "Label 'javascript' looks like a javascript url.");

    // Make sure the label error exists even if javascript URLs are tolerated
    assert.ok(!JSHINT(src, { scripturl: true }));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].line, 2);
    assert.eql(JSHINT.errors[0].reason, "Label 'javascript' looks like a javascript url.");
};

/**
 * Option `forin` disallows the use of for in loops without hasOwnProperty.
 *
 * The for in statement is used to loop through the names of properties
 * of an object, including those inherited through the prototype chain.
 * The method hasOwnPropery is used to check if the property belongs to
 * an object or was inherited through the prototype chain.
 */
exports.forin = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/forin.js', 'utf8');

    // Make sure there are no other errors
    assert.ok(JSHINT(src));

    // Make sure it fails when forin is true
    assert.ok(!JSHINT(src, { forin: true }));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, 'The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype.');
};

/**
 * Option `loopfunc` allows you to use function expression in the loop.
 * E.g.:
 *   while (true) x = function () {};
 *
 * This is generally a bad idea since it is too easy to make a
 * closure-related mistake.
 */
exports.loopfunc = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/loopfunc.js', 'utf8');

    // By default, not functions are allowed inside loops
    assert.ok(!JSHINT(src));
    assert.eql(JSHINT.errors.length, 3);
    assert.eql(JSHINT.errors[0].line, 2);
    assert.eql(JSHINT.errors[0].reason, "Don't make functions within a loop.");
    assert.eql(JSHINT.errors[1].line, 6);
    assert.eql(JSHINT.errors[1].reason, "Don't make functions within a loop.");
    assert.eql(JSHINT.errors[2].line, 10);
    assert.eql(JSHINT.errors[2].reason, "Function declarations should not be placed in blocks. Use a function expression or move the statement to the top of the outer function.");

    // When loopfunc is true, only function declaration should fail.
    // Expressions are okay.
    assert.ok(!JSHINT(src, { loopfunc: true }));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].line, 10);
    assert.eql(JSHINT.errors[0].reason, "Function declarations should not be placed in blocks. Use a function expression or move the statement to the top of the outer function.");
};

/** Option `boss` unlocks some useful but unsafe features of JavaScript. */
exports.boss = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/boss.js', 'utf8');

    // By default, warn about suspicious assignments
    assert.ok(!JSHINT(src));
    assert.eql(JSHINT.errors.length, 4);
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, 'Expected a conditional expression and instead saw an assignment.');
    assert.eql(JSHINT.errors[1].line, 4);
    assert.eql(JSHINT.errors[1].reason, 'Expected a conditional expression and instead saw an assignment.');
    assert.eql(JSHINT.errors[2].line, 7);
    assert.eql(JSHINT.errors[2].reason, 'Expected a conditional expression and instead saw an assignment.');
    assert.eql(JSHINT.errors[3].line, 12);
    assert.eql(JSHINT.errors[3].reason, 'Expected a conditional expression and instead saw an assignment.');

    // But if you are the boss, all is good
    assert.ok(JSHINT(src, { boss: true }));
};

/**
 * Options `eqnull` allows you to use '== null' comparisons.
 * It is useful when you want to check if value is null _or_ undefined.
 */
exports.eqnull = function () {
    var code = [
        'if (e == null) doSomething();'
      , 'if (null == e) doSomething();'
    ];

    // By default, warn about `== null` comparison
    assert.ok(!JSHINT(code));
    assert.eql(JSHINT.errors.length, 2);
    assert.eql(JSHINT.errors[0].reason, "Use '===' to compare with 'null'.");
    assert.eql(JSHINT.errors[1].reason, "Use '===' to compare with 'null'.");

    // But when `eqnull` is true, no questions asked
    assert.ok(JSHINT(code, { eqnull: true }));

    // Make sure that `eqnull` has precedence over `eqeqeq`
    assert.ok(JSHINT(code, { eqeqeq: true, eqnull: true }));
};

/**
 * Option `supernew` allows you to use operator `new` with anonymous functions
 * and objects without invocation.
 *
 * Ex.:
 *   new function () { ... };
 *   new Date;
 */
exports.supernew = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/supernew.js', 'utf8');

    assert.ok(!JSHINT(src));
    assert.eql(JSHINT.errors.length, 3);
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, "Weird construction. Delete 'new'.");
    assert.eql(JSHINT.errors[1].line, 9);
    assert.eql(JSHINT.errors[1].reason, "Missing '()' invoking a constructor.");
    assert.eql(JSHINT.errors[2].line, 11);
    assert.eql(JSHINT.errors[2].reason, "Missing '()' invoking a constructor.");

    assert.ok(JSHINT(src, { supernew: true }));
};

/** Option `bitwise` disallows the use of bitwise operators. */
exports.bitwise = function () {
    var ops = [ '&', '|', '^', '<<' , '>>', '>>>' ];

    // By default allow bitwise operators
    for (var i = 0, op; op = ops[i]; i++)
        assert.ok(JSHINT('var c = a ' + op + ' b;'));
    assert.ok(JSHINT('var c = ~a;'));

    for (i = 0, op = null; op = ops[i]; i++) {
        assert.ok(!JSHINT('var c = a ' + op + ' b;', { bitwise: true }));
        assert.eql(JSHINT.errors.length, 1);
        assert.eql(JSHINT.errors[0].reason, "Unexpected use of '" + op + "'.");
    }
    assert.ok(!JSHINT('var c = ~a;', { bitwise: true }));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, "Unexpected '~'.");
};

/** Option `debug` allows the use of debugger statements. */
exports.debug = function () {
    var code = 'function test () { debugger; return true; }';

    // By default disallow debugger statements.
    assert.ok(!JSHINT(code));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, "All 'debugger' statements should be removed.");

    // But allow them if debug is true.
    assert.ok(JSHINT(code, { debug: true }));
};

/** Option `eqeqeq` requires you to use === all the time. */
exports.eqeqeq = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/eqeqeq.js', 'utf8');

    assert.ok(!JSHINT(src));
    assert.eql(JSHINT.errors.length, 1); // Only == null should fail
    assert.eql(JSHINT.errors[0].line, 8);
    assert.eql(JSHINT.errors[0].reason, "Use '===' to compare with 'null'.");

    assert.ok(!JSHINT(src, { eqeqeq: true }));
    assert.eql(JSHINT.errors.length, 3); // All relations in that file should fail
    assert.eql(JSHINT.errors[0].line, 2);
    assert.eql(JSHINT.errors[0].reason, "Expected '===' and instead saw '=='.");
    assert.eql(JSHINT.errors[1].line, 5);
    assert.eql(JSHINT.errors[1].reason, "Expected '!==' and instead saw '!='.");
    assert.eql(JSHINT.errors[2].line, 8);
    assert.eql(JSHINT.errors[2].reason, "Expected '===' and instead saw '=='.");
};

/** Option `evil` allows the use of eval. */
exports.evil = function () {
    var src = "eval('hey();');";

    assert.ok(!JSHINT(src)); // Eval?                        SHUT.
    assert.eql(JSHINT.errors.length, 1); //                  DOWN.
    assert.eql(JSHINT.errors[0].reason, "eval is evil."); // EVERYTHING.

    assert.ok(JSHINT(src, { evil: true }));
};

/**
 * Option `immed` forces you to wrap immediate invocations in parens.
 *
 * Functions in JavaScript can be immediately invoce but that can confuse
 * readers of your code. To make it less confusing, wrap the invocations in
 * parens.
 *
 * E.g. (note the parens):
 *   var a = (function () {
 *     return 'a';
 *   }());
 *   console.log(a); // --> 'a'
 */
exports.immed = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/immed.js', 'utf8');

    assert.ok(JSHINT(src));
    assert.ok(!JSHINT(src, { immed: true }));
    assert.eql(JSHINT.errors.length, 2);
    assert.eql(JSHINT.errors[0].line, 3);
    assert.eql(JSHINT.errors[0].reason, "Wrap an immediate function invocation in parentheses " +
                                        "to assist the reader in understanding that the expression " +
                                        "is the result of a function, and not the function itself.");
    assert.eql(JSHINT.errors[1].line, 7);
    assert.eql(JSHINT.errors[1].reason, 'Move the invocation into the parens that contain the function.');
};

/** Option `nomen` disallows variable names with dangling '_'. */
exports.nomen = function () {
    var names = [ '_hey', 'hey_' ];

    for (var i = 0, name; name = names[i]; i++)
        assert.ok(JSHINT('var ' + name + ';'));

    for (i = 0, name = null; name = names[i]; i++) {
        assert.ok(!JSHINT('var ' + name + ';', { nomen: true }));
        assert.eql(JSHINT.errors.length, 1);
        assert.eql(JSHINT.errors[0].reason, "Unexpected dangling '_' in '" + name + "'.");
    }

    // Normal names should pass all the time
    assert.ok(JSHINT('var hey;'));
    assert.ok(JSHINT('var hey;', { nomen: true }));
};

/** Option `passfail` tells JSHint to stop at the first error. */
exports.passfail = function () {
    var code = [
        'one()'
      , 'two()'
      , 'three()'
    ];

    assert.ok(!JSHINT(code));
    assert.eql(JSHINT.errors.length, 3);

    assert.ok(!JSHINT(code, { passfail: true }));
    assert.ok(JSHINT.errors.length, 1);
};

/**
 * Option `onevar` allows you to use only one var statement
 * per function. Don't ask me why.
 */
exports.onevar = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/onevar.js', 'utf8');

    assert.ok(JSHINT(src));
    assert.ok(!JSHINT(src, { onevar: true }));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].line, 10);
    assert.eql(JSHINT.errors[0].reason, 'Too many var statements.');
};

/** Option `plusplus` prohibits the use of increments/decrements. */
exports.plusplus = function () {
    var ops = [ '++', '--' ];

    for (var i = 0, op; op = ops[i]; i++) {
        assert.ok(JSHINT('var i = j' + op + ';'));
        assert.ok(JSHINT('var i = ' + op + 'j;'));
    }

    for (i = 0, op = null; op = ops[i]; i++) {
        assert.ok(!JSHINT('var i = j' + op + ';', { plusplus: true }));
        assert.ok(JSHINT.errors.length, 1);
        assert.ok(JSHINT.errors[0].reason, "Unexpected use of '" + op + "'.");

        assert.ok(!JSHINT('var i = ' + op + 'j;', { plusplus: true }));
        assert.ok(JSHINT.errors.length, 1);
        assert.ok(JSHINT.errors[0].reason, "Unexpected use of '" + op + "'.");
    }
};

/**
 * Option `newcap` requires constructors to be capitalized.
 *
 * Constructors are functions that are designed to be used with the `new` statement.
 * `new` creates a new object and binds it to the implied this parameter.
 * A constructor executed without new will have its this assigned to a global object,
 * leading to errors.
 *
 * Unfortunately, JavaScript gives us absolutely no way of telling if a function is a
 * constructor. There is a convention to capitalize all constructor names to prevent
 * those mistakes. This option enforces that convention.
 */
exports.newcap = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/newcap.js', 'utf8');

    assert.ok(JSHINT(src)); // By default, everything is fine

    // When newcap is true, enforce the conventions
    assert.ok(!JSHINT(src, { newcap: true }));
    assert.eql(JSHINT.errors.length, 2);
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, 'A constructor name should start with an uppercase letter.');
    assert.eql(JSHINT.errors[1].line, 5);
    assert.eql(JSHINT.errors[1].reason, "Missing 'new' prefix when invoking a constructor.");
};

/** Option `sub` allows all forms of subscription. */
exports.sub = function () {
    assert.ok(!JSHINT("window.obj = obj['prop'];"));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, "['prop'] is better written in dot notation.");
    assert.ok(JSHINT("window.obj = obj['prop'];", { sub: true }));
};

/** Option `strict` requires you to use "use strict"; */
exports.strict = function () {
    var code  = "(function () { return; }());",
        code1 = '(function () { "use strict"; return; }());';

    assert.ok(JSHINT(code));
    assert.ok(JSHINT(code1));

    assert.ok(!JSHINT(code, { strict: true }));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, 'Missing "use strict" statement.');

    assert.ok(JSHINT(code1, { strict: true }));
};

/** Option `globalstrict` allows you to use global "use strict"; */
exports.globalstrict = function () {
    var code = [
        '"use strict";'
      , 'function hello() { return; }'
    ];

    assert.ok(!JSHINT(code, { strict: true }));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, 'Use the function form of "use strict".');
    assert.ok(JSHINT(code, { globalstrict: true }));

    // Check that globalstrict also enabled strict
    assert.ok(!JSHINT(code[1], { globalstrict: true }));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, 'Missing "use strict" statement.');

    // Don't enforce "use strict"; if strict has been explicitly set to false
    assert.ok(JSHINT(code[1], { globalstrict: true, strict: false }));
};

/** Option `regexp` disallows the use of . and [^...] in regular expressions. */
exports.regexp = function () {
    var code = [
        'var a = /hey/;'
      , 'var a = /h.ey/;'
      , 'var a = /h[^...]/;'
    ];

    for (var i = 0, st; st = code[i]; i++)
        assert.ok(JSHINT(code));

    assert.ok(JSHINT(code[0], { regexp: true }));

    assert.ok(!JSHINT(code[1], { regexp: true }));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, "Insecure '.'.");

    assert.ok(!JSHINT(code[2], { regexp: true }));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, "Insecure '^'.");
};

/** Option `laxbreak` allows you to insert newlines before some operators. */
exports.laxbreak = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/laxbreak.js', 'utf8');

    assert.ok(!JSHINT(src));
    assert.eql(JSHINT.errors.length, 2);
    assert.eql(JSHINT.errors[0].line, 2);
    assert.eql(JSHINT.errors[0].reason, "Bad line breaking before ','.");
    assert.eql(JSHINT.errors[1].line, 12);
    assert.eql(JSHINT.errors[1].reason, "Bad line breaking before ','.");

    var ops = [ '||', '&&', '*', '/', '%', '+', '-', '>=',
                '==', '===', '!=', '!==', '>', '<', '<=', 'instanceof' ];

    for (var i = 0, op, code; op = ops[i]; i++) {
        code = ['var a = b ', op + ' c;'];
        assert.ok(!JSHINT(code));
        assert.eql(JSHINT.errors.length, 1);
        assert.eql(JSHINT.errors[0].reason, "Bad line breaking before '" + op + "'.");
        assert.ok(JSHINT(code, { laxbreak: true }));
    }

    code = [ 'var a = b ', '? c : d;' ];
    assert.ok(!JSHINT(code));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, "Bad line breaking before '?'.");
    assert.ok(JSHINT(code, { laxbreak: true }));
};

exports.white = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/white.js', 'utf8');

    assert.ok(JSHINT(src));
    assert.ok(!JSHINT(src, { white: true }));
    assert.eql(JSHINT.errors.length, 5);
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, "Unexpected space after 'hello'.");
    assert.eql(JSHINT.errors[1].line, 2);
    assert.eql(JSHINT.errors[1].reason, "Unexpected space after 'true'.");
    assert.eql(JSHINT.errors[2].line, 5);
    assert.eql(JSHINT.errors[2].reason, "Missing space after 'function'.");
    assert.eql(JSHINT.errors[3].line, 6);
    assert.eql(JSHINT.errors[3].reason, "Missing space after 'if'.");
    assert.eql(JSHINT.errors[4].line, 6);
    assert.eql(JSHINT.errors[4].reason, "Missing space after ')'.");
};

exports.trailing = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/white.js', 'utf8');

    assert.ok(JSHINT(src));
    assert.ok(!JSHINT(src, { trailing: true }));
    assert.eql(JSHINT.errors.length, 2);
    assert.eql(JSHINT.errors[0].line, 7);
    assert.eql(JSHINT.errors[0].reason, "Trailing whitespace.");
    assert.eql(JSHINT.errors[1].line, 9);
    assert.eql(JSHINT.errors[1].reason, "Trailing whitespace.");
};

exports.regexdash = function () {
    var code = [
        'var a = /[-ab]/;'
      , 'var a = /[ab-]/;'
    ];

    // Default behavior
    assert.ok(!JSHINT(code[0]));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, "Unescaped '-'.");

    assert.ok(!JSHINT(code[1]));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, "Unescaped '-'.");

    // Regex dash is on
    assert.ok(!JSHINT(code[0], { regexdash: true }));
    assert.eql(JSHINT.errors.length, 1);
    assert.eql(JSHINT.errors[0].reason, "Unescaped '-'.");
    assert.ok(JSHINT(code[1], { regexdash: true }));
};