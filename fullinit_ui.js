// init_ui.js
// 2011-01-05

// This is the web browser companion to fulljslint.js. It is an ADsafe
// lib file that implements a web ui by adding behavior to the widget's
// html tags.

// It stores a function in lib.init_ui. Calling that function will
// start up the JSLint widget ui.

// option = {adsafe: true, fragment: false}

/*members check, cookie, each, edition, get, getTitle, getValue, indent,
    isArray, join, jslint, lib, maxerr, maxlen, on, passfail, predef, push,
    q, select, set, split, stringify, tree, value, white
*/

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

        function show_jslint_options() {

// Build and display a jslint control comment.

// The comment can be copied into a .js file.

            var a = [], name;
            for (name in option) {
                if (typeof ADSAFE.get(option, name) === 'boolean') {
                    a.push(name + ': true');
                }
            }
            if (+option.maxerr > 0) {
                a.push('maxerr: ' + option.maxerr);
            }
            if (+option.maxlen > 0) {
                a.push('maxlen: ' + option.maxlen);
            }
            if (+option.indent > 0) {
                a.push('indent: ' + option.indent);
            }
            jslintstring.value('/*jslint ' + a.join(', ') + ' */');
        }

        function update_options() {

// Make an object containing the current options.

            var value;
            option = {};
            checkboxes.q(':checked').each(function (bunch) {
                ADSAFE.set(option, bunch.getTitle(), true);
            });
            if (option.white) {
                value = +indent.getValue();
                if (value && value !== 4) {
                    option.indent = value;
                }
            }
            if (!option.passfail) {
                value = +maxerr.getValue();
                if (value && value !== 50) {
                    option.maxerr = value;
                }
            }
            value = +maxlen.getValue();
            option.maxlen = value && value > 0 ? value : 0;
            value = predefined.getValue();
            if (value) {
                option.predef = value.split(/\s*,\s*/);
            }
            show_jslint_options();
        }

// Restore the options from a JSON cookie.

        if (!option || typeof option !== 'object') {
            option = {};
        } else {
            checkboxes.each(function (bunch) {
                bunch.check(ADSAFE.get(option, bunch.getTitle()));
            });
            indent.value(option.indent || '4');
            maxlen.value(option.maxlen || '');
            maxerr.value(option.maxerr || '50');
            predefined.value(ADSAFE.isArray(option.predef) ?
                    option.predef.join(',') : '');
        }
        show_jslint_options();

// Display the edition.

        dom.q('#JSLINT_EDITION').value('Edition ' + lib.edition());

// Add click event handlers to the [JSLint] and [clear] buttons.

        dom.q('input&jslint').on('click', function (e) {
            tree.value('');

// Make a JSON cookie of the option object.

            lib.cookie.set(option);

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

        dom.q('input&clear').on('click', function (e) {
            output.value('');
            tree.value('');
            input.value('').select();
        });

        dom.q('#JSLINT_CLEARALL').on('click', function (e) {
            checkboxes.check(false);
            indent.value(option.indent || '4');
            maxlen.value(option.maxlen || '');
            maxerr.value(option.maxerr || '50');
            update_options();
        });

        dom.q('#JSLINT_GOODPARTS').on('click', function (e) {
            goodparts.check(true);
            update_options();
        });

        checkboxes.on('click', update_options);
        indent.on('change', update_options);
        maxerr.on('change', update_options);
        maxlen.on('change', update_options);
        predefined.on('change', update_options);
        input
            .on('change', function (e) {
                output.value('');
            })
            .select();
    };
});
