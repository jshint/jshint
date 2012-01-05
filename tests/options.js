/**
 * Tests for all non-environmental options. Non-environmental options are
 * options that change how JSHint behaves instead of just pre-defining a set
 * of global variables.
 */

/*jshint boss: true, laxbreak: true, node: true, maxlen:100 */

var JSHINT  = require('../jshint.js').JSHINT,
    fs      = require('fs'),
    TestRun = require("./testhelper").setup.testRun;

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
    TestRun()
        .addError(5, "'a' is already defined.")
        .addError(10, "'foo' is already defined.")
        .test(src);

    // Allow variable shadowing when shadow is true
    TestRun()
        .test(src, { shadow: true });
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
    TestRun()
        .test(src);

    // However, JSHint must complain if variable is actually missing
    TestRun()
        .addError(1, "'fn' is not defined.")
        .test('fn();', { undef: true });

    // And it also must complain about the redefinition (see option `shadow`)
    TestRun()
        .addError(5, "'a' is already defined.")
        .addError(10, "'foo' is already defined.")
        .test(src1);

    // When latedef is true, JSHint must not tolerate the use before definition
    TestRun()
        .addError(2, "'fn' was used before it was defined.")
        .addError(6, "'fn1' was used before it was defined.")
        .addError(10, "'vr' was used before it was defined.")
        .test(src, { latedef: true });
};

exports.latedefwundef = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/latedefundef.js', 'utf8');

    // Assures that when `undef` is set to true, it'll report undefined variables
    // and late definitions won't be reported as `latedef` is set to false.
    TestRun()
        .addError(29, "'hello' is not defined.")
        .addError(35, "'world' is not defined.")
        .test(src, { latedef: false, undef: true });

    // When we suppress `latedef` and `undef` then we get no warnings.
    TestRun()
        .test(src, { latedef: false, undef: false });

    // If we warn on `latedef` but supress `undef` we only get the
    // late definition warnings.
    TestRun()
        .addError(5, "'func2' was used before it was defined.")
        .addError(12, "'foo' was used before it was defined.")
        .addError(18, "'fn1' was used before it was defined.")
        .addError(26, "'baz' was used before it was defined.")
        .addError(34, "'fn' was used before it was defined.")
        .addError(41, "'q' was used before it was defined.")
        .addError(46, "'h' was used before it was defined.")
        .test(src, { latedef: true, undef: false });

    // If we warn on both options we get all the warnings.
    TestRun()
        .addError(5, "'func2' was used before it was defined.")
        .addError(12, "'foo' was used before it was defined.")
        .addError(18, "'fn1' was used before it was defined.")
        .addError(26, "'baz' was used before it was defined.")
        .addError(29, "'hello' is not defined.")
        .addError(34, "'fn' was used before it was defined.")
        .addError(35, "'world' is not defined.")
        .addError(41, "'q' was used before it was defined.")
        .addError(46, "'h' was used before it was defined.")
        .test(src, { latedef: true, undef: true });
};

exports.undefwstrict = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/undefstrict.js', 'utf8');
    TestRun().test(src, { undef: false });
};

/**
 * The `proto` and `iterator` options allow you to prohibit the use of the
 * special `__proto__` and `__iterator__` properties, respectively.
 */
exports.testProtoAndIterator = function () {
    var source = fs.readFileSync(__dirname + '/fixtures/protoiterator.js', 'utf8');
    var json = '{"__proto__": true, "__iterator__": false, "_identifier": null, "property": 123}';

    // JSHint should not allow the `__proto__` and
    // `__iterator__` properties by default
    TestRun()
        .addError(7, "The '__proto__' property is deprecated.")
        .addError(8, "The '__proto__' property is deprecated.")
        .addError(10, "The '__proto__' property is deprecated.")
        .addError(27, "'__iterator__' is only available in JavaScript 1.7.")
        .addError(33, "The '__proto__' property is deprecated.")
        .addError(37, "The '__proto__' property is deprecated.")
        .test(source);

    TestRun()
        .addError(1, "The '__proto__' key may produce unexpected results.")
        .addError(1, "The '__iterator__' key may produce unexpected results.")
        .test(json);

    // Should not report any errors when proto and iterator
    // options are on
    TestRun("source").test(source, { proto: true, iterator: true });
    TestRun("json").test(json, { proto: true, iterator: true });
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
    TestRun().test(src);
    TestRun().test(src1);

    // Require all blocks to be wrapped with curly braces if curly is true
    TestRun()
        .addError(2, "Expected '{' and instead saw 'return'.")
        .addError(5, "Expected '{' and instead saw 'doSomething'.")
        .addError(8, "Expected '{' and instead saw 'doSomething'.")
        .test(src, { curly: true });

    TestRun().test(src1, { curly: true });
};

