/*jshint boss: true */

var JSHINT = require('../jshint').JSHINT,
    fs = require('fs');

(function (args) {
    var name   = args[0],
        optstr = args[1], // arg1=val1,arg2=val2,...
        opts   = { },
        input;

    if (!name) {
        print('Usage: jshint.js file.js');
        process.exit(1);
    }

    if (optstr) {
        optstr.split(',').forEach(function (arg) {
            var o = arg.split('=');
            opts[o[0]] = (function (ov) {
                switch (ov) {
                case 'true':
                    return true;
                case 'false':
                    return false;
                default:
                    return ov;
                }
            })(o[1]);
        });
    }

    input = fs.readFileSync(name).toString();

    if (!input) {
        console.error('jshint: Couldn\'t open file ' + name);
        process.exit(1);
    }

    if (!JSHINT(input, opts)) {
        for (var i = 0, err; err = JSHINT.errors[i]; i++) {
            console.error(err.reason + ' (line: ' + err.line + ', character: ' + err.character + ')');
            console.error('> ' + (err.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
            console.error('');
        }
        process.exit(1);
    }

    process.exit(0);
}(process.argv.slice(2)));
