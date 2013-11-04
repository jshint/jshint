/**
 * Tests for the parser/tokenizer
 */

"use strict";

var JSHINT	= require('../../src/jshint.js').JSHINT;
var fs		= require('fs');
var TestRun = require("../helpers/testhelper").setup.testRun;
var path    = require("path");

exports["should not complain about Annex B code without"] = function (test) {
    var code = fs.readFile(__dirname + "/fixtures/annexb.js", "utf8");

    TestRun(test)
        .addError(7, "'escape' is not defined.")
        .addError(9, "'unescape' is not defined.")
        .test(code);

    test.done();
};
