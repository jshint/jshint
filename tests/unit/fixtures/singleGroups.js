var a = {};

// Invalid forms:

if ((a)) {}

if (typeof(a.b)) {}

// Valid forms:

(function() {})();

(function() {}).call();

(function() {}());

(function() {}.call());

if ((a.b, a)) {}

if ((a - 3) * 3) {}

var b = () => ({});

var c = (...d) => (d);
