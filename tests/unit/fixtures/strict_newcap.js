var factory = function () {};
var Factory = function () {};

(function () {
    "use strict";

    var a = new factory();
    var b = new Factory();

    return a && b;
})();


(function () {
    "use strict";
    /*jshint newcap:false */

    var a = new factory();
    var b = new Factory();

    return a && b;
})();
