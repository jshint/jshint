/* jshint proto: true, node: true */

function FooBar(testMe) {
  this.testMe = testMe;
}

function Foo_bar(test_me) {
  this.test_me = test_me;
}

function Foo() {
  this.TEST_ME = 2;
}

var TEST_1, test1, test_1;

function _FooBar(_testMe) {
    this.__testMe = _testMe;
}

var o = Function.prototype.__proto__;
var s = ({}).constructor.super_;
var test_;
