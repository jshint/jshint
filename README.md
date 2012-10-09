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

For general usage information, visit our website: [http://jshint.com/](http://jshint.com/).

Reporting a bug
---------------

To report a bug simply create a [new GitHub Issue](https://github.com/jshint/jshint/issues/new) and
describe your problem or suggestion. We welcome all kind of feedback regarding JSHint including but
not limited to:

 * When JSHint doesn't work as expected
 * When JSHint complains about valid JavaScript code that works in all browsers
 * When you simply want a new option or feature

Before reporting a bug look around to see if there are any open or closed tickets that
cover your issue. And remember the wisdom: pull request > bug report > tweet.

Installation
------------

You can install JSHint via NPM:

	npm install jshint -g

We also provide platform wrappers for Rhino, JavaScriptCore and Windows Script Host. To
use them, clone this repo and run our build command:

	node make.js

Contributing
------------

Look for a file named `CONTRIBUTING.md` in this repository. It contains our contributing
guidelines. We also have [a mailing list](http://groups.google.com/group/jshint/).

License
-------

JSHint is distributed under the MIT License. One file and one file only (src/stable/jshint.js) is
distributed under the slightly modified MIT License.

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
