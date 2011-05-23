/*jshint boss: true */

// usage:
//   jsc env/jsc.js -- ${file} "$(cat ${file})" "{option1:true,option2:false}"

load("jshint.js");

(function(args){
    var name  = args[0],
        input = args[1],
        opts  = (function(arg){
            return (typeof arg === 'undefined') ? {} : eval('(' + arg + ')');
        })(args[2]);

    if (!name) {
        print('jshint: No file name was provided.');
        quit();
    }

    if (!input) {
        print('jshint: ' + name + ' contents were not provided to jshint.');
        quit();
    }

    if (!JSHINT(input, opts)) {
        for (var i = 0, err; err = JSHINT.errors[i]; i++) {
            print(err.reason + ' (line: ' + err.line + ', character: ' + err.character + ')');
            print('> ' + (err.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
            print('');
        }
    }

    quit();
})(arguments);