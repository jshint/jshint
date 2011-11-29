var fs = require('fs');
var jshint = require('./jshint').JSHINT;

var file = fs.readFileSync('./othertest.js').toString();

var result = jshint(file);
result && console.log("Lint Free.");
jshint.errors.forEach(function (err) {
  err && console.log(err.line, err.character, err.reason);
});
