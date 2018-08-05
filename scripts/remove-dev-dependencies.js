"use strict"
/**
 * Some of this project's development dependencies cannot be successfully
 * installed in legacy versions of Node.js. This module removes development
 * dependencies from the project's npm package manifest so that the `npm`
 * utility does not attempt to install them in a subsequent execution of `npm
 * install. Although the `npm` utility offers a "remove" command, that command
 * can remove only one package per invocation and triggers installation of all
 * other packages. This script allows mutliple packages to be removed prior to
 * installation.
 */

var path = require("path");
var fs = require("fs");
var manifestLocation = path.join(__dirname, "..", "package.json");
var manifest = require(manifestLocation);
var packageNames = process.argv.slice(2);
var newContents;

packageNames.forEach(function(packageName) {
  if (!manifest.devDependencies[packageName]) {
    throw new Error("Could not locate development dependency named \"" + packageName + "\"");
  }

  delete manifest.devDependencies[packageName];
});

newContents = JSON.stringify(manifest, null, 2);

fs.writeFile(manifestLocation, newContents, function(err) {
  if (err) {
    throw new Error(err);
  }

  console.log("Successfully removed packages. New contents:");
  console.log(newContents.replace(/(^|\n)/g, "$1> "));
});
