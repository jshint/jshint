/**
 * Tests for all non-environmental options. Non-environmental options are
 * options that change how JSHint behaves instead of just pre-defining a set
 * of global variables.
 */

/*jshint boss: true, laxbreak: true, node: true */

var JSHINT = require('../jshint.js').JSHINT,
    helper = require("./testhelper").setup.testhelper,
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

    helper(JSHINT, src)
        // Do not tolerate variable shadowing by default
        .init(false)
        .run()
            .hasError(5, "'a' is already defined.")
            .hasError(10, "'foo' is already defined.")
        .end()
        
        // Allow variable shadowing when shadow is true
        .init(true, { shadow: true })
    ;
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

    helper(JSHINT)
        // By default, tolerate the use of variable before its definition
        .init(true, {}, src)
        
        // However, JSHint must complain if variable is actually missing
        .init(false, { undef: true }, 'fn()')
        .run()
            .hasError(1, "'fn' is not defined.")
            .hasError(1, "Missing semicolon.")
        .end()
        
        // And it also must complain about the redefinition (see option `shadow`)
        .init(false, { }, src1)
        
        // When latedef is true, JSHint must not tolerate the use before definition
        .init(false, { latedef: true }, src)
        .run()
            .hasError(2, "'fn' was used before it was defined.")
            .hasError(6, "'fn1' was used before it was defined.")
            .hasError(10, "'vr' was used before it was defined.")
        .end()
    ;
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

    helper(JSHINT)
        // By default, tolerate one-line blocks since they are valid JavaScript
        .init(true, {}, src)
        .init(true, {}, src1)
        
        // Require all blocks to be wrapped with curly braces if curly is true
        .init(false, { curly: true }, src)
        .run()
            .hasError(2, "Expected '{' and instead saw 'return'.")
            .hasError(5, "Expected '{' and instead saw 'doSomething'.")
            .hasError(8, "Expected '{' and instead saw 'doSomething'.")
        .end()
        
        .init(true, { curly: true }, src1)
    ;
};

/** Option `noempty` prohibits the use of empty blocks. */
exports.noempty = function () {
    var code = 'for (;;) {}';

    helper(JSHINT, code)
        // By default, tolerate empty blocks since they are valid JavaScript
        .init(true)
        
        // Do not tolerate, when noempty is true
        .init(false, { noempty: true })
        .run()
            .hasError(1, "Empty block.")
        .end()
    ;
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

    helper(JSHINT, src)
        // By default, tolerate both arguments.callee and arguments.caller
        .init(true)
        
        // Do not tolerate both .callee and .caller when noarg is true
        .init(false, { noarg: true })
        .run()
            .hasError(2, "Avoid arguments.callee.")
            .hasError(6, "Avoid arguments.caller.")
        .end()
    ;
};

/** Option `nonew` prohibits the use of constructors for side-effects */
exports.nonew = function () {
    var code  = "new Thing();",
        code1 = "var obj = new Thing();";

    helper(JSHINT)
        .init(true, {}, code)
        .init(true, {}, code1)
        
        .init(false, { nonew: true }, code)
        .run()
            .hasError(1, "Do not use 'new' for side effects.")
        .end()
        .init(true, { nonew: true }, code1)
    ;
};

/** Option `asi` allows you to use automatic-semicolon insertion */
exports.asi = function () {
    var code = 'hello()';

    helper(JSHINT, code)
        .init(false)
        .run()
            .hasError(1, "Missing semicolon.")
        .end()
        .init(true, { asi: true })
    ;
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
        helper(JSHINT, exp)
            .init(false)
            .run()
                .hasError(1, "Expected an assignment or function call and instead saw an expression.")
            .end()
            
            .init(true, { expr: true })
        ;
    }
};

/** Option `undef` requires you to always define variables you use */
exports.undef = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/undef.js', 'utf8');

    helper(JSHINT, src)
        // Make sure there are no other errors
        .init(true)
        
        // Make sure it fails when undef is true
        .init(false, { undef: true })
        .run()
            .hasError(1, "'undef' is not defined.")
            .hasError(6, "'localUndef' is not defined.")
        .end()
    ;
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

    helper(JSHINT, src)
        // Make sure there are no other errors
        .init(true)
        
        // Make sure it fails when forin is true
        .init(false, { forin: true })
        .run()
            .hasError(1, "The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype.")
        .end()
    ;
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

    helper(JSHINT, src)
        // By default, not functions are allowed inside loops
        .init(false)
        .run()
            .hasError(2, "Don't make functions within a loop.")
            .hasError(6, "Don't make functions within a loop.")
            .hasError(10, "Function declarations should not be placed in blocks. Use a function expression or move the statement to the top of the outer function.")
        .end()
        
        // When loopfunc is true, only function declaration should fail.
        // Expressions are okay.
        .init(false, { loopfunc: true })
        .run()
            .hasError(10, "Function declarations should not be placed in blocks. Use a function expression or move the statement to the top of the outer function.")
        .end()
    ;
};

