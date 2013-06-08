/*jshint boss: true, rhino: true, unused: true, undef: true, white: true, quotmark: double */
/*global JSHINT */

(function (args) {
	"use strict";

	var filenames = [];
	var flags = {};
	var optstr; // arg1=val1,arg2=val2,...
	var predef; // global1=true,global2,global3,...
	var opts   = {};
	var retval = 0;

	args.forEach(function (arg) {
		if (arg.indexOf("--") === 0 ) {
			// Configuration Flags might be boolean or will be split into name and value
			if( arg.indexOf("=") > -1 ) {
				var o = arg.split("=");
				flags[ o[0].slice(2) ] = o[1];
			} else {
				flags[ arg.slice(2) ] = true;
			}

			return;
		} else if (arg.indexOf("=") > -1) {
			// usual rhino configuration, like "boss=true,browser=true"
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

	// If a config flag has been provided, try and load that
	if( "config" in flags ) {
		var cfgFileContent;
		try {
			cfgFileContent = readFile(flags.config);
		} catch (e) {
			print("Could not read config file " + flags.config);
			quit(1);
		}

		print("Reading config from " + flags.config);
		opts = JSON.parse( cfgFileContent );
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

	opts.predef = opts.globals || {};
	delete(opts.globals);

	if (predef) {
		predef.split(",").forEach(function (arg) {
			var global = arg.split("=");
			opts.predef[global[0]] = global[1] === "true" ? true : false;
		});
	}

	filenames.forEach(function (name) {
		var input = readFile(name);

		if (!input) {
			print("jshint: Couldn't open file " + name);
			quit(1);
		}

		if (!JSHINT(input, opts)) {
			for (var i = 0, err; err = JSHINT.errors[i]; i += 1) {
				print(err.reason + " (" + name + ":" + err.line + ":" + err.character + ")");
				print("> " + (err.evidence || "").replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
				print("");
			}
			retval = 1;
		}
	});

	quit(retval);
}(arguments));
