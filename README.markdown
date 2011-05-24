JSHint, The (Gentler) JavaScript Code Quality Tool
==================================================

JSHint is a fork of Douglas Crockford's [JSLint](http://jslint.com/) that does
not tyrannize your code. It is designed to detect errors that actually break your
code while skipping things that, according to Crockford, “are known to
contribute mistakes in projects”. In other words, JSHint is a fork of JSLint
for the real world.

For example, JSLint does not tolerate the following constructions:

    if (cond) statement();

It expects all blocks to be enclosed in braces ({}):

    if (cond) {
      statement();
    }

JSHint removes that requirement (but it is still available as an option).


Community
---------

The most important part is that JSHint is developed and supported by
the JavaScript developers community and not by one very opinionated person.

If you use JSLint and think that it is too strict, use
[Issues](https://github.com/jshint/jshint/issues) to describe most annoying
JSLint gripes you encounter.


Development
-----------

JSHint was forked from the JSLint, edition 2010-12-16.
The current stable edition is [2011-02-19](http://jshint.com/jshint.js).


Environments
------------

JSHint can be used as a Node module out of the box:

    var JSHINT = require("jshint.js").JSHINT;

If you use Rhino, we have a special wrapper script for that:

    java -jar /path/to/js.jar env/rhino.js myscript.js

Also included is a Windows Scripting Host wrapper:

    cscript env/wsh.js myscript.js

And if you're on OS X, use Apple's built-in JavaScriptCore:

	env/jsc.sh myscript.js

Tests
-----

To run tests you will need to install [node.js](http://nodejs.org/) and
expresso. You can install the latter with npm:

    npm install expresso

After that, running tests is as easy as:

    expresso tests/*.js