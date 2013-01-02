JSHint, A Static Code Analysis Tool for JavaScript
==================================================

JSHint is a community-driven tool to detect errors and potential problems in
JavaScript code and to enforce your team's coding conventions. We made JSHint
very flexible so you can easily adjust it to your particular coding guidelines
and the environment you expect your code to execute in.

Our goal is to help JavaScript developers write complex programs without
worrying about typos and language gotchas.

We believe that static code analysis programs—as well as other code quality
tools—are important and beneficial to the JavaScript community and, thus,
should not alienate their users.

For general usage information, visit our website:
[http://jshint.com/](http://jshint.com/).

Reporting a bug
---------------

To report a bug simply create a
[new GitHub Issue](https://github.com/jshint/jshint/issues/new) and describe
your problem or suggestion. We welcome all kind of feedback regarding
JSHint including but not limited to:

 * When JSHint doesn't work as expected
 * When JSHint complains about valid JavaScript code that works in all browsers
 * When you simply want a new option or feature

Before reporting a bug look around to see if there are any open or closed tickets
that cover your issue. And remember the wisdom: pull request > bug report > tweet.

Installation
------------

You can install JSHint via NPM:

	npm install jshint -g

We also provide platform wrappers for Rhino, JavaScriptCore and Windows Script
Host. To use them, clone this repo and run our build command:

	node make.js

Usage
-----

    jshint -h

You can also require JSHint itself as a module.

    var jshint = require('jshint');

Note: If you are using npm v1.x be sure to install jshint locally (without the -g
flag) or link it globally.

Custom Reporters
----------------

Specify a custom reporter module (see example/reporter.js).

    --reporter path/to/reporter.js

Use a jslint compatible xml reporter.

    --jslint-reporter

Show additional non-error data generated by jshint (unused globals etc).

    --show-non-errors

Configuration Options
---------------------

**Note:** This behavior described below is very different from versions
prior to `0.6`.

The CLI uses the default options that come with JSHint. Only one extra
option is unique to the CLI version of JSHint: `globals` allows you to
define an object of globals that get ignored for every file.

To have your own configuration apply, there are several methods you can
use:

### Specify Manually

Setting the `--config=/path/to/your/config` command line option to specify
your own configuration file outside of the directory tree for your project.

### Within your Project's Directory Tree

When the CLI is called, and a configuration file isn't specified already,
`node-jshint` will attempt to locate one for you starting in `pwd`. (or
"present working directory") If this does not yield a `.jshintrc` file,
it will move one level up (`..`) the directory tree all the way up to
the filesystem root. If a file is found, it stops immediately and uses
that set of configuration.

This setup allows you to set up **one** configuration file for your entire
project. (place it in the root folder) As long as you run `jshint` from
anywhere within your project directory tree, the same configuration file
will be used.

### Home Directory

If all the methods above do not yield a `.jshintrc` to use, the last place
that will be checked is your user's `$HOME` directory.

## File Extensions

Default extension for files is ".js". If you want to use JSHint with other
file extensions (.json), you need to pass this extra extension as an
option:

    --extra-ext .json

## Ignoring Files and Directories

If there is a .jshintignore file in your project's directory tree, (also
provided you run `jshint` from within your project's directory) then any
directories or files specified will be skipped over. (behaves just like
a `.gitignore` file)

**Note:** Pattern matching uses minimatch, with the nocase
[option](https://github.com/isaacs/minimatch). When there is no match,
it performs a left side match (when no forward slashes present and path
is a directory).

Using JSHint as a library
-------------------------

It is easy to use JSHint as a JavaScript library. Just install the package
with NPM and, in your code, import a global `JSHINT` function:

    var JSHINT = require("jshint").JSHINT;

This function takes two parameters. The first parameter is either a string
or an array of strings. If it is a string, it will be split on '\n' or
'\r'. If it is an array of strings, it is assumed that each string
represents one line. The source can be a JavaScript text or a JSON text.

The second parameter is an optional object of options which control the
operation of JSHINT. Most of the options are booleans: they are all
optional and have a default value of false.

The third parameter is an object of global variables, with keys as names
and a boolean value to determine if they are assignable.

If it checks out, JSHINT returns true. Otherwise, it returns false.

If false, you can inspect JSHINT.errors to find out the problems.
JSHINT.errors is an array of objects containing these members:

    {
      line      : The line (relative to 1) at which the lint was found
      character : The character (relative to 1) at which the lint was found
      reason    : The problem
      evidence  : The text line in which the problem occured
      scope     : The scope of the problem.
      raw       : The raw message before the details were inserted
      a         : The first detail
      b         : The second detail
      c         : The third detail
      d         : The fourth detail
    }

If a fatal error was found, a null will be the last element of the
JSHINT.errors array.

You can request a data structure which contains JSHint's results.

    var myData = JSHINT.data();

It returns a structure with this form:

    {
      errors: [
        {
          line       : NUMBER,
          character  : NUMBER,
          reason     : STRING,
          evidence   : STRING
        }
      ],
        functions: [
        name         : STRING,
        line         : NUMBER,
        character    : NUMBER,
        last         : NUMBER,
        lastcharacter: NUMBER,
        param        : [ STRING ],
        closure      : [ STRING ],
        var          : [ STRING ],
        exception    : [ STRING ],
        outer        : [ STRING ],
        unused       : [ STRING ],
        global       : [ STRING ],
        label        : [ STRING ]
      ],
      globals: [
        STRING
      ],
      member: {
        STRING: NUMBER
      },
      unused: [
        {
          name       : STRING,
          line       : NUMBER
        }
      ],
      implieds: [
        {
          name: STRING,
          line: NUMBER
        }
      ],
      urls: [
        STRING
      ],
      json: BOOLEAN
    }

Empty array will not be included.


FAQ
---

#### How do I turn off "mixed tabs and spaces" warning?

If you're using so-called [smart tabs](http://www.emacswiki.org/SmartTabs)
then we have an option `smarttabs` for you. Otherwise, your solution is to
run JSHint with a custom reporter that discards any warnings you don't like.
For example, this [example reporter](https://gist.github.com/3885619)
discards all warnings about mixed tabs and spaces.

Contributing
------------

Look for a file named `CONTRIBUTING.md` in this repository. It contains our
contributing guidelines. We also have
[a mailing list](http://groups.google.com/group/jshint/).

License
-------

JSHint is distributed under the MIT License. One file and one file only
(src/stable/jshint.js) is distributed under the slightly modified MIT License.

Attribution
-----------

Core Team members:

 * [Anton Kovalyov](http://anton.kovalyov.net/) ([@valueof](http://twitter.com/valueof))
 * [Wolfgang Kluge](http://klugesoftware.de/) ([blog](http://gehirnwindung.de/))
 * [Josh Perez](http://www.goatslacker.com/) ([@goatslacker](http://twitter.com/goatslacker))
 * [Brent Lintner](http://brentlintner.heroku.com/) ([@brentlintner](http://twitter.com/brentlintner))

Maintainer: Anton Kovalyov

Thank you!
----------

We really appreciate all kind of feedback and contributions. Thanks for using and supporting JSHint!
