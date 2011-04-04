/**
 * Tests for the environmental (browser, jquery, etc.) options
 */

/*jshint boss: true, laxbreak: true, node: true */
/*global wrap: true */

var JSHINT = require('../jshint.js').JSHINT,
    assert = require('assert'),
    fs     = require('fs');

function wrap(globals) {
    return '(function () { return [ ' + globals.join(',') + ' ]; }());';
}

assert.globalsKnown = function (globals, options) {
    JSHINT(wrap(globals), options || {});
    var report = JSHINT.data();

    assert.isUndefined(report.implieds);
    assert.eql(report.globals.length, globals.length);

    var dict = {};
    for (var i = 0, g; g = report.globals[i]; i++)
        globals[g] = true;

    for (i = 0, g = null; g = globals[i]; i++)
        assert.ok(g in globals);
};

assert.globalsImplied = function (globals, options) {
    JSHINT(wrap(globals), options || {});
    var report = JSHINT.data();

    assert.isDefined(report.implieds);
    assert.isUndefined(report.globals, 0);

    var implieds = [];
    for (var i = 0, warn; warn = report.implieds[i]; i++)
        implieds.push(warn.name);

    assert.eql(implieds.length, globals.length);
};

/** Option `node` predefines Node.js globals */
exports.testNodeJS = function () {
    var globals = [
            "__filename"
          , "__dirname"
          , "Buffer"
          , "GLOBAL"
          , "global"
          , "module"
          , "process"
          , "require"
          , "exports"
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { node: true });
};

/** Option `jquery` predefines jQuery globals */
exports.testJQuery = function () {
    var globals = [ 'jQuery', '$' ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { jquery: true });
};

/** Option `couch` predefines CouchDB globals */
exports.testCouchDB = function () {
    var globals = [
            "require"
          , "respond"
          , "getRow"
          , "emit"
          , "send"
          , "start"
          , "sum"
          , "log"
          , "exports"
          , "module"
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { couch: true });
};

/** Option `prototypejs` predefines Prototype.js and Scriptaculous globals */
exports.testPrototype = function () {
    var globals = [
            "$"
          , "$$"
          , "$A"
          , "$F"
          , "$H"
          , "$R"
          , "$break"
          , "$continue"
          , "$w"
          , "Abstract"
          , "Ajax"
          , "Class"
          , "Enumerable"
          , "Element"
          , "Event"
          , "Field"
          , "Form"
          , "Hash"
          , "Insertion"
          , "ObjectRange"
          , "PeriodicalExecuter"
          , "Position"
          , "Prototype"
          , "Selector"
          , "Template"
          , "Toggle"
          , "Try"
          , "Autocompleter"
          , "Builder"
          , "Control"
          , "Draggable"
          , "Draggables"
          , "Droppables"
          , "Effect"
          , "Sortable"
          , "SortableObserver"
          , "Sound"
          , "Scriptaculous"
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { prototypejs: true });
};

/**
 * Option `devel` predefines global functions used for development
 * (console, alert, etc.)
 */
exports.testDevel = function () {
    var globals = [
            "alert"
          , "confirm"
          , "console"
          , "Debug"
          , "opera"
          , "prompt"
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { devel: true });
};
