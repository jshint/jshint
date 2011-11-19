function func1() {
    func2();
}

function func2() {
}


foo();

function foo() { }

/*
(function () {
    "use strict";
    fn();
    function fn() {}
}());
*/


function bar() {
    baz();
}

function baz() {}

hello();
