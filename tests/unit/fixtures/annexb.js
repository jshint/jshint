'use strict';
var s = "foo";

// ES5 annex B
s.substr(1);

escape(s);

unescape(s);

var d = new Date();
d.getYear();
d.setYear(13);

s = d.toGMTString();
