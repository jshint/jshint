// wsh.js
// 2009-09-11

// This is the WSH companion to fulljslint.js.
/*
Copyright (c) 2002 Douglas Crockford  (www.JSLint.com) WSH Edition
*/

/*global JSLINT, WScript */

(function () {
    if (!JSLINT(WScript.StdIn.ReadAll(), {passfail: true})) {
        var e = JSLINT.errors[0];
        WScript.StdErr.WriteLine('Lint at line ' + e.line +
            ' character ' + e.character + ': ' + e.reason);
        WScript.StdErr.WriteLine((e.evidence || '').
            replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
        WScript.Quit(1);
    }
}());