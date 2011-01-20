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

JSHint adds an option, oneline, that allows you to use one-line blocks in 
for, while and if constructions.


Community
---------

The most important part is that JSHint is developed and supported by
the JavaScript developers community and not by one very opinionated person.

If you use JSLint and think that it is too strict, use
[Issues](https://github.com/jshint/jshint/issues) to describe most annoying
JSLint gripes you encounter.


Development
-------

We don't have a stable version of JSHint yet. Stay tuned!

