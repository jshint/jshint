var JSLINT = require("../fulljslint.js").JSLINT;

describe("Blocks", function () {
    it("must tolerate one-line blocks", function () {
        var ol = "if (cond) return true;",
            ml = "if (cond) { return true; }";

        // Without oneline
        expect(JSLINT(ml)).toEqual(true);
        expect(JSLINT(ol)).toEqual(false);

        // With oneline
        expect(JSLINT(ml, { oneline: true })).toEqual(true);
        expect(JSLINT(ol, { oneline: true })).toEqual(true);
    });

    it("must tolerate arguments.callee and arguments.caller by default", function () {
        var ce = "function test() { return arguments.callee; }",
            cr = "function test() { return arguments.caller; }";

        expect(JSLINT(ce)).toEqual(true);
        expect(JSLINT(cr)).toEqual(true);

        // Go back to Crockford's world with `callee` switch
        expect(JSLINT(ce, { calref: true })).toEqual(false);
        expect(JSLINT(cr, { calref: true })).toEqual(false);
    });
});