/** Option `noempty` prohibits the use of empty blocks. */
exports.noempty = function () {
    var code = 'for (;;) {}';

    // By default, tolerate empty blocks since they are valid JavaScript
    TestRun().test(code);

    // Do not tolerate, when noempty is true
    TestRun()
        .addError(1, 'Empty block.')
        .test(code, { noempty: true });
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
    TestRun().test(src);

    // Do not tolerate both .callee and .caller when noarg is true
    TestRun()
        .addError(2, 'Avoid arguments.callee.')
        .addError(6, 'Avoid arguments.caller.')
        .test(src, { noarg: true });
};

/** Option `nonew` prohibits the use of constructors for side-effects */
exports.nonew = function () {
    var code  = "new Thing();",
        code1 = "var obj = new Thing();";

    TestRun().test(code);
    TestRun().test(code1);

    TestRun()
        .addError(1, "Do not use 'new' for side effects.")
        .test(code, { nonew: true });
};

// Option `asi` allows you to use automatic-semicolon insertion
exports.asi = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/asi.js', 'utf8');

    TestRun(1)
        .addError(2, "Missing semicolon.")
        .addError(4, "Line breaking error 'return'.")
        .addError(4, "Missing semicolon.")
        .addError(5, "Missing semicolon.")
        .addError(9, "Line breaking error 'continue'.")
        .addError(9, "Missing semicolon.")
        .addError(10, "Missing semicolon.")
        .addError(11, "Line breaking error 'break'.")
        .addError(11, "Missing semicolon.")
        .addError(12, "Missing semicolon.")
        .addError(16, "Missing semicolon.")
        .addError(17, "Line breaking error 'return'.")
        .addError(17, "Missing semicolon.")
        .addError(19, "Line breaking error 'break'.")
        .addError(19, "Missing semicolon.")
        .addError(21, "Line breaking error 'break'.")
        .addError(21, "Missing semicolon.")
        .addError(25, "Missing semicolon.")
        .addError(26, "Missing semicolon.", { character: 10 })
        .addError(27, "Missing semicolon.", { character: 12 })
        .addError(28, "Missing semicolon.", { character: 12 })
        .test(src);

    TestRun(2)
        .addError(2, "Missing semicolon.") // throw on "use strict", even option asi is used
        .test(src, { asi: true });
};

/** Option `lastsemic` allows you to skip the semicolon after last statement in a block,
  * if that statement is followed by the closing brace on the same line. */
exports.lastsemic = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/lastsemic.js', 'utf8');

    // without lastsemic
    TestRun()
        .addError(2, "Missing semicolon.") // missing semicolon in the middle of a block
        .addError(4, "Missing semicolon.") // missing semicolon in a one-liner function
        .addError(5, "Missing semicolon.") // missing semicolon at the end of a block
        .test(src);

    // with lastsemic
    TestRun()
        .addError(2, "Missing semicolon.")
        .addError(5, "Missing semicolon.")
        .test(src, { lastsemic: true });
    // this line is valid now: [1, 2, 3].forEach(function(i) { print(i) });
    // line 5 isn't, because the block doesn't close on the same line

    // it shouldn't interfere with asi option
    TestRun().test(src, { lastsemic: true, asi: true });
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

    for (var i = 0, exp; exp = exps[i]; i += 1) {
        TestRun()
            .addError(1, 'Expected an assignment or function call and instead saw an expression.')
            .test(exp);
    }

    for (i = 0, exp = null; exp = exps[i]; i += 1) {
        TestRun().test(exp, { expr: true });
    }
};

