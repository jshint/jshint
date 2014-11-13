"use strict";

// These are the JSHint boolean options.
exports.bool = {
  enforcing: {
    bitwise     : true, // if bitwise operators should not be allowed
    freeze      : true, // if modifying native object prototypes should be disallowed
    camelcase   : true, // if identifiers should be required in camel case
    curly       : true, // if curly braces around all blocks should be required
    eqeqeq      : true, // if === should be required
    notypeof    : true, // if should report typos in typeof comparisons
    es3         : true, // if ES3 syntax should be allowed
    es5         : true, // if ES5 syntax should be allowed (is now set per default)
    forin       : true, // if for in statements must filter
    funcscope   : true, // if only function scope should be used for scope tests
    globalstrict: true, // if global "use strict"; should be allowed (also enables 'strict')
    immed       : true, // if immediate invocations must be wrapped in parens
    iterator    : true, // if the `__iterator__` property should be allowed
    // statements inside of a one-line blocks.
    newcap      : true, // if constructor names must be capitalized
    noarg       : true, // if arguments.caller and arguments.callee should be
    nocomma     : true, // if comma operator should be disallowed
    noempty     : true, // if empty blocks should be disallowed
    nonbsp      : true, // if non-breaking spaces should be disallowed
    nonew       : true, // if using `new` for side-effects should be disallowed
    // disallowed
    undef       : true, // if variables should be declared before used
    singleGroups: false,// if grouping operators for single-expression statements
    // should be disallowed
    enforceall : false // option to turn on all enforce options
    // by default and all relax options off by default
  },
  relaxing: {
    asi         : true, // if automatic semicolon insertion should be tolerated
    multistr    : true, // allow multiline strings
    debug       : true, // if debugger statements should be allowed
    boss        : true, // if advanced usage of assignments should be allowed
    phantom     : true, // if PhantomJS symbols should be allowed
    evil        : true, // if eval should be allowed
    plusplus    : true, // if increment/decrement should not be allowed
    proto       : true, // if the `__proto__` property should be allowed
    scripturl   : true, // if script-targeted URLs should be tolerated
    strict      : true, // require the "use strict"; pragma
    sub         : true, // if all forms of subscript notation are tolerated
    supernew    : true, // if `new function () { ... };` and `new Object;`
    // should be tolerated
    laxbreak    : true, // if line breaks should not be checked
    laxcomma    : true, // if line breaks should not be checked around commas
    validthis   : true, // if 'this' inside a non-constructor function is valid.
    // This is a function scoped option only.
    withstmt    : true, // if with statements should be allowed
    moz         : true, // if mozilla specific syntax should be allowed
    noyield     : true,  // allow generators without a yield
    eqnull      : true, // if == null comparisons should be tolerated
    lastsemic   : true, // if semicolons may be ommitted for the trailing
    loopfunc    : true, // if functions should be allowed to be defined within
    expr        : true, // if ExpressionStatement should be allowed as Programs
    esnext      : true // if es.next specific syntax should be allowed
  },

  // Third party globals
  environments: {
    mootools    : true, // if MooTools globals should be predefined
    couch       : true, // if CouchDB globals should be predefined
    jasmine     : true, // Jasmine functions should be predefined
    jquery      : true, // if jQuery globals should be predefined
    node        : true, // if the Node.js environment globals should be
    // predefined
    qunit       : true, // if the QUnit environment globals should be predefined
    rhino       : true, // if the Rhino environment globals should be predefined
    shelljs     : true, // if ShellJS globals should be predefined
    prototypejs : true, // if Prototype and Scriptaculous globals should be
    // predefined
    yui         : true, // YUI variables should be predefined
    mocha       : true, // Mocha functions should be predefined
    wsh         : true, // if the Windows Scripting Host environment globals
    // should be predefined
    worker      : true, // if Web Worker script symbols should be allowed
    nonstandard : true, // if non-standard (but widely adopted) globals should
    // be predefined
    browser     : true, // if the standard browser globals should be predefined
    browserify  : true, // if the standard browserify globals should be predefined
    devel       : true, // if logging globals should be predefined (console, alert, etc.)
    dojo        : true, // if Dojo Toolkit globals should be predefined
    typed       : true  // if typed array globals should be predefined
  },

  // Obsolete options
  obsolete: {
    onecase     : true, // if one case switch statements should be allowed
    regexp      : true, // if the . should not be allowed in regexp literals
    regexdash   : true  // if unescaped first/last dash (-) inside brackets
                        // should be tolerated
  }
};

// These are the JSHint options that can take any value
// (we use this object to detect invalid options)
exports.val = {
  maxlen       : false,
  indent       : false,
  maxerr       : false,
  predef       : false, // predef is deprecated and being replaced by globals
  globals      : false,
  quotmark     : false, // 'single'|'double'|true
  scope        : false,
  maxstatements: false, // {int} max statements per function
  maxdepth     : false, // {int} max nested block depth per function
  maxparams    : false, // {int} max params per function
  maxcomplexity: false, // {int} max cyclomatic complexity per function
  shadow       : false, // if variable shadowing should be tolerated
                        //   "inner"  - check for variables defined in the same scope only
                        //   "outer"  - check for variables defined in outer scopes as well
                        //   false    - same as inner
                        //   true     - allow variable shadowing
  unused       : true,  // warn if variables are unused. Available options:
                        //   false    - don't check for unused variables
                        //   true     - "vars" + check last function param
                        //   "vars"   - skip checking unused function params
                        //   "strict" - "vars" + check all function params
  latedef      : false, // warn if the variable is used before its definition
                        //   false    - don't emit any warnings
                        //   true     - warn if any variable is used before its definition
                        //   "nofunc" - warn for any variable but function declarations
  ignore       : false, // start/end ignoring lines of code, bypassing the lexer
                        //   start    - start ignoring lines, including the current line
                        //   end      - stop ignoring lines, starting on the next line
                        //   line     - ignore warnings / errors for just a single line
                        //              (this option does not bypass the lexer)
  ignoreDelimiters: false // array of start/end delimiters used to ignore
                          // certain chunks from code
};

// These are JSHint boolean options which are shared with JSLint
// where the definition in JSHint is opposite JSLint
exports.inverted = {
  bitwise : true,
  forin   : true,
  newcap  : true,
  plusplus: true,
  regexp  : true,
  undef   : true,

  // Inverted and renamed, use JSHint name here
  eqeqeq  : true,
  strict  : true
};

exports.validNames = Object.keys(exports.val)
  .concat(Object.keys(exports.bool.relaxing))
  .concat(Object.keys(exports.bool.enforcing))
  .concat(Object.keys(exports.bool.obsolete))
  .concat(Object.keys(exports.bool.environments));

// These are JSHint boolean options which are shared with JSLint
// where the name has been changed but the effect is unchanged
exports.renamed = {
  eqeq   : "eqeqeq",
  windows: "wsh",
  sloppy : "strict"
};

exports.removed = {
  nomen: true,
  onevar: true,
  passfail: true,
  white: true,
  gcl: true,
  smarttabs: true,
  trailing: true
};
