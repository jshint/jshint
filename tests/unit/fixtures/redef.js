(function () {
    if (b) {
        var a = 1;
    } else {
        var a = 2;
    }
}());

function test(foo) {
    var foo = foo || false;
}

function z() {
    var b = 1;
    function y() {
        function x() {
            var b = 2;
        }
    }
}

var c;
var c;

var d;
function d() {}

function e() {}
var e;

function f() {}
function f() {}

var g;
function foo() { var g; }

var g;
function foo() { function g() {} }

var h;
if (h) {
    var h;
}

function i(){}
if (i) {
    var i;
}

function bar() {
    var c;
    var c;

    var d;
    function d() {}

    function e() {}
    var e;

    function f() {}
    function f() {}

    var g;
    function foo() { var g; }

    var g;
    function foo() { function g() {} }

    var h;
    if (h) {
        var h;
    }

    function i(){}
    if (i) {
        var i;
    }
}