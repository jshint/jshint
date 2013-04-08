/*jshint boss: true, rhino: true, unused: true, undef: true, white: true, quotmark: double */
/*global JSHINT */
/*global checkstyleReporter */

(function (args) {
	"use strict";
    
	var filenames = [];
	var reporter; // only "checkstyle" is recognized
	var optstr; // arg1=val1,arg2=val2,... or reporter=<reporter>
	var predef; // global1=true,global2,global3,...
	var opts   = {};
	var retval = 0;
	var results = [];
	var data = [];
	var lintData;
    
	args.forEach(function (arg) {
		if (arg.indexOf("=") > -1) {
			// Check first for reporter option
			if (arg.split("=")[0] === "reporter") {
				reporter = arg.split("=")[1];
				return;
			}
			if (!optstr) {
				// First time it's the options.
				optstr = arg;
			} else {
				predef = arg;
			}

			return;
		}

		if (optstr) {
			predef = arg;
			return;
		}

		filenames.push(arg);
	});

	if (filenames.length === 0) {
		print("Usage: jshint.js file.js");
		quit(1);
	}

	if (optstr) {
		optstr.split(",").forEach(function (arg) {
			var o = arg.split("=");
			if (o[0] === "indent") {
				opts[o[0]] = parseInt(o[1], 10);
			} else {
				opts[o[0]] = (function (ov) {
					switch (ov) {
					case "true":
						return true;
					case "false":
						return false;
					default:
						return ov;
					}
				}(o[1]));
			}
		});
	}

	if (predef) {
		opts.predef = {};

		predef.split(",").forEach(function (arg) {
			var global = arg.split("=");
			opts.predef[global[0]] = global[1] === "true" ? true : false;
		});
	}

	filenames.forEach(function (file) {
		var input = readFile(file);
		
		if (!input) {
			print("jshint: Couldn't open file " + file);
			quit(1);
		}
		
		if (!JSHINT(input, opts)) {
			JSHINT.errors.forEach(function (err) {
				if (err) {
					results.push({ file: file, error: err });
				}
			});
			retval = 1;
		}

		lintData = JSHINT.data();

		if (lintData) {
			lintData.file = file;
			data.push(lintData);
		}
	});
	   
	if (reporter === "checkstyle" && typeof checkstyleReporter !== "undefined") {
		checkstyleReporter(results, data);
	} else {
		for (var i = 0; i < results.length; i += 1) {
			var file = results[i].file;
			var err = results[i].error;
			print(err.reason + " (" + file + ":" + err.line + ":" + err.character + ")");
			print("> " + (err.evidence || "").replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
			print("");
		}
	}

	quit(retval);
}(arguments));
