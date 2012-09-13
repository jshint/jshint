/*jshint boss: true, laxbreak: true, node: true, devel: true */

var JSHINT  = require('../../jshint.js').JSHINT,
    assert  = require('assert'),
    fs      = require('fs'),
    TestRun = require("../helpers/testhelper").setup.testRun;

/** JSHint must pass its own check */
exports.checkJSHint = function () {
    var res = JSHINT(fs.readFileSync(__dirname + "/../../jshint.js", "utf8"), {});

    if (!res) {
        console.log("file: jshint.js");
        console.log(JSHINT.errors);
    }

    assert.ok(res);
    assert.isUndefined(JSHINT.data().implieds);
};

/** Rhino wrapper must pass JSHint check */
exports.checkRhino = function () {
    var src = fs.readFileSync(__dirname + "/../../env/rhino.js", "utf8");
    TestRun("jshint-rhino").test(src);
};

/* JavaScriptCore wrapper must pass JSHint check */
exports.checkJSC = function () {
    var src = fs.readFileSync(__dirname + "/../../env/jsc.js", "utf8");
    TestRun().test(src);
};

/** All test files must pass JSHint check */
exports.checkTestFiles = function () {
    // test all files in /tests and all direct subfolders of /tests.
    var root = __dirname + '/..';
    var path = require("path");

    function testFiles(dir, isRoot) {
        var filesAndFolders = fs.readdirSync(dir);

        for (var i = 0, l = filesAndFolders.length; i < l; i += 1) {
            var name = filesAndFolders[i];
            var p = path.join(dir, name);
            var stat;

            try {
                stat = fs.statSync(p);
            } catch (ex) {
                continue;
            }

            if (stat.isFile(p)) {
                var src = fs.readFileSync(p, 'utf8'),
                    res = JSHINT(src, {
                        bitwise: true,
                        eqeqeq: true,
                        forin: true,
                        immed: true,
                        latedef: true,
                        laxcomma: true,
                        newcap: false,
                        noarg: true,
                        noempty: true,
                        nonew: true,
                        plusplus: true,
                        regexp: true,
                        undef: true,
                        strict: false,
                        trailing: true,
                        white: true
                    });

                if (!res) {
                    console.log("file: " + path.relative(root, p));
                    console.log(JSHINT.errors);
                }
                assert.ok(res);

                var implieds = JSHINT.data().implieds;
                if (implieds) {
                    console.log("implieds: " + implieds);
                    assert.isUndefined(implieds);
                }
            } else {
                if (isRoot) {
                    testFiles(p, false);
                }
            }
        }
    }

    testFiles(root, true);
};

/**
 * JSHint allows you to specify custom globals as a parameter to the JSHINT
 * function so it is not necessary to spam code with jshint-related comments
 */
exports.testCustomGlobals = function () {
    var code   = '(function () { return [ fooGlobal, barGlobal ]; }());',
        custom = { fooGlobal: false, barGlobal: false };

    assert.ok(JSHINT(code, {}, custom));

    var report = JSHINT.data();
    assert.isUndefined(report.implieds);
    assert.eql(report.globals.length, 2);

    var dict = {};
    for (var i = 0, g; g = report.globals[i]; i += 1)
        dict[g] = true;

    for (i = 0, g = null; g = custom[i]; i += 1)
        assert.ok(g in dict);
};

exports.testUnusedDefinedGlobals = function () {
    var src = fs.readFileSync(__dirname + "/fixtures/unusedglobals.js", "utf8");

    TestRun()
        .addError(2, "'bar' is defined but never used.")
        .test(src, { unused: true });
};

/** Test that JSHint recognizes `new Array(<expr>)` as a valid expression */
exports.testNewArray = function () {
    var code  = 'new Array(1);',
        code1 = 'new Array(v + 1);',
        code2 = 'new Array("hello", "there", "chaps");';

    TestRun().test(code);
    TestRun().test(code1);
    TestRun().test(code2);

    TestRun()
        .addError(1, "Use the array literal notation [].")
        .test('new Array();');
};

/** Test that JSHint recognizes `new foo.Array(<expr>)` as a valid expression #527 **/
exports.testNewNonNativeArray = function () {
    var code  = 'new foo.Array();',
        code1 = 'new foo.Array(1);',
        code2 = 'new foo.Array(v + 1);',
        code3 = 'new foo.Array("hello", "there", "chaps");';

    TestRun().test(code);
    TestRun().test(code1);
    TestRun().test(code2);
    TestRun().test(code3);
};

exports.testNonNativeArray = function () {
    var code1 = 'foo.Array();',
        code2 = 'foo.Array(v + 1);',
        code3 = 'foo.Array("hello", "there", "chaps");';

    TestRun().test(code1);
    TestRun().test(code2);
    TestRun().test(code3);
};


/** Test that JSHint recognizes `new Object(<expr>)` as a valid expression */
exports.testNewObject = function () {
    var code  = 'Object(1);',
        code1 = 'new Object(1);';

    TestRun().test(code);
    TestRun().test(code1);

    TestRun()
        .addError(1, "Use the object literal notation {}.")
        .test('Object();');

    TestRun()
        .addError(1, "Use the object literal notation {}.")
        .test('new Object();');
};

