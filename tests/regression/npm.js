"use strict";

var path  = require("path");

exports.npm = function (test) {
  var jshint;
  test.ok(jshint = require(path.join(__dirname, '/../../')));
  test.equal(typeof(jshint.JSHINT), 'function');
  test.done();
};
