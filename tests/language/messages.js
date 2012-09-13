var fs = require("fs");
var messageFunc = "warning|warningAt|error|errorAt".split("|");

(function() {
	
	fs.readFile("jshint.js", function(err, data) {
		if (err) throw err;
		
		var code = data.toString();
		var messages = [];
		for(var i=0; i<messageFunc.length; i++) {
			var regexp = new RegExp(messageFunc[i] + "\\([\n]?\"([^\"]*)\"", "g");
			var result;

			while((result = regexp.exec(code)) != null) {
				
				var key = result[1];
				if (messages[key]) {
					messages[key]++;
				} else {
					messages[key] = 1;
				}
			}
		}
		
		console.log(messages);
	});
}());
