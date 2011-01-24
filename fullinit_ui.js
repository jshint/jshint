// init_ui.js
// 2011-01-19

// This is the web browser companion to fulljslint.js. It is an ADsafe
// lib file that implements a web ui by adding behavior to the widget's
// html tags.

// It stores a function in lib.init_ui. Calling that function will
// start up the JSLint widget ui.

// option = {adsafe: true, fragment: false}

/*members check, cookie, each, edition, get, getCheck, getTitle,
    getValue, indent, isArray, join, jslint, length, lib, maxerr, maxlen,
    on, predef, push, q, select, set, split, stringify, target, tree, value
*/

/*global ADSAFE, JSMAX */

ADSAFE.lib("init_ui", function (lib) {
    "use strict";

    return function (dom) {
        var checkboxes = dom.q('input_checkbox'),
            goodparts = checkboxes.q('&goodpart'),
            indent = dom.q('#JSLINT_INDENT'),
            input = dom.q('#JSLINT_INPUT'),
            jslintstring = dom.q('#JSLINT_JSLINTSTRING'),
            maxerr = dom.q('#JSLINT_MAXERR'),
            maxlen = dom.q('#JSLINT_MAXLEN'),
            option = lib.cookie.get(),
            output = dom.q('#JSLINT_OUTPUT'),
            tree = dom.q('#JSLINT_TREE'),
            predefined = dom.q('#JSLINT_PREDEF');

        function show_jslint_control() {

// Build and display a jslint control comment.
// The comment can be copied into a .js file.

            var a = [], name;
            for (name in option) {
                if (ADSAFE.get(option, name) === true) {
                    a.push(name + ': true');
                }
            }
            if (typeof option.maxerr === 'number' && option.maxerr >= 0) {
                a.push('maxerr: ' + option.maxerr);
            }
            if (typeof option.maxlen === 'number' && option.maxlen >= 0) {
                a.push('maxlen: ' + option.maxlen);
            }
            if (typeof option.indent === 'number' && option.indent >= 0) {
                a.push('indent: ' + option.indent);
            }
            jslintstring.value('/*jslint ' + a.join(', ') + ' */');

// Make a JSON cookie of the option object.

            lib.cookie.set(option);
        }

        function show_options() {
            checkboxes.each(function (bunch) {
                bunch.check(ADSAFE.get(option, bunch.getTitle()));
            });
            indent.value(String(option.indent));
            maxlen.value(String(option.maxlen || ''));
            maxerr.value(String(option.maxerr));
            predefined.value(ADSAFE.isArray(option.predef) ? option.predef.join(',') : '');
            show_jslint_control();
        }

        function update_check(event) {
            option[event.target.getTitle()] = event.target.getCheck();
            show_jslint_control();
        }

        function update_number(event) {
            var value = event.target.getValue();
            if (value.length === 0 || +value < 0 || !isFinite(value)) {
                value = '';
            }
            option[event.target.getTitle()] = +value;
            event.target.value(String(value));
            show_jslint_control();
        }

        function update_list(event) {
            var value = event.target.getValue().split(/\s*,\s*/);
            option[event.target.getTitle()] = value;
            event.target.value(value.join(', '));
            show_jslint_control();
        }


// Restore the options from a JSON cookie.

        if (!option || typeof option !== 'object') {
            option = {
                indent: 4,
                maxerr: 50
            };
        } else {
            option.indent =
                typeof option.indent === 'number' && option.indent >= 0 ?
                option.indent : 4;
            option.maxerr =
                typeof option.maxerr === 'number' && option.maxerr >= 0 ?
                option.maxerr : 50;
        }
        show_options();


// Display the edition.

        dom.q('#JSLINT_EDITION').value('Edition ' + lib.edition());

// Add click event handlers to the [JSLint] and [clear] buttons.

        dom.q('input&jslint').on('click', function (e) {
            tree.value('');

// Call JSLint and display the report.

            lib.jslint(input.getValue(), option, output);
            input.select();
            return false;
        });

        dom.q('input&tree').on('click', function (e) {
            output.value('Tree:');
            tree.value(JSON.stringify(lib.tree(), [
                'value',  'arity', 'name',  'first',
                'second', 'third', 'block', 'else'
            ], 4));
            input.select();
        });

        //dom.q('input&jsmax').on('click', function (e) {
        //    output.value('JSMax:');
        //    tree.value(JSMAX(lib.tree()));
        //    input.select();
        //});

        dom.q('input&clear').on('click', function (e) {
            output.value('');
            tree.value('');
            input.value('').select();
        });


        dom.q('#JSLINT_CLEARALL').on('click', function (e) {
            option = {
                indent: 4,
                maxerr: 50
            };
            show_options();
        });

        dom.q('#JSLINT_GOODPARTS').on('click', function (e) {
            goodparts.each(function (bunch) {
                option[bunch.getTitle()] = true;
            });
            option.indent = 4;
            show_options();
        });

        checkboxes.on('click', update_check);
        indent.on('change', update_number);
        maxerr.on('change', update_number);
        maxlen.on('change', update_number);
        predefined.on('change', update_list);
        input
            .on('change', function (e) {
                output.value('');
            })
            .select();
    };
});
