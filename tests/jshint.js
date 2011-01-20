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
});