/*jshint evil: true, shadow: true, wsh: true */
/*global JSHINT: false */

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

	var globals = {};
	var options = {};
	var named = WScript.Arguments.Named;
	var unnamed = WScript.Arguments.Unnamed;

	if (unnamed.length !== 1) {
		WScript.StdOut.WriteLine("    usage: cscript env/wsh.js [options] <script>");
		WScript.StdOut.WriteLine("");
		WScript.StdOut.WriteLine("Scans the specified script with JSHint and reports any errors encountered.  If");
		WScript.StdOut.WriteLine("the script name is \"-\", it will be read from standard input instead.");
		WScript.StdOut.WriteLine("");
		WScript.StdOut.WriteLine("JSHint configuration options can be passed in via optional, Windows-style");
		WScript.StdOut.WriteLine("arguments.  For example:");
		WScript.StdOut.WriteLine("    cscript env/wsh.js /jquery:true myscript.js");
		WScript.StdOut.WriteLine("    cscript env/wsh.js /globals:QUnit:false,_:false,foo:true foo.js");

		WScript.Quit(-1);
	}

	var script = unnamed(0);

	if (script === "-") {
		script = WScript.StdIn.ReadAll();
	} else {
		script = new ActiveXObject("Scripting.FileSystemObject").OpenTextFile(script, 1).ReadAll();
	}

	for (var etor = new Enumerator(named); !etor.atEnd(); etor.moveNext()) {
		var option = etor.item();
		var value = named(option);

		if (option === "global") {
			value = value.split(",");

			for (var i = 0; i < value.length; i++) {
				var name = value[i].split(":");

				if (name.length === 1 || name[1] === "false") {
					globals[name[0]] = false;
				} else if (name[1] === "true") {
					globals[name[0]] = true;
				} else {
					WScript.StdOut.WriteLine("Unrecognized value for global: " + name[0]);
					WScript.StdOut.WriteLine("Must be \"true\", \"false\", or omitted.");

					WScript.Quit(-1);
				}
			}
		} else {
			options[option] = value === "true" ? true : value === "false" ? false : value;
		}
	}

	// trim junk character; not sure where it comes from
	JSHINT(script.substr(0, script.length - 1), options, globals);

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
