/*jshint boss: true, laxbreak: true, node: true, devel: true */

var JSHINT  = require('../../jshint.js').JSHINT,
    assert  = require('assert'),
    fs      = require('fs'),
    TestRun = require("../helpers/testhelper").setup.testRun;

exports.prototype_1_7 = function () {
    var src = fs.readFileSync(__dirname + '/libs/prototype-17.js', 'utf8');

    TestRun()
        .addError(22, "Missing semicolon.")
        .addError(94, "Unnecessary semicolon.")
        .addError(110, "Missing '()' invoking a constructor.")
        .addError(253, "'i' is already defined.")
        .addError(253, "'length' is already defined.")
        .addError(260, "'i' is already defined.")
        .addError(260, "'length' is already defined.")
        .addError(261, "'key' is already defined.")
        .addError(261, "'str' is already defined.")
        .addError(319, "'isArray' is a function.")
        .addError(392, "Missing semicolon.")
        .addError(400, "Missing semicolon.")
        .addError(409, "Missing semicolon.")
        .addError(430, "Missing semicolon.")
        .addError(451, "Missing semicolon.")
        .addError(482, "Unescaped '^'.")
        .addError(482, "Unescaped '['.")
        .addError(563, "Missing semicolon.")
        .addError(563, "Expected an identifier and instead saw ','.")
        .addError(563, "Missing semicolon.")
        .addError(633, "Use '!==' to compare with 'undefined'.")
        .addError(737, "Use '===' to compare with ''.")
        .addError(741, "Wrap the /regexp/ literal in parens to disambiguate the slash operator.")
        .addError(799, "Unescaped '['.")
        .addError(805, "Unescaped ']'.")
        .addError(807, "Use '===' to compare with ''.")
        .addError(1137, "Use '===' to compare with '0'.")
        .addError(1215, "Missing semicolon.")
        .addError(1224, "Unnecessary semicolon.")
        .addError(1916, "Missing semicolon.")
        .addError(2034, "Missing semicolon.")
        .addError(2210, "Missing semicolon.")
        .addError(2210, "Expected an identifier and instead saw ','.")
        .addError(2210, "Missing semicolon.")
        .addError(2222, "Missing semicolon.")
        .addError(2222, "Expected an identifier and instead saw ','.")
        .addError(2222, "Missing semicolon.")
        .addError(2345, "Missing semicolon.")
        .addError(2345, "Expected an identifier and instead saw ','.")
        .addError(2345, "Missing semicolon.")
        .addError(2662, "Missing semicolon.")
        .addError(2735, "Missing semicolon.")
        .addError(2924, "Missing semicolon.")
        .addError(2987, "'tagName' used out of scope.")
        .addError(2989, "'tagName' used out of scope.")
        .addError(2989, "'tagName' used out of scope.")
        .addError(2990, "'tagName' used out of scope.")
        .addError(3844, "'positionedOffset' is a function.")
        .addError(3860, "'cumulativeOffset' is a function.")
        .addError(3974, "Unescaped '['.")
        .test(src, {
            sub: true,
            lastsemic: true,
            loopfunc: true,
            evil: true,
            eqnull: true,
            laxbreak: true,
            boss: true,
            expr: true
        });
};
