"use strict";

var fs = require('fs');
var TestRun = require("../helpers/testhelper").setup.testRun;

exports["Backbone.js 0.5.3"] = function (test) {
  var src = fs.readFileSync(__dirname + '/libs/backbone.js', 'utf8');

  TestRun(test)
    .addError(32, 13, "Unnecessary grouping operator.")
    .addError(784, 31, "Unnecessary grouping operator.")
    .addError(864, 28, "Unnecessary grouping operator.")
    .addError(685, 60, "Missing '()' invoking a constructor.")
    .test(src, { expr: true, eqnull: true, boss: true, regexdash: true, singleGroups: true });

  test.done();
};

exports.jQuery_1_7 = function (test) {
  var src = fs.readFileSync(__dirname + '/libs/jquery-1.7.js', 'utf8');
  var globals = { DOMParser: false, ActiveXObject: false, define: false };

  TestRun(test)
    .addError(551, 19, "'name' is defined but never used.")
    .addError(1044, 17, "'actual' is defined but never used.")
    .addError(1312, 13, "'pCount' is defined but never used.")
    .addError(1369, 9, "'events' is defined but never used.")
    .addError(1607, 38, "'table' is defined but never used.")
    .addError(1710, 13, "'internalKey' is defined but never used.")
    .addError(1813, 13, "'internalKey' is defined but never used.")
    .addError(2818, 24, "Expected an assignment or function call and instead saw an expression.")
    .addError(2822, 39, "Expected an assignment or function call and instead saw an expression.")
    .addError(2859, 5, "'rnamespaces' is defined but never used.")
    .addError(2861, 5, "'rperiod' is defined but never used.")
    .addError(2862, 5, "'rspaces' is defined but never used.")
    .addError(2863, 5, "'rescape' is defined but never used.")
    .addError(2900, 26, "'quick' is defined but never used.")
    .addError(3269, 78, "'related' is defined but never used.")
    .addError(3592, 17, "'selector' is defined but never used.")
    .addError(4465, 31, "'curLoop' is defined but never used.")
    .addError(4560, 33, "Expected an assignment or function call and instead saw an expression.")
    .addError(4694, 35, "'cache' is defined but never used.")
    .addError(4712, 32, "Expected a 'break' statement before 'case'.")
    .addError(4843, 77, "Expected an assignment or function call and instead saw an expression.")
    .addError(5635, 38, "'elem' is defined but never used.")
    .addError(5675, 54, "'i' is defined but never used.")
    .addError(5691, 50, "'i' is defined but never used.")
    .addError(7141, 53, "'i' is defined but never used.")
    .addError(6061, 22, "'cur' is defined but never used.")
    .test(src, { undef: true, unused: true }, globals);

  test.done();
};

