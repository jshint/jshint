var a = [
    1,
    2,
];

var b = {
    a: 1,
    b: 2,
};

(function () {
    var _x;

    var obj = {
        get x() { return _x; },
        set x(value) { _x = value; }
    };
}());