//pass - global scope
var c;

//fail - func scope
(function () {
	var a = true;
	if (a)
		return;
	var b = false;
}());

//pass - func scope
(function () {
	var a = true;
	var b = false;
	if (a)
		return;
}());

//fail - global scope
var d;
