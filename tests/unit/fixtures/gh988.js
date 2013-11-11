function maxStatements() {
    /*jshint maxstatements: 2 */
    var x = 10;
    return function () {
        /*jshint maxstatements: false */
        var y = 20;
        var z = 30;
        return x + y + z;
    };
}

function maxParams() {
    /*jshint maxparams: 1 */
    return function (a) {
        /*jshint maxparams: false */
        return function (b, c) {
            return true;
        };
    };
}

function maxDepth() {
    /*jshint maxdepth: 1 */
    return function () {
        /*jshint maxdepth: false */
        if (x) {
            if (y) {}
        }
    };
}

function maxComplexity() {
    /*jshint maxcomplexity: 1 */
    return function () {
        /*jshint maxcomplexity: false */
        if (x) {
            return true;
        } else {
            return false;
        }
    };
}

function indent() {
    /*jshint indent: 4 */
    return function () {
      /*jshint indent: false */
      return true;
    };
}