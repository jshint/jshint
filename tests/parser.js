/**
 * Tests for the parser/tokenizer
 */

/*jshint boss: true, laxbreak: true, node: true, maxlen:100 */

var JSHINT  = require('../jshint.js').JSHINT,
    fs      = require('fs'),
    TestRun = require("./testhelper").setup.testRun;

exports.unsafe = function () {
    var code = [
        'var a\u000a = "Here is a unsafe character";'
    ];

    TestRun()
        .addError(1, "Unsafe character.")
        .test(code);
};

exports.other = function () {
    var code = [
        '\\'
      , '!'
    ];

    TestRun()
        .addError(1, "Unexpected '\\'.")
        .addError(2, "Unexpected early end of program.")
        .addError(2, "Expected an identifier and instead saw '(end)'.")
        .test(code);
};

exports.confusingOps = function () {
    var code = [
        'var a = 3 - -3;'
      , 'var b = 3 + +3;'
      , 'a = a - --a;'
      , 'a = b + ++b;'
      , 'a = a-- - 3;' // this is not confusing?!
      , 'a = a++ + 3;' // this is not confusing?!
    ];

    TestRun()
        .addError(1, "Confusing minusses.")
        .addError(2, "Confusing plusses.")
        .addError(3, "Confusing minusses.")
        .addError(4, "Confusing plusses.")
        .test(code);
};


exports.plusplus = function () {
    var code = [
        'var a = ++[2];'
      , 'var b = --(2);'
    ];

    TestRun()
        .addError(1, "Unexpected use of '++'.")
        .addError(2, "Unexpected use of '--'.")
        .test(code, { plusplus: true });

    TestRun()
        .addError(2, "Bad operand.")
        .test(code, { plusplus: false });
};

exports.assignment = function () {
    var code = [
        'arguments.length = 2;'
      , 'a() = 2;'
    ];

    TestRun()
        .addError(1, "Bad assignment.")
        .addError(2, "Bad assignment.")
        .addError(2, "Expected an assignment or function call and instead saw an expression.")
        .addError(2, "Missing semicolon.")
        .test(code, { plusplus: true });
};

exports.relations = function () {
    var code = [
        'var a = 2 === NaN;'
      , 'var b = NaN == 2;'
      , 'var c = !2 < 3;'
      , 'var c = 2 < !3;'
      , 'var d = (!"x" in obj);'
      , 'var e = (!a === b);'
      , 'var f = (a === !"hi");'
      , 'var g = (!2 === 1);'
      , 'var h = (![1, 2, 3] === []);'
    ];

    TestRun()
        .addError(1, "Use the isNaN function to compare with NaN.")
        .addError(2, "Use the isNaN function to compare with NaN.")
        .addError(3, "Confusing use of '!'.", {character : 9})
        .addError(4, "Confusing use of '!'.", {character : 13})
        .addError(5, "Confusing use of '!'.", {character : 10})
        .addError(6, "Confusing use of '!'.", {character : 10})
        .addError(7, "Confusing use of '!'.", {character : 16})
        .addError(8, "Confusing use of '!'.", {character : 10})
        .addError(9, "Confusing use of '!'.", {character : 10})
        .test(code);
};

exports.options = function () {
    var code = [
        '/*member a*/'
      , '/*members b*/'
      , 'var x; x.a.b.c();'
      , '/*jshint +++ */'
      , '/*jslint indent: -2 */'
      , '/*jslint indent: 100.4 */'
      , '/*jslint maxlen: 200.4 */'
      , '/*jslint maxerr: 300.4 */'
      , '/*jslint maxerr: 20 */'
      , '/*member c:true */'
      , '/*jshint d:no */'
      , '/*globals xxx*/'
      , 'xxx = 2;'
    ];

    TestRun()
        .addError(3, "Unexpected /*member 'c'.")
        .addError(4, "Bad option.")
        .addError(4, "Missing option value.")
        .addError(5, "Expected a small integer and instead saw '-'.")
        .addError(5, "Bad option.")
        .addError(5, "Missing option value.")
        .addError(6, "Expected a small integer and instead saw '100.4'.")
        .addError(7, "Expected a small integer and instead saw '200.4'.")
        .addError(8, "Expected a small integer and instead saw '300.4'.")
        .addError(10, "Expected '*/' and instead saw ':'.")
        .addError(11, "Bad option value.")
        .addError(13, "Read only.")
        .test(code);
};

exports.shebang = function () {
    var code = [
        '#!test'
      , 'var a = "xxx";'
      , '#!test'
    ];

    TestRun()
        .addError(3, "Expected an identifier and instead saw '#'.")
        .addError(3, "Expected an operator and instead saw '!'.")
        .addError(3, "Expected an assignment or function call and instead saw an expression.")
        .addError(3, "Missing semicolon.")
        .test(code);
};

exports.numbers = function () {
    /*jshint maxlen: 300*/
    var code = [
        'var a = 10e307;'
      , 'var b = 10e308;'
      , 'var c = 0.03 + 0.3 + 3.0 + 30.00;'
      , 'var d = 03;'
      , 'var e = .3;'
      , 'var f = 0xAAg;'
      , 'var g = 0033;'
      , 'var h = 3.;'
      , 'var i = 3.7.toString();'
    ];

    TestRun()
        .addError(2, "Bad number '10e308'.")
        .addError(4, "Don't use extra leading zeros '03'.")
        .addError(5, "A leading decimal point can be confused with a dot: '.3'.")
        .addError(6, "Missing space after '0xAA'.")
        .addError(6, "Missing semicolon.")
        .addError(6, "Expected an assignment or function call and instead saw an expression.")
        .addError(7, "Don't use extra leading zeros '0033'.")
        .addError(8, "A trailing decimal point can be confused with a dot '3.'.")
        .addError(9, "A dot following a number can be confused with a decimal point.")
        .test(code);
};