/** Option `undef` requires you to always define variables you use */
exports.undef = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/undef.js', 'utf8');

    // Make sure there are no other errors
    TestRun().test(src);

    // Make sure it fails when undef is true
    TestRun()
        .addError(1, "'undef' is not defined.")
        .addError(5, "'undef' is not defined.")
        .addError(6, "'undef' is not defined.")
        .addError(8, "'undef' is not defined.")
        .addError(9, "'undef' is not defined.")
        .addError(13, "'localUndef' is not defined.")
        .addError(18, "'localUndef' is not defined.")
        .addError(19, "'localUndef' is not defined.")
        .addError(21, "'localUndef' is not defined.")
        .addError(22, "'localUndef' is not defined.")
        .test(src, { undef: true });
};

/** Option `scripturl` allows the use of javascript-type URLs */
exports.scripturl = function () {
    var code = [
            "var foo = { 'count': 12, 'href': 'javascript:' };",
            "foo = 'javascript:' + 'xyz';"
        ],
        src = fs.readFileSync(__dirname + '/fixtures/scripturl.js', 'utf8');

    // Make sure there is an error
    TestRun()
        .addError(1, "Script URL.")
        .addError(2, "Script URL.") // 2 times?
        .addError(2, "JavaScript URL.")
        .test(code);

    // Make sure the error goes away when javascript URLs are tolerated
    TestRun().test(code, { scripturl: true });

    // Make sure an error exists for labels that look like URLs
    TestRun()
        .addError(2, "Label 'javascript' looks like a javascript url.")
        .test(src);

    // Make sure the label error exists even if javascript URLs are tolerated
    TestRun()
        .addError(2, "Label 'javascript' looks like a javascript url.")
        .test(src, { scripturl: true });
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
    var msg = 'The body of a for in should be wrapped in an if statement to filter unwanted ' +
              'properties from the prototype.';

    // Make sure there are no other errors
    TestRun().test(src);

    // Make sure it fails when forin is true
    TestRun()
        .addError(13, msg)
        .test(src, { forin: true });
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
    TestRun()
        .addError(2, "Don't make functions within a loop.")
        .addError(6, "Don't make functions within a loop.")
        .addError(10, "Function declarations should not be placed in blocks. Use a function " +
                      "expression or move the statement to the top of the outer function.")
        .test(src);

    // When loopfunc is true, only function declaration should fail.
    // Expressions are okay.
    TestRun()
        .addError(10, "Function declarations should not be placed in blocks. Use a function " +
                      "expression or move the statement to the top of the outer function.")
        .test(src, { loopfunc: true });
};

/** Option `boss` unlocks some useful but unsafe features of JavaScript. */
exports.boss = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/boss.js', 'utf8');

    // By default, warn about suspicious assignments
    TestRun()
        .addError(1, 'Expected a conditional expression and instead saw an assignment.')
        .addError(4, 'Expected a conditional expression and instead saw an assignment.')
        .addError(7, 'Expected a conditional expression and instead saw an assignment.')
        .addError(12, 'Expected a conditional expression and instead saw an assignment.')
        .test(src);

    // But if you are the boss, all is good
    TestRun().test(src, { boss: true });
};

/**
 * Options `eqnull` allows you to use '== null' comparisons.
 * It is useful when you want to check if value is null _or_ undefined.
 */
exports.eqnull = function () {
    var code = [
        'if (e == null) doSomething();'
      , 'if (null == e) doSomething();'
      , 'if (e != null) doSomething();'
      , 'if (null != e) doSomething();'
    ];

    // By default, warn about `== null` comparison
    TestRun()
        .addError(1, "Use '===' to compare with 'null'.")
        .addError(2, "Use '===' to compare with 'null'.")
        .addError(3, "Use '!==' to compare with 'null'.")
        .addError(4, "Use '!==' to compare with 'null'.")
        .test(code);

    // But when `eqnull` is true, no questions asked
    TestRun().test(code, { eqnull: true });

    // Make sure that `eqnull` has precedence over `eqeqeq`
    TestRun().test(code, { eqeqeq: true, eqnull: true });
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

    TestRun()
        .addError(1, "Weird construction. Delete 'new'.")
        .addError(9, "Missing '()' invoking a constructor.")
        .addError(11, "Missing '()' invoking a constructor.")
        .test(src);

    TestRun().test(src, { supernew: true });
};

