var a = {};

// Invalid forms:

if ((a)) {}

if (typeof(a.b)) {}

(a ? a : (a=[])).push('3');

if (a || (1 / 0 == 1 / 0)) {}

// Valid forms:

(function() {})();

(function() {}).call();

(function() {}());

(function() {}.call());

if ((a.b, a)) {}

if ((a - 3) * 3) {}

var b = () => ({});

var c = (...d) => (d);

if (!(a instanceof b)) {}

if (!(a in b)) {}

if (!!(a && a.b)) {}
