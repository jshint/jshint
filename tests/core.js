/*jshint boss: true, laxbreak: true, node: true, devel: true */

var JSHINT = require('../jshint.js').JSHINT,
    assert = require('assert'),
    fs     = require('fs');

/** JSHint must pass its own check */
exports.checkJSHint = function () {
    var res = JSHINT(fs.readFileSync(__dirname + "/../jshint.js", "utf8"));

    if (!res)
        console.log(JSHINT.errors);

    assert.ok(res);
    assert.isUndefined(JSHINT.data().implieds);
};

/** Rhino wrapper must pass JSHint check */
exports.checkRhino = function () {
    var src = fs.readFileSync(__dirname + "/../env/rhino.js", "utf8");
    assert.ok(JSHINT(src, { rhino: true }));
};

/** All test files must pass JSHint check */
exports.checkTestFiles = function () {
    var files = [ 'core.js', 'envs.js', 'options.js' ];

    for (var i = 0, name; name = files[i]; i++) {
        var src = fs.readFileSync(__dirname + '/../tests/' + name, 'utf8'),
            res = JSHINT(src);

        if (!res)
            console.log(JSHINT.errors);

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
    for (var i = 0, g; g = report.globals[i]; i++)
        dict[g] = true;

    for (i = 0, g = null; g = custom[i]; i++)
        assert.ok(g in dict);
};

/** Test that JSHint recognizes `new Array(<expr>)` as a valid expression */
exports.testNewArray = function () {
    var code  = 'new Array(1);',
        code1 = 'new Array(v + 1);',
        code2 = 'new Array("hello", "there", "chaps");';

    assert.ok(JSHINT(code));
    assert.ok(JSHINT(code1));
    assert.ok(JSHINT(code2));

    assert.ok(!JSHINT('new Array();'));
    assert.eql(JSHINT.errors[0].reason, "Use the array literal notation [].");
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

    assert.ok(JSHINT(code));
    // But it must never tolerate reassigning of undefined
    assert.ok(!JSHINT(code1));
};

/** Tests that JSHint accepts new line after a dot (.) operator */
exports.newLineAfterDot = function () {
    assert.ok(JSHINT([ "chain().chain().", "chain();" ]));
};

/**
 * JSHint does not tolerate deleting variables.
 * More info: http://perfectionkills.com/understanding-delete/
 */
exports.noDelete = function () {
    assert.ok(!JSHINT('delete NullReference;'));
    assert.eql(JSHINT.errors[0].reason, 'Variables should not be deleted.');
};

/**
 * JSHint allows case statement fall through only when it is made explicit
 * using special comments.
 */
exports.switchFallThrough = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/switchFallThrough.js', 'utf8');
    assert.ok(!JSHINT(src));
    assert.eql(JSHINT.errors.length, 2);
    assert.eql(JSHINT.errors[0].line, 3);
    assert.eql(JSHINT.errors[0].reason, "Expected a 'break' statement before 'case'.");
    assert.eql(JSHINT.errors[1].line, 18);
    assert.eql(JSHINT.errors[1].reason, "Expected a 'break' statement before 'default'.");
};

exports.testVoid = function () {
    var code = [
        "void(0);"
      , "void 0;"
      , "var a = void(1);"
    ];
    assert.ok(JSHINT(code));
};

exports.functionScopedOptions = function () {
    var src = fs.readFileSync(__dirname + '/fixtures/functionScopedOptions.js', 'utf8');
    assert.ok(!JSHINT(src));
    assert.eql(JSHINT.errors.length, 2);
    assert.eql(JSHINT.errors[0].line, 1);
    assert.eql(JSHINT.errors[0].reason, "eval is evil.");
    assert.eql(JSHINT.errors[1].line, 8);
    assert.eql(JSHINT.errors[1].reason, "eval is evil.");
};

/** JSHint should not only read jshint, but also jslint options */
exports.jslintOptions = function() {
    var src = fs.readFileSync(__dirname + '/fixtures/jslintOptions.js', 'utf8');
    assert.ok(JSHINT(src));
};
