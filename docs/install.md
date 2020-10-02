# Download and install

JSHint runs in a number of different environments; installation is different
for each.

### Browser-like environments

A standalone files is built for browser-like environments with every release.
You'll find it in the `dist` directory of the download. [Download the latest
release here](https://github.com/jshint/jshint/releases/latest).

### Rhino

A standalone files is built for Mozilla's [Rhino JavaScript
engine](http://www.mozilla.org/rhino) with every release.  You'll find it in
the `dist` directory of the download. [Download the latest release
here](https://github.com/jshint/jshint/releases/latest).

### Node.js

![NPM version](https://badge.fury.io/js/jshint.svg)

Each release of JSHint is published to [npm](https://npmjs.org), the package
manager for [the Node.js platform](https://nodejs.org).

You may **install it globally** using the following command:

    npm install -g jshint

After this, you can use the `jshint` command-line interface.

It is common to install JSHint as a development dependency within an existing
Node.js project:

    npm install --save-dev jshint

### Plugins for text editors and IDEs

#### VIM

* [jshint.vim](https://github.com/walm/jshint.vim), VIM plugin and command line
tool for running JSHint.
* [jshint2.vim](https://github.com/Shutnik/jshint2.vim), modern VIM plugin with
extra features for running JSHint.
* [Syntastic](https://github.com/scrooloose/syntastic),
supports JSHint both older/newer than 1.1.0.

#### Emacs

* [jshint-mode](https://github.com/daleharvey/jshint-mode), JSHint mode for GNU
Emacs.
* [Flycheck](https://github.com/lunaryorn/flycheck), on-the-fly syntax checking
extension for GNU Emacs, built-in JSHint support.
* [web-mode](http://web-mode.org/), an autonomous major-mode for editing web templates
supports JSHint.

#### Sublime Text

* [Sublime-JSHint Gutter](https://github.com/victorporof/Sublime-JSHint), JSHint
plugin for graphically displaying lint results in ST2 and ST3.
* [sublime-jshint](https://github.com/uipoet/sublime-jshint), JSHint build package
for ST2.
* [Sublime Linter](https://github.com/Kronuz/SublimeLinter), inline lint
highlighting for ST2.

#### Atom

* [linter-jshint](https://github.com/AtomLinter/linter-jshint), JSHint plugin for Atom's Linter.
* [JSHint for Atom](https://github.com/sindresorhus/atom-jshint), JSHint package for Atom.

#### TextMate

* [JSHint Bundle for TextMate 2](https://github.com/bodnaristvan/JSHint.tmbundle)
* [JSHint TextMate Bundle](https://github.com/fgnass/jshint.tmbundle).
* [JSLintMate](http://rondevera.github.com/jslintmate/) (supports both JSHint and
JSLint).
* [JSHint-external TextMate Bundle](https://github.com/natesilva/jshint-external.tmbundle)

#### Visual Studio

* [SharpLinter](https://github.com/jamietre/SharpLinter) (supports both JSLint and
JSHint).
* [JSLint for Visual Studio](http://jslint4vs2010.codeplex.com/) (supports both
JSLint and JSHint).
* [Web Essentials](http://vswebessentials.com) (Runs JSHint automatically).

### Visual Studio Code
* [VS Code JSHint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.jshint), integrates JSHint into VS Code.

#### Brackets

* [Brackets JSHint plugin](https://github.com/cfjedimaster/brackets-jshint/)
* [Brackets Interactive Linter](https://github.com/MiguelCastillo/Brackets-InteractiveLinter)

#### Other

* [ShiftEdit IDE](http://shiftedit.net/) has built-in support for JSHint.
* [Komodo 7 now ships](http://www.activestate.com/blog/2011/05/komodo-7-alpha-2-improved-syntax-checking)
with built-in support for JSHint.
* [JSHint integration for the Eclipse IDE](http://github.eclipsesource.com/jshint-eclipse/)
* [JSHint integration for the NetBeans IDE](https://github.com/panga/netbeans-jshint/)
* [JetBrains IDE family](http://www.jetbrains.com/products.html) supports realtime
code inspection with both JSHint and JSLint out of the box.
* [JSLint plugin for Notepad++](http://sourceforge.net/projects/jslintnpp/) now
supports JSHint.
* [JSHint plugin for Gedit](https://github.com/Kilian/gedit-jshint).

### Other cool stuff

* [JSHintr](http://rixth.github.com/jshintr/) is a web tool that allows you to
set your own code standards, easily review a file against these standards, and
share the output with other developers.
* [FixMyJS](https://github.com/jshint/fixmyjs) is a tool that automatically fixes
mistakes—such as missing semicolon, multiple definitions, etc.—reported by
JSHint.
* [A ruby gem for JSHint](https://github.com/rquinlivan/jshint-gem).
* [Another ruby gem](https://github.com/stereobooster/jshintrb) but without Java
dependency.
* [pre-commit](http://jish.github.com/pre-commit/) checks your code for errors
before you commit it.
* [Dedicated Ant task](https://github.com/philmander/ant-jshint) to easily
automate JSHint in Ant Maven.
* [QHint - JSHint in QUnit](https://github.com/gyoshev/qhint). Check for errors in
your code from within your unit tests. Lint errors result in failed tests.
* [Grunt](http://gruntjs.com), a task-based command line build tool for JavaScript
projects, supports JSHint out of the box.
* [overcommit](https://github.com/brigade/overcommit) is an extensible Git hook
manager with built-in JSHint linting, distributed as a Ruby gem. [Read
more](http://causes.github.io/blog/2013/05/30/overcommit-the-opinionated-git-hook-manager/)
about it.
* [jshint-mojo](https://github.com/cjdev/jshint-mojo), a plugin for Maven.
* [JSXHint](https://github.com/CondeNast/JSXHint), a wrapper around JSHint to allow
linting of files containing JSX syntax.
