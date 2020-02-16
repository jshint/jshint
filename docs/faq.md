# Frequently Asked Questions

### Can I use multiple reporters at the same time?

Yes, you may do so by authoring a new reporter that composes the reporters you
are interested in using.

For example, to use reporters named `first-reporter` and `second-reporter`,
create a new module that invokes them both:

    var first = require('first-reporter');
    var second = require('second-reporter');

    exports.reporter = function(results, data, opts) {
      first.reporter(results, data, opts);
      second.reporter(results, data, opts);
    };

Save that to a file named `dual-reporter.js`, and run JSHint with:

    $ jshint --reporter ./dual-reporter.js

...and you should see the output of `first-reporter` followed by the output of
`second-reporter`.

This approach is especially well-suited to using the different reporters'
output in different contexts (for instance, e-mailing one reporter's output to
the development team and feeding another reporter's output to a continuous
integration system). You might output a custom delimiter between the output
streams in order to demultiplex them. Alternatively, you might replace the
global `process.stdout` value with another stream between reporter invocations.
This latter solution is somewhat fragile because it involves mutating global
state--a future release of JSHint may expose a safer mechanism for this
operation.

See [the documentation on JSHint's "reporter"
API](http://jshint.com/docs/reporters/) for more details on creating your own
reporter.

### JSHint skips some unused variables

If your code looks like this:

    function test(a, b, c) {
      return c;
    }

Then JSHint will not warn about unused variables `a` and `b` if you set the
`unused` option to `true`. It figures that if unused arguments are followed
by used ones, it was a conscious decision and not a typo. If you want to
warn about all unused variables not matter where they appear, set the `unused`
option to `strict`:

    /*jshint unused:strict */
    function test(a, b, c) {
      return c;
    }

    // Warning: unused variable 'a'
    // Warning: unused variable 'b'

For more information see: [options/unused](http://jshint.com/docs/options/#unused).
