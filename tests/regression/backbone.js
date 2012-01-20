/*jshint boss: true, laxbreak: true, node: true, devel: true */

var JSHINT  = require('../../jshint.js').JSHINT,
    assert  = require('assert'),
    fs      = require('fs'),
    TestRun = require("../helpers/testhelper").setup.testRun;

exports["Backbone.js 0.5.3"] = function () {
    var src = fs.readFileSync(__dirname + '/libs/backbone.js', 'utf8');

    TestRun()
        .addError(669, "Unescaped '['.")
        .addError(669, "Unescaped '^'.")
        .addError(685, "Missing '()' invoking a constructor.")
        .addError(764, "Use '===' to compare with '0'.")
        .addError(859, "Use '!==' to compare with '0'.")
        .test(src, { expr: true, eqnull: true, boss: true, regexdash: true });
};
