#!/usr/bin/env node
/*global ls:true, target:true, find: true, echo: true, cat:true, exit:true, exec: true */

"use strict";

require("shelljs/make");
var cli = require("cli");

var TESTS = [
	"tests/",
	"tests/stable/unit/",
	"tests/stable/regression/",
	"tests/next/unit/",
];

var OPTIONS = JSON.parse(cat("./jshint.json"));

target.all = function () {
	target.lint();
	target.test();
	target.build();
};

target.lint = function () {
	var jshint = require("jshint").JSHINT;
	var files = find("src").filter(function (file) {
		return file.match(/\.js$/);
	}).concat(ls(__dirname + "/*.js"));

	TESTS.forEach(function (dir) {
		ls(dir + "*.js").forEach(function (file) {
			files.push(file);
		});
	});

	echo("Linting files...", "\n");

	var failures = {};
	files.forEach(function (file) {
		var passed = jshint(cat(file), OPTIONS);
		process.stdout.write(passed ? "." : "F");

		if (!passed) {
			failures[file] = jshint.data();
		}
	});

	echo("\n");

	if (Object.keys(failures).length === 0) {
		cli.ok("All files passed.");
		return;
	}

	var outputError = function (err) {
		if (!err) {
			return;
		}

		var line = "[L" + err.line + "]";
		while (line.length < 10) {
			line += " ";
		}

		echo(line, err.reason);
		echo("\n");
	};

	for (var key in failures) {
		cli.error(key);
		failures[key].errors.forEach(outputError);
	}

	exit(1);
};

target.test = function () {
	var nodeunit = require("nodeunit").reporters.minimal;
	var files = [];

	TESTS.forEach(function (dir) {
		ls(dir + "*.js").forEach(function (file) {
			files.push(file);
		});
	});

	echo("Running tests...", "\n");
	nodeunit.run(files);
};

target.build = function () {
	var browserify = require("browserify");
	var bundle = browserify({ debug: true, exports: [ "require" ] });

	bundle.addEntry("./src/stable/jshint.js");
	require('fs').mkdir('dist', function () {
		bundle.bundle().to("./dist/jshint.js");
		cli.ok("Bundle");

		// Rhino
		var rhino = cat("./dist/jshint.js", "./src/platforms/rhino.js");
		rhino = "#!/usr/bin/env rhino\n\n" + rhino;
		rhino.to("./dist/jshint-rhino.js");
		exec("chmod +x dist/jshint-rhino.js");
		cli.ok("Rhino");
	});
};
