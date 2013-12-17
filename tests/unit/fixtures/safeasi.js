var fn = function() {}

[1].forEach(fn)

(function() {
    [1].forEach(fn)

    (fn || function () {})(5)

    /a/.exec('a').forEach(fn)
})()
