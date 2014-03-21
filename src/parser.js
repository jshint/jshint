/*jshint quotmark:double */
/*global console:true */
/*exported console */

"use strict";

var _        = require("underscore");
var events   = require("events");
var vars     = require("./vars.js");
var messages = require("./messages.js");
var Lexer    = require("./lex.js").Lexer;
var reg      = require("./reg.js");
var options  = require("./options.js");
var utils    = require("./utils.js");
var console  = require("console-browserify"); // Needed for browserify to work with IE and Rhino.

var varmap = {
  couch:       [ vars.couch ],
  rhino:       [ vars.rhino ],
  shelljs:     [ vars.shelljs, vars.node, vars.typed ],
  typed:       [ vars.typed ],
  phantom:     [ vars.phantom ],
  node:        [ vars.node, vars.typed ],
  devel:       [ vars.devel ],
  dojo:        [ vars.dojo ],
  browser:     [ vars.browser, vars.typed ],
  jquery:      [ vars.jquery ],
  worker:      [ vars.worker ],
  wsh:         [ vars.wsh ],
  yui:         [ vars.yui ],
  mootools:    [ vars.mootools ],
  prototypejs: [ vars.prototypejs ],
  nonstandard: [ vars.nonstandard ]
};

// Extension API

var syntax   = {};
var emitter  = new events.EventEmitter();
var state    = {};

var api = {
  isStrictMode: function () {
    return state.directive["use strict"];
  },

  getOption: function (name) {
    return state.option[name] || null;
  },

  getEnvironment: function (name, strict) {
    // Assuming that chronologically ES3 < ES5 < ES6/ESNext < Mozilla

    switch (name) {
      case "moz":
        return strict ? state.option.moz && !state.option.esnext :
                        state.option.moz;
      case "es6":
        return strict ? state.option.esnext && !state.option.moz :
                        state.option.moz || state.option.esnext;
      case "es5":
        return !state.option.es3;
      case "es3":
        return strict ? state.option.es3 && !state.option.moz && !state.option.esnext :
                        state.option.es3;
    }
  },

  warn: function (code, data) {
    warn(code, { coord: { line: data.line, ch: data.char }, args: data.data });
  },

  on: function (names, listener) {
    names.split(" ").forEach(function (name) {
      emitter.on(name, listener);
    }.bind(this));
  }
};

var anonname;    // The guessed name for anonymous functions.
var declared;    // Globals that were declared using /*global ... */ syntax.
var exported;    // Variables that are used outside of the current file.
var funct;       // The current function
var globalscope; // The global scope
var inblock;
var indent;
var lookahead;
var lex;
var noreach;
var predefined;  // Global variables defined by option
var scope;       // The current scope
var stack;
var warnings;

function checkOption(name, t) {
  name = name.trim();

  if (/^[+-]W\d{3}$/g.test(name))
    return true;

  if (options.multi[name] === undefined && options.simple[name] === undefined) {
    if (t.type !== "jslint") {
      warn("E001", { token: t, args: [name] });
      return false;
    }
  }

  return true;
}

function isIdentifier(tkn, value) {
  if (!tkn)
    return false;

  if (!tkn.identifier || tkn.value !== value)
    return false;

  return true;
}

function isReserved(token) {
  if (!token.reserved) {
    return false;
  }
  var meta = token.meta;

  if (meta && meta.isFutureReservedWord && api.getEnvironment("es5")) {
    // ES3 FutureReservedWord in an ES5 environment.
    if (!meta.es5) {
      return false;
    }

    // Some ES5 FutureReservedWord identifiers are active only
    // within a strict mode environment.
    if (meta.strictOnly) {
      if (!state.option.strict && !state.directive["use strict"]) {
        return false;
      }
    }

    if (token.isProperty) {
      return false;
    }
  }

  return true;
}

// Produce an error warning.
function quit(code, line, chr) {
  var pct = Math.floor((line / lex.source.length) * 100);
  var msg = messages.get(code);
  var nt  = state.tokens.next || {};

  state.errors.push({
    scope     : "(main)",
    type      : "error",
    message   : msg.desc + " (" + pct + "% scanned).",
    code      : msg.code,
    line      : line || nt.line,
    character : chr || nt.from,
  });

  state.errors.push(null);

  throw { name: "ParseError", state: state };
}

function isundef(scope, code, opts) {
  return state.undefs.push([scope, code, opts]);
}

function warn(code, opts) {
  opts = opts || {};
  var msg = messages.get(code, opts.args || []);
  var line, ch, token;

  if (state.ignored[code])
    return;

  if (opts.coord) {
    line = opts.coord.line || 0;
    ch = opts.coord.ch || 0;
  } else {
    token = opts.token || state.tokens.next;
    if (token.id === "(end)") token = state.tokens.curr;

    line = token.line || 0;
    ch = token.from || 0;
  }

  state.errors.push({
    code:    msg.code,
    type:    msg.type,
    line:    line,
    ch:      ch,
    message: msg.desc,
    source:  lex.source[line - 1] || "",
    scope:   state.program
  });

  if (state.option.passfail)
    quit("E042", line, ch);

  warnings += 1;
  if (warnings >= state.option.maxerr)
    quit("E043", line, ch);
}

// name: string
// opts: { type: string, token: token, islet: bool, unused: bool }
function addlabel(name, opts) {
  opts = opts || {};

  var type  = opts.type;
  var islet = opts.islet;

  // Define name in the current function in the current scope.
  if (type === "exception") {
    if (_.has(funct["(context)"], name) && funct[name] !== true && !state.option.node) {
      warn("W002", { token: state.tokens.next, args: [name] });
    }
  }

  if (_.has(funct, name) && !funct["(global)"]) {
    if (funct[name] === true) {
      if (state.option.latedef) {
        if ((state.option.latedef === true && _.contains([funct[name], type], "unction")) ||
            !_.contains([funct[name], type], "unction")) {
          warn("W003", { token: state.tokens.next, args: [name] });
        }
      }
    } else {
      if ((!state.option.shadow || _.contains([ "inner", "outer" ], state.option.shadow)) &&
          type !== "exception" || funct["(blockscope)"].getlabel(name)) {
        warn("W004", { token: state.tokens.next, args: [name] });
      }
    }
  }

  if (funct["(context)"] && _.has(funct["(context)"], name) && type !== "function") {
    if (state.option.shadow === "outer") {
      warn("W123", { token: state.tokens.next, args: [name] });
    }
  }

  // if the identifier is from a let, adds it only to the current blockscope
  if (islet) {
    funct["(blockscope)"].current.add(name, type, state.tokens.curr);
  } else {
    funct["(blockscope)"].shadow(name);
    funct[name] = type;

    if (opts.token) {
      funct["(tokens)"][name] = opts.token;
    }

    utils.setprop(funct, name, { unused: opts.unused || false });

    if (funct["(global)"]) {
      globalscope[name] = funct;
      if (_.has(state.implied, name)) {
        if (state.option.latedef) {
          if ((state.option.latedef === true && _.contains([funct[name], type], "unction")) ||
              !_.contains([funct[name], type], "unction")) {
            warn("W003", { token: state.tokens.next, args: [name] });
          }
        }

        delete state.implied[name];
      }
    } else {
      scope[name] = funct;
    }
  }
}

function doOption() {
  var nt = state.tokens.next;
  var body = nt.body.split(",").map(function (s) { return s.trim(); });

  if (nt.type === "globals") {
    body.forEach(function (g) {
      g = g.split(":");
      var key = (g[0] || "").trim();
      var val = (g[1] || "").trim();

      if (key.charAt(0) === "-") {
        key = key.slice(1);
        val = false;

        state.blacklist[key] = true;
        delete predefined[key];
        return;
      }

      predefined[key] = (val === "true");
      declared[key] = nt;
    });

    return;
  }

  if (nt.type === "exported")
    return void body.forEach(function (e) { exported[e] = true });

  var numvals = [
    "maxstatements",
    "maxparams",
    "maxdepth",
    "maxcomplexity",
    "maxerr",
    "indent"
  ];

  if (nt.type === "jshint" || nt.type === "jslint") {
    body.forEach(function (g) {
      g = g.split(":");
      var key = (g[0] || "").trim();
      var val = (g[1] || "").trim();

      if (!checkOption(key, nt)) {
        return;
      }

      if (numvals.indexOf(key) >= 0) {
        // GH988 - numeric options can be disabled by setting them to `false`
        if (val !== "false") {
          val = +val;

          if (typeof val !== "number" || !isFinite(val) || val <= 0 || Math.floor(val) !== val) {
            warn("E032", { token: nt, args: [g[1].trim()] });
            return;
          }

          state.option[key] = val;
        } else {
          if (key !== "indent") {
            state.option[key] = false;
          }
        }

        return;
      }

      if (key === "validthis") {
        // `validthis` is valid only within a function scope.

        if (funct["(global)"])
          return void warn("E009");

        if (val !== "true" && val !== "false")
          return void warn("E002", { token: nt });

        state.option.validthis = (val === "true");
        return;
      }

      if (key === "shadow") {
        switch (val) {
        case "true":
          state.option.shadow = true;
          break;
        case "outer":
          state.option.shadow = "outer";
          break;
        case "false":
        case "inner":
          state.option.shadow = "inner";
          break;
        default:
          warn("E002", { token: nt });
        }

        return;
      }

      if (key === "unused") {
        switch (val) {
        case "true":
          state.option.unused = true;
          break;
        case "false":
          state.option.unused = false;
          break;
        case "vars":
        case "strict":
          state.option.unused = val;
          break;
        default:
          warn("E002", { token: nt });
        }
        return;
      }

      if (key === "latedef") {
        switch (val) {
        case "true":
          state.option.latedef = true;
          break;
        case "false":
          state.option.latedef = false;
          break;
        case "nofunc":
          state.option.latedef = "nofunc";
          break;
        default:
          warn("E002", { token: nt });
        }
        return;
      }

      if (key === "ignore") {
        switch (val) {
        case "start":
          lex.ignoring = true;
          break;
        case "end":
          lex.ignoring = false;
          break;
        case "line":
          // Any errors or warnings that happened on the current line, make them go away.
          state.errors = _.reject(state.errors, function (error) {
            // nt.line returns to the current line
            return error.line === nt.line;
          });
          break;
        default:
          warn("E002", { token: nt });
        }
        return;
      }

      if (key === "globalstrict" && val === "true" && state.option.strict !== false) {
        state.option.globalstrict = true;
        state.option.strict = true;
        return;
      }

      var match = /^([+-])(W\d{3})$/g.exec(key);
      if (match) {
        // ignore for -W..., unignore for +W...
        state.ignored[match[2]] = (match[1] === "-");
        return;
      }

      var tn;
      if (val === "true" || val === "false") {
        if (nt.type === "jslint") {
          tn = options.renamed[key] || key;
          state.option[tn] = (val === "true");

          if (options.inverted[tn] !== undefined) {
            state.option[tn] = !state.option[tn];
          }
        } else {
          state.option[key] = (val === "true");
        }

        // Add new globals to the 'predefined' collection if needed.
        if (varmap[key] && val === "true")
          varmap[key].forEach(function (vars) { _.extend(predefined, vars) });

        return;
      }

      warn("E002", { token: nt });
    });
  }
}

function convertToken(token) {
  var obj;

  function reserved(obj, isprop) {
    var meta = obj.meta;

    if (!obj.reserved)
      return false;

    if (!meta || !meta.isFutureReservedWord || !api.getEnvironment("es5"))
      return true;

    // ES3 FutureReservedWord in an ES5 environment.
    if (!meta.es5)
      return false;

    // Some ES5 FutureReservedWord identifiers are active only
    // within a strict mode environment.
    if (meta.strictOnly && !state.option.strict && !state.directive["use strict"])
      return false;

    if (isprop)
      return false;

    return true;
  }

  if (token.id)
    return token;

  if (token.type === "(punctuator)")
    obj = Object.create(syntax[token.value] || syntax["(error)"]);

  if (token.type === "(identifier)") {
    if (_.has(syntax, token.value)) {
      obj = Object.create(syntax[token.value] || syntax["(error)"]);

      // If this can't be a reserved keyword, reset the object.
      if (!reserved(obj, state.tokens.curr.id === "." && token.type === "(identifier)"))
        obj = null;
    }
  }

  if (!obj)
    obj = Object.create(syntax[token.type]);

  obj.identifier = (token.type === "(identifier)");
  obj.check = token.check;
  obj.type  = obj.type || token.type;
  obj.value = token.value;
  obj.line  = token.pos.line;
  obj.from  = token.pos.from;
  obj.character = token.pos.ch;

  if (state.tokens.curr.id === "." && obj.identifier)
    obj.isProperty = true;

  return obj;
}

// We need a peek function. If it has an argument, it peeks that much farther
// ahead. It is used to distinguish
//     for ( var i in ...
// from
//     for ( var i = ...

function peek(p) {
  var i = p || 0, j = 0, t;

  while (j <= i) {
    t = lookahead[j];
    if (!t) {
      t = lookahead[j] = convertToken(lex.token());
    }
    j += 1;
  }
  return t;
}

// Produce the next token. It looks for programming errors.

