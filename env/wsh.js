/*jshint evil: true */
/*global ActiveXObject: false, JSHINT: false, WScript: false */

(function() {
	// load JSHint if the two scripts have not been concatenated
	if (typeof JSHINT === "undefined") eval(new ActiveXObject("Scripting.FileSystemObject").OpenTextFile("..\\jshint.js", 1).ReadAll());

	var source = WScript.StdIn.ReadAll();

	// trim junk character; not sure where it comes from
	JSHINT(source.substr(0, source.length - 1), { passfail: false });

	var data = JSHINT.data();
	var exit = 0;

	if (data.errors && data.errors.length) {
		exit = 1;

		for (var i = 0; i < data.errors.length; i++) {
			var error = data.errors[i];

			if (!error) continue;

			if (i) WScript.StdOut.WriteLine("");

			WScript.StdOut.WriteLine("Lint at line " + error.line + " character " + error.character + ": " + error.reason);

			if (error.evidence) WScript.StdOut.WriteLine("    " + error.evidence.replace(/^\s*((?:[\S\s]*\S)?)\s*$/, "$1"));
		}

		if ((data.unused && data.unused.length) || (data.implieds && data.implieds.length)) WScript.StdOut.WriteLine("");
	}

	if (data.unused && data.unused.length) {
		exit = 1;

		WScript.StdOut.WriteLine("Unused variables:");

		var unused = {};

		for (var i = 0; i < data.unused.length; i++) {
			var item = data.unused[i];
			var func = item["function"];

			if (!(func in unused)) unused[func] = [];

			unused[func].push(item.name + " (" + item.line + ")");
		}

		for (var func in unused) {
			WScript.StdOut.WriteLine("    " + func + ": " + unused[func].join(", "));
		}

		if (data.implieds && data.implieds.length) WScript.StdOut.WriteLine("");
	}

	if (data.implieds && data.implieds.length) {
		exit = 1;

		WScript.StdOut.WriteLine("Implied globals:");

		var implieds = {};

		for (var i = 0; i < data.implieds.length; i++) {
			var item = data.implieds[i];

			if (!(item.name in implieds)) implieds[item.name] = [];

			implieds[item.name].push(item.line);
		}

		for (var name in implieds) {
			WScript.StdOut.WriteLine("    " + name + ": " + implieds[name].join(", "));
		}
	}

	WScript.Quit(exit);
}());
