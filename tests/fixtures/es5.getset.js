(function () {
    var _x;

    var obj = {
        set x(value) { _x = value; },
        name: 'jshint',
        get x() { return _x; }
    };

    var onlyGetter1 = {
        get x() { return _x; }
    };

    var onlyGetter2 = {
        get x() { return _x; },
        get y() { return _x; },
        a: 1
    };

    var onlySetter = { // bad
        set x(value) { _x = value; }
    };
    
    var doubleGetter = { // bad
        get x() { return _x; },
        name: 'jshint',
        get x() { return _x; }
    };

    var doubleSetter = { // bad
        get x() { return _x; },
        set x(value) { _x = value; },
        name: 'jshint',
        set x(value) { _x = value; }
    };
    
    var propertyAndGetter = { // bad
        x: 42,
        name: 'jshint',
        get x() { return _x; }
    };
}());
