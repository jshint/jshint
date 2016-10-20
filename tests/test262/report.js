"use strict";

function list(items, title) {
  if (items.length === 0) {
    return null;
  }

  return [
    title.replace("#", items.length),
    items.map(function(item) { return "- " + item; }).join("\n")
  ].join("\n");
}

module.exports = function report(summary, duration) {
  var seconds = (duration / 1000).toFixed(2);

  var lines = [
    "Results:",
    "",
    summary.totalTests + " total programs parsed in " + seconds + " seconds.",
    "",
    summary.expected.success.length + " valid programs parsed successfully",
    summary.expected.failure.length + " invalid programs produced parsing errors",
    summary.expected.falsePositive.length + " invalid programs parsed successfully (in accordance with expectations file)",
    summary.expected.falseNegative.length + " valid programs produced parsing errors (in accordance with expectations file)",
    "",
    list(summary.unexpected.success, "# valid programs parsed successfully (in violation of expectations file):"),
    list(summary.unexpected.failure, "# invalid programs produced parsing errors (in violation of expectations file):"),
    list(summary.unexpected.falsePositive, "# invalid programs parsed successfully (without a corresponding entry in expectations file):"),
    list(summary.unexpected.falseNegative, "# valid programs produced parsing errors (without a corresponding entry in expectations file):"),
    list(summary.unexpected.unrecognized, "# programs were referenced by the expectations file but not parsed in this test run:"),
  ].filter(function(line) {
    return typeof line === "string";
  });

  return lines.join("\n");
};
