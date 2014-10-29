/*jshint node:true, undef:true, maxlen:100 */

var fs = require('fs');
var path = require('path');

exports.fixture = function (name) {
  return fs.readFileSync(path.join(__dirname, '/../unit/fixtures/', name)).toString();
};
