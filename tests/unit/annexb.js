/**
 * Tests for the parser/tokenizer
 */

"use strict";

var JSHINT	= require('../../src/jshint.js').JSHINT;
var fs		= require('fs');
var TestRun = require("../helpers/testhelper").setup.testRun;
var path    = require("path");

exports["should not complain about substr without annexb option"] = function (test) {
    
    var code = [
        "var s = 'foo';",
        "s.substr(1);"
    ];

    TestRun(test)
        .test(code);

    TestRun(test)
        .addError(2, "'substr' is deprecated in ES5 Annex B.")
        .test(code, { legacy: true });

    test.done();
};

exports["should not complain about Annex B code without option"] = function (test) {
    var code = [
        "'use strict';",
        "var s = 'foo';",
        "escape(s);"
    ];

    TestRun(test)
        .addError(1, 'Use the function form of "use strict".')
        .addError(3, "'escape' is not defined.")
        .test(code);

    TestRun(test)
        .addError(1, 'Use the function form of "use strict".')
        .addError(3, "'escape' is deprecated in ES5 Annex B.")
        .test(code, {legacy: true});

    test.done();
};

exports["should not complain about Annex B code without option"] = function (test) {
    var code = fs.readFileSync(__dirname + "/fixtures/annexb.js", "utf8");

    TestRun(test)
        .addError(1, 'Use the function form of "use strict".')
        .addError(7, "'escape' is not defined.")
        .addError(9, "'unescape' is not defined.")
        .test(code);

    TestRun(test)
        .addError(1, 'Use the function form of "use strict".')
        .addError(5, "'substr' is deprecated in ES5 Annex B.")
        .addError(7, "'escape' is deprecated in ES5 Annex B.")
        .addError(9, "'unescape' is deprecated in ES5 Annex B.")
        .addError(12, "'getYear' is deprecated in ES5 Annex B.")
        .addError(13, "'setYear' is deprecated in ES5 Annex B.")
        .addError(15, "'toGMTString' is deprecated in ES5 Annex B.")
        .test(code, {legacy: true});

    test.done();
};
