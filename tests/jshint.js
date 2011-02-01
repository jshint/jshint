/*jshint boss: true, laxbreak: true */
/*global describe: false, it: false, expect: false */

var JSHINT = require("../jshint.js").JSHINT,
    fs     = require("fs");

describe("JSHint", function () {
    it("must pass its own check", function () {
        var src = fs.readFileSync(__dirname + "/../jshint.js", "utf8");
        expect(JSHINT(src)).toEqual(true);
        expect(JSHINT.data().implieds).toEqual(undefined);
    });

    it("rhino.js must pass jshint check", function () {
        var src = fs.readFileSync(__dirname + "/../env/rhino.js", "utf8");
        expect(JSHINT(src, { rhino: true })).toEqual(true);
    });

    it("tests/jshint.js must pass jshint check", function () {
        var src = fs.readFileSync(__dirname + "/jshint.js", "utf8");
        expect(JSHINT(src, { node: true })).toEqual(true);
    });
});

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
        ],

        eb = "for (;;) {}";

    it("must tolerate one-line blocks by default", function () {
        // By default, tolerate one-line blocks
        for (var i = 0, stmt; stmt = ol[i]; i++)
            expect(JSHINT(stmt)).toEqual(true);

        for (i = 0, stmt; stmt = ml[i]; i++)
            expect(JSHINT(stmt)).toEqual(true);
    });

    it("must require curly braces if curly:true", function () {
        for (var i = 0, stmt; stmt = ol[i]; i++)
            expect(JSHINT(stmt, { curly: true })).toEqual(false);

        for (i = 0, stmt; stmt = ml[i]; i++)
            expect(JSHINT(stmt, { curly: true })).toEqual(true);
    });

    it("must tolerate empty blocks", function () {
        expect(JSHINT(eb)).toEqual(true);
    });

    it("must not tolerate empty blocks if noempty:true", function () {
        expect(JSHINT(eb, { noempty: true })).toEqual(false);
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

describe("Statements", function () {
    var ml = "chain().chain().chain().\n    chain();";

    it("must tolerate new line after dot", function () {
        expect(JSHINT(ml)).toEqual(true);
    });
});

describe("Control statements", function () {
    var cond  = "if (e = 1) { doSmth(); }",
        loopw = "while (obj = arr.next()) { hey(); }",
        loopf = "for (var b; b = arr.next();) { hey(); }",
        loopd = "do { smth(b); } while (b = arr.next());";

    it("should warn about using assignments by default", function () {
        expect(JSHINT(cond)).toEqual(false);
        expect(JSHINT(loopw)).toEqual(false);
        expect(JSHINT(loopf)).toEqual(false);
        expect(JSHINT(loopd)).toEqual(false);
    });

    it("should allow using assignments when boss:true", function () {
        expect(JSHINT(cond, { boss: true })).toEqual(true);
        expect(JSHINT(loopw, { boss: true })).toEqual(true);
        expect(JSHINT(loopf, { boss: true })).toEqual(true);
        expect(JSHINT(loopd, { boss: true })).toEqual(true);
    });
});

describe("Globals", function () {
    var win  = "window.location = 'http://google.com/';",
        node = [
            "__filename"
          , "__dirname"
          , "Buffer"
          , "GLOBAL"
          , "global"
          , "module"
          , "process"
          , "require"
        ];

    it("must know that window is a predefined global", function () {
        JSHINT(win, { browser: true });
        var report = JSHINT.data();
        expect(report.implieds).toEqual(undefined);
        expect(report.globals.length).toEqual(1);
        expect(report.globals[0]).toEqual("window");
    });

    it("must know about node.js globals", function () {
        var code = "(function () { return [ " + node.join(",") + " ]; }());";

        JSHINT(code, { node: true });
        var report = JSHINT.data();

        expect(report.implieds).toEqual(undefined);
        expect(report.globals.length).toEqual(8);

        var globals = {};
        for (var i = 0, g; g = report.globals[i]; i++)
            globals[g] = true;

        for (i = 0, g; g = node[i]; i++)
            expect(g in globals).toEqual(true);
    });
});