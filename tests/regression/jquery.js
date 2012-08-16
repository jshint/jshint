/*jshint boss: true, laxbreak: true, node: true, devel: true */

var JSHINT  = require('../../jshint.js').JSHINT,
    assert  = require('assert'),
    fs      = require('fs'),
    TestRun = require("../helpers/testhelper").setup.testRun;

exports.jQuery_1_7 = function () {
    var src = fs.readFileSync(__dirname + '/libs/jquery-1.7.js', 'utf8');
    var globals = { DOMParser: false, ActiveXObject: false, define: false };

    TestRun()
        .addError(551, "'name' is defined but never used.")
        .addError(1044, "'actual' is defined but never used.")
        .addError(1312, "'pCount' is defined but never used.")
        .addError(1369, "'events' is defined but never used.")
        .addError(1607, "'table' is defined but never used.")
        .addError(1710, "'internalKey' is defined but never used.")
        .addError(1813, "'internalKey' is defined but never used.")
        .addError(2818, "Expected an assignment or function call and instead saw an expression.")
        .addError(2822, "Expected an assignment or function call and instead saw an expression.")
        .addError(2859, "'rnamespaces' is defined but never used.")
        .addError(2861, "'rperiod' is defined but never used.")
        .addError(2862, "'rspaces' is defined but never used.")
        .addError(2863, "'rescape' is defined but never used.")
        .addError(2900, "'quick' is defined but never used.")
        .addError(3269, "'related' is defined but never used.")
        .addError(3592, "'selector' is defined but never used.")
        .addError(4465, "'curLoop' is defined but never used.")
        .addError(4560, "Expected an assignment or function call and instead saw an expression.")
        .addError(4694, "'cache' is defined but never used.")
        .addError(4702, "Mixed spaces and tabs.")
        .addError(4712, "Expected a 'break' statement before 'case'.")
        .addError(4715, "Mixed spaces and tabs.")
        .addError(4843, "Expected an assignment or function call and instead saw an expression.")
        .addError(5635, "'elem' is defined but never used.")
        .addError(5675, "'i' is defined but never used.")
        .addError(5691, "'i' is defined but never used.")
        .addError(7141, "'i' is defined but never used.")
        .addError(6061, "'cur' is defined but never used.")
        .addError(9209, "Mixed spaces and tabs.")
        .test(src, { undef: true, unused: true }, globals);
};
