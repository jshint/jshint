var jasmine = require('jasmine-node'),
    verbose = true,
    colored = true;

for (var key in jasmine) {
    global[key] = jasmine[key];
}

process.argv.forEach(function (arg) {
    switch (arg) {
        case '--no-color': colored = false; break;
        case '--silent':   verbose = false; break;
    }
});

jasmine.executeSpecsInFolder(__dirname + "/tests/", function (runner, log) {
    process.exit(runner.results().failedCount);
}, verbose, colored);