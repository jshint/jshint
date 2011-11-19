function func1() {
    func2();
}

function func2() {
}


foo();

function foo() { }


(function () {
    "use strict";
    fn1();
    function fn1() {}
}());


function bar() {
    baz();
}

function baz() {}


hello();


(function () {
    fn();
    function fn() {}
    world();
}());
