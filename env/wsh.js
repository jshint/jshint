/*jshint evil: true, shadow: true, wsh: true */
/*global JSHINT: false */

(function() {
	function readFile(path, charset) {
		try {
			var stream = WScript.CreateObject("ADODB.Stream");

			stream.Charset = charset;
			stream.Open();
			stream.LoadFromFile(path);

			var result = stream.ReadText();
			stream.close();

			return result;
		} catch (ex) {
			return null;
		}
	}

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

	var scriptName = WScript.ScriptName;
	var scriptPath = WScript.ScriptFullName;

	scriptPath = scriptPath.substr(0, scriptPath.length - scriptName.length);

	// load JSHint if the two scripts have not been concatenated
	if (typeof JSHINT === "undefined") {
		eval(readFile(scriptPath + "..\\jshint.js", 'utf-8'));

		if (typeof JSHINT === "undefined") {
			WScript.StdOut.WriteLine("ERROR: Could not find 'jshint.js'.");

			WScript.Quit(-2);
		}
	}

	var globals = {};
	var options = {};
	var named = WScript.Arguments.Named;
	var unnamed = WScript.Arguments.Unnamed;

	if (unnamed.length !== 1) {
		WScript.StdOut.WriteLine("    usage: cscript " + scriptName + " [options] <script>");
		WScript.StdOut.WriteLine("");
		WScript.StdOut.WriteLine("Scans the specified script with JSHint and reports any errors encountered.  If");
		WScript.StdOut.WriteLine("the script name is \"-\", it will be read from standard input instead.");
		WScript.StdOut.WriteLine("");
		WScript.StdOut.WriteLine("JSHint configuration options can be passed in via optional, Windows-style");
		WScript.StdOut.WriteLine("arguments.  For example:");
		WScript.StdOut.WriteLine("    cscript " + scriptName + " /jquery:true myscript.js");
		WScript.StdOut.WriteLine("    cscript " + scriptName + " /global:QUnit:false,_:false,foo:true foo.js");
		WScript.StdOut.WriteLine("");
		WScript.StdOut.WriteLine("By default, we assume that your file is encoded if UTF-8. You can change that");
		WScript.StdOut.WriteLine("by providing a custom charset option:");
		WScript.StdOut.WriteLine("    cscript " + scriptName + " /charset:ascii myscript.js");

		WScript.Quit(-1);
	}

	var script = unnamed(0);

	if (script === "-") {
		try {
			script = WScript.StdIn.ReadAll();
		} catch (ex) {
			script = null;
		}
	} else {
		script = readFile(script, named('charset') || 'utf-8');
	}

	if (script === null) {
		WScript.StdOut.WriteLine("ERROR: Could not read target script.");

		WScript.Quit(2);
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

	JSHINT(script, options, globals);

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