/** Test that JSHint recognizes `new foo.Object(<expr>)` as a valid expression #527 **/
exports.testNewNonNativeObject = function () {
    var code  = 'new foo.Object();',
        code1 = 'new foo.Object(1);',
        code2 = 'foo.Object();',
        code3 = 'foo.Object(1);';

    TestRun().test(code);
    TestRun().test(code1);
    TestRun().test(code2);
    TestRun().test(code3);
};


/**
 * Test that JSHint allows `undefined` to be a function parameter.
 * It is a common pattern to protect against the case when somebody
 * overwrites undefined. It also helps with minification.
 *
 * More info: https://gist.github.com/315916
 */
exports.testUndefinedAsParam = function () {
    var code  = '(function (undefined) {}());',
        code1 = 'var undefined = 1;';

    TestRun().test(code);
    // But it must never tolerate reassigning of undefined
    TestRun()
        .addError(1, "Expected an identifier and instead saw 'undefined' (a reserved word).")
        .test(code1);
};

/** Tests that JSHint accepts new line after a dot (.) operator */
exports.newLineAfterDot = function () {
    TestRun().test([ "chain().chain().", "chain();" ]);
};

/**
 * JSHint does not tolerate deleting variables.
 * More info: http://perfectionkills.com/understanding-delete/
 */
exports.noDelete = function () {
    TestRun()
        .addError(1, 'Variables should not be deleted.')
        .test('delete NullReference;');
};

/**
 * JSHint allows case statement fall through only when it is made explicit
 * using special comments.
 */
exports.switchFallThrough = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/switchFallThrough.js', 'utf8');
    TestRun()
        .addError(3, "Expected a 'break' statement before 'case'.")
        .addError(18, "Expected a 'break' statement before 'default'.")
        .addError(36, "Unexpected ':'.")
        .test(src);
};

exports.testVoid = function () {
    var code = [
        "void(0);"
      , "void 0;"
      , "var a = void(1);"
    ];
    TestRun().test(code);
};

exports.testMissingSpaces = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/missingspaces.js', 'utf8');
    TestRun()
        .addError(1, "Missing space after 'function'.", { character: 17 })
        .addError(2, "Missing space after 'b'.", { character: 6 })
        .addError(2, "Missing space after '='.", { character: 7 })
        .addError(2, "Missing space after ')'.", { character: 18 })
        .addError(3, "Missing space after 'd'.", { character: 6 })
        .addError(4, "Missing space after ')'.", { character: 13 })
        .addError(5, "Missing space after '1'.", { character: 13 })
        .addError(7, "Missing space after '2'.", { character: 10 })
        .addError(7, "Missing space after '+'.", { character: 11 })
        .addError(8, "Missing space after '/'.", { character: 14 })
        .addError(8, "Missing space after '+'.", { character: 15 })
        .addError(8, "Missing space after 'uid'.", { character: 20 })
        .addError(8, "Missing space after '+'.", { character: 21 })
        .addError(8, "Missing space after '/likes?access_token='.", { character: 43 })
        .addError(8, "Missing space after '+'.", { character: 44 })
        .test(src, { white: true });
};

exports.functionScopedOptions = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/functionScopedOptions.js', 'utf8');
    TestRun()
        .addError(1, "eval is evil.")
        .addError(8, "eval is evil.")
        .test(src);
};

/** JSHint should not only read jshint, but also jslint options */
exports.jslintOptions = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/jslintOptions.js', 'utf8');
    TestRun().test(src);
};

exports.jslintInverted = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/jslintInverted.js', 'utf8');
    TestRun().test(src);
};

exports.jslintRenamed = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/jslintRenamed.js', 'utf8');
    TestRun()
        .addError(4, "Expected '===' and instead saw '=='.")
        .test(src);
};

exports.caseExpressions = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/caseExpressions.js', 'utf8');
    TestRun()
        .addError(2, "This 'switch' should be an 'if'.")
        .test(src);
};

exports.returnStatement = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/return.js', 'utf8');

    TestRun()
        .addError(3, "Did you mean to return a conditional instead of an assignment?")
        .addError(38, "Line breaking error 'return'.")
        .test(src, { maxerr: 2 });
};

exports.globalDeclarations = function () {
    var src = 'exports = module.exports = function () {};';

    // Test should pass
    TestRun().test(src, { node: true }, { exports: true });

    // Test should pass as well
    src = [
        '/*jshint node:true */',
        '/*global exports:true */',
        'exports = module.exports = function () {};'
    ];

    TestRun().test(src.join('\n'));
};

exports.argsInCatchReused = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/trycatch.js', 'utf8');
    TestRun()
        .addError(6, "'e' is already defined.")
        .addError(12, "Do not assign to the exception parameter.")
        .addError(23, "'e' is not defined.")
        .test(src, { undef: true });
};

exports.testRawOnError = function () {
    JSHINT(';', { maxerr: 1 });
    assert.equal(JSHINT.errors[0].raw, 'Unnecessary semicolon.');
    assert.equal(JSHINT.errors[1].raw, 'Too many errors.');
    assert.equal(JSHINT.errors[2], null);
};

