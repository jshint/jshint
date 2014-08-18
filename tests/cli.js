"use strict";

var path  = require("path");
var shjs  = require("shelljs");
var sinon = require("sinon");
var cli   = require("../src/cli.js");

exports.group = {
  setUp: function (cb) {
    sinon.stub(cli, "exit");
    cb();
  },

  tearDown: function (cb) {
    cli.exit.restore();
    cb();
  },

  testConfig: function (test) {
    var _cli = require("cli");
    var out = sinon.stub(_cli, "error");
    sinon.stub(cli, "run").returns(true);

    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/file\.js$/)).returns("var a = function () {}; a();")
      .withArgs(sinon.match(/file1\.json$/)).returns("wat")
      .withArgs(sinon.match(/file2\.json$/)).returns("{\"node\":true,\"globals\":{\"foo\":true,\"bar\":true}}")
      .withArgs(sinon.match(/file4\.json$/)).returns("{\"extends\":\"file3.json\"}")
      .withArgs(sinon.match(/file5\.json$/)).returns("{\"extends\":\"file2.json\"}")
      .withArgs(sinon.match(/file6\.json$/)).returns("{\"extends\":\"file2.json\",\"node\":false}")
      .withArgs(sinon.match(/file7\.json$/)).returns("{\"extends\":\"file2.json\",\"globals\":{\"bar\":false,\"baz\":true}}");

    sinon.stub(shjs, "test")
      .withArgs("-e", sinon.match(/file\.js$/)).returns(true)
      .withArgs("-e", sinon.match(/file1\.json$/)).returns(true)
      .withArgs("-e", sinon.match(/file2\.json$/)).returns(true)
      .withArgs("-e", sinon.match(/file3\.json$/)).returns(false)
      .withArgs("-e", sinon.match(/file4\.json$/)).returns(true)
      .withArgs("-e", sinon.match(/file5\.json$/)).returns(true)
      .withArgs("-e", sinon.match(/file6\.json$/)).returns(true);

    cli.exit.restore();
    sinon.stub(cli, "exit").throws("ProcessExit");

    // File doesn't exist.
    try {
      cli.interpret([
        "node", "jshint", "file.js", "--config", "file3.json"
      ]);
    } catch (err) {
      var msg = out.args[0][0];
      test.equal(msg.slice(0, 23), "Can't find config file:");
      test.equal(msg.slice(msg.length - 10), "file3.json");
      test.equal(err, "ProcessExit");
    }

    // Invalid config
    try {
      cli.interpret([
        "node", "jshint", "file.js", "--config", "file1.json"
      ]);
    } catch (err) {
      var msg = out.args[1][0];
      test.equal(msg.slice(0, 24), "Can't parse config file:");
      test.equal(msg.slice(msg.length - 10), "file1.json");
      test.equal(err, "ProcessExit");
    }

    // Invalid merged filed
    try {
      cli.interpret([
        "node", "jshint", "file.js", "--config", "file4.json"
      ]);
    } catch (err) {
      var msg = out.args[2][0];
      test.equal(msg.slice(0, 23), "Can't find config file:");
      test.equal(msg.slice(msg.length - 10), "file3.json");
      test.equal(err, "ProcessExit");
    }

    cli.exit.restore();
    sinon.stub(cli, "exit");

    // Merges existing valid files
    cli.interpret([
      "node", "jshint", "file.js", "--config", "file5.json"
    ]);
    test.equal(cli.run.lastCall.args[0].config.node, true);
    test.equal(cli.run.lastCall.args[0].config['extends'], void 0);

    // Overwrites options after extending
    cli.interpret([
      "node", "jshint", "file.js", "--config", "file6.json"
    ]);
    test.equal(cli.run.lastCall.args[0].config.node, false);

    // Valid config
    cli.interpret([
      "node", "jshint", "file.js", "--config", "file2.json"
    ]);

    // Performs a deep merge of "globals" configuration
    cli.interpret([
      "node", "jshint", "file2.js", "--config", "file7.json"
    ]);
    test.deepEqual(cli.run.lastCall.args[0].config.globals, { foo: true, bar: false, baz: true });

    _cli.error.restore();
    cli.run.restore();
    shjs.cat.restore();
    shjs.test.restore();

    test.done();
  },

  testPrereq: function (test) {
    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/file\.js$/)).returns("a();")
      .withArgs(sinon.match(/prereq.js$/)).returns("var a = 1;")
      .withArgs(sinon.match(/config.json$/))
        .returns("{\"undef\":true,\"prereq\":[\"prereq.js\", \"prereq2.js\"]}");

    sinon.stub(shjs, "test")
      .withArgs("-e", sinon.match(/file\.js$/)).returns(true)
      .withArgs("-e", sinon.match(/prereq.js$/)).returns(true)
      .withArgs("-e", sinon.match(/config.json$/)).returns(true);

    cli.exit.restore();
    sinon.stub(cli, "exit")
      .withArgs(0).returns(true)
      .withArgs(1).throws("ProcessExit");

    cli.interpret([
      "node", "jshint", "file.js", "--config", "config.json"
    ]);

    shjs.cat.restore();
    shjs.test.restore();

    test.done();
  },

  testOverrides: function (test) {
    var dir = __dirname + "/../examples/";
    var rep = require("../examples/reporter.js");
    var config = {
      "asi": true,
      "overrides": {
        "bar.js": {
          "asi": false
        }
      }
    };

    sinon.stub(process, "cwd").returns(dir);
    sinon.stub(rep, "reporter");
    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/foo\.js$/)).returns("a()")
      .withArgs(sinon.match(/bar\.js$/)).returns("a()")
      .withArgs(sinon.match(/config\.json$/))
        .returns(JSON.stringify(config));

    sinon.stub(shjs, "test")
      .withArgs("-e", sinon.match(/foo\.js$/)).returns(true)
      .withArgs("-e", sinon.match(/bar\.js$/)).returns(true)
      .withArgs("-e", sinon.match(/config\.json$/)).returns(true);

    cli.exit.restore();
    sinon.stub(cli, "exit")
      .withArgs(0).returns(true)
      .withArgs(1).throws("ProcessExit");

    // Test successful file
    cli.interpret([
      "node", "jshint", "foo.js", "--config", "config.json", "--reporter", "reporter.js"
    ]);
    test.ok(rep.reporter.args[0][0].length === 0);

    // Test overriden, failed file
    cli.interpret([
      "node", "jshint", "bar.js", "--config", "config.json", "--reporter", "reporter.js"
    ]);
    test.ok(rep.reporter.args[1][0].length > 0, "Error was expected but not thrown");
    test.equal(rep.reporter.args[1][0][0].error.code, "W033");

    process.cwd.restore();
    rep.reporter.restore();
    shjs.cat.restore();
    shjs.test.restore();

    test.done();
  },

  testOverridesMatchesRelativePaths: function (test) {
    var dir = __dirname + "/../examples/";
    var rep = require("../examples/reporter.js");
    var config = {
      "asi": true,
      "overrides": {
        "src/bar.js": {
          "asi": false
        }
      }
    };

    sinon.stub(process, "cwd").returns(dir);
    sinon.stub(rep, "reporter");
    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/bar\.js$/)).returns("a()")
      .withArgs(sinon.match(/config\.json$/))
        .returns(JSON.stringify(config));

    sinon.stub(shjs, "test")
      .withArgs("-e", sinon.match(/bar\.js$/)).returns(true)
      .withArgs("-e", sinon.match(/config\.json$/)).returns(true);

    cli.exit.restore();
    sinon.stub(cli, "exit")
      .withArgs(0).returns(true)
      .withArgs(1).throws("ProcessExit");

    cli.interpret([
      "node", "jshint", "./src/bar.js", "--config", "config.json", "--reporter", "reporter.js"
    ]);
    test.ok(rep.reporter.args[0][0].length === 1);

    process.cwd.restore();
    rep.reporter.restore();
    shjs.cat.restore();
    shjs.test.restore();

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

    cli.exit.restore();
    sinon.stub(cli, "exit").throws("ProcessExit");

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
    sinon.stub(shjs, "test")
      .withArgs("-e", sinon.match(/file\.js$/)).returns(true)
      .withArgs("-e", sinon.match(/\.jshintrc$/)).returns(true)
      .withArgs("-e", sinon.match(/\.jshintignore$/)).returns(true);

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
    shjs.test.restore();
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

  testExtract: function (test) {
    var html = "<html>text<script>var a = 1;</script></html>";
    var text = "hello world";
    var js   = "var a = 1;";

    test.equal(cli.extract(html, "never"), html);
    test.equal(cli.extract(html, "auto"), js);
    test.equal(cli.extract(html, "always"), js);

    test.equal(cli.extract(js, "never"), js);
    test.equal(cli.extract(js, "auto"), js);
    test.equal(cli.extract(js, "always"), '');

    test.equal(cli.extract(text, "never"), text);
    test.equal(cli.extract(text, "auto"), text);
    test.equal(cli.extract(text, "always"), '');

    html = [
      "<html>",
        "<script type='text/javascript'>",
          "var a = 1;",
        "</script>",
        "<h1>Hello!</h1>",
        "<script type='text/coffeescript'>",
          "a = 1",
        "</script>",
        "<script>",
          "var b = 1;",
        "</script>",
      "</html>" ].join("\n");

    js = ["\n", "var a = 1;", "\n\n\n\n\n", "var b = 1;\n" ].join("\n");

    test.equal(cli.extract(html, "auto"), js);
    test.done();
  },

  testExtractWithIndent: function (test) {
    var html = [
      "<html>",
        "<script type='text/javascript'>",
        "  var a = 1;",
        "    var b = 1;",
        "</script>",
      "</html>" ].join("\n");

    // leading whitespace is removed by amount from first js line
    var js = ["\n", "var a = 1;", "  var b = 1;\n"].join("\n");

    test.equal(cli.extract(html, "auto"), js);
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

  testMalformedNpmFile: function (test) {
    sinon.stub(process, "cwd").returns(__dirname);
    var localNpm = path.normalize(__dirname + "/package.json");
    var localRc = path.normalize(__dirname + "/.jshintrc");
    var testStub = sinon.stub(shjs, "test");
    var catStub = sinon.stub(shjs, "cat");

    // stub rc file
    testStub.withArgs("-e", localRc).returns(true);
    catStub.withArgs(localRc).returns('{"evil": true}');

    // stub npm file
    testStub.withArgs("-e", localNpm).returns(true);
    catStub.withArgs(localNpm).returns('{'); // malformed package.json

    // stub src file
    testStub.withArgs("-e", sinon.match(/file\.js$/)).returns(true);
    catStub.withArgs(sinon.match(/file\.js$/)).returns("eval('a=2');");

    cli.interpret([
      "node", "jshint", "file.js"
    ]);
    test.equal(cli.exit.args[0][0], 0); // lint with wrong package.json

    shjs.test.restore();
    shjs.cat.restore();
    process.cwd.restore();
    test.done();
  },

  testRcFile: function (test) {
    sinon.stub(process, "cwd").returns(__dirname);
    var localRc = path.normalize(__dirname + "/.jshintrc");
    var testStub = sinon.stub(shjs, "test");
    var catStub = sinon.stub(shjs, "cat");

    // stub rc file
    testStub.withArgs("-e", localRc).returns(true);
    catStub.withArgs(localRc).returns('{"evil": true}');

    // stub src file
    testStub.withArgs("-e", sinon.match(/file\.js$/)).returns(true);
    catStub.withArgs(sinon.match(/file\.js$/)).returns("eval('a=2');");

    cli.interpret([
      "node", "jshint", "file.js"
    ]);
    test.equal(cli.exit.args[0][0], 0); // eval allowed = rc file found

    shjs.test.restore();
    shjs.cat.restore();
    process.cwd.restore();
    test.done();
  },

  testHomeRcFile: function (test) {
    var homeRc = path.join(process.env.HOME || process.env.HOMEPATH, ".jshintrc");
    var testStub = sinon.stub(shjs, "test");
    var catStub = sinon.stub(shjs, "cat");

    // stub rc file
    testStub.withArgs("-e", homeRc).returns(true);
    catStub.withArgs(homeRc).returns('{"evil": true}');

    // stub src file (in root where we are unlikely to find a .jshintrc)
    testStub.withArgs("-e", sinon.match(/\/file\.js$/)).returns(true);
    catStub.withArgs(sinon.match(/\/file\.js$/)).returns("eval('a=2');");

    cli.interpret([
      "node", "jshint", "/file.js"
    ]);
    test.equal(cli.exit.args[0][0], 0); // eval allowed = rc file found

    shjs.test.restore();
    shjs.cat.restore();
    test.done();
  },

  testOneLevelRcLookup: function (test) {
    var srcDir = __dirname + "../src/";
    var parentRc = path.join(srcDir, ".jshintrc");

    var cliDir = path.join(srcDir, "cli/");
    sinon.stub(process, "cwd").returns(cliDir);

    var testStub = sinon.stub(shjs, "test");
    var catStub = sinon.stub(shjs, "cat");

    // stub rc file
    testStub.withArgs("-e", parentRc).returns(true);
    catStub.withArgs(parentRc).returns('{"evil": true}');

    // stub src file
    testStub.withArgs("-e", sinon.match(/file\.js$/)).returns(true);
    catStub.withArgs(sinon.match(/file\.js$/)).returns("eval('a=2');");

    cli.interpret([
      "node", "jshint", "file.js"
    ]);
    test.equal(cli.exit.args[0][0], 0); // eval allowed = rc file found

    shjs.test.restore();
    shjs.cat.restore();
    process.cwd.restore();
    test.done();
  },

  testTargetRelativeRcLookup: function (test) {
    // working from outside the project
    sinon.stub(process, "cwd").returns(process.env.HOME || process.env.HOMEPATH);
    var projectRc = path.normalize(__dirname + "/.jshintrc");
    var srcFile = __dirname + "/sub/file.js";
    var testStub = sinon.stub(shjs, "test");
    var catStub = sinon.stub(shjs, "cat");

    // stub rc file
    testStub.withArgs("-e", projectRc).returns(true);
    catStub.withArgs(projectRc).returns('{"evil": true}');

    // stub src file
    testStub.withArgs("-e", srcFile).returns(true);
    catStub.withArgs(srcFile).returns("eval('a=2');");

    cli.interpret([
      "node", "jshint", srcFile
    ]);
    test.equal(cli.exit.args[0][0], 0); // eval allowed = rc file found

    shjs.test.restore();
    shjs.cat.restore();
    process.cwd.restore();
    test.done();
  },

  testIgnores: function (test) {
    var run = sinon.stub(cli, "run");
    var dir = __dirname + "/../examples/";
    sinon.stub(process, "cwd").returns(dir);

    cli.interpret([
      "node", "jshint", "file.js", "--exclude=exclude.js"
    ]);

    test.equal(run.args[0][0].ignores[0], path.resolve(dir, "exclude.js"));
    test.equal(run.args[0][0].ignores[1], path.resolve(dir, "ignored.js"));
    test.equal(run.args[0][0].ignores[2], path.resolve(dir, "another.js"));

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

  testExcludePath: function (test) {
    var run = sinon.stub(cli, "run");
    var dir = __dirname + "/../examples/";
    sinon.stub(process, "cwd").returns(dir);

    cli.interpret([
      "node", "jshint", "file.js", "--exclude-path=../examples/.customignore"
    ]);

    test.equal(run.args[0][0].ignores[0], path.resolve(dir, "exclude.js"));

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

  testAPIIgnores: function (test) {
    var dir = __dirname + "/../data/";
    sinon.stub(process, "cwd").returns(dir);
    var result = null;

    cli.run({
      args: [dir + "../tests/unit/fixtures/ignored.js"],
      cwd: dir + "../tests/unit/fixtures/",
      reporter: function (results) { result = results; }
    });

    test.deepEqual(result, []);

    process.cwd.restore();
    test.done();
  },

  testCollectFiles: function (test) {
    var gather = sinon.stub(cli, "gather");
    var args = [];

    gather.returns([]);

    sinon.stub(shjs, "test")
      .withArgs("-e", sinon.match(/.*/)).returns(true);

    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/file2?\.js$/)).returns("console.log('Hello');")
      .withArgs(sinon.match(/ignore[\/\\]file\d\.js$/)).returns("console.log('Hello, ignore me');")
      .withArgs(sinon.match(/ignore[\/\\]dir[\/\\]file\d\.js$/)).returns("print('Ignore me');")
      .withArgs(sinon.match(/node_script$/)).returns("console.log('Hello, ignore me');")
      .withArgs(sinon.match(/\.jshintrc$/)).returns("{}")
      .withArgs(sinon.match(/\.jshintignore$/)).returns(path.join("ignore", "**"));

    cli.interpret([
      "node", "jshint", "file.js", "file2.js", "node_script", path.join("ignore", "file1.js"),
      path.join("ignore", "file2.js"), path.join("ignore", "dir", "file1.js")
    ]);

    args = gather.args[0][0];

    test.equal(args.args[0], "file.js");
    test.equal(args.args[1], "file2.js");
    test.equal(args.args[2], "node_script");
    test.equal(args.args[3], path.join("ignore", "file1.js"));
    test.equal(args.args[4], path.join("ignore", "file2.js"));
    test.equal(args.args[5], path.join("ignore", "dir", "file1.js"));
    test.equal(args.ignores, path.resolve(path.join("ignore", "**")));

    shjs.test.restore();
    shjs.cat.restore();

    sinon.stub(shjs, "test")
      .withArgs("-e", sinon.match(/.*/)).returns(true)
      .withArgs("-d", sinon.match(/src$/)).returns(true)
      .withArgs("-d", sinon.match(/src[\/\\]lib$/)).returns(true);

    sinon.stub(shjs, "ls")
      .withArgs(sinon.match(/src$/)).returns(["lib", "file4.js"])
      .withArgs(sinon.match(/src[\/\\]lib$/)).returns(["file5.js"]);

    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/file2?\.js$/)).returns("console.log('Hello');")
      .withArgs(sinon.match(/file3\.json$/)).returns("{}")
      .withArgs(sinon.match(/src[\/\\]file4\.js$/)).returns("print('Hello');")
      .withArgs(sinon.match(/src[\/\\]lib[\/\\]file5\.js$/)).returns("print('Hello');")
      .withArgs(sinon.match(/\.jshintrc$/)).returns("{}")
      .withArgs(sinon.match(/\.jshintignore$/)).returns("");

    cli.interpret([
      "node", "jshint", "file.js", "file2.js", "file3.json", "--extra-ext=json", "src"
    ]);

    args = gather.args[1][0];

    test.equal(args.args.length, 4);
    test.equal(args.args[0], "file.js");
    test.equal(args.args[1], "file2.js");
    test.equal(args.args[2], "file3.json");
    test.equal(args.args[3], "src");
    test.equal(args.ignores, false);

    shjs.test.restore();
    shjs.ls.restore();
    shjs.cat.restore();

    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/reporter\.js$/)).returns("console.log('Hello');")
      .withArgs(sinon.match(/\.jshintrc$/)).returns("{}")
      .withArgs(sinon.match(/\.jshintignore$/)).returns("");

    cli.interpret([
      "node", "jshint", "examples"
    ]);

    args = gather.args[2][0];

    test.equal(args.args.length, 1);
    test.equal(args.args[0], "examples");
    test.equal(args.ignores.length, 0);

    shjs.cat.restore();

    gather.restore();
    test.done();
  },

  testGatherOptionalParameters: function (test) {
    sinon.stub(shjs, "test")
      .withArgs("-e", sinon.match(/\.jshintignore$/)).returns(true)
      .withArgs("-e", sinon.match(/file.js$/)).returns(true);

    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/\.jshintignore$/)).returns(path.join("ignore", "**"));

    var files = cli.gather({
      args: ["file.js"]
    });

    test.equal(files.length, 1);
    test.equal(files[0], "file.js");

    shjs.test.restore();
    shjs.cat.restore();
    test.done();
  },

  testGather: function (test) {
    var dir = __dirname + "/../examples/";
    var files = [];
    sinon.stub(process, "cwd").returns(dir);

    var demoFiles = [
      [ /file2?\.js$/, "console.log('Hello');" ],
      [ /ignore[\/\\]file\d\.js$/, "console.log('Hello, ignore me');" ],
      [ /ignore[\/\\]dir[\/\\]file\d\.js$/, "print('Ignore me');" ],
      [ /node_script$/, "console.log('Hello, ignore me');" ],
      [ /\.jshintrc$/, "{}" ],
      [ /\.jshintignore$/, path.join("ignore", "**") ],
    ];

    var testStub = sinon.stub(shjs, "test");
    demoFiles.forEach(function (file) {
      testStub = testStub.withArgs("-e", sinon.match(file[0])).returns(true);
    });

    var catStub = sinon.stub(shjs, "cat");
    demoFiles.forEach(function (file) {
      catStub = catStub.withArgs(sinon.match(file[0])).returns(file[1]);
    });

    files = cli.gather({
      args: ["file.js", "file2.js", "node_script",
        path.join("ignore", "file1.js"),
        path.join("ignore", "file2.js"),
        path.join("ignore", "dir", "file1.js")
      ],
      ignores: [path.join("ignore", "**")],
      extensions: ""
    });

    var args = shjs.cat.args.filter(function (arg) {
      return !/\.jshintrc$/.test(arg[0]) && !/\.jshintignore$/.test(arg[0]);
    });

    test.equal(args.length, 0);
    test.equal(files.length, 3);
    test.equal(files[0], "file.js");
    test.equal(files[1], "file2.js");
    test.equal(files[2], "node_script");

    shjs.test.restore();
    shjs.cat.restore();

    demoFiles = [
      [ /file2?\.js$/, "console.log('Hello');" ],
      [ /file3\.json$/, "{}" ],
      [ /src[\/\\]file4\.js$/, "print('Hello');" ],
      [ /src[\/\\]lib[\/\\]file5\.js$/, "print('Hello'); "],
      [ /\.jshintrc$/, "{}" ],
      [ /\.jshintignore$/, "" ]
    ];

    testStub = sinon.stub(shjs, "test");
    demoFiles.forEach(function (file) {
      testStub = testStub.withArgs("-e", sinon.match(file[0])).returns(true);
    });

    testStub = testStub
      .withArgs("-e", sinon.match(/src$/)).returns(true)
      .withArgs("-e", sinon.match(/src[\/\\]lib$/)).returns(true)
      .withArgs("-d", sinon.match(/src$/)).returns(true)
      .withArgs("-d", sinon.match(/src[\/\\]lib$/)).returns(true);

    sinon.stub(shjs, "ls")
      .withArgs(sinon.match(/src$/)).returns(["lib", "file4.js"])
      .withArgs(sinon.match(/src[\/\\]lib$/)).returns(["file5.js"]);

    catStub = sinon.stub(shjs, "cat");
    demoFiles.forEach(function (file) {
      catStub = catStub.withArgs(sinon.match(file[0])).returns(file[1]);
    });

    cli.interpret([
      "node", "jshint", "file.js", "file2.js", "file3.json", "--extra-ext=json", "src"
    ]);

    files = cli.gather({
      args: ["file.js", "file2.js", "file3.json", "src"],
      extensions: "json",
      ignores: []
    });

    args = shjs.cat.args.filter(function (arg) {
      return !/\.jshintrc$/.test(arg[0]) && !/\.jshintignore$/.test(arg[0]);
    });

    test.equal(args.length, 5);
    test.equal(files.length, 5);
    test.equal(files[0], "file.js");
    test.equal(files[1], "file2.js");
    test.equal(files[2], "file3.json");
    test.equal(files[3], path.join("src", "lib", "file5.js"));
    test.equal(files[4], path.join("src", "file4.js"));

    shjs.test.restore();
    shjs.ls.restore();
    shjs.cat.restore();
    process.cwd.restore();

    sinon.stub(process, "cwd").returns(__dirname + "/../");
    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/reporter\.js$/)).returns("console.log('Hello');")
      .withArgs(sinon.match(/\.jshintrc$/)).returns("{}")
      .withArgs(sinon.match(/\.jshintignore$/)).returns("");

    files = cli.gather({
      args: ["examples"],
      extensions: "json",
      ignores: []
    });

    args = shjs.cat.args.filter(function (arg) {
      return !/\.jshintrc$/.test(arg[0]) && !/\.jshintignore$/.test(arg[0]);
    });

    test.equal(args.length, 0);
    test.equal(files.length, 1);
    test.equal(files[0], path.join("examples", "reporter.js"));

    shjs.cat.restore();
    process.cwd.restore();
    test.done();
  },

  testStatusCode: function (test) {
    var rep = require("../examples/reporter.js");
    var dir = __dirname + "/../examples/";
    sinon.stub(rep, "reporter");
    sinon.stub(process, "cwd").returns(dir);

    sinon.stub(shjs, "test")
      .withArgs("-e", sinon.match(/(pass\.js|fail\.js|\.jshintrc|\.jshintignore)$/)).returns(true);

    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/pass\.js$/)).returns("function test() { return 0; }")
      .withArgs(sinon.match(/fail\.js$/)).returns("console.log('Hello')")
      .withArgs(sinon.match(/\.jshintrc$/)).returns("{}")
      .withArgs(sinon.match(/\.jshintignore$/)).returns("");

    cli.exit.restore();
    sinon.stub(cli, "exit");

    cli.interpret([
      "node", "jshint", "pass.js", "--reporter=reporter.js"
    ]);

    cli.interpret([
      "node", "jshint", "fail.js", "--reporter=reporter.js"
    ]);

    test.strictEqual(cli.exit.args[0][0], 0);
    test.equal(cli.exit.args[1][0], 2);

    rep.reporter.restore();
    process.cwd.restore();
    shjs.test.restore();
    shjs.cat.restore();

    test.done();
  },

  testExtractWithIndentReportLocation: function (test) {
    var rep = require("../examples/reporter.js");
    var errors = [];
    sinon.stub(rep, "reporter", function (res) {
      errors = errors.concat(res);
    });

    var dir = __dirname + "/../examples/";
    sinon.stub(process, "cwd").returns(dir);

    var html = [
      "<html>",
      "<script type='text/javascript'>",
      "  /* jshint indent: 2*/",
      "  var a = 1;",
      "    var b = 1",
      "</script>",
      "</html>"
    ].join("\n");

    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/indent\.html$/)).returns(html)
      .withArgs(sinon.match(/.\jshintignore$/)).returns("");

    sinon.stub(shjs, "test")
      .withArgs("-e", sinon.match(/indent\.html$/)).returns(true)
      .withArgs("-e", sinon.match(/\.jshintignore$/)).returns(false);

    cli.exit.restore();
    sinon.stub(cli, "exit");

    cli.interpret([
      "node", "jshint", "indent.html", "--extract", "always", "--reporter=reporter.js"
    ]);
    test.equal(cli.exit.args[0][0], 1);

    rep.reporter.restore();
    process.cwd.restore();
    shjs.cat.restore();
    shjs.test.restore();

    test.equal(errors.length, 1, "found single error");
    var lintError = errors[0].error;
    test.ok(lintError, "have error object");
    test.equal(lintError.code, "W033", "found missing semicolon warning");
    test.equal(lintError.line, 5, "misaligned line");
    test.equal(lintError.character, 14, "first misaligned character at column 5");

    test.done();
  },

  testExtractWithIndentReportLocationMultipleFragments: function (test) {
    var rep = require("../examples/reporter.js");
    var errors = [];
    sinon.stub(rep, "reporter", function (res) {
      errors = errors.concat(res);
    });

    var dir = __dirname + "/../examples/";
    sinon.stub(process, "cwd").returns(dir);

    var html = [
      "<html>",
      "<script type='text/javascript'>",
      "  /* jshint indent: 2*/",
      "  var a = 1;",
      "    var b = 1", // misindented on purpose
      "</script>",
      "<p>nothing</p>",
      "<script type='text/javascript'>",
      "  /* jshint indent: 2*/",
      "      var a = 1", // misindented on purpose
      "</script>",
      "</html>"
    ].join("\n");

    sinon.stub(shjs, "cat")
      .withArgs(sinon.match(/indent\.html$/)).returns(html)
      .withArgs(sinon.match(/.\jshintignore$/)).returns("");

    sinon.stub(shjs, "test")
      .withArgs("-e", sinon.match(/indent\.html$/)).returns(true)
      .withArgs("-e", sinon.match(/\.jshintignore$/)).returns(false);

    cli.exit.restore();
    sinon.stub(cli, "exit");

    cli.interpret([
      "node", "jshint", "indent.html", "--extract", "always", "--reporter=reporter.js"
    ]);
    test.equal(cli.exit.args[0][0], 1);

    rep.reporter.restore();
    process.cwd.restore();
    shjs.cat.restore();
    shjs.test.restore();

    test.equal(errors.length, 2, "found two errors");

    test.equal(errors[0].error.line, 5, "first error line");
    test.equal(errors[0].error.character, 14, "first error column");

    test.equal(errors[1].error.line, 10, "second error line");
    test.equal(errors[1].error.character, 16, "second error column");

    test.done();
  }
};
