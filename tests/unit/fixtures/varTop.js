//fail
(function () {
	var a = true;
	if (a)
		return;
	var b = false;
}());

//pass
(function () {
	var a = true;
	var b = false;
	if (a)
		return;
}());
