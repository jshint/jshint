"use strict";

var hp = require("htmlparser2");

/**
 * Extract the JavaScript source code from HTML source code. All HTML lines
 * will be replaced by empty lines, so the output code will have the same line
 * number as the input.
 *
 * @param {string} code HTML source code
 *
 * @return {string} JS source code
 */
module.exports = function (code) {

	var result = [];
	var index = 0;
	var inScript = false;

	var parser = new hp.Parser({

		onopentag: function (name, attrs) {
			// Test if the current tag is a javascript tag
			if (name === "script" && (
			    !attrs.type || attrs.type.toLowerCase().indexOf("text/javascript") >= 0
			   )) {

				inScript = true;

				// Push all new lines we found since the last time in the result
				result.push.apply(result, code.slice(this.index, parser.endIndex).match(/\n\r|\n|\r/g));

			}
		},

		onclosetag: function (name) {
			// If we were in a script tag, we are exiting from it
			if (name === "script" && inScript) {
				inScript = false;
				index = parser.startIndex;
			}
		},

		ontext: function (data) {
			if (inScript) {
				// Collect the good javascript juice
				result.push(data);
			}
		}

	});
	
	parser.parseComplete(code);

	return result.join("");
};

if (process.mainModule === module) {
	// Simple cli to extract the javascript code from HTML read from stdin
	require("cli").withStdin(function (code) {
		process.stdout.write(module.exports(code));
	});
}
