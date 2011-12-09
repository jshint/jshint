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

    var obj2 = {
        get x() { return _x; },
        name: 'jshint',
        set x(value) { _x = value; }
    };

    var onlyGetter1 = {
        get x() { return _x; }
    };

    var onlyGetter2 = {
        get x() { return _x; },
        get y() { return _x; },
        a: 1
    };

    var onlySetter = {
        set x(value) { _x = value; }
    };
}());