exports.comments = function () {
    var code = [
        '/*'
      , '/* nested */'
      , '*/'
      , '/* unclosed ...'
    ];

    TestRun()
        .addError(2, "Nested comment.")
        .addError(2, "Unbegun comment.")
        .addError(4, "Unclosed comment.")
        .test(code);
};

exports.regexp = function () {
    var code = [
        'var a1 = /\\\x1f/;'
      , 'var a2 = /[\\\x1f]/;'
      , 'var b1 = /\\</;' // only \< is unexpected?!
      , 'var b2 = /[\\<]/;' // only \< is unexpected?!
      , 'var c = /(?(a)b)/;'
      , 'var d = /)[--aa-b-cde-]/;'
      , 'var e = /[]/;'
      , 'var f = /[^]/;'
      , 'var g = /[a^[]/;'
      , 'var h = /[a-\\s-\\w-\\d\\x10-\\x20--]/;'
      , 'var i = /[/-a1-/]/;'
      , 'var j = /[a-<<-3]./;'
      , 'var k = /]}/;'
      , 'var l = /?(*)(+)({)/;'
      , 'var m = /a{b}b{2,c}c{3,2}d{4,?}x{30,40}/;'
      , 'var n = /a??b+?c*?d{3,4}? a?b+c*d{3,4}/;'
      , 'var o = /a\\/*  [a-^-22-]/;'
      , 'var p = /(?:(?=a|(?!b)))/;'
      , 'var q = /=;//;' // hack to not get other errors than "... confused with '/='".
                         // The current parser recognizes this as /= and not as regex
      , 'var r = /(/;'
      , 'var s = /(((/;'
      , 'var t = /x/* 2;'
      , 'var u = /x/;'
      , 'var v = /dsdg;'
    ];

    TestRun()
        .addError(1, "Unsafe character.")
        .addError(1, "Unexpected control character in regular expression.")
        .addError(2, "Unsafe character.")
        .addError(2, "Unexpected control character in regular expression.")
        .addError(3, "Unexpected escaped character '<' in regular expression.")
        .addError(4, "Unexpected escaped character '<' in regular expression.")
        .addError(5, "Expected ':' and instead saw '('.")
        .addError(6, "Unescaped ')'.")
        .addError(6, "Unescaped '-'.")
        .addError(7, "Empty class.")
        .addError(8, "Unescaped '^'.")
        .addError(9, "Unescaped '^'.")
        .addError(9, "Unescaped '['.")
        .addError(10, "Unescaped '-'.")
        .addError(11, "Unescaped '/'.")
        .addError(13, "Unescaped ']'.")
        .addError(13, "Unescaped '}'.")
        .addError(14, "Unescaped '?'.")
        .addError(14, "Unescaped '*'.")
        .addError(14, "Unescaped '+'.")
        .addError(14, "Unescaped '{'.")
        .addError(15, "Expected a number and instead saw 'b'.")
        .addError(15, "Expected '}' and instead saw 'c'.")
        .addError(15, "Unescaped '}'.")
        .addError(15, "Expected '}' and instead saw '?'.")
        .addError(15, "'3' should not be greater than '2'.")
        .addError(17, "Spaces are hard to count. Use {2}.")
        .addError(17, "Unescaped '^'.")
        .addError(17, "Unescaped '-'.")
        .addError(19, "A regular expression literal can be confused with '/='.")
        .addError(20, "1 unterminated regular expression group(s).")
        .addError(21, "3 unterminated regular expression group(s).")
        .addError(22, "Confusing regular expression.")
        .addError(24, "Unclosed regular expression.")
        .test(code);
};

exports.strings = function () {
    var code = [
        'var a = "\u0012\\r";'
      , 'var b = \'\\g\';'
      , 'var c = "\\u0022\\u0070\\u005C";'
      , 'var x = "ax'
    ];

    TestRun()
        .addError(1, "Control character in string: .")
        .addError(1, "Unsafe character.")
        .addError(2, "Bad escapement.")
        .addError(3, "Unnecessary escapement.")
        .addError(4, "Unclosed string.")
        .test(code);
};

exports.ownProperty = function () {
    var code = [
        'hasOwnProperty: for(;;) {break;}'
    ];

    TestRun()
        .addError(1, "'hasOwnProperty' is a really bad name.")
        .test(code);
};

exports.jsonMode = function () {
    var code = [
        '{'
      , '   a: 2,'
      , '   \'b\': "hallo\\"\\v\\x12\\\'world",'
      , '   "c\\"\\v\\x12": \'4\','
      , '   "d": "4\\'
      , '   ",'
      , '   "e": 0x332,'
      , '   "x": 0'
      , '}'
    ];

    TestRun()
        .addError(2, "Expected a string and instead saw a.")
        .addError(3, "Strings must use doublequote.")
        .addError(3, "Avoid \\v.")
        .addError(3, "Avoid \\x-.")
        .addError(3, "Avoid \\'.")
        .addError(4, "Avoid \\v.")
        .addError(4, "Avoid \\x-.")
        .addError(4, "Strings must use doublequote.")
        .addError(5, "Avoid EOL escapement.")
        .addError(7, "Avoid 0x-. '0x332'.")
        .test(code, {multistr: true});
};
