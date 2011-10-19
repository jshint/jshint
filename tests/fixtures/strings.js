// ok, if option multistr is set
var test;
test = "hallo world\
\
this is a multiline string in javascript";

// never ok
// not detected as error before!
test = "hallo world

this is not a multiline string in javascript";

// mixed (should result in one error)
test = "hallo world\

this is a faulty multiline string in javascript";