function advance(id, t) {
  switch (state.tokens.curr.id) {
  case "(number)":
    if (state.tokens.next.id === ".") {
      warn("W005", { token: state.tokens.curr });
    }
    break;
  case "-":
    if (state.tokens.next.id === "-" || state.tokens.next.id === "--") {
      warn("W006");
    }
    break;
  case "+":
    if (state.tokens.next.id === "+" || state.tokens.next.id === "++") {
      warn("W007");
    }
    break;
  }

  if (state.tokens.curr.type === "(string)" || state.tokens.curr.identifier) {
    anonname = state.tokens.curr.value;
  }

  if (id && state.tokens.next.id !== id) {
    if (t) {
      if (state.tokens.next.id === "(end)") {
        warn("E019", { token: t, args: [t.id] });
      } else {
        warn("E020", {
          token: state.tokens.next,
          args: [id, t.id, t.line, state.tokens.next.value]
        });
      }
    } else if (state.tokens.next.type !== "(identifier)" || state.tokens.next.value !== id) {
      warn("W116", { token: state.tokens.next, args: [id, state.tokens.next.value] });
    }
  }

  state.tokens.prev = state.tokens.curr;
  state.tokens.curr = state.tokens.next;
  for (;;) {
    state.tokens.next = lookahead.shift() || convertToken(lex.token());

    if (!state.tokens.next) { // No more tokens left, give up
      quit("E041", state.tokens.curr.line);
    }

    if (state.tokens.next.id === "(end)" || state.tokens.next.id === "(error)") {
      return;
    }

    if (state.tokens.next.isSpecial) {
      doOption();
    } else {
      if (state.tokens.next.id !== "(endline)") {
        break;
      }
    }
  }
}

function isInfix(token) {
  return token.infix || (!token.identifier && !!token.led);
}

function isEndOfExpr() {
  var curr = state.tokens.curr;
  var next = state.tokens.next;
  if (next.id === ";" || next.id === "}" || next.id === ":") {
    return true;
  }
  if (isInfix(next) === isInfix(curr) || (curr.id === "yield" && api.getEnvironment("moz", true))) {
    return curr.line !== next.line;
  }
  return false;
}

// This is the heart of JSHINT, the Pratt parser. In addition to parsing, it
// is looking for ad hoc lint patterns. We add .fud to Pratt's model, which is
// like .nud except that it is only used on the first token of a statement.
// Having .fud makes it much easier to define statement-oriented languages like
// JavaScript. I retained Pratt's nomenclature.

// .nud  Null denotation
// .fud  First null denotation
// .led  Left denotation
//  lbp  Left binding power
//  rbp  Right binding power

// They are elements of the parsing method called Top Down Operator Precedence.

function expression(rbp, initial) {
  var left, isArray = false, isObject = false, isLetExpr = false;

  // if current expression is a let expression
  if (!initial && state.tokens.next.value === "let" && peek(0).value === "(") {
    if (!api.getEnvironment("moz", true))
      warn("W118", { token: state.tokens.next, args: ["let expressions"] });

    isLetExpr = true;
    // create a new block scope we use only for the current expression
    funct["(blockscope)"].stack();
    advance("let");
    advance("(");
    syntax["let"].fud.call(syntax["let"].fud, false);
    advance(")");
  }

  if (state.tokens.next.id === "(end)")
    warn("E006", { token: state.tokens.curr });

  advance();

  if (initial) {
    anonname = "anonymous";
    funct["(verb)"] = state.tokens.curr.value;
  }

  if (initial === true && state.tokens.curr.fud) {
    left = state.tokens.curr.fud();
  } else {
    if (state.tokens.curr.nud) {
      left = state.tokens.curr.nud();
    } else {
      warn("E030", { token: state.tokens.curr, args: [state.tokens.curr.id] });
    }

    while (rbp < state.tokens.next.lbp && !isEndOfExpr()) {
      isArray = state.tokens.curr.value === "Array";
      isObject = state.tokens.curr.value === "Object";

      // #527, new Foo.Array(), Foo.Array(), new Foo.Object(), Foo.Object()
      // Line breaks in IfStatement heads exist to satisfy the checkJSHint
      // "Line too long." error.
      if (left && (left.value || (left.first && left.first.value))) {
        // If the left.value is not "new", or the left.first.value is a "."
        // then safely assume that this is not "new Array()" and possibly
        // not "new Object()"...
        if (left.value !== "new" ||
          (left.first && left.first.value && left.first.value === ".")) {
          isArray = false;
          // ...In the case of Object, if the left.value and state.tokens.curr.value
          // are not equal, then safely assume that this not "new Object()"
          if (left.value !== state.tokens.curr.value) {
            isObject = false;
          }
        }
      }

      advance();

      if (isArray && state.tokens.curr.id === "(" && state.tokens.next.id === ")") {
        warn("W009", { token: state.tokens.curr });
      }

      if (isObject && state.tokens.curr.id === "(" && state.tokens.next.id === ")") {
        warn("W010", { token: state.tokens.curr });
      }

      if (left && state.tokens.curr.led) {
        left = state.tokens.curr.led(left);
      } else {
        warn("E033", { token: state.tokens.curr, args: [state.tokens.curr.id] });
      }
    }
  }
  if (isLetExpr) {
    funct["(blockscope)"].unstack();
  }
  return left;
}

function comma(opts) {
  opts = opts || {};
  if (!opts.peek) advance(",");

  if (state.tokens.next.identifier && !(opts.property && api.getEnvironment("es5"))) {
    // Keywords that cannot follow a comma operator.
    switch (state.tokens.next.value) {
    case "break":
    case "case":
    case "catch":
    case "continue":
    case "default":
    case "do":
    case "else":
    case "finally":
    case "for":
    case "if":
    case "in":
    case "instanceof":
    case "return":
    case "switch":
    case "throw":
    case "try":
    case "var":
    case "let":
    case "while":
    case "with":
      warn("E024", { token: state.tokens.next, args: [state.tokens.next.value] });
      return false;
    }
  }

  if (state.tokens.next.type === "(punctuator)") {
    switch (state.tokens.next.value) {
    case "}":
    case "]":
    case ",":
      if (opts.allowTrailing) {
        return true;
      }

      /* falls through */
    case ")":
      warn("E024", { token: state.tokens.next, args: [state.tokens.next.value] });
      return false;
    }
  }
  return true;
}

// Functional constructors for making the symbols that will be inherited by
// tokens.

function symbol(s, p) {
  var x = syntax[s];
  if (!x || typeof x !== "object") {
    syntax[s] = x = {
      id: s,
      lbp: p,
      value: s
    };
  }
  return x;
}

function delim(s) {
  return symbol(s, 0);
}

function stmt(s, f) {
  var x = delim(s);
  x.identifier = x.reserved = true;
  x.fud = f;
  return x;
}

function blockstmt(s, f) {
  var x = stmt(s, f);
  x.block = true;
  return x;
}

function reserveName(x) {
  var c = x.id.charAt(0);
  if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
    x.identifier = x.reserved = true;
  }
  return x;
}

function prefix(s, f) {
  var x = symbol(s, 150);
  reserveName(x);

  x.nud = (typeof f === "function") ? f : function () {
    this.right = expression(150);
    this.arity = "unary";
    if (this.id === "++" || this.id === "--") {
      if (state.option.plusplus) {
        warn("W016", { token: this, args: [this.id] });
      } else if (this.right && (!this.right.identifier || isReserved(this.right)) &&
          this.right.id !== "." && this.right.id !== "[") {
        warn("W017", { token: this });
      }
    }

    return this;
  };

  return x;
}

function type(s, f) {
  var x = delim(s);
  x.type = s;
  x.nud = f;
  return x;
}

function reserve(name, func) {
  var x = type(name, func);
  x.identifier = true;
  x.reserved = true;
  return x;
}

function FutureReservedWord(name, meta) {
  var x = type(name, (meta && meta.nud) || function () {
    return this;
  });

  meta = meta || {};
  meta.isFutureReservedWord = true;

  x.value = name;
  x.identifier = true;
  x.reserved = true;
  x.meta = meta;

  return x;
}

function reservevar(s, v) {
  return reserve(s, function () {
    if (typeof v === "function") {
      v(this);
    }
    return this;
  });
}

function infix(s, f, p) {
  var x = symbol(s, p);
  reserveName(x);
  x.infix = true;
  x.led = function (left) {
    if (s === "in" && left.id === "!") {
      warn("W018", { token: left, args: ["!"] });
    }
    if (typeof f === "function") {
      return f(left, this);
    } else {
      this.left = left;
      this.right = expression(p);
      return this;
    }
  };
  return x;
}

function application(s) {
  var x = symbol(s, 42);

  x.led = function (left) {
    if (!api.getEnvironment("es6")) {
      warn("W104", { token: state.tokens.curr, args: ["arrow function syntax (=>)"] });
    }

    this.left = left;
    this.right = doFunction(undefined, undefined, false, left);
    return this;
  };
  return x;
}

function relation(s, f) {
  var x = symbol(s, 100);

  x.led = function (left) {
    var right = expression(100);

    if (isIdentifier(left, "NaN") || isIdentifier(right, "NaN")) {
      warn("W019", { token: this });
    } else if (f) {
      f.apply(this, [left, right]);
    }

    if (!left || !right) {
      quit("E041", state.tokens.curr.line);
    }

    if (left.id === "!") {
      warn("W018", { token: left, args: ["!"] });
    }

    if (right.id === "!") {
      warn("W018", { token: right, args: ["!"] });
    }

    this.left = left;
    this.right = right;
    return this;
  };
  return x;
}

function isPoorRelation(node) {
  return node &&
      ((node.type === "(number)" && +node.value === 0) ||
       (node.type === "(string)" && node.value === "") ||
       (node.type === "null" && !state.option.eqnull) ||
      node.type === "true" ||
      node.type === "false" ||
      node.type === "undefined");
}

// Checks whether the 'typeof' operator is used with the correct
// value. For docs on 'typeof' see:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof

function isTypoTypeof(left, right) {
  if (state.option.notypeof)
    return false;

  if (!left || !right)
    return false;

  var values = [
    "undefined", "object", "boolean", "number",
    "string", "function", "xml", "object", "unknown"
  ];

  if (right.type === "(identifier)" && right.value === "typeof" && left.type === "(string)")
    return !_.contains(values, left.value);

  return false;
}

function findNativePrototype(left) {
  var natives = [
    "Array", "ArrayBuffer", "Boolean", "Collator", "DataView", "Date",
    "DateTimeFormat", "Error", "EvalError", "Float32Array", "Float64Array",
    "Function", "Infinity", "Intl", "Int16Array", "Int32Array", "Int8Array",
    "Iterator", "Number", "NumberFormat", "Object", "RangeError",
    "ReferenceError", "RegExp", "StopIteration", "String", "SyntaxError",
    "TypeError", "Uint16Array", "Uint32Array", "Uint8Array", "Uint8ClampedArray",
    "URIError"
  ];

  function walkPrototype(obj) {
    if (typeof obj !== "object") return;
    return obj.right === "prototype" ? obj : walkPrototype(obj.left);
  }

  function walkNative(obj) {
    while (!obj.identifier && typeof obj.left === "object")
      obj = obj.left;

    if (obj.identifier && natives.indexOf(obj.value) >= 0)
      return obj.value;
  }

  var prototype = walkPrototype(left);
  if (prototype) return walkNative(prototype);
}

function assignop(s, f, p) {
  var x = infix(s, typeof f === "function" ? f : function (left, that) {
    that.left = left;

    if (left) {
      if (state.option.freeze) {
        var nativeObject = findNativePrototype(left);
        if (nativeObject)
          warn("W121", { token: left, args: [nativeObject] });
      }

      if (predefined[left.value] === false &&
          scope[left.value]["(global)"] === true) {
        warn("W020", { token: left });
      } else if (left["function"]) {
        warn("W021", { token: left, args: [left.value] });
      }

      if (funct[left.value] === "const") {
        warn("E013", { token: left, args: [left.value] });
      }

      if (left.id === ".") {
        if (!left.left) {
          warn("E031", { token: that });
        } else if (left.left.value === "arguments" && !state.directive["use strict"]) {
          warn("E031", { token: that });
        }

        that.right = expression(10);
        return that;
      } else if (left.id === "[") {
        if (state.tokens.curr.left.first) {
          state.tokens.curr.left.first.forEach(function (t) {
            if (funct[t.value] === "const") {
              warn("E013", { token: t, args: [t.value] });
            }
          });
        } else if (!left.left) {
          warn("E031", { token: that });
        } else if (left.left.value === "arguments" && !state.directive["use strict"]) {
          warn("E031", { token: that });
        }
        that.right = expression(10);
        return that;
      } else if (left.identifier && !isReserved(left)) {
        if (funct[left.value] === "exception") {
          warn("W022", { token: left });
        }
        that.right = expression(10);
        return that;
      }

      if (left === syntax["function"]) {
        warn("W023", { token: state.tokens.curr });
      }
    }

    warn("E031", { token: that });
  }, p);

  x.exps = true;
  x.assign = true;
  return x;
}

function bitwise(s, f, p) {
  var x = symbol(s, p);
  reserveName(x);
  x.led = (typeof f === "function") ? f : function (left) {
    if (state.option.bitwise) {
      warn("W016", { token: this, args: [this.id] });
    }
    this.left = left;
    this.right = expression(p);
    return this;
  };
  return x;
}