/** Option `bitwise` disallows the use of bitwise operators. */
exports.bitwise = function () {
    var ops = [ '&', '|', '^', '<<', '>>', '>>>' ];
    var moreTests = [
        'var c = ~a;',
        'c &= 2;'
    ];

    // By default allow bitwise operators
    for (var i = 0, op; op = ops[i]; i += 1) {
        TestRun().test('var c = a ' + op + ' b;');
    }
    TestRun().test(moreTests);

    for (i = 0, op = null; op = ops[i]; i += 1) {
        TestRun()
            .addError(1, "Unexpected use of '" + op + "'.")
            .test('var c = a ' + op + ' b;', { bitwise: true });
    }
    TestRun()
        .addError(1, "Unexpected '~'.")
        .addError(2, "Unexpected use of '&='.")
        .test(moreTests, { bitwise: true });
};

/** Option `debug` allows the use of debugger statements. */
exports.debug = function () {
    var code = 'function test () { debugger; return true; }';

    // By default disallow debugger statements.
    TestRun()
        .addError(1, "All 'debugger' statements should be removed.")
        .test(code);

    // But allow them if debug is true.
    TestRun().test(code, { debug: true });
};

/** Option `eqeqeq` requires you to use === all the time. */
exports.eqeqeq = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/eqeqeq.js', 'utf8');

    TestRun()
        .addError(8, "Use '===' to compare with 'null'.")
        .test(src);

    TestRun()
        .addError(2, "Expected '===' and instead saw '=='.")
        .addError(5, "Expected '!==' and instead saw '!='.")
        .addError(8, "Expected '===' and instead saw '=='.")
        .test(src, { eqeqeq: true });
};

/** Option `evil` allows the use of eval. */
exports.evil = function () {
    var src = [
        "eval('hey();');",
        "document.write('');",
        "document.writeln('');",
        "window.execScript('xyz');",
        "new Function('xyz();');",
        "setTimeout('xyz();', 2);",
        "setInterval('xyz();', 2);",
        "var t = document['eval']('xyz');"
    ];

    TestRun()
        .addError(1, "eval is evil.")
        .addError(2, "document.write can be a form of eval.")
        .addError(3, "document.write can be a form of eval.")
        .addError(4, "eval is evil.")
        .addError(5, "The Function constructor is eval.")
        .addError(6, "Implied eval is evil. Pass a function instead of a string.")
        .addError(7, "Implied eval is evil. Pass a function instead of a string.")
        .addError(8, "eval is evil.")
        .test(src, { browser: true });

    TestRun().test(src, { evil: true, browser: true });
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

    TestRun().test(src);

    TestRun()
        .addError(3, "Wrap an immediate function invocation in parentheses " +
                     "to assist the reader in understanding that the expression " +
                     "is the result of a function, and not the function itself.")
        .addError(7, "Move the invocation into the parens that contain the function.")
        .addError(13, "Do not wrap function literals in parens unless they are to " +
                      "be immediately invoked.")
        .test(src, { immed: true });
};

/** Option `nomen` disallows variable names with dangling '_'. */
exports.nomen = function () {
    var names = [ '_hey', 'hey_' ];

    for (var i = 0, name; name = names[i]; i += 1) {
        TestRun().test('var ' + name + ';');
    }

    for (i = 0, name = null; name = names[i]; i += 1) {
        TestRun()
            .addError(1, "Unexpected dangling '_' in '" + name + "'.")
            .test('var ' + name + ';', { nomen: true });
    }

    // Normal names should pass all the time
    TestRun().test('var hey;');
    TestRun().test('var hey;', { nomen: true });

    // node globals
    TestRun()
        .addError(1, "Unexpected dangling '_' in '_x'.")
        .test('var x = top._x + __dirname + __filename;', { node: true, nomen: true });

};

