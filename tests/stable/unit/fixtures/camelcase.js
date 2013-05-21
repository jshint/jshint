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

function FooBar_(test_) {
    this.TEST_ME_ = 12;
    this.test__ = test_;
}

var _test_, _, testMe_, test_me_;
