var fs = require("fs"),
	JSHINT = require("../../jshint").JSHINT;
	
var testRule = {
	bitwise: true,
	eqeqeq: true,
	forin: true,
	immed: true,
	latedef: true,
	laxcomma: true,
	newcap: false,
	noarg: true,
	noempty: true,
	nonew: true,
	plusplus: true,
	regexp: true,
	undef: true,
	strict: false,
	trailing: true,
	white: true
};



(function() {
	var path = process.argv[2] || "jshint.js";
	
	fs.readFile(path, function(err, data) {
		
		if (err) throw err;
		var dummy = data.toString("utf-8");
		
		JSHINT.lang("ko");
		JSHINT(dummy, testRule);
		console.log(JSHINT.errors);
	});
}());