function bitwiseassignop(s) {
  return assignop(s, function (left, that) {
    if (state.option.bitwise) {
      warn("W016", { token: that, args: [that.id] });
    }
    if (left) {
      if (left.id === "." || left.id === "[" ||
          (left.identifier && !isReserved(left))) {
        expression(10);
        return that;
      }
      if (left === syntax["function"]) {
        warn("W023", { token: state.tokens.curr });
      }
      return that;
    }
    warn("E031", { token: that });
  }, 20);
}

function suffix(s) {
  var x = symbol(s, 150);

  x.led = function (left) {
    if (state.option.plusplus) {
      warn("W016", { token: this, args: [this.id] });
    } else if ((!left.identifier || isReserved(left)) && left.id !== "." && left.id !== "[") {
      warn("W017", { token: this });
    }

    this.left = left;
    return this;
  };
  return x;
}

// fnparam means that this identifier is being defined as a function
// argument (see identifier())
// prop means that this identifier is that of an object property

function optionalidentifier(fnparam, prop) {
  if (!state.tokens.next.identifier)
    return;

  advance();

  var curr = state.tokens.curr;
  var val  = state.tokens.curr.value;

  switch (true) {
  case !isReserved(curr):
  case prop && api.getEnvironment("es5"):
  case fnparam && val === "undefined":
    return val;
  }

  warn("W024", { token: state.tokens.curr, args: [state.tokens.curr.id] });
  return val;
}

// fnparam means that this identifier is being defined as a function
// argument
// prop means that this identifier is that of an object property
function identifier(fnparam, prop) {
  var i = optionalidentifier(fnparam, prop);
  if (i) {
    return i;
  }
  if (state.tokens.curr.id === "function" && state.tokens.next.id === "(") {
    warn("W025");
  } else {
    warn("E030", { token: state.tokens.next, args: [state.tokens.next.value] });
  }
}

function reachable(s) {
  var i = 0, t;
  if (state.tokens.next.id !== ";" || noreach) {
    return;
  }
  for (;;) {
    do {
      t = peek(i);
      i += 1;
    } while (t.id != "(end)" && t.id === "(comment)");

    if (t.reach) {
      return;
    }
    if (t.id !== "(endline)") {
      if (t.id === "function") {
        if (state.option.latedef === true) {
          warn("W026", { token: t });
        }
        break;
      }

      warn("W027", { token: t, args: [t.value, s] });
      break;
    }
  }
}

function statement() {
  var values;
  var i = indent, r, s = scope, t = state.tokens.next;

  if (t.id === ";") {
    advance(";");
    return;
  }

  // Is this a labelled statement?
  var res = isReserved(t);

  // We're being more tolerant here: if someone uses
  // a FutureReservedWord as a label, we warn but proceed
  // anyway.

  if (res && t.meta && t.meta.isFutureReservedWord && peek().id === ":") {
    warn("W024", { token: t, args: [t.id] });
    res = false;
  }

  // detect a destructuring assignment
  if (_.has(["[", "{"], t.value)) {
    if (lookupBlockType().isDestAssign) {
      if (!api.getEnvironment("es6")) {
        warn("W104", { token: state.tokens.curr, args: ["destructuring expression"] });
      }
      values = destructuringExpression();
      values.forEach(function (tok) {
        isundef(funct, "W117", { token: tok.token, args: [tok.id] });
      });
      advance("=");
      destructuringExpressionMatch(values, expression(10, true));
      advance(";");
      return;
    }
  }
  if (t.identifier && !res && peek().id === ":") {
    advance();
    advance(":");
    scope = Object.create(s);
    addlabel(t.value, { type: "label" });

    if (!state.tokens.next.labelled && state.tokens.next.value !== "{") {
      warn("W028", { token: state.tokens.next, args: [t.value, state.tokens.next.value] });
    }

    state.tokens.next.label = t.value;
    t = state.tokens.next;
  }

  // Is it a lonely block?

  if (t.id === "{") {
    // Is it a switch case block?
    //
    //  switch (foo) {
    //    case bar: { <= here.
    //      ...
    //    }
    //  }
    var iscase = (funct["(verb)"] === "case" && state.tokens.curr.value === ":");
    block(true, true, false, false, iscase);
    return;
  }

  // Parse the statement.
  r = expression(0, true);

  if (r && (!r.identifier || r.value !== "function") && (r.type !== "(punctuator)")) {
    if (!state.directive["use strict"] && state.option.globalstrict && state.option.strict) {
      warn("E007");
    }
  }

  // Look for the final semicolon.

  if (!t.block) {
    if (!state.option.expr && (!r || !r.exps)) {
      warn("W030", { token: state.tokens.curr });
    } else if (state.option.nonew && r && r.left && r.id === "(" && r.left.id === "new") {
      warn("W031", { token: t });
    }

    if (state.tokens.next.id !== ";") {
      if (!state.option.asi) {
        // If this is the last statement in a block that ends on
        // the same line *and* option lastsemic is on, ignore the warning.
        // Otherwise, complain about missing semicolon.
        if (!state.option.lastsemic || state.tokens.next.id !== "}" ||
          state.tokens.next.line !== state.tokens.curr.line) {
          warn("W033", { coord: {
            line: state.tokens.curr.line,
            ch: state.tokens.curr.character
          }});
        }
      }
    } else {
      advance(";");
    }
  }

  // Restore the indentation.

  indent = i;
  scope = s;
  return r;
}

function statements(startLine) {
  var a = [], p;

  while (!state.tokens.next.reach && state.tokens.next.id !== "(end)") {
    if (state.tokens.next.id === ";") {
      p = peek();

      if (!p || (p.id !== "(" && p.id !== "[")) {
        warn("W032");
      }

      advance(";");
    } else {
      a.push(statement(startLine === state.tokens.next.line));
    }
  }
  return a;
}

/*
 * read all directives
 * recognizes a simple form of asi, but always
 * warns, if it is used
 */
function directives() {
  var i, p, pn;

  for (;;) {
    if (state.tokens.next.id === "(string)") {
      p = peek(0);
      if (p.id === "(endline)") {
        i = 1;
        do {
          pn = peek(i);
          i = i + 1;
        } while (pn.id === "(endline)");

        if (pn.id !== ";") {
          if (pn.id !== "(string)" && pn.id !== "(number)" &&
            pn.id !== "(regexp)" && pn.identifier !== true &&
            pn.id !== "}") {
            break;
          }
          warn("W033", { token: state.tokens.next });
        } else {
          p = pn;
        }
      } else if (p.id === "}") {
        // Directive with no other statements, warn about missing semicolon
        warn("W033", { token: p });
      } else if (p.id !== ";") {
        break;
      }

      advance();
      if (state.directive[state.tokens.curr.value]) {
        warn("W034", { token: state.tokens.curr, args: [state.tokens.curr.value] });
      }

      if (state.tokens.curr.value === "use strict") {
        state.option.undef = true;
      }

      // there's no directive negation, so always set to true
      state.directive[state.tokens.curr.value] = true;

      if (p.id === ";") {
        advance(";");
      }
      continue;
    }
    break;
  }
}

/*
 * Parses a single block. A block is a sequence of statements wrapped in
 * braces.
 *
 * ordinary   - true for everything but function bodies and try blocks.
 * stmt       - true if block can be a single statement (e.g. in if/for/while).
 * isfunc     - true if block is a function body
 * isfatarrow - true if block is a body of a fat arrow function
 * iscase     - true if block is a switch case block
 */
function block(ordinary, stmt, isfunc, isfatarrow, iscase) {
  var a;
  var b = inblock;
  var old_indent = indent;
  var m;
  var s = scope;
  var t;
  var line;
  var d;

  inblock = ordinary;

  if (!ordinary || !state.option.funcscope)
    scope = Object.create(scope);

  t = state.tokens.next;

  var metrics = funct["(metrics)"];
  var max = state.option.maxdepth;
  metrics.blockDepth += 1;

  if (max && metrics.blockDepth > 0 && metrics.blockDepth === max + 1) {
    warn("W073", { token: null, args: [ metrics.blockDepth ] });
  }

  if (state.tokens.next.id === "{") {
    advance("{");

    // create a new block scope
    funct["(blockscope)"].stack();

    line = state.tokens.curr.line;
    if (state.tokens.next.id !== "}") {
      indent += state.option.indent;
      while (!ordinary && state.tokens.next.from > indent) {
        indent += state.option.indent;
      }

      if (isfunc) {
        m = {};
        for (d in state.directive) {
          if (_.has(state.directive, d)) {
            m[d] = state.directive[d];
          }
        }
        directives();

        if (state.option.strict && funct["(context)"]["(global)"]) {
          if (!m["use strict"] && !state.directive["use strict"]) {
            warn("E007");
          }
        }
      }

      a = statements(line);

      metrics.statements += a.length;

      if (isfunc) {
        state.directive = m;
      }

      indent -= state.option.indent;
    }
    advance("}", t);

    funct["(blockscope)"].unstack();

    indent = old_indent;
  } else if (!ordinary) {
    if (isfunc) {
      m = {};
      if (stmt && !isfatarrow && !api.getEnvironment("moz", true)) {
        warn("W118", { token: state.tokens.curr, args: ["function closure expressions"] });
      }

      if (!stmt) {
        for (d in state.directive) {
          if (_.has(state.directive, d)) {
            m[d] = state.directive[d];
          }
        }
      }
      expression(10);

      if (state.option.strict && funct["(context)"]["(global)"]) {
        if (!m["use strict"] && !state.directive["use strict"]) {
          warn("E007");
        }
      }
    } else {
      warn("E021", { token: state.tokens.next, args: ["{", state.tokens.next.value] });
    }
  } else {

    // check to avoid let declaration not within a block
    funct["(nolet)"] = true;

    if (!stmt || state.option.curly) {
      warn("W116", { token: state.tokens.next, args: ["{", state.tokens.next.value] });
    }

    noreach = true;
    indent += state.option.indent;
    // test indentation only if statement is in new line
    a = [statement(state.tokens.next.line === state.tokens.curr.line)];
    indent -= state.option.indent;
    noreach = false;

    delete funct["(nolet)"];
  }
  // Don't clear and let it propagate out if it is "break", "return", or "throw" in switch case
  if (!(iscase && ["break", "return", "throw"].indexOf(funct["(verb)"]) != -1)) {
    funct["(verb)"] = null;
  }

  if (!ordinary || !state.option.funcscope) scope = s;
  inblock = b;
  metrics.blockDepth -= 1;
  return a;
}

function note_implied(tkn) {
  var name = tkn.value;
  var desc = Object.getOwnPropertyDescriptor(state.implied, name);

  if (!desc)
    state.implied[name] = [tkn.line];
  else
    desc.value.push(tkn.line);
}

// Build the syntax table by declaring the syntactic elements of the language.

type("(number)", function () {
  return this;
});

type("(string)", function () {
  return this;
});

type("(template)", function() {
  return this;
});

syntax["(identifier)"] = {
  type: "(identifier)",
  lbp: 0,
  identifier: true,

  nud: function () {
    var v = this.value;
    var s = scope[v];
    var f;
    var block;

    if (typeof s === "function") {
      // Protection against accidental inheritance.
      s = undefined;
    } else if (!funct["(blockscope)"].current.has(v) && typeof s === "boolean") {
      f = funct;
      funct = state.functions[0];
      addlabel(v, { type: "var" });
      s = funct;
      funct = f;
    }

    block = funct["(blockscope)"].getlabel(v);

    // The name is in scope and defined in the current function.
    if (funct === s || block) {
      // Change 'unused' to 'var', and reject labels.
      // the name is in a block scope.
      switch (block ? block[v]["(type)"] : funct[v]) {
      case "unused":
        if (block) block[v]["(type)"] = "var";
        else funct[v] = "var";
        break;
      case "unction":
        if (block) block[v]["(type)"] = "function";
        else funct[v] = "function";
        this["function"] = true;
        break;
      case "const":
        utils.setprop(funct, v, { unused: false });
        break;
      case "function":
        this["function"] = true;
        break;
      case "label":
        warn("W037", { token: state.tokens.curr, args: [v] });
        break;
      }
    } else if (funct["(global)"]) {
      // The name is not defined in the function.  If we are in the global
      // scope, then we have an undefined variable.
      //
      // Operators typeof and delete do not raise runtime errors even if
      // the base object of a reference is null so no need to display warning
      // if we're inside of typeof or delete.

      if (typeof predefined[v] !== "boolean") {
        // Attempting to subscript a null reference will throw an
        // error, even within the typeof and delete operators
        if (!(anonname === "typeof" || anonname === "delete") ||
          (state.tokens.next && (state.tokens.next.value === "." ||
            state.tokens.next.value === "["))) {

          // if we're in a list comprehension, variables are declared
          // locally and used before being defined. So we check
          // the presence of the given variable in the comp array
          // before declaring it undefined.

          if (!funct["(comparray)"].check(v)) {
            isundef(funct, "W117", { token: state.tokens.curr, args: [v] });
          }
        }
      }

      note_implied(state.tokens.curr);
    } else {
      // If the name is already defined in the current
      // function, but not as outer, then there is a scope error.

      switch (funct[v]) {
      case "closure":
      case "function":
      case "var":
      case "unused":
        warn("W038", { token: state.tokens.curr, args: [v] });
        break;
      case "label":
        warn("W037", { token: state.tokens.curr, args: [v] });
        break;
      case "outer":
      case "global":
        break;
      default:
        // If the name is defined in an outer function, make an outer entry,
        // and if it was unused, make it var.
        if (s === true) {
          funct[v] = true;
        } else if (s === null) {
          warn("W039", { token: state.tokens.curr, args: [v] });
          note_implied(state.tokens.curr);
        } else if (typeof s !== "object") {
          // Operators typeof and delete do not raise runtime errors even
          // if the base object of a reference is null so no need to
          //
          // display warning if we're inside of typeof or delete.
          // Attempting to subscript a null reference will throw an
          // error, even within the typeof and delete operators
          if (!(anonname === "typeof" || anonname === "delete") ||
            (state.tokens.next &&
              (state.tokens.next.value === "." || state.tokens.next.value === "["))) {

            isundef(funct, "W117", { token: state.tokens.curr, args: [v] });
          }
          funct[v] = true;
          note_implied(state.tokens.curr);
        } else {
          switch (s[v]) {
          case "function":
          case "unction":
            this["function"] = true;
            s[v] = "closure";
            funct[v] = s["(global)"] ? "global" : "outer";
            break;
          case "var":
          case "unused":
            s[v] = "closure";
            funct[v] = s["(global)"] ? "global" : "outer";
            break;
          case "const":
            utils.setprop(s, v, { unused: false });
            break;
          case "closure":
            funct[v] = s["(global)"] ? "global" : "outer";
            break;
          case "label":
            warn("W037", { token: state.tokens.curr, args: [v] });
          }
        }
      }
    }
    return this;
  },

  led: function () {
    warn("E033", { token: state.tokens.next, args: [state.tokens.next.value] });
  }
};