/** Option `passfail` tells JSHint to stop at the first error. */
exports.passfail = function () {
    var code = [
        'one()'
      , 'two()'
      , 'three()'
    ];

    TestRun()
        .addError(1, "Missing semicolon.")
        .addError(2, "Missing semicolon.")
        .addError(3, "Missing semicolon.")
        .test(code);

    TestRun()
        .addError(1, "Missing semicolon.")
        .test(code, { passfail: true });
};

/**
 * Option `onevar` allows you to use only one var statement
 * per function. Don't ask me why.
 */
exports.onevar = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/onevar.js', 'utf8');

    TestRun().test(src);
    TestRun()
        .addError(10, "Too many var statements.")
        .test(src, { onevar: true });
};

/** Option `plusplus` prohibits the use of increments/decrements. */
exports.plusplus = function () {
    var ops = [ '++', '--' ];

    for (var i = 0, op; op = ops[i]; i += 1) {
        TestRun().test('var i = j' + op + ';');
        TestRun().test('var i = ' + op + 'j;');
    }

    for (i = 0, op = null; op = ops[i]; i += 1) {
        TestRun()
            .addError(1, "Unexpected use of '" + op + "'.")
            .test('var i = j' + op + ';', { plusplus: true });

        TestRun()
            .addError(1, "Unexpected use of '" + op + "'.")
            .test('var i = ' + op + 'j;', { plusplus: true });
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

    TestRun().test(src); // By default, everything is fine

    // When newcap is true, enforce the conventions
    TestRun()
        .addError(1, 'A constructor name should start with an uppercase letter.')
        .addError(5, "Missing 'new' prefix when invoking a constructor.")
        .test(src, { newcap: true });
};

/** Option `sub` allows all forms of subscription. */
exports.sub = function () {
    TestRun()
        .addError(1, "['prop'] is better written in dot notation.")
        .test("window.obj = obj['prop'];");

    TestRun().test("window.obj = obj['prop'];", { sub: true });
};

/** Option `strict` requires you to use "use strict"; */
exports.strict = function () {
    var code  = "(function () { return; }());";
    var code1 = '(function () { "use strict"; return; }());';
    var src = fs.readFileSync(__dirname + '/fixtures/strict_violations.js', 'utf8');
    var src2 = fs.readFileSync(__dirname + '/fixtures/strict_incorrect.js', 'utf8');

    TestRun().test(code);
    TestRun().test(code1);

    TestRun()
        .addError(1, 'Missing "use strict" statement.')
        .test(code, { strict: true });

    TestRun().test(code1, { strict: true });

    // Test for strict mode violations
    TestRun()
        .addError(4, 'Possible strict violation.')
        .addError(7, 'Strict violation.')
        .addError(8, 'Strict violation.')
        .test(src, { strict: true });

    TestRun()
        .addError(4, 'Expected an assignment or function call and instead saw an expression.')
        .addError(9, 'Missing semicolon.')
        .addError(28, 'Expected an assignment or function call and instead saw an expression.')
        .addError(53, 'Expected an assignment or function call and instead saw an expression.')
        .test(src2, { strict: false });
};

/** Option `globalstrict` allows you to use global "use strict"; */
exports.globalstrict = function () {
    var code = [
        '"use strict";'
      , 'function hello() { return; }'
    ];

    TestRun()
        .addError(1, 'Use the function form of "use strict".')
        .test(code, { strict: true });

    TestRun().test(code, { globalstrict: true });

    // Check that globalstrict also enabled strict
    TestRun()
        .addError(1, 'Missing "use strict" statement.')
        .test(code[1], { globalstrict: true });

    // Don't enforce "use strict"; if strict has been explicitly set to false
    TestRun().test(code[1], { globalstrict: true, strict: false });
};

/** Option `regexp` disallows the use of . and [^...] in regular expressions. */
exports.regexp = function () {
    var code = [
        'var a = /hey/;'
      , 'var a = /h.ey/;'
      , 'var a = /h[^...]/;'
    ];

    for (var i = 0, st; st = code[i]; i += 1) {
        TestRun().test(code);
    }

    TestRun().test(code[0], { regexp: true });

    TestRun()
        .addError(1, "Insecure '.'.")
        .test(code[1], { regexp: true });

    TestRun()
        .addError(1, "Insecure '^'.")
        .test(code[2], { regexp: true });
};

/** Option `laxbreak` allows you to insert newlines before some operators. */
exports.laxbreak = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/laxbreak.js', 'utf8');

    TestRun()
        .addError(2, "Bad line breaking before ','.")
        .addError(12, "Bad line breaking before ','.")
        .test(src);

    var ops = [ '||', '&&', '*', '/', '%', '+', '-', '>=',
                '==', '===', '!=', '!==', '>', '<', '<=', 'instanceof' ];

    for (var i = 0, op, code; op = ops[i]; i += 1) {
        code = ['var a = b ', op + ' c;'];
        TestRun()
            .addError(2, "Bad line breaking before '" + op + "'.")
            .test(code);

        TestRun().test(code, { laxbreak: true });
    }

    code = [ 'var a = b ', '? c : d;' ];
    TestRun()
        .addError(2, "Bad line breaking before '?'.")
        .test(code);

    TestRun().test(code, { laxbreak: true });
};

