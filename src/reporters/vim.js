"use strict";

module.exports = {
	reporter: function (results, data, opts) {
		var str = '';

		opts = opts || {};

		results.forEach(function (result) {
			var error = result.error;

			str += result.file  + ':' + error.line + ':' + error.reason;

			if (opts.verbose) {
				str += ' (' + error.code + ')';
			}

			str += '\n';
		});

		if (str) {
			process.stdout.write(str + "\n");
		}
	}
};
