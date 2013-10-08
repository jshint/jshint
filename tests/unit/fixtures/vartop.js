//pass - global scope, var assigned unnamed func
var a;
var b = function () {
	var b = 3;
	var c = 3;
	return b === c;
};
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

//fail - func scope
function func_name0 () {
	var f = true;
	if (f)
		return;
	for (var i = 0; i < 10; i++) {
		console.log(i);
	}
}

//pass - mixed declaration format
function func_name1 () {
	var a,
		b,
		c;
	//some comments
	var d;
}

//all pass except the last declaration/initialization - 
//more mixed declaration and initialization
function func_name2 () {

	var a = true,
		b = "hello";
	var c = true;
	//sample comment
	var d = "world";

	var e = "still valid";
	console.assert(1 === 1, "why yes, 1 does equal 1");
	var f = "this should fail!";
}

//pass - unnamed multi-line function (with closing brace on the same line
//as the last line of logic) assigned to a var followed by another
//var declaration.
function func_name3 () {

	var a = function () {
		var b = 3;
		var c = 3;
		return b === c; };
	var c;
}
