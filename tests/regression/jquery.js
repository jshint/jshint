/*jshint boss: true, laxbreak: true, node: true, devel: true */

var JSHINT  = require('../../jshint.js').JSHINT,
    assert  = require('assert'),
    fs      = require('fs'),
    TestRun = require("../helpers/testhelper").setup.testRun;

exports.jQuery_1_7 = function () {
    var src = fs.readFileSync(__dirname + '/libs/jquery-1.7.js', 'utf8');
    var globals = { DOMParser: false, ActiveXObject: false, define: false };

    TestRun()
        .addError(77, "'all' is defined but never used.")
        .addError(551, "'name' is defined but never used.")
        .addError(903, "'i' is defined but never used.")
        .addError(1044, "'actual' is defined but never used.")
        .addError(1312, "'pCount' is defined but never used.")
        .addError(1369, "'events' is defined but never used.")
        .addError(1607, "'table' is defined but never used.")
        .addError(1710, "'internalKey' is defined but never used.")
        .addError(1813, "'internalKey' is defined but never used.")
        .addError(2760, "'i' is defined but never used.")
        .addError(2787, "'i' is defined but never used.")
        .addError(2818, "Expected an assignment or function call and instead saw an expression.")
        .addError(2822, "Expected an assignment or function call and instead saw an expression.")
        .addError(2859, "'rnamespaces' is defined but never used.")
        .addError(2861, "'rperiod' is defined but never used.")
        .addError(2862, "'rspaces' is defined but never used.")
        .addError(2863, "'rescape' is defined but never used.")
        .addError(2900, "'quick' is defined but never used.")
        .addError(3269, "'related' is defined but never used.")
        .addError(3442, "'data' is defined but never used.")
        .addError(3442, "'namespaces' is defined but never used.")
        .addError(3449, "'namespaces' is defined but never used.")
        .addError(3592, "'selector' is defined but never used.")
        .addError(3889, "'i' is defined but never used.")
        .addError(4465, "'curLoop' is defined but never used.")
        .addError(4496, "'curLoop' is defined but never used.")
        .addError(4496, "'inplace' is defined but never used.")
        .addError(4496, "'result' is defined but never used.")
        .addError(4496, "'not' is defined but never used.")
        .addError(4560, "Expected an assignment or function call and instead saw an expression.")
        .addError(4574, "'i' is defined but never used.")
        .addError(4633, "'elem' is defined but never used.")
        .addError(4637, "'elem' is defined but never used.")
        .addError(4637, "'match' is defined but never used.")
        .addError(4641, "'elem' is defined but never used.")
        .addError(4645, "'elem' is defined but never used.")
        .addError(4649, "'elem' is defined but never used.")
        .addError(4653, "'elem' is defined but never used.")
        .addError(4657, "'elem' is defined but never used.")
        .addError(4661, "'elem' is defined but never used.")
        .addError(4694, "'cache' is defined but never used.")
        .addError(4702, "Mixed spaces and tabs.")
        .addError(4712, "Expected a 'break' statement before 'case'.")
        .addError(4715, "Mixed spaces and tabs.")
        .addError(4818, "'all' is defined but never used.")
        .addError(4843, "Expected an assignment or function call and instead saw an expression.")
        .addError(5552, "'i' is defined but never used.")
        .addError(5234, "'nodeCheck' is defined but never used.")
        .addError(5267, "'nodeCheck' is defined but never used.")
        .addError(9209, "Mixed spaces and tabs.")
        .test(src, { undef: true, unused: true }, globals);
};
