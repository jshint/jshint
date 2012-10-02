"use strict";

require("shelljs/make");
var cli = require("cli");

var TESTS = [
	"tests/stable/unit/",
	"tests/stable/regression/",
	"tests/next/unit/"
];

var OPTIONS = {
	es5: true,
	boss: true,
	node: true,
	globalstrict: true,
	strict: true,
	white: true,
	smarttabs: true,
	maxlen: 100,
	newcap: false,
	undef: true,
	unused: true,
	onecase: true
};

target.all = function () {
	target.lint();
	target.test();
};

target.lint = function () {
	var jshint = require("jshint").JSHINT;
	var files = find("src").filter(function (file) {
		return file.match(/\.js$/);
	});

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

	if (Object.keys(failures).length == 0) {
		cli.ok("All files passed.");
		return;
	}

	for (var key in failures) {
		cli.error(key);

		failures[key].errors.forEach(function (err) {
			if (!err) {
				return;
			}

			var line = "[L" + err.line + "]";
			while (line.length < 10) {
				line += " ";
			}

			echo(line, err.reason);
		});

		echo("\n");
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
