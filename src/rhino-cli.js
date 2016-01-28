"use strict";

var fs = require('fs');
var path = require('path');
var util = require('util');
var rhinoExit = require('./rhino-exit');

// CLI support for Rhino.
module.exports = function(args) {
  /* global java */

  // Thunks required for the npm `cli` package.
  global.process = process;
  process.binding = function(name) {
    if (name === 'natives') {
      return { path: path };
    }
    throw new Error("process.binding unsupported");
  };
  process.exit = rhinoExit;
  process.env = {};
  for (var it = java.lang.System.getenv().entrySet().iterator();
       it.hasNext();) {
    var entry = it.next();
    process.env["" + entry.getKey()] = "" + entry.getValue();
  }

  // Thunks requires for the npm `shjs` package.
  // Functions required for: shjs.test("-e",...), shjs.test("-d",...),
  // shjs.cat(...), shjs.ls(..), shjs.ls('-R',...)
  var fakeCwd = '' + java.lang.System.getProperty('user.dir');
  process.cwd = function() {
    return fakeCwd;
  };
  process.chdir = function(dir) {
    fakeCwd = path.resolve(fakeCwd, dir);
  };
  var Stats = function Stats(filename) {
    this.file = new java.io.File(path.resolve(fakeCwd, filename));
  };
  Stats.prototype.isDirectory = function() {
    return this.file.isDirectory();
  };
  Stats.prototype.isFile = function() {
    return this.file.isFile();
  };
  fs.statSync = function(path) {
    return new Stats(path);
  };
  fs.existsSync = function(path) {
    if (path === null || path === undefined) { return false; }
    return new Stats(path).file.exists();
  };
  fs.readdirSync = function(dir) {
    var file = new java.io.File(path.resolve(fakeCwd, dir));
    var entries = file.list() || [];
    // convert from Java array of Java string to JS array of JS string
    var result = [];
    for (var i = 0; i < entries.length; i++) {
      result[i] = '' + entries[i];
    }
    return result.sort();
  };
  fs.readFileSync = function(filename, options) {
    if (typeof options === "string") { options = { encoding: options }; }
    if (!(options && options.encoding)) {
      throw new Error("binary readFileSync not supported");
    }
    var buf =
        java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 4096);
    var stream = new java.io.FileInputStream(path.resolve(fakeCwd, filename));
    var reader = new java.io.InputStreamReader(stream, options.encoding);
    var result = "";
    while (true) {
      var n = reader.read(buf, 0, buf.length);
      if (n < 0) { break; }
      result += new java.lang.String(buf, 0, n);
    }
    return result;
  };

  // Hack in an implementation of console.*
  global.console = require('console-browserify');
  global.console.log = function() {
    java.lang.System.out.println(util.format.apply(util, arguments));
  };
  global.console.error = function() {
    java.lang.System.err.println(util.format.apply(util, arguments));
  };

  // Add two initial entries to the command-line arguments array, to match
  // node behavior.
  args.unshift('node', __filename);

  // Okay, now execute the CLI.
  require("./cli.js").interpret(args);
};