type("(regexp)", function () {
  return this;
});

// ECMAScript parser

delim("(endline)");
delim("(begin)");
delim("(end)").reach = true;
delim("(error)").reach = true;
delim("}").reach = true;
delim(")");
delim("]");
delim("\"").reach = true;
delim("'").reach = true;
delim(";");
delim(":").reach = true;
delim("#");

reserve("else");
reserve("case").reach = true;
reserve("catch");
reserve("default").reach = true;
reserve("finally");
reservevar("arguments", function (x) {
  if (state.directive["use strict"] && funct["(global)"]) {
    warn("E008", { token: x });
  }
});
reservevar("eval");
reservevar("false");
reservevar("Infinity");
reservevar("null");
reservevar("this", function (x) {
  if (state.directive["use strict"] && !state.option.validthis && ((funct["(statement)"] &&
      funct["(name)"].charAt(0) > "Z") || funct["(global)"])) {
    warn("W040", { token: x });
  }
});
reservevar("true");
reservevar("undefined");

assignop("=", "assign", 20);
assignop("+=", "assignadd", 20);
assignop("-=", "assignsub", 20);
assignop("*=", "assignmult", 20);
assignop("/=", "assigndiv", 20).nud = function () { warn("E014") };
assignop("%=", "assignmod", 20);

bitwiseassignop("&=", "assignbitand", 20);
bitwiseassignop("|=", "assignbitor", 20);
bitwiseassignop("^=", "assignbitxor", 20);
bitwiseassignop("<<=", "assignshiftleft", 20);
bitwiseassignop(">>=", "assignshiftright", 20);
bitwiseassignop(">>>=", "assignshiftrightunsigned", 20);
infix(",", function (left, that) {
  var expr;
  that.exprs = [left];
  if (!comma({peek: true})) {
    return that;
  }
  while (true) {
    if (!(expr = expression(10)))  {
      break;
    }
    that.exprs.push(expr);
    if (state.tokens.next.value !== "," || !comma()) {
      break;
    }
  }
  return that;
}, 10, true);

infix("?", function (left, that) {
  increaseComplexityCount();
  that.left = left;
  that.right = expression(10);
  advance(":");
  that["else"] = expression(10);
  return that;
}, 30);

var orPrecendence = 40;
infix("||", function (left, that) {
  increaseComplexityCount();
  that.left = left;
  that.right = expression(orPrecendence);
  return that;
}, orPrecendence);
infix("&&", "and", 50);
bitwise("|", "bitor", 70);
bitwise("^", "bitxor", 80);
bitwise("&", "bitand", 90);

relation("==", function (left, right) {
  var eqnull = state.option.eqnull && (left.value === "null" || right.value === "null");

  switch (true) {
    case !eqnull && state.option.eqeqeq:
      this.from = this.character;
      warn("W116", { token: this, args: ["===", "=="] });
      break;
    case isPoorRelation(left):
      warn("W041", { token: this, args: ["===", left.value] });
      break;
    case isPoorRelation(right):
      warn("W041", { token: this, args: ["===", right.value] });
      break;
    case isTypoTypeof(right, left):
      warn("W122", { token: this, args: [right.value] });
      break;
    case isTypoTypeof(left, right):
      warn("W122", { token: this, args: [left.value] });
  }

  return this;
});

relation("===", function (left, right) {
  if (isTypoTypeof(right, left))
    warn("W122", { token: this, args: [right.value] });
  else if (isTypoTypeof(left, right))
    warn("W122", { token: this, args: [left.value] });

  return this;
});

relation("!=", function (left, right) {
  var eqnull = state.option.eqnull && (left.value === "null" || right.value === "null");

  switch (true) {
    case !eqnull && state.option.eqeqeq:
      this.from = this.character;
      warn("W116", { token: this, args: ["!==", "!="] });
      break;
    case isPoorRelation(left):
      warn("W041", { token: this, args: ["!==", left.value] });
      break;
    case isPoorRelation(right):
      warn("W041", { token: this, args: ["!==", right.value] });
      break;
    case isTypoTypeof(right, left):
      warn("W122", { token: this, args: [right.value] });
      break;
    case isTypoTypeof(left, right):
      warn("W122", { token: this, args: [left.value] });
  }

  return this;
});

relation("!==", function (left, right) {
  if (isTypoTypeof(right, left))
    warn("W122", { token: this, args: [right.value] });
  else if (isTypoTypeof(left, right))
    warn("W122", { token: this, args: [left.value] });

  return this;
});

relation("<");
relation(">");
relation("<=");
relation(">=");
bitwise("<<", "shiftleft", 120);
bitwise(">>", "shiftright", 120);
bitwise(">>>", "shiftrightunsigned", 120);
infix("in", "in", 120);
infix("instanceof", "instanceof", 120);
infix("+", function (left, that) {
  var right = expression(130);
  if (left && right && left.id === "(string)" && right.id === "(string)") {
    left.value += right.value;
    left.character = right.character;
    if (!state.option.scripturl && reg.javascriptURL.test(left.value)) {
      warn("W050", { token: left });
    }
    return left;
  }
  that.left = left;
  that.right = right;
  return that;
}, 130);
prefix("+", "num");
prefix("+++", function () {
  warn("W007");
  this.right = expression(150);
  this.arity = "unary";
  return this;
});
infix("+++", function (left) {
  warn("W007");
  this.left = left;
  this.right = expression(130);
  return this;
}, 130);
infix("-", "sub", 130);
prefix("-", "neg");
prefix("---", function () {
  warn("W006");
  this.right = expression(150);
  this.arity = "unary";
  return this;
});
infix("---", function (left) {
  warn("W006");
  this.left = left;
  this.right = expression(130);
  return this;
}, 130);
infix("*", "mult", 140);
infix("/", "div", 140);
infix("%", "mod", 140);

suffix("++", "postinc");
prefix("++", "preinc");
syntax["++"].exps = true;

suffix("--", "postdec");
prefix("--", "predec");
syntax["--"].exps = true;
prefix("delete", function () {
  var p = expression(10);
  if (!p || (p.id !== "." && p.id !== "[")) {
    warn("W051");
  }
  this.first = p;
  return this;
}).exps = true;

prefix("~", function () {
  if (state.option.bitwise) {
    warn("W052", { token: this, args: ["~"] });
  }
  expression(150);
  return this;
});

prefix("...", function () {
  if (!api.getEnvironment("es6"))
    warn("W104", { token: this, args: ["spread/rest operator"] });

  if (!state.tokens.next.identifier)
    warn("E030", { token: state.tokens.next, args: [state.tokens.next.value] });

  expression(150);
  return this;
});

prefix("!", function () {
  // These are operators that should not be used with the ! operator.
  var bang = [ "<", "<=", "==", "===", "!==", "!=", ">", ">=", "+", "-", "*", "/", "%" ];

  this.right = expression(150);
  this.arity = "unary";

  if (!this.right)
    quit("E041", this.line || 0); // '!' followed by nothing? Give up.

  if (_.contains(bang, this.right.id))
    warn("W018", { token: this, args: ["!"] });

  return this;
});

prefix("typeof", "typeof");
prefix("new", function () {
  var c = expression(155), i;
  if (c && c.id !== "function") {
    if (c.identifier) {
      c["new"] = true;
      switch (c.value) {
      case "Number":
      case "String":
      case "Boolean":
      case "Math":
      case "JSON":
        warn("W053", { token: state.tokens.prev, args: [c.value] });
        break;
      case "Function":
        if (!state.option.evil) {
          warn("W054");
        }
        break;
      case "Date":
      case "RegExp":
      case "this":
        break;
      default:
        if (c.id !== "function") {
          i = c.value.substr(0, 1);
        }
      }
    } else {
      if (c.id !== "." && c.id !== "[" && c.id !== "(") {
        warn("W056", { token: state.tokens.curr });
      }
    }
  } else {
    if (!state.option.supernew)
      warn("W057", { token: this });
  }

  if (state.tokens.next.id !== "(" && !state.option.supernew) {
    warn("W058", { token: state.tokens.curr, args: [state.tokens.curr.value] });
  }
  this.first = c;
  return this;
});
syntax["new"].exps = true;

prefix("void").exps = true;

infix(".", function (left, that) {
  var m = identifier(false, true);

  that.left = left;
  that.right = m;

  if (m && m === "hasOwnProperty" && state.tokens.next.value === "=") {
    warn("W001");
  }

  if (left && left.value === "arguments" && (m === "callee" || m === "caller")) {
    if (state.option.noarg)
      warn("W059", { token: left, args: [m] });
    else if (state.directive["use strict"])
      warn("E008");
  } else if (!state.option.evil && left && left.value === "document" &&
      (m === "write" || m === "writeln")) {
    warn("W060", { token: left });
  }

  if (!state.option.evil && (m === "eval" || m === "execScript")) {
    warn("W061");
  }

  return that;
}, 160, true);

infix("(", function (left, that) {
  var n = 0;
  var p = [];

  if (left) {
    if (left.type === "(identifier)") {
      if (left.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/)) {
        if ("Number String Boolean Date Object".indexOf(left.value) === -1) {
          if (left.value === "Math") {
            warn("W063", { token: left });
          }
        }
      }
    }
  }

  if (state.tokens.next.id !== ")") {
    for (;;) {
      p[p.length] = expression(10);
      n += 1;
      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
  }

  advance(")");

  // Tracking of "internal" scripts, like eval containing a static string
  function addInternal(elem, src) {
    state.scripts.push({ id: "(internal)", elem: elem, value: src });
  }

  if (typeof left === "object") {
    if (api.getEnvironment("es3") && left.value === "parseInt" && n === 1) {
      warn("W065", { token: state.tokens.curr });
    }
    if (!state.option.evil) {
      if (left.value === "eval" || left.value === "Function" || left.value === "execScript") {
        warn("W061", { token: left });

        if (p[0] && [0].id === "(string)")
          addInternal(left, p[0].value);

      } else if (p[0] && p[0].id === "(string)" &&
        (left.value === "setTimeout" || left.value === "setInterval")) {
        warn("W066", { token: left });
        addInternal(left, p[0].value);

      // window.setTimeout/setInterval
      } else if (p[0] && p[0].id === "(string)" && left.value === "." &&
        left.left.value === "window" &&
        (left.right === "setTimeout" || left.right === "setInterval")) {
        warn("W066", { token: left });
        addInternal(left, p[0].value);
      }
    }
    if (!left.identifier && left.id !== "." && left.id !== "[" &&
        left.id !== "(" && left.id !== "&&" && left.id !== "||" &&
        left.id !== "?") {
      warn("W067", { token: left });
    }
  }

  that.left = left;
  return that;
}, 155, true).exps = true;

