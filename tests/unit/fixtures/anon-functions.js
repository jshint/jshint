var w = 2;
function x(f) {
	return f(w);
} // named function

x(function (n) { return n * 2; }); // anonymous function
x(function doubleIt(n) { return n * 2; }); // named function

(function () {
	return 0;
})(); // anonymous function

var y = function () {
	return 0;
}; // anonymous function

var z = function z() {
	return 0;
}; // named function