exports.prototype_1_7 = function (test) {
  var src = fs.readFileSync(__dirname + '/libs/prototype-17.js', 'utf8');

  TestRun(test)
    .addError(22, 6, "Missing semicolon.")
    .addError(94, 25, "Unnecessary semicolon.")
    .addError(110, 29, "Missing '()' invoking a constructor.")
    .addError(253, 20, "'i' is already defined.")
    .addError(253, 27, "'length' is already defined.")
    .addError(260, 20, "'i' is already defined.")
    .addError(260, 27, "'length' is already defined.")
    .addError(261, 17, "'key' is already defined.")
    .addError(261, 32, "'str' is already defined.")
    .addError(319, 5, "Reassignment of 'isArray', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .addError(392, 6, "Missing semicolon.")
    .addError(400, 6, "Missing semicolon.")
    .addError(409, 6, "Missing semicolon.")
    .addError(430, 6, "Missing semicolon.")
    .addError(451, 4, "Missing semicolon.")
    .addError(1215, 10, "Missing semicolon.")
    .addError(1224, 2, "Unnecessary semicolon.")
    .addError(1916, 2, "Missing semicolon.")
    .addError(2034, 40, "Missing semicolon.")
    .addError(2662, 6, "Missing semicolon.")
    .addError(2735, 8, "Missing semicolon.")
    .addError(2924, 8, "Missing semicolon.")
    .addError(2987, 8, "'tagName' used out of scope.")
    .addError(2989, 24, "'tagName' used out of scope.")
    .addError(2989, 34, "'tagName' used out of scope.")
    .addError(2990, 17, "'tagName' used out of scope.")
    .addError(3827, 5, "Reassignment of 'getOffsetParent', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .addError(3844, 5, "Reassignment of 'positionedOffset', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .addError(3860, 5, "Reassignment of 'cumulativeOffset', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .addError(4036, 17, "'ret' is already defined.")
    .addError(4072, 60, "'cur' used out of scope.")
    .addError(4085, 23, "'i' is already defined.")
    .addError(4132, 35, "'match' is already defined.")
    .addError(4290, 27, "'i' is already defined.")
    .addError(4290, 34, "'l' is already defined.")
    .addError(4291, 25, "'elem' is already defined.")
    .addError(4312, 61, "'nodeCheck' used out of scope.")
    .addError(4322, 66, "'nodeCheck' used out of scope.")
    .addError(4520, 27, "'i' is already defined.")
    .addError(4538, 32, "Expected a 'break' statement before 'case'.")
    .addError(4656, 27, "'i' is already defined.")
    .addError(4722, 30, "Missing '()' invoking a constructor.")
    .addError(4988, 8, "Missing semicolon.")
    .addError(5021, 7, "Missing semicolon.")
    .addError(5397, 8, "Missing semicolon.")
    .addError(5224, 21, "'values' is already defined.")
    .addError(5495, 5, "Function declarations should not be placed in blocks. Use a function " +
      "expression or move the statement to the top of the outer function.")
    .addError(5545, 93, "The '__proto__' property is deprecated.")
    .test(src, {
      sub      : true,
      lastsemic: true,
      loopfunc : true,
      evil     : true,
      eqnull   : true,
      laxbreak : true,
      boss     : true,
      expr     : true,
      maxerr   : 9001
    });

  test.done();
};


exports.lodash_0_6_1 = function (test) {
  var src = fs.readFileSync(__dirname + '/libs/lodash.js', 'utf8');
  var globals = { _: false, define: false };
  var options = {
    unused   : true,
    expr     : true,
    eqnull   : true,
    boss     : true,
    regexdash: true,
    proto    : true,
    laxbreak : true,
    newcap   : false,
    node     : true,
    evil     : true,
    laxcomma : true
  };

  TestRun(test)
    .addError(168, 23, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .addError(170, 26, "Missing '()' invoking a constructor.")
    .addError(632, 6, "Missing semicolon.")
    .addError(920, 5, "Reassignment of 'isArguments', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .addError(963, 5, "Reassignment of 'isFunction', which is a function. Use 'var' or 'let' to declare bindings that may change.")
    .addError(1122, 12, "'isArr' used out of scope.")
    .addError(1127, 13, "'className' used out of scope.")
    .addError(1153, 18, "'isArr' used out of scope.")
    .addError(1159, 9, "'isArr' used out of scope.")
    .addError(1670, 66, "Missing semicolon.")
    .addError(3374, 11, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .addError(3377, 27, "Missing '()' invoking a constructor.")
    .addError(3384, 24, "Missing semicolon.")
    .addError(3677, 24, "Missing '()' invoking a constructor.")
    .addError(3683, 21, "Missing '()' invoking a constructor.")
    .addError(3825, 12, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .addError(4225, 5, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .addError(4226, 12, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .addError(4242, 12, "If a strict mode function is executed using function invocation, its 'this' value will be undefined.")
    .test(src, options, globals);

  test.done();
};

exports.json2 = function (test) {
  var src = fs.readFileSync(__dirname + '/libs/json2.js', 'utf8');

  TestRun(test)
    .addError(177, 43, "'key' is defined but never used.")
    .addError(191, 50, "'key' is defined but never used.")
    .test(src, { singleGroups: true, undef: true, unused: true, laxbreak: true, predef: ["-JSON"] }, { JSON: true });

  test.done();
};

exports.codemirror3 = function (test) {
  var src = fs.readFileSync(__dirname + '/libs/codemirror3.js', 'utf8');
  var opt = {
    newcap:   false,
    undef:    true,
    unused:   true,
    eqnull:   true,
    boss:     true,
    laxbreak: true,
    shadow:   true,
    loopfunc: true,
    browser:  true,
    supernew: true,

    "-W008":  true, // Ignore warnings about leading dots in numbers.
    "-W038":  true, // Ignore scope warnings.
    "-W040":  true, // Ignore possible strict violations.

  };

  TestRun(test)
    .addError(1342, 51, "Value of 'e' may be overwritten in IE 8 and earlier.")
    .addError(1526, 14, "Value of 'e' may be overwritten in IE 8 and earlier.")
    .addError(1533, 12, "Value of 'e' may be overwritten in IE 8 and earlier.")
    .addError(4093, 63, "Unnecessary semicolon.")
    .test(src, opt, { CodeMirror: true });

  test.done();
};
