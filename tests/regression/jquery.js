/*jshint boss: true, laxbreak: true, node: true, devel: true */

var JSHINT  = require('../../jshint.js').JSHINT,
    assert  = require('assert'),
    fs      = require('fs'),
    TestRun = require("../helpers/testhelper").setup.testRun;

exports.jQuery_1_7 = function () {
    var src = fs.readFileSync(__dirname + '/libs/jquery-1.7.js', 'utf8');

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
        .test(src, {}, { DOMParser: false, ActiveXObject: false, define: false });
};
