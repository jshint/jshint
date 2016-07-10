"use strict";

var browserify = require("browserify");
var path       = require("path");
var version    = require("../package.json").version;

var srcDir     = path.join(__dirname, "../src");

var targets = ["web", "rhino"];

module.exports = function(target, done) {
  var bundle = browserify();
  bundle.transform('browserify-versionify');

  done = done || function() {};

  if (targets.indexOf(target) === -1) {
    done(new Error("Unrecognized target: '" + target + "'"));
    return;
  }

  bundle.require(srcDir + "/jshint.js", { expose: "jshint" });
  if (target === 'rhino') {
    // Replace the `exit` package with our own rhino-specific version.
    bundle.exclude('exit');
    bundle.require(srcDir + "/rhino-exit.js", { expose: "exit" });
    // Exclude the optional `daemon` package, an optional dep of `cli`.
    bundle.exclude('daemon');
    // Ensure that `path` is exported, since `cli` loads it dynamically.
    bundle.require('path', { expose: 'path' });
    // Load our collection of thunks and wrappers around the jshint cli.
    bundle.require(srcDir + "/rhino-cli.js", { expose: "jshint-rhino-cli" });
  }

  return bundle.bundle(function(err, src) {
    var wrapped;

    if (err) {
      done(err);
      return;
    }

    wrapped = [ "/*! " + version + " */",
      "var JSHINT;",
      "if (typeof window === 'undefined') window = {};",
      "(function () {",
        "var require;",
        src,
        "JSHINT = require('jshint').JSHINT;",
        "if (typeof exports === 'object' && exports) exports.JSHINT = JSHINT;",
      "}());"
    ];

    if (target === "rhino") {
      wrapped.splice(0, 0, "#!/usr/bin/env rhino", "var global = this;",
        "var cmdline_args = Array.prototype.slice.call(arguments);");
      wrapped.splice(-1, 0,
        // Start the CLI.
        "require('jshint-rhino-cli')(cmdline_args);");
    }

    done(null, version, wrapped.join("\n"));
  });
};
