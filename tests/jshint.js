var JSLINT = require("../fulljslint.js").JSLINT;

describe("Blocks", function () {
    it("must tolerate one-line blocks", function () {
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

        // By default, tolerate one-line blocks
        for (var i = 0, stmt; stmt = ol[i]; i++)
            expect(JSLINT(stmt)).toEqual(true);

        for (var i = 0, stmt; stmt = ml[i]; i++)
            expect(JSLINT(stmt)).toEqual(true);

        // If curly:true, require blocks to be wrapped with { }
        for (var i = 0, stmt; stmt = ol[i]; i++)
            expect(JSLINT(stmt, { curly: true })).toEqual(false);

        for (var i = 0, stmt; stmt = ml[i]; i++)
            expect(JSLINT(stmt, { curly: true })).toEqual(true);
    });

    it("must tolerate arguments.callee and arguments.caller by default", function () {
        var ce = "function test() { return arguments.callee; }",
            cr = "function test() { return arguments.caller; }";

        expect(JSLINT(ce)).toEqual(true);
        expect(JSLINT(cr)).toEqual(true);

        // Go back to Crockford's world with noarg:true
        expect(JSLINT(ce, { noarg: true })).toEqual(false);
        expect(JSLINT(cr, { noarg: true })).toEqual(false);
    });
});