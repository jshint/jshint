"use strict";

var fs = require("fs");
var path = require("path");
var shjs = require("shelljs");
var sinon = require("sinon");
var cli = require("../src/cli/cli.js");

exports.group = {
	setUp: function (cb) {
		if (!process.stdout.flush) {
			process.stdout.flush = function () { return true; };
		}

		sinon.stub(process, "exit");
		cb();
	},

	tearDown: function (cb) {
		process.exit.restore();
		cb();
	},

	testConfig: function (test) {
		// Test when configuration file doesn't exist.
		sinon.stub(shjs, "cat").returns("{ \"node\": true }");
		sinon.stub(shjs, "test").returns(false);

		var run = sinon.stub(cli, "run");

		cli.interpret([
			"node", "jshint", "file.js", "--config", "file.json"
		]);
		test.deepEqual(run.args[0][0].config, {});
		shjs.test.restore();

		// Test when configuration file exists.
		sinon.stub(shjs, "test").returns(true);

		cli.interpret([
			"node", "jshint", "file.js", "--config", "file.json"
		]);
		test.deepEqual(run.args[1][0].config, { node: true });

		shjs.test.restore();
		shjs.cat.restore();
		run.restore();

		test.done();
	},

	testReporter: function (test) {
		test.expect(5);

		var _cli = require("cli");
		var rep = require("../examples/reporter.js");
		var run = sinon.stub(cli, "run");
		var out = sinon.stub(_cli, "error");
		var dir = __dirname + "/../examples/";
		sinon.stub(process, "cwd").returns(dir);

		process.exit.restore();
		sinon.stub(process, "exit").throws("ProcessExit");

		// Test failed attempt.
		try {
			cli.interpret([
				"node", "jshint", "file.js", "--reporter", "invalid.js"
			]);
		} catch (err) {
			var msg = out.args[0][0];
			test.equal(msg.slice(0, 25), "Can't load reporter file:");
			test.equal(msg.slice(msg.length - 10), "invalid.js");
			test.equal(err, "ProcessExit");
		}

		// Test successful attempt.
		run.restore();
		sinon.stub(rep, "reporter");
		sinon.stub(shjs, "cat")
			.withArgs(sinon.match(/file\.js$/)).returns("func()")
			.withArgs(sinon.match(/\.jshintrc$/)).returns("{}")
			.withArgs(sinon.match(/\.jshintignore$/)).returns("");

		try {
			cli.interpret([
				"node", "jshint", "file.js", "--reporter", "reporter.js"
			]);
		} catch (err) {
			if (err.name !== "ProcessExit") {
				throw err;
			}

			test.equal(rep.reporter.args[0][0][0].error.raw, "Missing semicolon.");
			test.ok(rep.reporter.calledOnce);
		}

		rep.reporter.restore();
		shjs.cat.restore();
		process.cwd.restore();
		test.done();
	},

	testJSLintReporter: function (test) {
		var rep = require("../src/reporters/jslint_xml.js");
		var run = sinon.stub(cli, "run");

		cli.interpret([
			"node", "jshint", "file.js", "--reporter", "jslint"
		]);
		test.equal(run.args[0][0].reporter, rep.reporter);

		cli.interpret([
			"node", "jshint", "file.js", "--jslint-reporter"
		]);
		test.equal(run.args[1][0].reporter, rep.reporter);

		run.restore();
		test.done();
	},

	testCheckStyleReporter: function (test) {
		var rep = require("../src/reporters/checkstyle.js");
		var run = sinon.stub(cli, "run");

		cli.interpret([
			"node", "jshint", "file.js", "--reporter", "checkstyle"
		]);
		test.equal(run.args[0][0].reporter, rep.reporter);

		cli.interpret([
			"node", "jshint", "file.js", "--checkstyle-reporter"
		]);
		test.equal(run.args[1][0].reporter, rep.reporter);

		run.restore();
		test.done();
	},

	testShowNonErrors: function (test) {
		var rep = require("../src/reporters/non_error.js");
		var run = sinon.stub(cli, "run");

		cli.interpret([
			"node", "jshint", "file.js", "--show-non-errors"
		]);
		test.equal(run.args[0][0].reporter, rep.reporter);

		run.restore();
		test.done();
	},

	testExtensions: function (test) {
		var run = sinon.stub(cli, "run");

		cli.interpret([
			"node", "jshint", "file.js"
		]);
		test.equal(run.args[0][0].extensions, "");

		cli.interpret([
			"node", "jshint", "file.js", "--extra-ext", ".json"
		]);
		test.equal(run.args[1][0].extensions, ".json");

		run.restore();
		test.done();
	},

	testRcFile: function (test) {
		var run = sinon.stub(cli, "run");
		var dir = __dirname + "/../examples/";
		sinon.stub(process, "cwd").returns(dir);

		cli.interpret([
			"node", "jshint", "file.js"
		]);
		test.equal(run.args[0][0].config.strict, true);
		process.cwd.restore();

		var home = path.join(process.env.HOME, ".jshintrc");
		var conf = shjs.cat(path.join(dir, ".jshintrc"));
		sinon.stub(shjs, "test").withArgs("-e", home).returns(true);
		sinon.stub(shjs, "cat").withArgs(home).returns(conf);

		cli.interpret([
			"node", "jshint", "file.js"
		]);
		test.equal(run.args[1][0].config.strict, true);

		shjs.test.restore();
		shjs.cat.restore();
		run.restore();
		test.done();
	},

	testIgnoreFile: function (test) {
		var run = sinon.stub(cli, "run");
		var dir = __dirname + "/../examples/";
		sinon.stub(process, "cwd").returns(dir);

		cli.interpret([
			"node", "jshint", "file.js"
		]);

		test.equal(run.args[0][0].ignores[0], path.resolve(dir, "ignored.js"));
		test.equal(run.args[0][0].ignores[1], path.resolve(dir, "another.js"));

		run.restore();
		process.cwd.restore();

		sinon.stub(process, "cwd").returns(__dirname + "/../");
		sinon.stub(shjs, "cat")
			.withArgs(sinon.match(/file.js$/)).returns("console.log('Hello');")
			.withArgs(sinon.match(/\.jshintrc$/)).returns("{}")
			.withArgs(sinon.match(/\.jshintignore$/)).returns("examples");

		var args = shjs.cat.args.filter(function (arg) {
			return !/\.jshintrc$/.test(arg[0]) && !/\.jshintignore$/.test(arg[0]);
		});

		test.equal(args.length, 0);

		process.cwd.restore();
		shjs.cat.restore();
		test.done();
	},

	testCollectFiles: function (test) {
		var dir = __dirname + "/../examples/";
		sinon.stub(process, "cwd").returns(dir);
		sinon.stub(shjs, "cat")
			.withArgs(sinon.match(/file2?\.js$/)).returns("console.log('Hello');")
			.withArgs(sinon.match(/\.jshintrc$/)).returns("{}")
			.withArgs(sinon.match(/\.jshintignore$/)).returns("");

		cli.interpret([
			"node", "jshint", "file.js", "file2.js", ".hidden", "file4.json"
		]);

		var args = shjs.cat.args.filter(function (arg) {
			return !/\.jshintrc$/.test(arg[0]) && !/\.jshintignore$/.test(arg[0]);
		});

		test.equal(args.length, 2);
		test.equal(args[0][0], "file.js");
		test.equal(args[1][0], "file2.js");

		shjs.cat.restore();
		sinon.stub(shjs, "cat")
			.withArgs(sinon.match(/file2?\.js$/)).returns("console.log('Hello');")
			.withArgs(sinon.match(/file3\.json$/)).returns("{}")
			.withArgs(sinon.match(/\.jshintrc$/)).returns("{}")
			.withArgs(sinon.match(/\.jshintignore$/)).returns("");

		cli.interpret([
			"node", "jshint", "file.js", "file2.js", "file3.json", "--extra-ext=json"
		]);

		args = shjs.cat.args.filter(function (arg) {
			return !/\.jshintrc$/.test(arg[0]) && !/\.jshintignore$/.test(arg[0]);
		});

		test.equal(args.length, 3);
		test.equal(args[0][0], "file.js");
		test.equal(args[1][0], "file2.js");
		test.equal(args[2][0], "file3.json");

		shjs.cat.restore();
		process.cwd.restore();

		sinon.stub(process, "cwd").returns(__dirname + "/../");
		sinon.stub(shjs, "cat")
			.withArgs(sinon.match(/reporter\.js$/)).returns("console.log('Hello');")
			.withArgs(sinon.match(/\.jshintrc$/)).returns("{}")
			.withArgs(sinon.match(/\.jshintignore$/)).returns("");

		cli.interpret([
			"node", "jshint", "examples"
		]);

		args = shjs.cat.args.filter(function (arg) {
			return !/\.jshintrc$/.test(arg[0]) && !/\.jshintignore$/.test(arg[0]);
		});

		test.equal(args.length, 1);
		test.equal(args[0][0], "examples/reporter.js");

		shjs.cat.restore();
		process.cwd.restore();
		test.done();
	},

	testStatusCode: function (test) {
		var rep = require("../examples/reporter.js");
		var dir = __dirname + "/../examples/";
		sinon.stub(rep, "reporter");
		sinon.stub(process, "cwd").returns(dir);

		sinon.stub(shjs, "cat")
			.withArgs(sinon.match(/pass\.js$/)).returns("function test() { return 0; }")
			.withArgs(sinon.match(/fail\.js$/)).returns("console.log('Hello')")
			.withArgs(sinon.match(/\.jshintrc$/)).returns("{}")
			.withArgs(sinon.match(/\.jshintignore$/)).returns("");

		process.exit.restore();
		sinon.stub(process, "exit");

		cli.interpret([
			"node", "jshint", "pass.js", "--reporter=reporter.js"
		]);

		cli.interpret([
			"node", "jshint", "fail.js", "--reporter=reporter.js"
		]);

		test.strictEqual(process.exit.args[0][0], 0);
		test.equal(process.exit.args[1][0], 2);

		rep.reporter.restore();
		process.cwd.restore();
		shjs.cat.restore();

		test.done();
	},

	testDrain: function (test) {
		var dir = __dirname + "/../examples/";
		sinon.stub(cli, "run").returns(false);
		sinon.stub(process, "cwd").returns(dir);
		sinon.stub(process.stdout, "flush").returns(false);
		sinon.stub(process.stdout, "on", function (name, func) {
			func();
		});

		process.exit.restore();
		sinon.stub(process, "exit");

		cli.interpret(["node", "jshint", "reporter.js"]);
		test.equal(process.stdout.on.args[0][0], "drain");
		test.strictEqual(process.exit.args[0][0], 2);

		process.cwd.restore();
		process.stdout.flush.restore();
		process.stdout.on.restore();
		cli.run.restore();

		test.done();
	}
};
