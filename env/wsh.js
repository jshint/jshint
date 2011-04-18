/*jshint evil: true */
/*global ActiveXObject: false, JSHINT: false, WScript: false */

(function() {
	var formatters = {
		errors: function(errors, lines) {
			for (var i = 0; i < errors.length; i++) {
				var error = errors[i];

				if (!error) continue;

				if (i) lines.push("");

				lines.push("Line " + error.line + " character " + error.character + ": " + error.reason);

				if (error.evidence) lines.push("    " + error.evidence.replace(/^\s*((?:[\S\s]*\S)?)\s*$/, "$1"));
			}
		},

		implieds: function(implieds, lines) {
			lines.push("Implied globals:");

			var globals = {};

			for (var i = 0; i < implieds.length; i++) {
				var item = implieds[i];

				if (!(item.name in globals)) globals[item.name] = [];

				globals[item.name].push(item.line);
			}

			for (var name in globals) {
				lines.push("    " + name + ": " + globals[name].join(", "));
			}
		},

		unused: function(unused, lines) {
			lines.push("Unused variables:");

			var func, names = {};

			for (var i = 0; i < unused.length; i++) {
				var item = unused[i];

				func = item["function"];

				if (!(func in names)) names[func] = [];

				names[func].push(item.name + " (" + item.line + ")");
			}

			for (func in names) {
				lines.push("    " + func + ": " + names[func].join(", "));
			}
		}
	};

	// load JSHint if the two scripts have not been concatenated
	if (typeof JSHINT === "undefined") eval(new ActiveXObject("Scripting.FileSystemObject").OpenTextFile("..\\jshint.js", 1).ReadAll());

	var source = WScript.StdIn.ReadAll();

	// trim junk character; not sure where it comes from
	JSHINT(source.substr(0, source.length - 1), { passfail: false });

	var data = JSHINT.data();
	var lines = [];

	for (var formatter in formatters) {
		if (data[formatter]) {
			if (lines.length) lines.push("");

			formatters[formatter](data[formatter], lines);
		}
	}

	if (lines.length) {
		for (var i = 0; i < lines.length; i++) {
			WScript.StdOut.WriteLine(lines[i]);
		}

		WScript.Quit(1);
	} else {
		WScript.Quit(0);
	}
}());