prefix("(", function () {
  /*jshint loopfunc:true */
  var bracket, brackets = [];
  var pn, pn1, i = 0;
  var ret;
  var parens = 1;

  do {
    pn = peek(i);

    if (pn.value === "(") {
      parens += 1;
    } else if (pn.value === ")") {
      parens -= 1;
    }

    i += 1;
    pn1 = peek(i);
  } while (!(parens === 0 && pn.value === ")") &&
           pn1.value !== "=>" && pn1.value !== ";" && pn1.type !== "(end)");

  var exprs = [];

  if (state.tokens.next.id !== ")") {
    for (;;) {
      if (pn1.value === "=>" && _.contains(["{", "["], state.tokens.next.value)) {
        bracket = state.tokens.next;
        bracket.left = destructuringExpression();
        brackets.push(bracket);
        bracket.left.forEach(function (t) { exprs.push(t.token) });
      } else {
        exprs.push(expression(10));
      }
      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
  }

  advance(")", this);

  if (state.tokens.next.value === "=>") {
    return exprs;
  }
  if (!exprs.length) {
    return;
  }
  if (exprs.length > 1) {
    ret = Object.create(syntax[","]);
    ret.exprs = exprs;
  } else {
    ret = exprs[0];
  }
  if (ret) {
    ret.paren = true;
  }
  return ret;
});

application("=>");

infix("[", function (left, that) {
  var e = expression(10), s;
  if (e && e.type === "(string)") {
    if (!state.option.evil && (e.value === "eval" || e.value === "execScript")) {
      warn("W061", { token: that });
    }

    if (!state.option.sub && reg.identifier.test(e.value)) {
      s = syntax[e.value];
    }
  }
  advance("]", that);

  if (e && e.value === "hasOwnProperty" && state.tokens.next.value === "=") {
    warn("W001");
  }

  that.left = left;
  that.right = e;
  return that;
}, 160, true);

function comprehensiveArrayExpression() {
  var res = {};
  res.exps = true;
  funct["(comparray)"].stack();

  // Handle reversed for expressions, used in spidermonkey
  var reversed = false;
  if (state.tokens.next.value !== "for") {
    reversed = true;

    if (!api.getEnvironment("moz", true))
      warn("W116", { token: state.tokens.next, args: ["for", state.tokens.next.value] });

    funct["(comparray)"].setState("use");
    res.right = expression(10);
  }

  advance("for");
  if (state.tokens.next.value === "each") {
    advance("each");

    if (!api.getEnvironment("moz", true))
      warn("W118", { token: state.tokens.curr, args: ["for each"] });
  }
  advance("(");
  funct["(comparray)"].setState("define");
  res.left = expression(130);
  if (_.contains(["in", "of"], state.tokens.next.value)) {
    advance();
  } else {
    warn("E045", { token: state.tokens.curr });
  }
  funct["(comparray)"].setState("generate");
  expression(10);

  advance(")");
  if (state.tokens.next.value === "if") {
    advance("if");
    advance("(");
    funct["(comparray)"].setState("filter");
    res.filter = expression(10);
    advance(")");
  }

  if (!reversed) {
    funct["(comparray)"].setState("use");
    res.right = expression(10);
  }

  advance("]");
  funct["(comparray)"].unstack();
  return res;
}

prefix("[", function () {
  var blocktype = lookupBlockType(true);
  if (blocktype.isCompArray) {
    if (!api.getEnvironment("es6")) {
      warn("W119", { token: state.tokens.curr, args: ["array comprehension"] });
    }
    return comprehensiveArrayExpression();
  } else if (blocktype.isDestAssign && !api.getEnvironment("es6")) {
    warn("W104", { token: state.tokens.curr, args: ["destructuring assignment"] });
  }
  var b = state.tokens.curr.line !== state.tokens.next.line;
  this.first = [];
  if (b) {
    indent += state.option.indent;
    if (state.tokens.next.from === indent + state.option.indent) {
      indent += state.option.indent;
    }
  }
  while (state.tokens.next.id !== "(end)") {
    while (state.tokens.next.id === ",") {
      if (!api.getEnvironment("es5"))
        warn("W070");
      advance(",");
    }
    if (state.tokens.next.id === "]") {
      break;
    }
    this.first.push(expression(10));
    if (state.tokens.next.id === ",") {
      comma({ allowTrailing: true });
      if (state.tokens.next.id === "]" && !api.getEnvironment("es5", true)) {
        warn("W070", { token: state.tokens.curr });
        break;
      }
    } else {
      break;
    }
  }
  if (b) {
    indent -= state.option.indent;
  }
  advance("]", this);
  return this;
}, 160);

function property_name() {
  var id = optionalidentifier(false, true);

  if (!id) {
    if (state.tokens.next.id === "(string)") {
      id = state.tokens.next.value;
      advance();
    } else if (state.tokens.next.id === "(number)") {
      id = state.tokens.next.value.toString();
      advance();
    }
  }

  if (id === "hasOwnProperty") {
    warn("W001");
  }

  return id;
}

function functionparams(parsed) {
  /*jshint loopfunc:true */
  var next;
  var params = [];
  var ident;
  var tokens = [];
  var pastDefault = false;

  if (parsed) {
    if (Array.isArray(parsed)) {
      parsed.forEach(function (curr) {
        if (curr.value === "...") {
          if (!api.getEnvironment("es6"))
            warn("W104", { token: curr, args: ["spread/rest operator"] });
          return;
        } else if (curr.value !== ",") {
          params.push(curr.value);
          addlabel(curr.value, { type: "unused", token: curr });
        }
      });
      return params;
    } else {
      if (parsed.identifier === true) {
        addlabel(parsed.value, { type: "unused", token: parsed });
        return [parsed];
      }
    }
  }

  next = state.tokens.next;

  advance("(");

  if (state.tokens.next.id === ")") {
    advance(")");
    return;
  }

  for (;;) {
    if (_.contains(["{", "["], state.tokens.next.id)) {
      tokens = destructuringExpression();
      tokens.forEach(function (t) {
        if (t.id) {
          params.push(t.id);
          addlabel(t.id, { type: "unused", token: t.token });
        }
      });
    } else if (state.tokens.next.value === "...") {
      if (!api.getEnvironment("es6")) {
        warn("W104", { token: state.tokens.next, args: ["spread/rest operator"] });
      }
      advance("...");
      ident = identifier(true);
      params.push(ident);
      addlabel(ident, { type: "unused", token: state.tokens.curr });
    } else {
      ident = identifier(true);
      params.push(ident);
      addlabel(ident, { type: "unused", token: state.tokens.curr });
    }

    // it is a syntax error to have a regular argument after a default argument
    if (pastDefault) {
      if (state.tokens.next.id !== "=") {
        warn("E051", { token: state.tokens.current });
      }
    }
    if (state.tokens.next.id === "=") {
      if (!api.getEnvironment("es6")) {
        warn("W119", { token: state.tokens.next, args: ["default parameters"] });
      }
      advance("=");
      pastDefault = true;
      expression(10);
    }
    if (state.tokens.next.id === ",") {
      comma();
    } else {
      advance(")", next);
      return params;
    }
  }
}

function doFunction(name, statement, generator, fatarrowparams) {
  var f;
  var oldOption  = state.option;
  var oldIgnored = state.ignored;
  var oldScope   = scope;

  state.option   = Object.create(state.option);
  state.ignored  = Object.create(state.ignored);
  scope          = Object.create(scope);

  funct = utils.functor(name || "\"" + anonname + "\"", state.tokens.next, scope, {
    "(statement)": statement,
    "(context)":   funct,
    "(generator)": generator ? true : null
  });

  f = funct;
  state.tokens.curr.funct = funct;

  state.functions.push(funct);

  if (name) {
    addlabel(name, { type: "function" });
  }

  var params = funct["(params)"] = functionparams(fatarrowparams);
  params = params || [];

  if (state.option.maxparams && params.length > state.option.maxparams) {
    warn("W072", { token: funct["(metrics)"].token, args: [params.length] });
  }

  // So we parse fat-arrow functions after we encounter =>. So basically
  // doFunction is called with the left side of => as its last argument.
  // This means that the parser, at that point, had already added its
  // arguments to the undefs array and here we undo that.

  state.undefs = _.filter(state.undefs, function (item) {
    return !_.contains(_.union(fatarrowparams), item[2].token);
  });

  block(false, true, true, fatarrowparams ? true : false);

  if (!state.option.noyield && generator && funct["(generator)"] !== "yielded")
    warn("W124", { token: state.tokens.curr });

  var metrics = funct["(metrics)"];
  if (state.option.maxstatements && metrics.statements > state.option.maxstatements) {
    warn("W071", { token: metrics.token, args: [ metrics.statements ] });
  }

  var max = state.option.maxcomplexity;
  var cc = metrics.complexity;
  if (max && cc > max) {
    warn("W074", { token: metrics.token, args: [cc] });
  }

  funct["(unusedOption)"] = state.option.unused;

  scope = oldScope;
  state.option = oldOption;
  state.ignored = oldIgnored;
  funct["(last)"] = state.tokens.curr.line;
  funct["(lastcharacter)"] = state.tokens.curr.character;

  Object.keys(funct).forEach(function (key) {
    if (key[0] === "(") return;
    funct["(blockscope)"].unshadow(key);
  });

  funct = funct["(context)"];

  return f;
}

function increaseComplexityCount() {
  funct["(metrics)"].complexity += 1;
}

// Parse assignments that were found instead of conditionals.
// For example: if (a = 1) { ... }

function checkCondAssignment(expr) {
  var id, paren;
  if (expr) {
    id = expr.id;
    paren = expr.paren;
    if (id === "," && (expr = expr.exprs[expr.exprs.length - 1])) {
      id = expr.id;
      paren = paren || expr.paren;
    }
  }
  switch (id) {
  case "=":
  case "+=":
  case "-=":
  case "*=":
  case "%=":
  case "&=":
  case "|=":
  case "^=":
  case "/=":
    if (!paren && !state.option.boss) {
      warn("W084");
    }
  }
}

(function (x) {
  x.nud = function (isclassdef) {
    var b, f, i, p, t, g;
    var props = {}; // All properties, including accessors
    var tag = "";

    function saveProperty(name, tkn) {
      if (props[name] && _.has(props, name))
        warn("W075", { token: state.tokens.next, args: [i] });
      else
        props[name] = {};

      props[name].basic = true;
      props[name].basictkn = tkn;
    }

    function saveSetter(name, tkn) {
      if (props[name] && _.has(props, name)) {
        if (props[name].basic || props[name].setter)
          warn("W075", { token: state.tokens.next, args: [i] });
      } else {
        props[name] = {};
      }

      props[name].setter = true;
      props[name].setterToken = tkn;
    }

    function saveGetter(name) {
      if (props[name] && _.has(props, name)) {
        if (props[name].basic || props[name].getter)
          warn("W075", { token: state.tokens.next, args: [i] });
      } else {
        props[name] = {};
      }

      props[name].getter = true;
      props[name].getterToken = state.tokens.curr;
    }

    b = state.tokens.curr.line !== state.tokens.next.line;
    if (b) {
      indent += state.option.indent;
      if (state.tokens.next.from === indent + state.option.indent) {
        indent += state.option.indent;
      }
    }

    for (;;) {
      if (state.tokens.next.id === "}") {
        break;
      }

      if (isclassdef && state.tokens.next.value === "static") {
        advance("static");
        tag = "static ";
      }

      if (state.tokens.next.value === "get" && peek().id !== ":") {
        advance("get");

        if (!api.getEnvironment("es5", !isclassdef))
          warn("E034");

        i = property_name();

        // ES6 allows for get() {...} and set() {...} method
        // definition shorthand syntax, so we don't produce an error
        // if the esnext option is enabled.
        if (!i && !api.getEnvironment("es6"))
          warn("E035");

        // It is a Syntax Error if PropName of MethodDefinition is
        // "constructor" and SpecialMethod of MethodDefinition is true.
        if (isclassdef && i === "constructor")
          warn("E049", { token: state.tokens.next, args: ["class getter method", i] });

        // We don't want to save this getter unless it's an actual getter
        // and not an ES6 concise method
        if (i)
          saveGetter(tag + i);

        t = state.tokens.next;
        f = doFunction();
        p = f["(params)"];
        // Don't warn about getter/setter pairs if this is an ES6 concise method
        if (i && p)
          warn("W076", { token: t, args: [p[0], i] });

      } else if (state.tokens.next.value === "set" && peek().id !== ":") {
        advance("set");

        if (!api.getEnvironment("es5", !isclassdef))
          warn("E034");

        i = property_name();

        // ES6 allows for get() {...} and set() {...} method
        // definition shorthand syntax, so we don't produce an error
        // if the esnext option is enabled.
        if (!i && !api.getEnvironment("es6"))
          warn("E035");

        // It is a Syntax Error if PropName of MethodDefinition is
        // "constructor" and SpecialMethod of MethodDefinition is true.
        if (isclassdef && i === "constructor")
          warn("E049", { token: state.tokens.next, args: ["class setter method", i ] });

        // We don't want to save this getter unless it's an actual getter
        // and not an ES6 concise method
        if (i)
          saveSetter(tag + i, state.tokens.next);

        t = state.tokens.next;
        f = doFunction();
        p = f["(params)"];

        // Don't warn about getter/setter pairs if this is an ES6 concise method
        if (i && (!p || p.length !== 1))
          warn("W077", { token: t, args: [i] });
      } else {
        g = false;
        if (state.tokens.next.value === "*" && state.tokens.next.type === "(punctuator)") {
          if (!api.getEnvironment("es6")) {
            warn("W104", { token: state.tokens.next, args: ["generator functions"] });
          }
          advance("*");
          g = true;
        }
        i = property_name();
        saveProperty(tag + i, state.tokens.next);

        if (typeof i !== "string") {
          break;
        }

        if (state.tokens.next.value === "(") {
          if (!api.getEnvironment("es6")) {
            warn("W104", { token: state.tokens.curr, args: ["concise methods"] });
          }
          doFunction(i, undefined, g);
        } else if (!isclassdef) {
          advance(":");
          expression(10);
        }
      }
      // It is a Syntax Error if PropName of MethodDefinition is "prototype".
      if (isclassdef && i === "prototype") {
        warn("E049", { token: state.tokens.next, args: ["class method", i] });
      }

      if (isclassdef) {
        tag = "";
        continue;
      }
      if (state.tokens.next.id === ",") {
        comma({ allowTrailing: true, property: true });
        if (state.tokens.next.id === ",") {
          warn("W070", { token: state.tokens.curr });
        } else if (state.tokens.next.id === "}" && !api.getEnvironment("es5", true)) {
          warn("W070", { token: state.tokens.curr });
        }
      } else {
        break;
      }
    }
    if (b) {
      indent -= state.option.indent;
    }
    advance("}", this);

    // Check for lonely setters if in the ES5 mode.
    if (api.getEnvironment("es5")) {
      for (var name in props) {
        if (_.has(props, name) && props[name].setter && !props[name].getter) {
          warn("W078", { token: props[name].setterToken });
        }
      }
    }
    return this;
  };
  x.fud = function () {
    warn("E036", { token: state.tokens.curr });
  };
}(delim("{")));

function destructuringExpression() {
  var id;
  var identifiers = [];

  if (!api.getEnvironment("es6"))
    warn("W104", { token: state.tokens.curr, args: ["destructuring expression"] });

  function nextInnerDE() {
    var ident;

    if (_.contains(["[", "{"], state.tokens.next.value)) {
      destructuringExpression().forEach(function (id) {
        identifiers.push({ id: id.id, token: id.token });
      });
    } else if (state.tokens.next.value === ",") {
      identifiers.push({ id: null, token: state.tokens.curr });
    } else if (state.tokens.next.value === "(") {
      advance("(");
      nextInnerDE();
      advance(")");
    } else {
      ident = identifier();
      if (ident)
        identifiers.push({ id: ident, token: state.tokens.curr });
    }
  }

  if (state.tokens.next.value === "[") {
    advance("[");
    nextInnerDE();
    while (state.tokens.next.value !== "]") {
      advance(",");
      nextInnerDE();
    }
    advance("]");
  } else if (state.tokens.next.value === "{") {
    advance("{");
    id = identifier();
    if (state.tokens.next.value === ":") {
      advance(":");
      nextInnerDE();
    } else {
      identifiers.push({ id: id, token: state.tokens.curr });
    }
    while (state.tokens.next.value !== "}") {
      advance(",");
      id = identifier();
      if (state.tokens.next.value === ":") {
        advance(":");
        nextInnerDE();
      } else {
        identifiers.push({ id: id, token: state.tokens.curr });
      }
    }
    advance("}");
  }
  return identifiers;
}
function destructuringExpressionMatch(tokens, value) {
  var first = value.first;

  if (!first)
    return;

  _.zip(tokens, Array.isArray(first) ? first : [ first ]).forEach(function (val) {
    var token = val[0];
    var value = val[1];

    if (token && value)
      token.first = value;
    else if (token && token.first && !value)
      warn("W080", { token: token.first, args: [token.first.value] });
  });
}

var conststatement = stmt("const", function (prefix) {
  /*jshint loopfunc:true */
  var tokens;
  var value;
  var lone; // State variable to know if it is a lone identifier, or a destructuring statement.

  if (!api.getEnvironment("es6")) {
    warn("W104", { token: state.tokens.curr, args: ["const"] });
  }

  this.first = [];
  for (;;) {
    var names = [];
    if (_.contains(["{", "["], state.tokens.next.value)) {
      tokens = destructuringExpression();
      lone = false;
    } else {
      tokens = [ { id: identifier(), token: state.tokens.curr } ];
      lone = true;
    }

    tokens.forEach(function (t) {
      if (funct[t.id] === "const") {
        warn("E011", { token: null, args: [t.id] });
      }
      if (funct["(global)"] && predefined[t.id] === false) {
        warn("W079", { token: t.token, args: [t.id] });
      }
      if (t.id) {
        addlabel(t.id, { type: "const", token: t.token, unused: true });
        names.push(t.token);
      }
    });

    if (prefix) {
      break;
    }

    this.first = this.first.concat(names);

    if (state.tokens.next.id !== "=") {
      warn("E012", { token: state.tokens.curr, args: [state.tokens.curr.value] });
    }

    if (state.tokens.next.id === "=") {
      advance("=");
      if (state.tokens.next.id === "undefined") {
        warn("W080", { token: state.tokens.prev, args: [state.tokens.prev.value] });
      }
      if (peek(0).id === "=" && state.tokens.next.identifier) {
        warn("W120", { token: state.tokens.next, args: [state.tokens.next.value] });
      }
      value = expression(10);
      if (lone) {
        tokens[0].first = value;
      } else {
        destructuringExpressionMatch(names, value);
      }
    }

    if (state.tokens.next.id !== ",") {
      break;
    }
    comma();
  }
  return this;
});
conststatement.exps = true;

var varstatement = stmt("var", function (prefix) {
  /*jshint loopfunc:true */
  var tokens, lone, value;

  this.first = [];
  for (;;) {
    var names = [];
    if (_.contains(["{", "["], state.tokens.next.value)) {
      tokens = destructuringExpression();
      lone = false;
    } else {
      tokens = [ { id: identifier(), token: state.tokens.curr } ];
      lone = true;
    }

    tokens.forEach(function (t) {
      if (api.getEnvironment("es6") && funct[t.id] === "const") {
        warn("E011", { token: null, args: [t.id] });
      }
      if (funct["(global)"] && predefined[t.id] === false) {
        warn("W079", { token: t.token, args: [t.id] });
      }
      if (t.id) {
        addlabel(t.id, { type: "unused", token: t.token });
        names.push(t.token);
      }
    });

    if (prefix) {
      break;
    }

    this.first = this.first.concat(names);

    if (state.tokens.next.id === "=") {
      advance("=");
      if (state.tokens.next.id === "undefined") {
        warn("W080", { token: state.tokens.prev, args: [state.tokens.prev.value] });
      }
      if (peek(0).id === "=" && state.tokens.next.identifier) {
        warn("W120", { token: state.tokens.next, args: [state.tokens.next.value] });
      }
      value = expression(10);
      if (lone) {
        tokens[0].first = value;
      } else {
        destructuringExpressionMatch(names, value);
      }
    }

    if (state.tokens.next.id !== ",") {
      break;
    }
    comma();
  }
  return this;
});
varstatement.exps = true;

var letstatement = stmt("let", function (prefix) {
  /*jshint loopfunc:true */
  var tokens, lone, value, letblock;

  if (!api.getEnvironment("es6")) {
    warn("W104", { token: state.tokens.curr, args: ["let"] });
  }

  if (state.tokens.next.value === "(") {
    if (!api.getEnvironment("moz", true))
      warn("W118", { token: state.tokens.next, args: ["let block"] });

    advance("(");
    funct["(blockscope)"].stack();
    letblock = true;
  } else if (funct["(nolet)"]) {
    warn("E048", { token: state.tokens.curr });
  }

  this.first = [];
  for (;;) {
    var names = [];
    if (_.contains(["{", "["], state.tokens.next.value)) {
      tokens = destructuringExpression();
      lone = false;
    } else {
      tokens = [ { id: identifier(), token: state.tokens.curr.value } ];
      lone = true;
    }

    tokens.forEach(function (t) {
      if (api.getEnvironment("es6") && funct[t.id] === "const") {
        warn("E011", { token: null, args: [t.id] });
      }
      if (funct["(global)"] && predefined[t.id] === false) {
        warn("W079", { token: t.token, args: [t.id] });
      }
      if (t.id && !funct["(nolet)"]) {
        addlabel(t.id, { type: "unused", token: t.token, islet: true });
        names.push(t.token);
      }
    });

    if (prefix) {
      break;
    }

    this.first = this.first.concat(names);

    if (state.tokens.next.id === "=") {
      advance("=");
      if (state.tokens.next.id === "undefined") {
        warn("W080", { token: state.tokens.prev, args: [state.tokens.prev.value] });
      }
      if (peek(0).id === "=" && state.tokens.next.identifier) {
        warn("W120", { token: state.tokens.next, args: [state.tokens.next.value] });
      }
      value = expression(10);
      if (lone) {
        tokens[0].first = value;
      } else {
        destructuringExpressionMatch(names, value);
      }
    }

    if (state.tokens.next.id !== ",") {
      break;
    }
    comma();
  }
  if (letblock) {
    advance(")");
    block(true, true);
    this.block = true;
    funct["(blockscope)"].unstack();
  }

  return this;
});
letstatement.exps = true;

blockstmt("class", function () {
  return classdef.call(this, true);
});

function classdef(stmt) {
  /*jshint validthis:true */
  if (!api.getEnvironment("es6")) {
    warn("W104", { token: state.tokens.curr, args: ["class"] });
  }
  if (stmt) {
    // BindingIdentifier
    this.name = identifier();
    addlabel(this.name, { type: "unused", token: state.tokens.curr });
  } else if (state.tokens.next.identifier && state.tokens.next.value !== "extends") {
    // BindingIdentifier(opt)
    this.name = identifier();
  }
  classtail(this);
  return this;
}

function classtail(c) {
  var strictness = state.directive["use strict"];

  // ClassHeritage(opt)
  if (state.tokens.next.value === "extends") {
    advance("extends");
    c.heritage = expression(10);
  }

  // A ClassBody is always strict code.
  state.directive["use strict"] = true;
  advance("{");
  // ClassBody(opt)
  c.body = syntax["{"].nud(true);
  state.directive["use strict"] = strictness;
}

blockstmt("function", function () {
  var generator = false;
  if (state.tokens.next.value === "*") {
    advance("*");
    if (api.getEnvironment("es6", true)) {
      generator = true;
    } else {
      warn("W119", { token: state.tokens.curr, args: ["function*"] });
    }
  }
  if (inblock) {
    warn("W082", { token: state.tokens.curr });

  }
  var i = identifier();
  if (funct[i] === "const") {
    warn("E011", { token: null, args: [i] });
  }

  addlabel(i, { type: "unction", token: state.tokens.curr });

  doFunction(i, { statement: true }, generator);
  if (state.tokens.next.id === "(" && state.tokens.next.line === state.tokens.curr.line) {
    warn("E039");
  }
  return this;
});

prefix("function", function () {
  var generator = false;
  if (state.tokens.next.value === "*") {
    if (!api.getEnvironment("es6")) {
      warn("W119", { token: state.tokens.curr, args: ["function*"] });
    }
    advance("*");
    generator = true;
  }
  var i = optionalidentifier();
  doFunction(i, undefined, generator);
  if (!state.option.loopfunc && funct["(loopage)"]) {
    warn("W083");
  }
  return this;
});

blockstmt("if", function () {
  var t = state.tokens.next;
  increaseComplexityCount();
  state.condition = true;
  advance("(");
  checkCondAssignment(expression(0));
  advance(")", t);
  state.condition = false;
  block(true, true);
  if (state.tokens.next.id === "else") {
    advance("else");
    if (state.tokens.next.id === "if" || state.tokens.next.id === "switch") {
      statement(true);
    } else {
      block(true, true);
    }
  }
  return this;
});

blockstmt("try", function () {
  var b;

  function doCatch() {
    var oldScope = scope;
    var e;

    advance("catch");
    advance("(");

    scope = Object.create(oldScope);

    e = state.tokens.next.value;
    if (state.tokens.next.type !== "(identifier)") {
      e = null;
      warn("E030", { token: state.tokens.next, args: [e] });
    }

    advance();

    funct = utils.functor("(catch)", state.tokens.next, scope, {
      "(context)"  : funct,
      "(breakage)" : funct["(breakage)"],
      "(loopage)"  : funct["(loopage)"],
      "(statement)": false,
      "(catch)"    : true
    });

    if (e) {
      addlabel(e, { type: "exception" });
    }

    if (state.tokens.next.value === "if") {
      if (!api.getEnvironment("moz", true))
        warn("W118", { token: state.tokens.curr, args: ["catch filter"] });

      advance("if");
      expression(0);
    }

    advance(")");

    state.tokens.curr.funct = funct;
    state.functions.push(funct);

    block(false);

    scope = oldScope;

    funct["(last)"] = state.tokens.curr.line;
    funct["(lastcharacter)"] = state.tokens.curr.character;
    funct = funct["(context)"];
  }

  block(true);

  while (state.tokens.next.id === "catch") {
    increaseComplexityCount();

    if (b && !api.getEnvironment("moz", true))
      warn("W118", { token: state.tokens.next, args: ["multiple catch blocks"] });

    doCatch();
    b = true;
  }

  if (state.tokens.next.id === "finally") {
    advance("finally");
    block(true);
    return;
  }

  if (!b) {
    warn("E021", { token: state.tokens.next, args: ["catch", state.tokens.next.value] });
  }

  return this;
});

blockstmt("while", function () {
  var t = state.tokens.next;
  funct["(breakage)"] += 1;
  funct["(loopage)"] += 1;
  increaseComplexityCount();
  advance("(");
  checkCondAssignment(expression(0));
  advance(")", t);
  block(true, true);
  funct["(breakage)"] -= 1;
  funct["(loopage)"] -= 1;
  return this;
}).labelled = true;

blockstmt("with", function () {
  var t = state.tokens.next;
  if (state.directive["use strict"]) {
    warn("E010", { token: state.tokens.curr });
  } else if (!state.option.withstmt) {
    warn("W085", { token: state.tokens.curr });
  }

  advance("(");
  expression(0);
  advance(")", t);
  block(true, true);

  return this;
});

blockstmt("switch", function () {
  var t = state.tokens.next;
  var g = false;
  var noindent = false;

  funct["(breakage)"] += 1;
  advance("(");
  checkCondAssignment(expression(0));
  advance(")", t);
  t = state.tokens.next;
  advance("{");

  if (state.tokens.next.from === indent)
    noindent = true;

  if (!noindent)
    indent += state.option.indent;

  this.cases = [];

  for (;;) {
    switch (state.tokens.next.id) {
    case "case":
      switch (funct["(verb)"]) {
      case "yield":
      case "break":
      case "case":
      case "continue":
      case "return":
      case "switch":
      case "throw":
        break;
      default:
        // You can tell JSHint that you don't use break intentionally by
        // adding a comment /* falls through */ on a line just before
        // the next `case`.
        if (!reg.fallsThrough.test(lex.source[state.tokens.next.line - 2])) {
          warn("W086", { token: state.tokens.curr, args: ["case"] });
        }
      }
      advance("case");
      this.cases.push(expression(20));
      increaseComplexityCount();
      g = true;
      advance(":");
      funct["(verb)"] = "case";
      break;
    case "default":
      switch (funct["(verb)"]) {
      case "yield":
      case "break":
      case "continue":
      case "return":
      case "throw":
        break;
      default:
        // Do not display a warning if 'default' is the first statement or if
        // there is a special /* falls through */ comment.
        if (this.cases.length) {
          if (!reg.fallsThrough.test(lex.source[state.tokens.next.line - 2])) {
            warn("W086", { token: state.tokens.curr, args: ["default"] });
          }
        }
      }
      advance("default");
      g = true;
      advance(":");
      break;
    case "}":
      if (!noindent)
        indent -= state.option.indent;
      advance("}", t);
      funct["(breakage)"] -= 1;
      funct["(verb)"] = undefined;
      return;
    case "(end)":
      warn("E023", { token: state.tokens.next, args: ["}"] });
      return;
    default:
      indent += state.option.indent;
      if (g) {
        switch (state.tokens.curr.id) {
        case ",":
          warn("E040");
          return;
        case ":":
          g = false;
          statements();
          break;
        default:
          warn("E025", { token: state.tokens.curr });
          return;
        }
      } else {
        if (state.tokens.curr.id === ":") {
          advance(":");
          warn("E024", { token: state.tokens.curr, args: [":"] });
          statements();
        } else {
          warn("E021", { token: state.tokens.next, args: ["case", state.tokens.next.value] });
          return;
        }
      }
      indent -= state.option.indent;
    }
  }
}).labelled = true;

stmt("debugger", function () {
  if (!state.option.debug) {
    warn("W087", { token: this });
  }
  return this;
}).exps = true;

(function () {
  var x = stmt("do", function () {
    funct["(breakage)"] += 1;
    funct["(loopage)"] += 1;
    increaseComplexityCount();

    this.first = block(true, true);
    advance("while");
    var t = state.tokens.next;
    advance("(");
    checkCondAssignment(expression(0));
    advance(")", t);
    funct["(breakage)"] -= 1;
    funct["(loopage)"] -= 1;
    return this;
  });
  x.labelled = true;
  x.exps = true;
}());

blockstmt("for", function () {
  var s, t = state.tokens.next;
  var letscope = false;
  var foreachtok = null;

  if (t.value === "each") {
    foreachtok = t;
    advance("each");

    if (!api.getEnvironment("moz", true))
      warn("W118", { token: state.tokens.curr, args: ["for each"] });
  }

  funct["(breakage)"] += 1;
  funct["(loopage)"] += 1;
  increaseComplexityCount();
  advance("(");

  // what kind of for(…) statement it is? for(…of…)? for(…in…)? for(…;…;…)?
  var nextop; // contains the token of the "in" or "of" operator
  var i = 0;
  var inof = ["in", "of"];
  do {
    nextop = peek(i);
    ++i;
  } while (!_.contains(inof, nextop.value) && nextop.value !== ";" &&
        nextop.type !== "(end)");

  // if we're in a for (… in|of …) statement
  if (_.contains(inof, nextop.value)) {
    if (!api.getEnvironment("es6") && nextop.value === "of") {
      warn("W104", { token: nextop, args: ["for of"] });
    }
    if (state.tokens.next.id === "var") {
      advance("var");
      syntax["var"].fud.call(syntax["var"].fud, true);
    } else if (state.tokens.next.id === "let") {
      advance("let");
      // create a new block scope
      letscope = true;
      funct["(blockscope)"].stack();
      syntax["let"].fud.call(syntax["let"].fud, true);
    } else {
      switch (funct[state.tokens.next.value]) {
      case "unused":
        funct[state.tokens.next.value] = "var";
        break;
      case "var":
        break;
      default:
        if (!funct["(blockscope)"].getlabel(state.tokens.next.value))
          warn("W088", { token: state.tokens.next, args: [state.tokens.next.value] });
      }
      advance();
    }
    advance(nextop.value);
    expression(20);
    advance(")", t);
    s = block(true, true);
    if (state.option.forin && s && (s.length > 1 || typeof s[0] !== "object" ||
        s[0].value !== "if")) {
      warn("W089", { token: this });
    }
    funct["(breakage)"] -= 1;
    funct["(loopage)"] -= 1;
  } else {
    if (foreachtok) {
      warn("E045", { token: foreachtok });
    }
    if (state.tokens.next.id !== ";") {
      if (state.tokens.next.id === "var") {
        advance("var");
        syntax["var"].fud.call(syntax["var"].fud);
      } else if (state.tokens.next.id === "let") {
        advance("let");
        // create a new block scope
        letscope = true;
        funct["(blockscope)"].stack();
        syntax["let"].fud.call(syntax["let"].fud);
      } else {
        for (;;) {
          expression(0, "for");
          if (state.tokens.next.id !== ",") {
            break;
          }
          comma();
        }
      }
    }
    advance(";");
    if (state.tokens.next.id !== ";") {
      checkCondAssignment(expression(0));
    }
    advance(";");
    if (state.tokens.next.id === ";") {
      warn("E021", { token: state.tokens.next, args: [")", ";"] });
    }
    if (state.tokens.next.id !== ")") {
      for (;;) {
        expression(0, "for");
        if (state.tokens.next.id !== ",") {
          break;
        }
        comma();
      }
    }
    advance(")", t);
    block(true, true);
    funct["(breakage)"] -= 1;
    funct["(loopage)"] -= 1;

  }
  // unstack loop blockscope
  if (letscope) {
    funct["(blockscope)"].unstack();
  }
  return this;
}).labelled = true;

stmt("break", function () {
  var v = state.tokens.next.value;

  if (funct["(breakage)"] === 0)
    warn("W052", { token: state.tokens.next, args: [this.value] });

  if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
    if (state.tokens.curr.line === state.tokens.next.line) {
      if (funct[v] !== "label") {
        warn("W090", { token: state.tokens.next, args: [v] });
      } else if (scope[v] !== funct) {
        warn("W091", { token: state.tokens.next, args: [v] });
      }
      this.first = state.tokens.next;
      advance();
    }
  }
  reachable("break");
  return this;
}).exps = true;