exports.yesEmptyStmt = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/emptystmt.js', 'utf8');

    TestRun()
        .addError(1, "Expected an identifier and instead saw ';'.")
        .addError(6, "Expected an assignment or function call and instead saw an expression.")
        .addError(10, "Unnecessary semicolon.")
        .addError(17, "Unnecessary semicolon.")
        .test(src, { curly: false });

    TestRun()
        .addError(1, "Expected an identifier and instead saw ';'.")
        .addError(10, "Unnecessary semicolon.")
        .addError(17, "Unnecessary semicolon.")
        .test(src, { curly: false, expr: true });
};

exports.insideEval = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/insideEval.js', 'utf8');

    TestRun()
        .addError(1, "eval is evil.")
        .addError(3, "eval is evil.")
        .addError(5, "eval is evil.")
        .addError(7, "eval is evil.")
        .addError(9, "eval is evil.")
        .addError(11, "Implied eval is evil. Pass a function instead of a string.")
        .addError(13, "Implied eval is evil. Pass a function instead of a string.")
        .addError(15, "Implied eval is evil. Pass a function instead of a string.")
        .addError(17, "Implied eval is evil. Pass a function instead of a string.")

        // The "TestRun" class (and these errors) probably needs some
        // facility for checking the expected scope of the error
        .addError(1, "Unexpected early end of program.")
        .addError(1, "Expected an identifier and instead saw '(end)'.")
        .addError(1, "Expected ')' and instead saw ''.")
        .addError(1, "Missing semicolon.")

        .test(src, { evil: false });
};

// Regression test for GH-394.
exports.noExcOnTooManyUndefined = function () {
    var code = 'a(); b();';

    try {
        JSHINT(code, {undef: true, maxerr: 1});
    } catch (e) {
        assert.ok(false, 'Exception was thrown');
    }

    TestRun()
        .addError(1, "'a' is not defined.")
        .test(code, { undef: true, maxerr: 1 });
};

exports.defensiveSemicolon = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/gh-226.js', 'utf8');

    TestRun()
        .addError(16, "Unnecessary semicolon.")
        .addError(17, "Unnecessary semicolon.")
        .test(src, { expr: true, laxbreak: true });
};

// Test different variants of IIFE
exports.iife = function () {
    var iife = [
        '(function () { return; }());',
        '(function () { return; })();'
    ];

    TestRun().test(iife.join('\n'));
};

// Tests invalid options when they're passed as function arguments
// For code that tests /*jshint ... */ see parser.js
exports.invalidOptions = function () {
    TestRun()
        .addError(0, "Bad option: 'invalid'.")
        .test("function test() {}", { devel: true, invalid: true });
};

exports.multilineArray = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/gh-334.js', 'utf8');

    TestRun().test(src);
};

exports.testInvalidSource = function () {
    TestRun()
        .addError(0, "Input is neither a string nor an array of strings.")
        .test(undefined);

    TestRun()
        .addError(0, "Input is neither a string nor an array of strings.")
        .test(null);

    TestRun()
        .addError(0, "Input is neither a string nor an array of strings.")
        .test({});

    TestRun()
        .addError(0, "Input is an empty string.")
        .test("");

    TestRun()
        .addError(0, "Input is an empty array.")
        .test([]);
};

exports.testConstructor = function () {
    var code = "new Number(5);";

    TestRun()
        .addError(1, "Do not use Number as a constructor.", {
            character: 1
        })
        .test(code);
};

exports.missingRadix = function () {
    var code = "parseInt(20);";

    TestRun()
        .addError(1, "Missing radix parameter.", {
            character: 12
        })
        .test(code);
};

exports.NumberNaN = function () {
    var code = "(function () { return Number.NaN; })();";
    TestRun().test(code);
};

exports.htmlEscapement = function () {
    TestRun().test("var a = '<\\!--';");
    TestRun()
        .addError(1, "Bad escapement.")
        .test("var a = '\\!';");
};

// GH-551 regression test.
exports.testSparseArrays = function () {
    var src = "var arr = ['a',, null,, '',, undefined,,];";

    TestRun()
        .addError(1, "Extra comma.")
        .addError(1, "Extra comma.")
        .addError(1, "Extra comma.")
        .addError(1, "Extra comma.")
        .test(src);

    TestRun()
        .test(src, { es5: true });
};

exports.testCatchBlocks = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/gh247.js', 'utf8');

    TestRun()
        .addError(11, "'w' is not defined.")
        .test(src, { undef: true, devel: true });

    src = fs.readFileSync(__dirname + '/fixtures/gh618.js', 'utf8');

    TestRun()
        .addError(5, "Value of 'x' may be overwritten in IE.")
        .test(src, { undef: true, devel: true });

    TestRun()
        .test(src, { undef: true, devel: true, node: true });
};

exports.testNumericParams = function () {
    TestRun()
        .test("/*jshint maxparams:4, indent:3 */");

    TestRun()
        .addError(1, "Expected a small integer and instead saw 'face'.")
        .test("/*jshint maxparams:face */");
};
