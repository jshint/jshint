/*global require */

/**
  These tests can be run in `node`
  or it can be used by the test runner.
  */

// test suite
const should = require('assert').equal;
const assert = function (a, b) {
  try {
    should(a, b);
  } catch (e) {
    console.error(e);
  }
};


// setting up the tests
const immutable = "foo";
const immutable2 = 6;
const immutable3 = false;

// perfectly valid but useless
const immutable4;

// objects aren't immutable
// one can modify it's properties
// but can't redeclare as something other than this object
const immutable5 = { foo: "bar" };

// functions can be constant
const immutable6 = function () {
  return "foo";
};

// arrays aren't immutable either
// same rules apply as an Object
const immutable7 = ["foo"];

// comma separated is ok
const immutable8 = "testing", immutable9 = true;

// in scope
(function () {
  // valid
  const immutable4 = "foobar"; // immutable4 is in it's own scope so it can be redeclared
  const immutable5 = "w00t";

  const immutable6 = true, immutable7 = ["bar"];

  // tests
  assert(immutable3, false);
  assert(immutable4, "foobar");
  assert(immutable5, "w00t");
  assert(immutable6, true);
}());

// tests
assert(immutable, "foo");
assert(immutable2, 6);
assert(immutable3, false);
assert(immutable4, undefined);
assert(immutable8, "testing");
assert(immutable9, true);
