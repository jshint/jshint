// Invalid forms:

(a ? a : (a=[])).push('3');

if (a || (1 / 0 == 1 / 0)) {}

// Valid forms:

if ((a.b, a)) {}

var b = () => ({});

var c = (...d) => (d);