stmt("continue", function () {
  var v = state.tokens.next.value;

  if (funct["(breakage)"] === 0)
    warn("W052", { token: state.tokens.next, args: [this.value] });

  if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
    if (state.tokens.curr.line === state.tokens.next.line) {
      if (funct[v] !== "label") {
        warn("W090", { token: state.tokens.next, args: [v] });
      } else if (scope[v] !== funct) {
        warn("W091", { token: state.tokens.next, args: [v] });
      }
      this.first = state.tokens.next;
      advance();
    }
  } else if (!funct["(loopage)"]) {
    warn("W052", { token: state.tokens.next, args: [this.value] });
  }
  reachable("continue");
  return this;
}).exps = true;

stmt("return", function () {
  if (this.line === state.tokens.next.line) {
    if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
      this.first = expression(0);

      if (this.first && this.first.type === "(punctuator)" && this.first.value === "=") {
        if (!this.first.paren && !state.option.boss) {
          warn("W093", { coord: { line: this.first.line, ch: this.first.character }});
        }
      }
    }
  } else {
    if (state.tokens.next.type === "(punctuator)" &&
      ["[", "{", "+", "-"].indexOf(state.tokens.next.value) > -1) {
    }
  }

  reachable("return");
  return this;
}).exps = true;

(function (x) {
  x.exps = true;
  x.lbp = 25;
}(prefix("yield", function () {
  var prev = state.tokens.prev;
  if (api.getEnvironment("es6", true) && !funct["(generator)"]) {
    warn("E046", { token: state.tokens.curr, args: ["yield"] });
  } else if (!api.getEnvironment("es6")) {
    warn("W104", { token: state.tokens.curr, args: ["yield"] });
  }
  funct["(generator)"] = "yielded";
  if (this.line === state.tokens.next.line || !api.getEnvironment("moz", true)) {
    if (state.tokens.next.id !== ";" && !state.tokens.next.reach && state.tokens.next.nud) {
      this.first = expression(10);

      if (this.first.type === "(punctuator)" && this.first.value === "=") {
        if (!this.first.paren && !state.option.boss) {
          warn("W093", { coord: { line: this.first.line, ch: this.first.character } });
        }
      }
    }

    if (api.getEnvironment("moz", true) && state.tokens.next.id !== ")" &&
        (prev.lbp > 30 || (!prev.assign && !isEndOfExpr()) || prev.id === "yield")) {
      warn("E050", { token: this });
    }
  }
  return this;
})));

