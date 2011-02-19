/*jshint boss: true */

load("jshint.js");

(function (args) {
    var name = args[0],
        optstr = args[1], // arg1=val1,arg2=val2,...
        opts = {rhino: true},
        input, optname, optval;

    if (!name) {
        print('Usage: jshint.js file.js');
        quit(1);
    }

    if (optstr) {
        optstr.split(',').forEach(function(arg) {
            [optname,optval] = arg.split('=');
            opts[optname] = optval;
        });
    }

    input = readFile(name);

    if (!input) {
        print('jshint: Couldn\'t open file ' + name);
        quit(1);
    }

    if (!JSHINT(input, opts)) {
        for (var i = 0, err; err = JSHINT.errors[i]; i++) {
            print(err.reason + ' (line: ' + err.line + ', character: ' + err.character + ')');
            print('> ' + (err.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
            print('');
        }
        quit(1);
    }

    quit(0);
}(arguments));
