"use strict";

// These are the JSHint boolean options.
exports.simple = {
	asi         : true, // if automatic semicolon insertion should be tolerated
	bitwise     : true, // if bitwise operators should not be allowed
	boss        : true, // if advanced usage of assignments should be allowed
	browser     : true, // if the standard browser globals should be predefined
	couch       : true, // if CouchDB globals should be predefined
	curly       : true, // if curly braces around all blocks should be required
	debug       : true, // if debugger statements should be allowed
	devel       : true, // if logging globals should be predefined (console, alert, etc.)
	dojo        : true, // if Dojo Toolkit globals should be predefined
	eqeqeq      : true, // if === should be required
	eqnull      : true, // if == null comparisons should be tolerated
	notypeof    : true, // if should report typos in typeof comparisons
	es3         : true, // if ES3 syntax should be allowed
	es5         : true, // if ES5 syntax should be allowed (is now set per default)
	esnext      : true, // if es.next specific syntax should be allowed
	moz         : true, // if mozilla specific syntax should be allowed
	evil        : true, // if eval should be allowed
	expr        : true, // if ExpressionStatement should be allowed as Programs
	forin       : true, // if for in statements must filter
	funcscope   : true, // if only function scope should be used for scope tests
	globalstrict: true, // if global "use strict"; should be allowed (also enables 'strict')
	iterator    : true, // if the `__iterator__` property should be allowed
	jquery      : true, // if jQuery globals should be predefined
	lastsemic   : true, // if semicolons may be ommitted for the trailing
	                    // statements inside of a one-line blocks.
	loopfunc    : true, // if functions should be allowed to be defined within
	                    // loops
	mootools    : true, // if MooTools globals should be predefined
	freeze      : true, // if modifying native object prototypes should be disallowed
	newcap      : true, // if constructor names must be capitalized
	noarg       : true, // if arguments.caller and arguments.callee should be
	                    // disallowed
	node        : true, // if the Node.js environment globals should be
	                    // predefined
	nonew       : true, // if using `new` for side-effects should be disallowed
	nonstandard : true, // if non-standard (but widely adopted) globals should
	                    // be predefined
	passfail    : true, // if the scan should stop on first error
	phantom     : true, // if PhantomJS symbols should be allowed
	plusplus    : true, // if increment/decrement should not be allowed
	proto       : true, // if the `__proto__` property should be allowed
	prototypejs : true, // if Prototype and Scriptaculous globals should be
	                    // predefined
	rhino       : true, // if the Rhino environment globals should be predefined
	shelljs     : true, // if ShellJS globals should be predefined
	typed       : true, // if typed array globals should be predefined
	undef       : true, // if variables should be declared before used
	scripturl   : true, // if script-targeted URLs should be tolerated
	strict      : true, // require the "use strict"; pragma
	sub         : true, // if all forms of subscript notation are tolerated
	supernew    : true, // if `new function () { ... };` and `new Object;`
	                    // should be tolerated
	validthis   : true, // if 'this' inside a non-constructor function is valid.
	                    // This is a function scoped option only.
	withstmt    : true, // if with statements should be allowed
	worker      : true, // if Web Worker script symbols should be allowed
	wsh         : true, // if the Windows Scripting Host environment globals
	                    // should be predefined
	yui         : true, // YUI variables should be predefined

	// Obsolete options
	onecase     : true, // if one case switch statements should be allowed
	regexp      : true, // if the . should not be allowed in regexp literals
	regexdash   : true  // if unescaped first/last dash (-) inside brackets
	                    // should be tolerated
};

// These are the JSHint options that can take any value
// (we use this object to detect invalid options)
exports.multi = {
	indent       : false,
	maxerr       : false,
	predef       : false, // predef is deprecated and being replaced by globals
	globals      : false,
	scope        : false,
	maxstatements: false, // {int} max statements per function
	maxdepth     : false, // {int} max nested block depth per function
	maxparams    : false, // {int} max params per function
	maxcomplexity: false, // {int} max cyclomatic complexity per function
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
	shadow       : true,  // if variable shadowing should be tolerated
	                      // "inner"  - check for variables defined in the same scope only
	                      // "outer"  - check for variables defined in outer scopes as well
	                      // false    - same as inner
	                      // true     - allow variable shadowing
};

// These are JSHint boolean options which are shared with JSLint
// where the definition in JSHint is opposite JSLint
exports.inverted = {
	bitwise : true,
	forin   : true,
	newcap  : true,
	nomen   : true,
	plusplus: true,
	regexp  : true,
	undef   : true,

	// Inverted and renamed, use JSHint name here
	eqeqeq  : true,
	onevar  : true,
	strict  : true
};

// These are JSHint boolean options which are shared with JSLint
// where the name has been changed but the effect is unchanged
exports.renamed = {
	eqeq   : "eqeqeq",
	vars   : "onevar",
	windows: "wsh",
	sloppy : "strict"
};