stmt("throw", function () {
  this.first = expression(20);
  reachable("throw");
  return this;
}).exps = true;

stmt("import", function () {
  if (!api.getEnvironment("es6")) {
    warn("W119", { token: state.tokens.curr, args: ["import"] });
  }

  if (state.tokens.next.type === "(string)") {
    advance("(string)");
    return this;
  }

  if (state.tokens.next.identifier) {
    this.name = identifier();
    addlabel(this.name, { type: "unused", token: state.tokens.curr });
  } else {
    advance("{");
    for (;;) {
      if (state.tokens.next.value === "}"){
        advance("}");
        break;
      }

      var importName;
      if (state.tokens.next.type === "default") {
        importName = "default";
        advance("default");
      } else {
        importName = identifier();
      }

      if (state.tokens.next.value === "as") {
        advance("as");
        importName = identifier();
      }

      addlabel(importName, { type: "unused", token: state.tokens.curr });

      if (state.tokens.next.value === ",") {
        advance(",");
      } else if (state.tokens.next.value === "}") {
        advance("}");
        break;
      } else {
        warn("E024", { token: state.tokens.next, args: [state.tokens.next.value] });
        break;
      }
    }
  }

  advance("from");
  advance("(string)");
  return this;
}).exps = true;

stmt("export", function () {
  if (!api.getEnvironment("es6")) {
    warn("W119", { token: state.tokens.curr, args: ["export"] });
  }

  if (state.tokens.next.type === "default") {
    advance("default");
    if (state.tokens.next.id === "function" || state.tokens.next.id === "class") {
      this.block = true;
    }
    this.exportee = expression(10);

    return this;
  }

  if (state.tokens.next.value === "{") {
    advance("{");
    for (;;) {
      exported[identifier()] = true;

      if (state.tokens.next.value === ",") {
        advance(",");
      } else if (state.tokens.next.value === "}") {
        advance("}");
        break;
      } else {
        warn("E024", { token: state.tokens.next, args: [state.tokens.next.value] });
        break;
      }
    }
    return this;
  }

  if (state.tokens.next.id === "var") {
    advance("var");
    exported[state.tokens.next.value] = true;
    syntax["var"].fud.call(syntax["var"].fud);
  } else if (state.tokens.next.id === "let") {
    advance("let");
    exported[state.tokens.next.value] = true;
    syntax["let"].fud.call(syntax["let"].fud);
  } else if (state.tokens.next.id === "const") {
    advance("const");
    exported[state.tokens.next.value] = true;
    syntax["const"].fud.call(syntax["const"].fud);
  } else if (state.tokens.next.id === "function") {
    this.block = true;
    advance("function");
    exported[state.tokens.next.value] = true;
    syntax["function"].fud();
  } else if (state.tokens.next.id === "class") {
    this.block = true;
    advance("class");
    exported[state.tokens.next.value] = true;
    syntax["class"].fud();
  } else {
    warn("E024", { token: state.tokens.next, args: [state.tokens.next.value] });
  }

  return this;
}).exps = true;

// Future Reserved Words

