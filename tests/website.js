/**
 * The jshint.com project website generates some content based on the state of
 * this repository. Changes in this repository could therefore interfere with
 * the website. This script verifies that when the website is configured to use
 * the current codebase, it builds successfully and passes its own test suite.
 */
"use strict";

var execSync = require("child_process").execSync;
var path = require("path");
var fs = require("fs");

var repository = "https://github.com/jshint/jshint.github.io.git";
var websiteDir = path.join(__dirname, "jshint.com");
var linkName = path.join(websiteDir, "res", "jshint");

function execInSite(command) {
  execSync(command, { stdio: "inherit", cwd: websiteDir });
}

fs.mkdirSync(websiteDir, {recursive: true});

execInSite("git init");
execInSite("git pull " + repository + " dev");
execInSite("git rm -rf --ignore-unmatch res/jshint");

try {
  fs.unlinkSync(linkName);
} catch (error) {}

fs.symlinkSync(path.join(__dirname, ".."), linkName);

execInSite("npm install");
execInSite("npm test");
