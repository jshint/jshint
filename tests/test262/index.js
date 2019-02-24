#! /usr/bin/env node

"use strict";

var path = require("path");
var Transform = require("stream").Transform;

var Test262Stream = require("test262-stream");
var Interpreter = require("results-interpreter");

var runTest = require("./test");
var report = require("./report");
var expectationsFile = path.join(__dirname, "expectations.txt");
var shouldUpdate = process.argv.indexOf("--update-expectations") > -1;
var stream = new Test262Stream(path.join(__dirname, "test262"), {
  omitRuntime: true
});
var count = 0;

function normalizePath(str) {
  return str.split(path.sep).join(path.posix.sep);
}

var results = new Transform({
  objectMode: true,
  transform: function(test, encoding, done) {
    count += 1;
    if (count % 2000 === 0) {
      console.log("Completed " + count + " tests.");
    }

    done(null, {
      id: normalizePath(test.file) + "(" + test.scenario + ")",
      expected: test.attrs.negative && test.attrs.negative.phase === "parse"
        ? "fail" : "pass",
      actual: runTest(test) ? "pass": "fail"
    });
  }
});
var interpreter = new Interpreter(expectationsFile, {
  outputFile: shouldUpdate ? expectationsFile : null
});

console.log("Now running tests...");

if (shouldUpdate) {
  console.log(
    "The expectations file will be updated according to the results of this " +
    "test run."
  );
} else {
  console.log(
    "Note: the expectations file may be automatically updated by specifying " +
    "the `--update-expectations` flag."
  );
}

stream.pipe(results)
  .pipe(interpreter)
  .on("error", function(error) {
    console.error(error);
    process.exitCode = 1;
  })
  .on("finish", function () {
    report(this.summary);
    process.exitCode = this.summary.passed ? 0 : 1;
  });
