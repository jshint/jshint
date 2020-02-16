# Command-line Interface

The JSHint CLI can be installed via npm (see [the Installation page](/install)
for instructions).

Contents: [Specifying Input](#specifying-input) · [Specifying Linting
Options](#specifying-linting-options) · [Special Options](#special-options) ·
[Ignoring Files](#ignoring-files) · [Flags](#flags)

<a name="specifying-input"></a>

### Specifying Input

The `jshint` executable accepts file system paths as command-line arguments. If
a provided path describes a file, the executable will read that file and lint
the JavaScript code it contains:

    $ jshint myfile.js
    myfile.js: line 10, col 39, Octal literals are not allowed in strict mode.

    1 error

If a provided path describes a file system directory, JSHint will traverse
the directory and any subdirectories recursively, reading all JavaScript files
and linting their contents:

    $ tree a-directory/
    a-directory/
    ├── file-1.js
    └── nested
        └── file-2.js

    1 directory, 2 files

    $ jshint a-directory/
    a-directory/file-1.js: line 3, col 1, 'with' is not allowed in strict mode.

    a-directory/nested/file-2.js: line 3, col 3, Unreachable 'void' after 'return'.

    2 errors

If a file path is a dash (`-`) then JSHint will read from standard input.

<a name="specifying-linting-options"></a>

### Specifying Linting Options

The `jshint` executable is capable of applying [linting options](/docs/options)
specified in an external [JSON](http://json.org/)-formatted file. Such a file
might look like this:

    {
      "curly": true,
      "eqeqeq": true,
      "nocomma": true
    }

`jshint` will look for this configuration in a number of locations, stopping at
the first positive match:

1. The location specified with the `--config` [flag](#flags)
2. A file named `package.json` located in the current directory or any parent
   of the current directory (the configuration should be declared as the
   `jshintConfig` attribute of that file's JSON value)
3. A file named `.jshintrc` located in the current directory or any parent of
   the current directory
4. A file named `.jshintrc` located in the current user's "home" directory
   (where defined)

If this search yields no results, `jshint` will lint the input code as if no
linting rules had been enabled.

The command-line interface offers some [special options](#special-options) in
addition to [the ones available in other contexts](/docs/options)

<a name="special-options"></a>

### Special Options

The following options concern the file system and are only available from
within configuration files (i.e. not from inline directives or the API):

#### `extends`

Use another configuration file as a "base". The value of this option should be
a file path to another configuration file, and the path should be relative to
the current file.

For example, you might define a `.jshintrc` file in the top-level directory of
your project (say, `./.jshintrc') to specify the [linting
options](/docs/options) you would like to use in your entire project:

    {
      "undef": true,
      "unused": true
    }

You may want to re-use this configuration for your project's automated tests,
but also [allow for global
variables](http://localhost:4000/docs/options#globals) that are specific to the
test environment.  In this case, you could create a a new file in their test
directory, (`./test/.jshintrc` for example), and include the following
configuration:

    {
      "extends": "../.jshintrc",
      "globals": {
        "test": false,
        "assert": false
      }
    }

#### `overrides`

Specify options that should only be applied to files matching a given path
pattern.

The following configuration file [disallows variable
shadowing](/docs/options#shadow) for *all* files and [allows expressions as
statements](/docs/options#expr) for only those files ending in `-test.js`:

    {
      "shadow": false,
      "overrides": {
        "lib/*-test.js": {
          "expr": true
        }
      }
    }

<a name="ignoring-files"></a>

### Ignoring Files

`jshint` can be configured to ignore files based on their location in the
filesystem. You may create a dedicated "ignore" file to list any number of file
names, file paths, or file path patterns that should not be linted. Path
patterns will be interpreted using [the `minimatch` npm
module](https://www.npmjs.com/package/minimatch), which itself is based on [the
Unix filename matching syntax, fnmatch](http://linux.die.net/man/3/fnmatch).

    build/
    src/**/tmp.js

`jshint` will look for this configuration in a number of locations, stopping at
the first positive match:

1. The location specified with the `--exclude-path` [flag](#flags)
2. A file named `.jshintignore` located in the current directory or any parent
   of the current directory

If this search yields no results, `jshint` will not ignore any files.

<a name="flags"></a>

### Flags

#### `--config`

Explicitly sets the location on the file system from which `jshint` should load
linting options.

    $ jshint --config ../path/to/my/config.json

#### `--reporter`

Allows you to modify JSHint's output by replacing its default output function
with your own implementation.

    $ jshint --reporter=myreporter.js myfile.js

This flag also supports two pre-defined reporters: *jslint*, to make output
compatible with JSLint, and *checkstyle*, to make output compatible with
CheckStyle XML.

    $ jshint --reporter=checkstyle myfile.js
    <?xml version="1.0" encoding="utf-8"?>
    <checkstyle version="4.3">
      <file name="myfile.js">
        <error line="10" column="39" severity="error"
          message="Octal literals are not allowed in strict mode."/>
      </file>
    </checkstyle>

See also: [Writing your own JSHint reporter](/docs/reporters/).

#### `--verbose`

Adds message codes to the JSHint output.

#### `--show-non-errors`

Shows additional data generated by JSHint.

    $ jshint --show-non-errors myfile.js
    myfile.js: line 10, col 39, Octal literals are not allowed in strict mode.

    1 error

    myfile.js:
      Unused variables:
        foo, bar

#### `--extra-ext`

Allows you to specify additional file extensions to check (default is .js).

#### `--extract=[auto|always|never]`

Tells JSHint to extract JavaScript from HTML files before linting:

    tmp ☭ cat test.html
    <html>
      <head>
        <title>Hello, World!</title>
        <script>
          function hello() {
            return "Hello, World!";
          }
        </script>
      </head>
      <body>
        <h1>Hello, World!</h1>
        <script>
          console.log(hello())
        </script>
      </body>
    </html>

    tmp ☭ jshint --extract=auto test.html
    test.html: line 13, col 27, Missing semicolon.

    1 error

If you set it to *always* JSHint will always attempt to extract JavaScript.
And if you set it to *auto* it will make an attempt only if file looks
like it's an HTML file.

#### `--exclude`

Allows you to specify directories which you DON'T want to be linted.

#### `--exclude-path`

Allows you to provide your own .jshintignore file. For example, you can point
JSHint to your .gitignore file and use it instead of default .jshintignore.

#### `--prereq`

Allows you to specify prerequisite files i.e. files which include definitions
of global variables used throughout your project.

#### `--help`

Shows a nice little help message similar to what you're reading right now.

#### `--version`

Shows the installed version of JSHint.