exports.white = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/white.js', 'utf8');

    TestRun().test(src);
    TestRun()
        .addError(1, "Unexpected space after 'hello'.", { character: 15 })
        .addError(2, "Unexpected space after 'true'.", { character: 16 })
        .addError(5, "Missing space after 'function'.")
        .addError(6, "Missing space after 'if'.")
        .addError(6, "Missing space after ')'.")
        .addError(14, "Unexpected space after 'true'.", { character: 16 })
        .addError(15, "Missing space after ':'.")
        .addError(18, "Unexpected space after '('.", { character: 9 })
        .addError(18, "Unexpected space after 'ex'.", { character: 12 })
        .addError(55, "Missing space after ','.") // 2 times?
        .addError(56, "Missing space after '1'.")
        .addError(58, "Unexpected space before 'b'.")
        .addError(58, "Unexpected space after 'a'.")
        .addError(60, "Unexpected space before 'c'.")
        .addError(62, "Expected 'var' to have an indentation at 1 instead at 2.")
        .addError(64, "Unexpected space after 'nodblwarnings'.", { character: 23 })
        .addError(64, "Unexpected space after '('.", { character: 25 })
        .test(src, { white: true });
};

exports.trailing = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/white.js', 'utf8');

    TestRun().test(src);

    TestRun()
        .addError(8, "Trailing whitespace.")
        .addError(9, "Trailing whitespace.")
        .test(src, { trailing: true });
};

exports.regexdash = function () {
    var code = [
        'var a = /[-ab]/;'
      , 'var b = /[ab-]/;'
      , 'var c = /[a-c-e]/;'
      , 'var d = /[\\s-\\d]/;'
      , 'var e = /[\\s-]/;'
      , 'var f = /[-\\d]/;'
      , 'var g = /[a-]/;'
      , 'var h = /[-z]/;'
      , 'var g = /[a-\\w]/;'
      , 'var h = /[\\d-z]/;'
      , 'var i = /[^-ab]/;'
      , 'var j = /[^ab-]/;'
    ];

    // Default behavior
    TestRun()
        .addError(1, "Unescaped '-'.")
        .addError(2, "Unescaped '-'.")
        .addError(3, "Unescaped '-'.")
        .addError(4, "Unescaped '-'.")
        .addError(5, "Unescaped '-'.")
        .addError(6, "Unescaped '-'.")
        .addError(7, "Unescaped '-'.")
        .addError(8, "Unescaped '-'.")
        .addError(9, "Unescaped '-'.")
        .addError(10, "Unescaped '-'.")
        .addError(11, "Unescaped '-'.")
        .addError(12, "Unescaped '-'.")
        .test(code);

    // Regex dash is on
    TestRun()
        .addError(3, "Unescaped '-'.")
        .addError(4, "Unescaped '-'.")
        .addError(9, "Unescaped '-'.")
        .addError(10, "Unescaped '-'.")
        .test(code, { regexdash: true });
};