/** Option `boss` unlocks some useful but unsafe features of JavaScript. */
exports.boss = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/boss.js', 'utf8');

    helper(JSHINT, src)
         // By default, warn about suspicious assignments
        .init(false)
        .run()
            .hasError(1, "Expected a conditional expression and instead saw an assignment.")
            .hasError(4, "Expected a conditional expression and instead saw an assignment.")
            .hasError(7, "Expected a conditional expression and instead saw an assignment.")
            .hasError(12, "Expected a conditional expression and instead saw an assignment.")
        .end()
        
        // But if you are the boss, all is good
        .init(true, { boss: true })
    ;
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

    helper(JSHINT, code)
        // By default, warn about `== null` comparison
        .init(false)
        .run()
            .hasError(1, "Use '===' to compare with 'null'.")
            .hasError(2, "Use '===' to compare with 'null'.")
        .end()
        
        // But when `eqnull` is true, no questions asked
        .init(true, { eqnull: true })
        
        // Make sure that `eqnull` has precedence over `eqeqeq`
        .init(true, { eqeqeq: true, eqnull: true })
    ;
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

    helper(JSHINT, src)
        .init(false)
        .run()
            .hasError(1, "Weird construction. Delete 'new'.")
            .hasError(9, "Missing '()' invoking a constructor.")
            .hasError(11, "Missing '()' invoking a constructor.")
        .end()
        
        .init(true, { supernew: true })
    ;
};

/** Option `bitwise` disallows the use of bitwise operators. */
exports.bitwise = function () {
    var ops = [ '&', '|', '^', '<<' , '>>', '>>>' ];

    // By default allow bitwise operators
    helper(JSHINT, 'var c = ~a;')
        .init(true)
        .init(false, { bitwise: true })
        .run()
            .hasError(1, "Unexpected '~'.")
        .end()
    ;
    for (var i = 0, op; op = ops[i]; i++) {
        helper(JSHINT)
            .init(true, {}, 'var c = a ' + op + ' b;')
            .init(false, { bitwise: true }, 'var c = a ' + op + ' b;')
            .run()
                .hasError(1, "Unexpected use of '" + op + "'.")
            .end()
        ;
    }
};

/** Option `debug` allows the use of debugger statements. */
exports.debug = function () {
    var code = 'function test () { debugger; return true; }';

    helper(JSHINT, code)
        // By default disallow debugger statements.
        .init(false)
        .run()
            .hasError(1, "All 'debugger' statements should be removed.")
        .end()
        
        // But allow them if debug is true.
        .init(true, { debug: true })
    ;
};

/** Option `eqeqeq` requires you to use === all the time. */
exports.eqeqeq = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/eqeqeq.js', 'utf8');

    helper(JSHINT, src)
        // Only == null should fail
        .init(false)
        .run()
            .hasError(8, "Use '===' to compare with 'null'.")
        .end()
        
        // All relations in that file should fail
        .init(false, { eqeqeq: true })
        .run()
            .hasError(2, "Expected '===' and instead saw '=='.")
            .hasError(5, "Expected '!==' and instead saw '!='.")
            .hasError(8, "Expected '===' and instead saw '=='.")
        .end()
    ;
};

/** Option `evil` allows the use of eval. */
exports.evil = function () {
    var src = "eval('hey();');";

    helper(JSHINT, src)
        .init(false)
        .run()
            .hasError(1, "eval is evil.")
        .end()
        
        .init(true, { evil: true })
    ;
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

    helper(JSHINT, src)
        .init(true)
        .init(false, { immed: true })
        .run()
            .hasError(3, "Wrap an immediate function invocation in parentheses " +
                    "to assist the reader in understanding that the expression " +
                    "is the result of a function, and not the function itself.")
            .hasError(7, "Move the invocation into the parens that contain the function.")
        .end()
    ;
};

/** Option `nomen` disallows variable names with dangling '_'. */
exports.nomen = function () {
    var names = [ '_hey', 'hey_' ];

    for (var i = 0, name; name = names[i]; i++) {
        helper(JSHINT, 'var ' + name + ';')
            .init(true)
            .init(false, { nomen: true })
            .run()
                .hasError(1, "Unexpected dangling '_' in '" + name + "'.")
            .end()
        ;
    }
    
    helper(JSHINT, 'var hey;')
        .init(true)
        .init(true, { nomen: true })
    ;
};

/** Option `passfail` tells JSHint to stop at the first error. */
exports.passfail = function () {
    var code = [
        'one()'
      , 'two()'
      , 'three()'
    ];

    helper(JSHINT, code)
        .init(false)
        .run()
            .hasError(1, "Missing semicolon.")
            .hasError(2, "Missing semicolon.")
            .hasError(3, "Missing semicolon.")
        .end()
        .init(false, { passfail: true })
        .run()
            .hasError(1, "Missing semicolon.")
        .end()
    ;
};

/**
 * Option `onevar` allows you to use only one var statement
 * per function. Don't ask me why.
 */
exports.onevar = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/onevar.js', 'utf8');

    helper(JSHINT, src)
        .init(true)
        .init(false, { onevar: true })
        .run()
            .hasError(10, "Too many var statements.")
        .end()
    ;
};

