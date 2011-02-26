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
    var ml = "chain().chain().chain().\n    chain();",
        sc = "hello()";

    it("must tolerate new line after dot", function () {
        expect(JSHINT(ml)).toEqual(true);
    });

    it("must not tolerate missing semicolons by default", function () {
        expect(JSHINT(sc)).toEqual(false);
    });

    it("must tolerate missing semicolons when asi:true", function () {
        expect(JSHINT(sc, { asi: true })).toEqual(true);
    });
});

describe("Operators", function () {
    var dc = "delete NullReference;";

    // http://perfectionkills.com/understanding-delete/#built_ins_and_dontdelete
    it("must not tolerate deleting variables", function () {
        expect(JSHINT(dc)).toEqual(false);
    });

    it("must report of undefined variables when undef:true", function () {
        var global = "hey();",
            local  = "(function () { hey(); }());";

        expect(JSHINT(global, { undef: true })).toEqual(false);
        expect(JSHINT(local, { undef: true })).toEqual(false);
    });

    /*
     * Operators typeof and delete accept a reference. There is no
     * runtime error, if the base object of that reference is null.
     */
    it("must tolerate references in typeof and delete", function () {
        var localTypeof  = "(function () { if (typeof NullReference) {} }());",
            globalTypeof = "if (typeof NullReference) {}",
            localDelete  = "(function () { delete NullReference; }());",
            globalDelete = "delete NullReference;";

        expect(JSHINT(globalTypeof, { undef: true })).toEqual(true);
        expect(JSHINT(localTypeof, { undef: true })).toEqual(true);

        expect(JSHINT(localDelete, { undef: true })).toEqual(false);
        expect(JSHINT.data().errors.length).toEqual(1);
        expect(JSHINT(globalDelete, { undef: true })).toEqual(false);
        expect(JSHINT.data().errors.length).toEqual(1);
    });
});

describe("Keywords", function () {
    it("must not tolerate reassigning of undefined", function () {
        var undef = "var undefined = 1;";
        expect(JSHINT(undef)).toEqual(false);
    });

    /*
     * `undefined` as a function param is a common pattern to protect
     * against the case when somebody does `undefined = true` and
     * help with minification. More info: https://gist.github.com/315916
     */
    it("must tolerate undefined as an argument", function () {
       var undef = "(function (undefined) {}(undefined));";
       expect(JSHINT(undef)).toEqual(true);
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

    var eqnull = "if (e == null) { doSmth(); }",
        nulleq = "if (null == e) { doSmth(); }";

    it("should warn about `== null` by default", function () {
        expect(JSHINT(eqnull)).toEqual(false);
        expect(JSHINT(nulleq)).toEqual(false);
    });

    it("should allow `== null` if boss:true", function () {
        expect(JSHINT(eqnull, { boss: true })).toEqual(true);
        expect(JSHINT(nulleq, { boss: true })).toEqual(true);
    });

    it("should not allow implicit case statement fall through by default", function () {
        var code = [
            "switch(foo) {"
          , "case 1:"
          ,     "doSmth();"
          , "case 2:"
          ,     "doSmth();"
          , "}"
        ];

        expect(JSHINT(code)).toEqual(false);
    });

    it("should allow explicit case statement fall through", function () {
        var code = [
            "switch(foo) {"
          , "case 1:"
          ,     "doSmth();"
          ,     "/* falls through */"
          , "case 2:"
          ,     "doSmth();"
          , "}"
        ];
        expect(JSHINT(code)).toEqual(true);
    });

    it("should not allow implicit case statement fall through by default", function () {
        var code = [
            "switch(foo) {"
          , "case 1:"
          , "case 2:"
          , "default:"
          ,     "doSmth();"
          , "}"
        ];
        expect(JSHINT(code)).toEqual(false);
    });

    it("should allow explicit case statement fall through", function () {
        var code = [
            "switch(foo) {"
          , "case 1:"
          ,     "/* falls through */"
          , "case 2:"
          ,     "/* falls through */"
          , "default:"
          ,     "doSmth();"
          , "}"
        ];
        expect(JSHINT(code)).toEqual(true);
    });
});

describe("Globals", function () {
    var win    = "window.location = 'http://google.com/';",
        jquery = [ "jQuery", "$" ],

        node   = [
            "__filename"
          , "__dirname"
          , "Buffer"
          , "GLOBAL"
          , "global"
          , "module"
          , "process"
          , "require"
        ],

        couch   = [
            "require"
          , "respond"
          , "getRow"
          , "emit"
          , "send"
          , "start"
          , "sum"
          , "log"
          , "exports"
          , "module"
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

    it("must know about jQuery globals", function () {
        var code = "(function () { return [ " + jquery.join(",") + " ]; }());";

        JSHINT(code, { jquery: true });
        var report = JSHINT.data();

        expect(report.implieds).toEqual(undefined);
        expect(report.globals.length).toEqual(2);

        for (var i = 0, g; g = report.globals[i]; i++)
            expect(g == "jQuery" || g == "$").toEqual(true);
    });

    it("must know about CouchDB globals", function () {
        var code = "(function () { return [ " + couch.join(",") + " ]; }());";

        JSHINT(code, { couch: true });
        var report = JSHINT.data();

        expect(report.implieds).toEqual(undefined);
        expect(report.globals.length).toEqual(10);

        var globals = {};
        for (var i = 0, g; g = report.globals[i]; i++)
            globals[g] = true;

        for (i = 0, g; g = couch[i]; i++)
            expect(g in globals).toEqual(true);
    });
    
    it("must allow custom globals, so it's not necessary to spam code " +
       "with comments when the globals are obvious", function () {
        var code = "(function () { return [ fooGlobal, barGlobal ]; }());";
        
        var myCustomGlobals = {fooGlobal:false, barGlobal:false};
        JSHINT(code, {}, myCustomGlobals);
        
        var report = JSHINT.data();

        expect(report.implieds).toEqual(undefined);
        expect(report.globals.length).toEqual(2);

        var globals = {};
        for (var i = 0, g; g = report.globals[i]; i++)
            globals[g] = true;

        for (i = 0, g; g = myCustomGlobals[i]; i++)
            expect(g in globals).toEqual(true);
    });
    
});