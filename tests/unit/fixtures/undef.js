undef(); // this line will generate a warning
if (typeof undef) {} // this line won't because typeof accepts a reference
                     // even when the base object of that reference is null

var fn = function () {
    localUndef();

    if (typeof localUndef)
        return;
};
