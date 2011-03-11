#!/usr/bin/env node

var jasmine = require('jasmine-node'),
    verbose = true,
    colored = true;

for (var key in jasmine) {
    if (jasmine.hasOwnProperty(key))
        global[key] = jasmine[key];
}

process.argv.forEach(function (arg) {
    switch (arg) {
        case '--no-color': colored = false; break;
        case '--silent':   verbose = false; break;
    }
});

jasmine.executeSpecsInFolder(__dirname + "/tests/", function (runner, log) {
    // pass
}, verbose, colored);