var a = function () {
    return;
}();

var b = (function () {
    return;
})();

var c = (function () {
    return;
}());

var d = (function () {
    return;
});

var e = (function (a) {
    return;
}).call(null, 1);

var f = (function () {
    return;
}).apply(null, []);

var g = (function () {
    return;
}.apply(null, []));

var h = (function () {
    return;
}.call(null, true, undefined));
