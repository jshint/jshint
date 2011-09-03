/*jshint boss: true */

// usage:
//   jsc ${env_home}/jsc.js -- ${file} "$(cat ${file})" "{option1:true,option2:false} ${env_home}"
var env_home = '';
if (arguments.length > 3) {
  env_home = arguments[3].toString().replace(/\/env$/, '/');
}
load(env_home + "jshint.js");

if (typeof(JSHINT) === 'undefined') {
  print('jshint: Could not load jshint.js, tried "' + env_home + 'jshint.js".');
  quit();
}

(function(args){
    var home  = args[3]
        name  = args[0],
        input = args[1],
        opts  = (function(arg){
            switch (arg) {
            case undefined:
            case '':
                return {};
            default:
                return eval('(' + arg + ')');
            }
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