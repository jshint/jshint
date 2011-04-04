/*jshint boss: true, laxbreak: true, node: true */

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
    var files = [ 'core.js', 'envs.js' ];

    for (var i = 0, name; name = files[i]; i++) {
        var src = fs.readFileSync(__dirname + '/../tests/' + name, 'utf8');

        assert.ok(JSHINT(src));
        assert.isUndefined(JSHINT.data().implieds);
    }
};