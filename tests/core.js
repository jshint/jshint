/*jshint boss: true, laxbreak: true, node: true, devel: true */

var JSHINT  = require('../jshint.js').JSHINT,
    assert  = require('assert'),
    fs      = require('fs'),
    TestRun = require("./testhelper").setup.testRun;

/** JSHint must pass its own check */
exports.checkJSHint = function () {
    var res = JSHINT(fs.readFileSync(__dirname + "/../jshint.js", "utf8"), {
            bitwise: true,
            eqeqeqe: true,
            forin: true,
            immed: true,
            latedef: true,
            newcap: true,
            noarg: true,
            noempty: true,
            nonew: true,
            plusplus: true,
            regexp: true,
            undef: true,
            strict: true,
            trailing: true,
            white: true
        });

    if (!res) {
        console.log("file: jshint.js");
        console.log(JSHINT.errors);
    }

    assert.ok(res);
    assert.isUndefined(JSHINT.data().implieds);
};

/** Rhino wrapper must pass JSHint check */
exports.checkRhino = function () {
    var src = fs.readFileSync(__dirname + "/../env/jshint-rhino.js", "utf8");
    TestRun("jshint-rhino").test(src, {
            bitwise: true,
            eqeqeqe: true,
            forin: true,
            immed: true,
            latedef: true,
            newcap: true,
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
};

/* JavaScriptCore wrapper must pass JSHint check */
exports.checkJSC = function () {
    var src = fs.readFileSync(__dirname + "/../env/jsc.js", "utf8");
    TestRun().test(src);
};

/** All test files must pass JSHint check */
exports.checkTestFiles = function () {
    var files = fs.readdirSync(__dirname + '/../tests/').filter(function (e) {
        return e.length > 2 && e.substr(e.length - 3, 3) === '.js';
    });

    for (var i = 0, name; name = files[i]; i += 1) {
        var src = fs.readFileSync(__dirname + '/../tests/' + name, 'utf8'),
            res = JSHINT(src, {
                bitwise: true,
                eqeqeqe: true,
                forin: true,
                immed: true,
                latedef: true,
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
            console.log("file: " + name);
            console.log(JSHINT.errors);
        }

        assert.ok(res);
        assert.isUndefined(JSHINT.data().implieds);
    }
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

exports.caseExpressions = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/caseExpressions.js', 'utf8');
    TestRun()
        .addError(2, "This 'switch' should be an 'if'.")
        .test(src);
};

exports.returnStatement = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/return.js', 'utf8');

    TestRun()
        .addError(38, "Line breaking error 'return'.")
        .test(src, { maxerr: 1 });
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

exports.testJQuery = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/jquery-1.7.js', 'utf8');

    TestRun()
        .addError(2818, "Expected an assignment or function call and instead saw an expression.")
        .addError(2822, "Expected an assignment or function call and instead saw an expression.")
        .addError(4560, "Expected an assignment or function call and instead saw an expression.")
        .addError(4702, "Mixed spaces and tabs.")
        .addError(4712, "Expected a 'break' statement before 'case'.")
        .addError(4715, "Mixed spaces and tabs.")
        .addError(4843, "Expected an assignment or function call and instead saw an expression.")
        .addError(6912, "Mixed spaces and tabs.")
        .addError(6913, "Mixed spaces and tabs.")
        .addError(6914, "Mixed spaces and tabs.")
        .addError(6915, "Mixed spaces and tabs.")
        .addError(6916, "Mixed spaces and tabs.")
        .addError(6917, "Mixed spaces and tabs.")
        .addError(6918, "Mixed spaces and tabs.")
        .addError(6919, "Mixed spaces and tabs.")
        .addError(6923, "Mixed spaces and tabs.")
        .addError(6924, "Mixed spaces and tabs.")
        .addError(6925, "Mixed spaces and tabs.")
        .addError(6926, "Mixed spaces and tabs.")
        .addError(8086, "Mixed spaces and tabs.")
        .addError(8087, "Mixed spaces and tabs.")
        .addError(8088, "Mixed spaces and tabs.")
        .addError(8089, "Mixed spaces and tabs.")
        .addError(8090, "Mixed spaces and tabs.")
        .addError(9209, "Mixed spaces and tabs.")
        .test(src);
};
