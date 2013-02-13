"use strict";

module.exports = {
	reporter: function (results, data, opts) {
		var len = results.length;
		var str = '';
		var prevfile;
		var source = '';
		var lastline;
		var repl;
		var offset = 0;
		opts = opts || {};

		results = results.sort(function(result) { 
			return [result.file, result.error.line];
		});

		results.forEach(function (result) {
			var file = result.file;
			var error = result.error;
			if (prevfile !== file) {
				lastline = -1;
				if (repl !== undefined) {
					str += '+' + repl + '\n';
					repl = undefined;
				}
				str += '--- '+file+'\n+++ '+file+'\n';
			}

			prevfile = file;
			if (error.reason === "Missing semicolon.") {
				if (error.line > lastline) {
					if (repl !== undefined) {
						str += '+' + repl + '\n';
						repl = undefined;
					}
					offset = 0;
					repl = error.evidence.slice(0, error.character-1) + ';' + error.evidence.slice(error.character-1);
					lastline = error.line;
					str += '@@ -' + (error.line) +	' +' + (error.line) + ' @@\n';
					str += '-' + error.evidence + '\n';
				} else {
					offset += 1;
					repl = repl.slice(0, error.character-1+offset) + ';' + repl.slice(error.character-1+offset);
					lastline = error.line;
				}
			}

		});

		if (repl !== undefined) {
			str += '+' + repl + '\n';
		}

		if (str) {
			process.stdout.write(str + "\n");
		}
	}
};
