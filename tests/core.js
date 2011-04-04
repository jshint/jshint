/*jshint boss: true, laxbreak: true, node: true, devel: true */

var JSHINT = require('../jshint.js').JSHINT,
    assert = require('assert'),
    fs     = require('fs');

/** JSHint must pass its own check */
exports.checkJSHint = function () {
    var res = JSHINT(fs.readFileSync(__dirname + "/../jshint.js", "utf8"));
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
        code1 = 'new Array(v + 1);';

    assert.ok(JSHINT(code));
    assert.ok(JSHINT(code1));
};

/**
 * Test that JSHint allows `undefined` to be a function parameter.
 * It is a common pattern to protect against the case when somebody
 * overwrites undefined. It also helps with minification.
 *
 * More info: https://gist.github.com/315916
 */
exports.testUndefinedAsParam = function () {
    var code = '(function (undefined) {}());';
    assert.ok(JSHINT(code));
};