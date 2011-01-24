var JSHINT = require("../jshint.js").JSHINT;

describe("Blocks", function () {
    var ol = [
            "if (cond) return true;",
            "for (;;) console.log('test');",
            "while (true) console.log('test');"
        ],

        ml = [
            "if (cond) { return true; }",
            "for (;;) { console.log('test'); }",
            "while (true) { console.log('test'); }"
        ];
    
    it("must tolerate one-line blocks by default", function () {
        // By default, tolerate one-line blocks
        for (var i = 0, stmt; stmt = ol[i]; i++)
            expect(JSHINT(stmt)).toEqual(true);

        for (var i = 0, stmt; stmt = ml[i]; i++)
            expect(JSHINT(stmt)).toEqual(true);
    });

    it("must require curly braces if curly:true", function () {
        for (var i = 0, stmt; stmt = ol[i]; i++)
            expect(JSHINT(stmt, { curly: true })).toEqual(false);

        for (var i = 0, stmt; stmt = ml[i]; i++)
            expect(JSHINT(stmt, { curly: true })).toEqual(true);
    });
});

describe("Functions", function () {
    var ce = "function test() { return arguments.callee; }",
        cr = "function test() { return arguments.caller; }",

        ns = "new Klass();",
        na = "var obj = new Klass();";
    
    it("must tolerate arguments.callee and arguments.caller by default", function () {
        expect(JSHINT(ce)).toEqual(true);
        expect(JSHINT(cr)).toEqual(true);
    });

    it("must not tolerate arguments.callee and arguments.caller with noarg:true", function () {
        expect(JSHINT(ce, { noarg: true })).toEqual(false);
        expect(JSHINT(cr, { noarg: true })).toEqual(false);
    });

    it("must tolerate using constructors for side-effects", function () {
        expect(JSHINT(ns)).toEqual(true);
        expect(JSHINT(na)).toEqual(true);
    });

    it("must not tolerate using constructors for side-effects with nonew:true", function () {
        expect(JSHINT(ns, { nonew: true })).toEqual(false);
        expect(JSHINT(na, { nonew: true })).toEqual(true);
    });
});