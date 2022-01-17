"use strict";

var fs = require("fs");

/**
 * Determine if a file or directory is present at the given filesystem path.
 *
 * @param {string} name
 *
 * @returns {boolean}
 */
exports.exists = function(name) {
  return fs.existsSync(name);
};

/**
 * Determine if a directory is present at the given filesystem path.
 *
 * @param {string} name
 *
 * @returns {boolean}
 */
exports.isDirectory = function(name) {
  var stat;
  try {
    stat = fs.statSync(name);
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }

    throw error;
  }

  return stat.isDirectory();
};

/**
 * Read a UTF-8-encoded file.
 *
 * @param {string} name
 *
 * @returns {string}
 */
exports.readFile = function(name) {
  return fs.readFileSync(name, "utf8");
};

/**
 * Retrieve the name of the files and directories within a given directory.
 *
 * @param {string} name
 *
 * @returns {string[]}
 */
exports.readDirectory = function(name) {
  return fs.readdirSync(name)
    .filter(function(name) {
      return name[0] !== ".";
    });
};
