"use strict";

module.exports = function report(summary) {
  var goodnews = [
    summary.allowed.success.length + " valid programs parsed without error",
    summary.allowed.failure.length +
    " invalid programs produced a parsing error",
    summary.allowed.falsePositive.length +
    " invalid programs did not produce a parsing error" +
    " (and allowed by the expectations file)",
    summary.allowed.falseNegative.length +
    " valid programs produced a parsing error" +
    " (and allowed by the expectations file)"
  ];
  var badnews = [];
  var badnewsDetails = [];

  void [
    {
      tests: summary.disallowed.success,
      label:
      "valid programs parsed without error" +
      " (in violation of the expectations file)"
    },
    {
      tests: summary.disallowed.failure,
      label:
      "invalid programs produced a parsing error" +
      " (in violation of the expectations file)"
    },
    {
      tests: summary.disallowed.falsePositive,
      label:
      "invalid programs did not produce a parsing error" +
      " (without a corresponding entry in the expectations file)"
    },
    {
      tests: summary.disallowed.falseNegative,
      label:
      "valid programs produced a parsing error" +
      " (without a corresponding entry in the expectations file)"
    },
    {
      tests: summary.unrecognized,
      label: "non-existent programs specified in the expectations file"
    }
  ].forEach(function (entry) {
    var tests = entry.tests;
    var label = entry.label;

    if (!tests.length) {
      return;
    }

    var desc = tests.length + " " + label;

    badnews.push(desc);
    badnewsDetails.push(desc + ":");
    badnewsDetails.push.apply(
      badnewsDetails,
      tests.map(function (test) {
        return test.id || test;
      })
    );
  });

  console.log("Testing complete.");
  console.log("Summary:");
  console.log(goodnews.join("\n").replace(/^/gm, " ✔ "));

  if (!summary.passed) {
    console.log("");
    console.log(badnews.join("\n").replace(/^/gm, " ✘ "));
    console.log("");
    console.log("Details:");
    console.log(badnewsDetails.join("\n").replace(/^/gm, "   "));
  }
};
