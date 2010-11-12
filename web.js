// web.js
// 2010-04-05

// This is the web browser companion to fulljslint.js.

/*jslint browser: true, evil: true */
/*members checked, clearall, cookie, edition, getElementById, getElementsByName,
    getTime, goodparts, indent, indexOf, innerHTML, join, length, maxerr,
    onchange, onclick, parse, predef, push, recommended, report, select,
    setTime, sort, split, stringify, substring, toGMTString, value
*/


"use strict";

var JSLINT;

(function () {
    var c = document.cookie,
        predefined = document.getElementById('predef'),
        cluster = {
            goodparts: [
                'bitwise', 'eqeqeq', 'immed', 'newcap', 'nomen', 'onevar',
                'plusplus', 'regexp', 'undef', 'white'
            ],
            clearall: []
        },
        i,                              // Loop counter
        indent = document.getElementById('indent'),
        input = document.getElementById('input'),
        jslintstring = document.getElementById('jslintstring'),
        maxerr = document.getElementById('maxerr'),
        n,                              // A dom node
        ns,                             // An array of dom nodes
        nclear,
        nclick,
        o,                              // The options object
        options = [
            'adsafe', 'bitwise', 'browser', 'cap', 'css', 'debug', 'devel', 
            'eqeqeq', 'es5', 'evil', 'forin', 'fragment', 'immed', 'laxbreak', 
            'newcap', 'nomen', 'on', 'onevar', 'passfail', 'plusplus', 'regexp',
            'rhino', 'safe', 'windows', 'strict', 'sub', 'undef', 'white',
            'widget'
        ],
        output = document.getElementById('output');

    function get_check(o) {
        var n = document.getElementById(o);
        return n && n.checked;
    }


    function set_check(o, b) {
        var n = document.getElementById(o);
        if (n) {
            n.checked = b;
        }
    }

    function show_jslint_options() {
        var a = [], j, oj, s;
        for (j = 0; j < options.length; j += 1) {
            oj = options[j];
            if (get_check(oj)) {
                a.push(oj + ': true');
            }
        }
        if (!get_check('passfail') && +maxerr.value > 0) {
            a.push('maxerr: ' + maxerr.value);
        }
        if (get_check('white') && +indent.value > 0) {
            a.push('indent: ' + indent.value);
        }
        s = '/*jslint ' + a.join(', ') + ' */';
        jslintstring.innerHTML = s;
    }

    function set_cluster(n) {
        document.getElementById(n).onclick = function (e) {
            var c = cluster[n];
            for (i = 0; i < options.length; i += 1) {
                set_check(options[i], false);
            }
            for (i = 0; i < c.length; i += 1) {
                set_check(c[i], true);
            }
            indent.value = '4';
            maxerr.value = '50';
            predefined.value = '';
        };

// Show the jslintstring options.

        show_jslint_options();
    }


    input.onchange = function (e) {
        output.innerHTML = '';
    };

// Display the edition.

    document.getElementById('edition').innerHTML = 'Edition ' + JSLINT.edition;

// Add click event handlers to the [JSLint] and [clear] buttons.

    ns = document.getElementsByName('jslint');
    nclick = function (e) {

// Make a JSON cookie of the current options.

        var d = new Date(), j, oj, op = {};
        for (j = 0; j < options.length; j += 1) {
            oj = options[j];
            op[oj] = get_check(oj);
        }
        op.indent = +indent.value || 4;
        op.maxerr = +maxerr.value || 50;
        oj = predefined.value;
        if (oj) {
            op.predef = oj.split(/\s*,\s*/);
        }
        d.setTime(d.getTime() + 1e10);
        document.cookie = 'jslint=' + JSON.stringify(op) + ';expires=' +
            d.toGMTString();

// Call JSLint and obtain the report.

        JSLINT(input.value, op);
        output.innerHTML = JSLINT.report();
        input.select();
        return false;
    };
    nclear = function (e) {
        input.value = '';
        output.innerHTML = '';
        input.select();
        return false;
    };
    for (i = 0; i < ns.length; i += 1) {
        n = ns[i];
        switch (n.value) {
        case 'JSLint':
            n.onclick = nclick;
            break;
        case 'clear':
            n.onclick = nclear;
            break;
        }
    }

    indent.onchange = maxerr.onchange = predefined.onchange =
            document.getElementById('options').onclick = function (e) {
        show_jslint_options();
    };


// Recover the JSLint options from a JSON cookie.

    if (c && c.length > 8) {
        i = c.indexOf('jslint={');
        if (i >= 0) {
            c = c.substring(i + 7);
            i = c.indexOf('}');
            if (i > 1) {
                c = c.substring(0, i + 1);
                o = JSON.parse(c);
                for (i = 0; i < options.length; i += 1) {
                    set_check(options[i], o[options[i]]);
                }
                indent.value = o.indent || 4;
                maxerr.value = o.maxerr || 50;
                predefined.value = o.predef instanceof Array ?
                    o.predef.join(',') : '';
            }
        }
    }

// Show the jslintstring options.

    show_jslint_options();

    set_cluster('goodparts');
    set_cluster('clearall');

    input.select();
}());