exports.onecase = function () {
    var code = "switch (a) { case '1': b(); }";

    TestRun()
        .addError(1, "This 'switch' should be an 'if'.")
        .test(code);

    TestRun().test(code, { onecase: true });
};

exports.validthis = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/strict_this.js', 'utf8');

    TestRun()
        .addError(8, "Possible strict violation.")
        .addError(9, "Possible strict violation.")
        .addError(11, "Possible strict violation.")
        .test(src);

    src = fs.readFileSync(__dirname + '/fixtures/strict_this2.js', 'utf8');
    TestRun().test(src);

    // Test for erroneus use of validthis

    var code = ['/*jshint validthis:true */', 'hello();'];
    TestRun()
        .addError(1, "Option 'validthis' can't be used in a global scope.")
        .test(code);

    code = ['function x() {', '/*jshint validthis:heya */', 'hello();', '}'];
    TestRun()
        .addError(2, "Bad option value.")
        .test(code);
};

exports.indentation = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/indent.js', 'utf8');

    TestRun()
        .addError(5, "Mixed spaces and tabs.")
        .addError(6, "Mixed spaces and tabs.")
        .test(src);

    TestRun()
        .addError(5, "Mixed spaces and tabs.")
        .addError(6, "Mixed spaces and tabs.")
        .test(src, { indent: 4, white: true });

    TestRun()
        .addError(5, "Mixed spaces and tabs.")
        .addError(5, "Expected 'var' to have an indentation at 5 instead at 7.")
        .addError(6, "Mixed spaces and tabs.")
        .addError(6, "Expected 'var' to have an indentation at 5 instead at 7.")
        .addError(7, "Expected '}' to have an indentation at 3 instead at 5.")
        .test(src, { indent: 2, white: true });
};

/*
 * Test string relevant options
 *   multistr    allows multiline strings
 */
exports.strings = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/strings.js', 'utf8');

    TestRun()
        .addError(9, "Unclosed string.")
        .addError(10, "Unclosed string.")
        .addError(15, "Unclosed string.")
        .test(src, { multistr: true });

    TestRun()
        .addError(3, "Bad escapement of EOL. Use option multistr if needed.")
        .addError(4, "Bad escapement of EOL. Use option multistr if needed.")
        .addError(9, "Unclosed string.")
        .addError(10, "Unclosed string.")
        .addError(14, "Bad escapement of EOL. Use option multistr if needed.")
        .addError(15, "Unclosed string.")
        .test(src);
};

exports.scope = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/scope.js', 'utf8');

    TestRun(1)
        .addError(11, "'j' used out of scope.") // 3x
        .addError(12, "'x' used out of scope.")
        .addError(20, "'aa' used out of scope.")
        .addError(27, "'bb' used out of scope.")
        .addError(32, "'bb' is not defined.")
        .addError(36, "'bb' is not defined.")
        .addError(37, "'cc' is not defined.")
        .addError(42, "'bb' is not defined.")
        .test(src);

    TestRun(2)
        .addError(37, "'cc' is not defined.")
        .addError(42, "'bb' is not defined.")
        .test(src, { funcscope: true });
};

/*
 * Tests the `esnext` option
 */
exports.esnext = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/const.js', 'utf8');

    var code = [
        'const myConst = true;',
        'const foo = 9;',
        'var myConst = function () { };',
        'foo = "hello world";'
    ];

    TestRun()
        .addError(21, "const 'immutable4' is initialized to 'undefined'.")
        .test(src, { esnext: true });

    TestRun()
        .addError(3, "const 'myConst' has already been declared")
        .addError(4, "Attempting to override 'foo' which is a constant")
        .test(code, { esnext: true });
};

/*
 * Tests the `maxlen` option
 */
exports.maxlen = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/maxlen.js', 'utf8');

    TestRun()
        .addError(3, "Line too long.")
        .test(src, { maxlen: 23 });
};

exports.smarttabs = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/smarttabs.js', 'utf8');

    TestRun()
        .addError(4, "Mixed spaces and tabs.")
        .addError(5, "Mixed spaces and tabs.")
        .test(src);

    TestRun()
        .addError(5, "Mixed spaces and tabs.")
        .test(src, { smarttabs: true });
};