FutureReservedWord("abstract");
FutureReservedWord("boolean");
FutureReservedWord("byte");
FutureReservedWord("char");
FutureReservedWord("class", { es5: true, nud: classdef });
FutureReservedWord("double");
FutureReservedWord("enum", { es5: true });
FutureReservedWord("export", { es5: true });
FutureReservedWord("extends", { es5: true });
FutureReservedWord("final");
FutureReservedWord("float");
FutureReservedWord("goto");
FutureReservedWord("implements", { es5: true, strictOnly: true });
FutureReservedWord("import", { es5: true });
FutureReservedWord("int");
FutureReservedWord("interface", { es5: true, strictOnly: true });
FutureReservedWord("long");
FutureReservedWord("native");
FutureReservedWord("package", { es5: true, strictOnly: true });
FutureReservedWord("private", { es5: true, strictOnly: true });
FutureReservedWord("protected", { es5: true, strictOnly: true });
FutureReservedWord("public", { es5: true, strictOnly: true });
FutureReservedWord("short");
FutureReservedWord("static", { es5: true, strictOnly: true });
FutureReservedWord("super", { es5: true });
FutureReservedWord("synchronized");
FutureReservedWord("throws");
FutureReservedWord("transient");
FutureReservedWord("volatile");

// this function is used to determine wether a squarebracket or a curlybracket
// expression is a comprehension array or a destructuring assignment.

var lookupBlockType = function () {
  var pn, pn1;
  var i = -1;
  var bracketStack = 0;
  var ret = {};
  if (_.contains(["[", "{"], state.tokens.curr.value))
    bracketStack += 1;
  do {
    pn = (i === -1) ? state.tokens.next : peek(i);
    pn1 = peek(i + 1);
    i = i + 1;
    if (_.contains(["[", "{"], pn.value)) {
      bracketStack += 1;
    } else if (_.contains(["]", "}"], pn.value)) {
      bracketStack -= 1;
    }
    if (pn.identifier && pn.value === "for" && bracketStack === 1) {
      ret.isCompArray = true;
      break;
    }
    if (_.contains(["}", "]"], pn.value) && pn1.value === "=" && bracketStack === 0) {
      ret.isDestAssign = true;
      break;
    }
    if (pn.value === ";") {
      ret.isBlock = true;
    }
  } while (bracketStack > 0 && pn.id !== "(end)" && i < 15);
  return ret;
};

// array comprehension parsing function
// parses and defines the three states of the list comprehension in order
// to avoid defining global variables, but keeping them to the list comprehension scope
// only. The order of the states are as follows:
//  * "use" which will be the returned iterative part of the list comprehension
//  * "define" which will define the variables local to the list comprehension
//  * "filter" which will help filter out values

var arrayComprehension = function () {
  var CompArray = function () {
    this.mode = "use";
    this.variables = [];
  };
  var _carrays = [];
  var _current;
  function declare(v) {
    var l = _current.variables.filter(function (elt) {
      // if it has, change its undef state
      if (elt.value === v) {
        elt.undef = false;
        return v;
      }
    }).length;
    return l !== 0;
  }
  function use(v) {
    var l = _current.variables.filter(function (elt) {
      // and if it has been defined
      if (elt.value === v && !elt.undef) {
        if (elt.unused === true) {
          elt.unused = false;
        }
        return v;
      }
    }).length;
    // otherwise we warn about it
    return (l === 0);
  }
  return {stack: function () {
        _current = new CompArray();
        _carrays.push(_current);
      },
      unstack: function () {
        _current.variables.filter(function (v) {
          if (v.unused)
            warn("W098", { token: v.token, args: [v.value] });
          if (v.undef)
            isundef(v.funct, "W117", { token: v.token, args: [v.value] });
        });
        _carrays.splice(-1, 1);
        _current = _carrays[_carrays.length - 1];
      },
      setState: function (s) {
        if (_.contains(["use", "define", "generate", "filter"], s))
          _current.mode = s;
      },
      check: function (v) {
        if (!_current) {
          return;
        }
        // When we are in "use" state of the list comp, we enqueue that var
        if (_current && _current.mode === "use") {
          if (use(v)) {
            _current.variables.push({
              funct: funct,
              token: state.tokens.curr,
              value: v,
              undef: true,
              unused: false
            });
          }
          return true;
        // When we are in "define" state of the list comp,
        } else if (_current && _current.mode === "define") {
          // check if the variable has been used previously
          if (!declare(v)) {
            _current.variables.push({
              funct: funct,
              token: state.tokens.curr,
              value: v,
              undef: false,
              unused: true
            });
          }
          return true;
        // When we are in the "generate" state of the list comp,
        } else if (_current && _current.mode === "generate") {
          isundef(funct, "W117", { token: state.tokens.curr, args: [v] });
          return true;
        // When we are in "filter" state,
        } else if (_current && _current.mode === "filter") {
          // we check whether current variable has been declared
          if (use(v)) {
            // if not we warn about it
            isundef(funct, "W117", { token: state.tokens.curr, args: [v] });
          }
          return true;
        }
        return false;
      }
      };
};

var blockScope = function () {
  var _current = {};
  var _variables = [_current];

  function _checkBlockLabels() {
    for (var t in _current) {
      if (_current[t]["(type)"] === "unused") {
        if (state.option.unused) {
          var tkn = _current[t]["(token)"];
          warn("W098", { coord: { line: tkn.line, ch: tkn.character }, args: [t] });
        }
      }
    }
  }

  return {
    stack: function () {
      _current = {};
      _variables.push(_current);
    },

    unstack: function () {
      _checkBlockLabels();
      _variables.splice(_variables.length - 1, 1);
      _current = _.last(_variables);
    },

    getlabel: function (l) {
      for (var i = _variables.length - 1 ; i >= 0; --i) {
        if (_.has(_variables[i], l) && !_variables[i][l]["(shadowed)"]) {
          return _variables[i];
        }
      }
    },

    shadow: function (name) {
      for (var i = _variables.length - 1; i >= 0; i--) {
        if (_.has(_variables[i], name)) {
          _variables[i][name]["(shadowed)"] = true;
        }
      }
    },

    unshadow: function (name) {
      for (var i = _variables.length - 1; i >= 0; i--) {
        if (_.has(_variables[i], name)) {
          _variables[i][name]["(shadowed)"] = false;
        }
      }
    },

    current: {
      has: function (t) {
        return _.has(_current, t);
      },
      add: function (t, type, tok) {
        _current[t] = { "(type)" : type, "(token)": tok, "(shadowed)": false };
      }
    }
  };
};

function parse(input, options, program) {
  // Reset parser state
  state.option    = options.passed;
  state.ignored   = options.ignored;
  state.blacklist = options.blacklist;
  state.directive = {};
  state.implied   = {};
  state.unused    = [];

  state.tokens = {
    prev: syntax["(begin)"],
    curr: syntax["(begin)"],
    next: syntax["(begin)"]
  };

  if (program) {
    state.program = program;
  } else {
    state.program = "(main)";
    state.errors  = [];
    state.undefs  = [];
    state.scripts = [];
  }

  declared = {};
  exported = options.exported;

  state.option.indent = state.option.indent || 4;
  state.option.maxerr = state.option.maxerr || 50;

  predefined = {};
  globalscope = Object.create(predefined);
  scope = globalscope;

  comma.first = true;
  indent = 1;

  funct = utils.functor("(global)", null, scope, {
    "(global)"    : true,
    "(blockscope)": blockScope(),
    "(comparray)" : arrayComprehension(),
    "(metrics)"   : utils.metrics(state.tokens.next)
  });

  state.functions = [funct];
  stack = null;
  inblock = false;
  lookahead = [];
  warnings = 0;

  // Configure and start lexer
  lex = new Lexer(input, { indent: state.option.indent, esnext: state.option.esnext });

  lex.on("warning", function (ev) {
    warn(ev.code, { coord: { line: ev.line, ch: ev.character }, args: ev.data });
  });

  lex.on("error", function (ev) {
    warn(ev.code, { coord: { line: ev.line, ch: ev.character }, args: ev.data });
  });

  lex.on("fatal", function (ev) {
    quit("E041", ev.line, ev.from);
  });

  lex.on("Hashbang", function (ev) {
    if (~ev.value.indexOf("node"))
      state.option.node = true;
  });

  lex.on("NBSP", function (ev) {
    if (!state.option.nonbsp) return;
    warn("W125", { coord: { line: ev.line, ch: ev.character } });
  });

  [ "Identifier", "String", "Number" ].forEach(function (name) {
    lex.on(name, function (ev) { emitter.emit(name, ev) });
  });

  lex.start();

  // Check options
  _.each(state.option, function (val, name) { checkOption(name, state.tokens.curr) });

  // Setup variables for the environment
  function ifenabled(acc, varsets, opt) {
    if (!state.option[opt])
      return acc;

    _.each(varsets, function (set) { _.extend(acc, set) });
    return acc;
  }

  _.extend(predefined, vars.ecma, vars.reserved);
  _.extend(predefined, _.reduce(varmap, ifenabled, {}), options.variables);

  _.each(predefined, function (val, name) {
    if (_.has(state.blacklist, name)) delete predefined[name];
  });

  if (state.option.globalstrict && state.option.strict !== false)
    state.option.strict = true;

  advance();
  directives();

  if (state.tokens.next.id === "{" || state.tokens.next.id === "[") {
    if (!api.getEnvironment("es6") && lookupBlockType().isDestAssign) {
      warn("W104", { token: state.tokens.curr, args: ["destructuring assignment"] });
    }
  } else {
    if (state.directive["use strict"]) {
      if (!state.option.globalstrict && !(state.option.node || state.option.phantom)) {
        warn("W097", { token: state.tokens.prev });
      }
    }
  }

  statements();
  advance((state.tokens.next && state.tokens.next.value !== ".")  ? "(end)" : undefined);
  funct["(blockscope)"].unstack();

  var markDefined = function (name, context) {
    do {
      if (typeof context[name] === "string") {
        // JSHINT marks unused variables as 'unused' and
        // unused function declaration as 'unction'. This
        // code changes such instances back 'var' and
        // 'closure' so that the code in JSHINT.data()
        // doesn't think they're unused.

        if (context[name] === "unused")
          context[name] = "var";
        else if (context[name] === "unction")
          context[name] = "closure";

        return true;
      }

      context = context["(context)"];
    } while (context);

    return false;
  };

  var clearImplied = function (name, line) {
    if (!state.implied[name])
      return;

    var newImplied = [];
    for (var i = 0; i < state.implied[name].length; i += 1) {
      if (state.implied[name][i] !== line)
        newImplied.push(state.implied[name][i]);
    }

    if (newImplied.length === 0)
      delete state.implied[name];
    else
      state.implied[name] = newImplied;
  };

  var warnUnused = function (name, tkn, type, unused_opt) {
    var line = tkn.line;
    var chr  = tkn.character;

    if (unused_opt === undefined) {
      unused_opt = state.option.unused;
    }

    if (unused_opt === true) {
      unused_opt = "last-param";
    }

    var warnable_types = {
      "vars": ["var"],
      "last-param": ["var", "param"],
      "strict": ["var", "param", "last-param"]
    };

    if (unused_opt) {
      if (warnable_types[unused_opt] && warnable_types[unused_opt].indexOf(type) !== -1) {
        warn("W098", { coord: { line: line, ch: chr }, args: [name] });
      }
    }

    state.unused.push({
      name: name,
      line: line,
      character: chr
    });
  };

  var checkUnused = function (func, key) {
    var type = func[key];
    var tkn = func["(tokens)"][key];

    if (key.charAt(0) === "(")
      return;

    if (type !== "unused" && type !== "unction" && type !== "const")
      return;

    // Params are checked separately from other variables.
    if (func["(params)"] && func["(params)"].indexOf(key) !== -1)
      return;

    // Variable is in global scope and defined as exported.
    if (func["(global)"] && _.has(exported, key))
      return;

    // Is this constant unused?
    if (type === "const" && !utils.getprop(func, key, "unused"))
      return;

    warnUnused(key, tkn, "var");
  };

  // Check queued 'x is not defined' instances to see if they're still undefined.
  state.undefs.forEach(function (params) {
    var scope = params[0];
    var code  = params[1];
    var opts  = params[2];

    if (markDefined(opts.token.value, scope))
      return void clearImplied(opts.token.value, opts.token.line);

    if (state.option.undef)
      warn(code, opts);
  });

  state.functions.forEach(function (func) {
    if (func["(unusedOption)"] === false) {
      return;
    }

    for (var key in func) {
      if (_.has(func, key)) {
        checkUnused(func, key);
      }
    }

    if (!func["(params)"])
      return;

    var params = func["(params)"].slice();
    var param  = params.pop();
    var type, unused_opt;

    while (param) {
      type = func[param];
      unused_opt = func["(unusedOption)"] || state.option.unused;
      unused_opt = unused_opt === true ? "last-param" : unused_opt;

      // 'undefined' is a special case for (function (window, undefined) { ... })();
      // patterns.

      if (param === "undefined")
        return;

      if (type === "unused" || type === "unction") {
        warnUnused(param, func["(tokens)"][param], "param", func["(unusedOption)"]);
      } else if (unused_opt === "last-param") {
        return;
      }

      param = params.pop();
    }
  });

  for (var key in declared) {
    if (_.has(declared, key) && !_.has(globalscope, key) && !_.has(exported, key)) {
      warnUnused(key, declared[key], "var");
    }
  }

  // Loop over the listed scripts, and check them as well.
  if (state.program === "(main)") {
    state.scripts.forEach(function (internal) {
      parse(internal.value, options, internal.elem);
    });
  }

  state.env = scope;
  return state;
}

exports.parse  = parse;
exports.extend = function (fn) { fn(api) };
exports.reset  = function () { emitter.removeAllListeners() };