/** Option `plusplus` prohibits the use of increments/decrements. */
exports.plusplus = function () {
    var ops = [ '++', '--' ];

    for (var i = 0, op; op = ops[i]; i++) {
        helper(JSHINT)
            .init(true, {}, 'var i = j' + op + ';')
            .init(true, {}, 'var i = ' + op + 'j;')
            .init(false, { plusplus: true }, 'var i = j' + op + ';')
            .run()
                .hasError(1, "Unexpected use of '" + op + "'.")
            .end()
            .init(false, { plusplus: true }, 'var i = ' + op + 'j;')
            .run()
                .hasError(1, "Unexpected use of '" + op + "'.")
            .end()
        ;
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

    helper(JSHINT, src)
        // By default, everything is fine
        .init(true)
        
        // When newcap is true, enforce the conventions
        .init(false, { newcap: true })
        .run()
            .hasError(1, "A constructor name should start with an uppercase letter.")
            .hasError(5, "Missing 'new' prefix when invoking a constructor.")
        .end()
    ;
};

/** Option `sub` allows all forms of subscription. */
exports.sub = function () {
    helper(JSHINT, "window.obj = obj['prop'];")
        .init(false)
        .run()
            .hasError(1, "['prop'] is better written in dot notation.")
        .end()
        
        .init(true, { sub: true })
    ;
};

/** Option `strict` requires you to use "use strict"; */
exports.strict = function () {
    var code  = "(function () { return; }());",
        code1 = '(function () { "use strict"; return; }());';

    helper(JSHINT)
        .init(true, {}, code)
        .init(true, {}, code1)
        
        .init(false, { strict: true }, code)
        .run()
            .hasError(1, 'Missing "use strict" statement.')
        .end()
        
        .init(true, { strict: true }, code1)
    ;
};

/** Option `globalstrict` allows you to use global "use strict"; */
exports.globalstrict = function () {
    var code = [
        '"use strict";'
      , 'function hello() { return; }'
    ];

    helper(JSHINT, code)
        .init(false, { strict: true })
        .run()
            .hasError(1, 'Use the function form of "use strict".')
        .end()
        
        .init(true, { globalstrict: true })
        
        // Check that globalstrict also enabled strict
        .init(false, { globalstrict: true }, code[1])
        .run()
            .hasError(1, 'Missing "use strict" statement.')
        .end()
    ;
};

/** Option `regexp` disallows the use of . and [^...] in regular expressions. */
exports.regexp = function () {
    var code = [
        'var a = /hey/;'
      , 'var a = /h.ey/;'
      , 'var a = /h[^...]/;'
    ];
    for (var i = 0, st; st = code[i]; i++) {
        helper(JSHINT)
            .init(true, {}, code)
        ;
    }
    
    helper(JSHINT)
        .init(true, { regexp: true }, code[0])
        .init(false, { regexp: true }, code[1])
        .run()
            .hasError(1, "Insecure '.'.")
        .end()
        .init(false, { regexp: true }, code[2])
        .run()
            .hasError(1, "Insecure '^'.")
        .end()
    ;
};

/** Option `laxbreak` allows you to insert newlines before some operators. */
exports.laxbreak = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/laxbreak.js', 'utf8');

    helper(JSHINT, src)
        .init(false)
        .run()
            .hasError(2, "Bad line breaking before ','.")
            .hasError(12, "Bad line breaking before ','.")
        .end()
    ;
    var ops = [ '||', '&&', '*', '/', '%', '+', '-', '>=',
                '==', '===', '!=', '!==', '>', '<', '<=', 'instanceof' ];

    for (var i = 0, op, code; op = ops[i]; i++) {
        code = ['var a = b ', op + ' c;'];
        
        helper(JSHINT, code)
            .init(false)
            .run()
                .hasError(2, "Bad line breaking before '" + op + "'.")
            .end()
        
            .init(true, { laxbreak: true })
        ;
    }

    code = [ 'var a = b ', '? c : d;' ];
    helper(JSHINT, code)
        .init(false)
        .run()
            .hasError(2, "Bad line breaking before '?'.")
        .end()
        
        .init(true, { laxbreak: true })
    ;
};

exports.white = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/white.js', 'utf8');

    helper(JSHINT, src)
        .init(true)
        .init(false, { white: true })
        .run()
            .hasError(1, "Unexpected space after 'hello'.")
            .hasError(2, "Unexpected space after 'true'.")
            .hasError(5, "Missing space after 'function'.")
            .hasError(6, "Missing space after 'if'.")
            .hasError(6, "Missing space after ')'.")
            .hasError(14, "Unexpected space after 'true'.")
            .hasError(15, "Missing space after ':'.")
            .hasError(18, "Unexpected space after '('.")
            .hasError(18, "Unexpected space after 'ex'.")
        .end()
    ;
};

exports.trailing = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/white.js', 'utf8');

    helper(JSHINT, src)
        .init(true)
        .init(false, { trailing: true })
        .run()
            .hasError(7, "Trailing whitespace.")
            .hasError(9, "Trailing whitespace.")
        .end()
    ;
};