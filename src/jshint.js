/*!
 * JSHint, by JSHint Community.
 *
 * This file (and this file only) is licensed under the same slightly modified
 * MIT license that JSLint is. It stops evil-doers everywhere:
 *
 *   Copyright (c) 2002 Douglas Crockford  (www.JSLint.com)
 *
 *   Permission is hereby granted, free of charge, to any person obtaining
 *   a copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom
 *   the Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included
 *   in all copies or substantial portions of the Software.
 *
 *   The Software shall be used for Good, not Evil.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 *
 */

/*jshint quotmark:double */
/*exported console */

var _            = require("lodash");
var events       = require("events");
var vars         = require("./vars.js");
var messages     = require("./messages.js");
var Lexer        = require("./lex.js").Lexer;
var reg          = require("./reg.js");
var state        = require("./state.js").state;
var style        = require("./style.js");
var options      = require("./options.js");
var scopeManager = require("./scope-manager.js");
var prodParams   = require("./prod-params.js");

// We need this module here because environments such as IE and Rhino
// don't necessarilly expose the 'console' API and browserify uses
// it to log things. It's a sad state of affair, really.
var console = require("console-browserify");

// We build the application inside a function so that we produce only a singleton
// variable. That function will be invoked immediately, and its return value is
// the JSHINT function itself.

var JSHINT = (function() {
  "use strict";

  var api, // Extension API

    // These are operators that should not be used with the ! operator.
    bang = {
      "<"  : true,
      "<=" : true,
      "==" : true,
      "===": true,
      "!==": true,
      "!=" : true,
      ">"  : true,
      ">=" : true,
      "+"  : true,
      "-"  : true,
      "*"  : true,
      "/"  : true,
      "%"  : true
    },

    declared, // Globals that were declared using /*global ... */ syntax.

    functions, // All of the functions

    inblock,
    indent,
    lookahead,
    lex,
    member,
    membersOnly,
    predefined,    // Global variables defined by option

    urls,

    extraModules = [],
    emitter = new events.EventEmitter();

  function checkOption(name, isStable, t) {
    var type, validNames;

    if (isStable) {
      type = "";
      validNames = options.validNames;
    } else {
      type = "unstable ";
      validNames = options.unstableNames;
    }

    name = name.trim();

    if (/^[+-]W\d{3}$/g.test(name)) {
      return true;
    }

    if (validNames.indexOf(name) === -1) {
      if (t.type !== "jslint" && !_.has(options.removed, name)) {
        error("E001", t, type, name);
        return false;
      }
    }

    return true;
  }

  function isString(obj) {
    return Object.prototype.toString.call(obj) === "[object String]";
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

    if (meta && meta.isFutureReservedWord) {
      if (meta.moduleOnly && !state.option.module) {
        return false;
      }

      if (state.inES5()) {
        // ES3 FutureReservedWord in an ES5 environment.
        if (!meta.es5) {
          return false;
        }

        // Some ES5 FutureReservedWord identifiers are active only
        // within a strict mode environment.
        if (meta.strictOnly) {
          if (!state.option.strict && !state.isStrict()) {
            return false;
          }
        }

        if (token.isProperty) {
          return false;
        }
      }
    }

    return true;
  }

  function supplant(str, data) {
    return str.replace(/\{([^{}]*)\}/g, function(a, b) {
      var r = data[b];
      return typeof r === "string" || typeof r === "number" ? r : a;
    });
  }

  function combine(dest, src) {
    Object.keys(src).forEach(function(name) {
      if (_.has(JSHINT.blacklist, name)) return;
      dest[name] = src[name];
    });
  }

  function processenforceall() {
    if (state.option.enforceall) {
      for (var enforceopt in options.bool.enforcing) {
        if (state.option[enforceopt] === undefined &&
            !options.noenforceall[enforceopt]) {
          state.option[enforceopt] = true;
        }
      }
      for (var relaxopt in options.bool.relaxing) {
        if (state.option[relaxopt] === undefined) {
          state.option[relaxopt] = false;
        }
      }
    }
  }

  /**
   * Apply all linting options according to the status of the `state` object.
   */
  function applyOptions() {
    var badESOpt = null;
    processenforceall();

    /**
     * TODO: Remove in JSHint 3
     */
    badESOpt = state.inferEsVersion();
    if (badESOpt) {
      quit("E059", state.tokens.next, "esversion", badESOpt);
    }

    if (state.inES5()) {
      combine(predefined, vars.ecmaIdentifiers[5]);
    }

    if (state.inES6()) {
      combine(predefined, vars.ecmaIdentifiers[6]);
    }

    /**
     * Use `in` to check for the presence of any explicitly-specified value for
     * `globalstrict` because both `true` and `false` should trigger an error.
     */
    if (state.option.strict === "global" && "globalstrict" in state.option) {
      quit("E059", state.tokens.next, "strict", "globalstrict");
    }

    if (state.option.module) {
      /**
       * TODO: Extend this restriction to *all* ES6-specific options.
       */
      if (!state.inES6()) {
        warning("W134", state.tokens.next, "module", 6);
      }
    }

    if (state.option.couch) {
      combine(predefined, vars.couch);
    }

    if (state.option.qunit) {
      combine(predefined, vars.qunit);
    }

    if (state.option.rhino) {
      combine(predefined, vars.rhino);
    }

    if (state.option.shelljs) {
      combine(predefined, vars.shelljs);
      combine(predefined, vars.node);
    }
    if (state.option.typed) {
      combine(predefined, vars.typed);
    }

    if (state.option.phantom) {
      combine(predefined, vars.phantom);
    }

    if (state.option.prototypejs) {
      combine(predefined, vars.prototypejs);
    }

    if (state.option.node) {
      combine(predefined, vars.node);
      combine(predefined, vars.typed);
    }

    if (state.option.devel) {
      combine(predefined, vars.devel);
    }

    if (state.option.dojo) {
      combine(predefined, vars.dojo);
    }

    if (state.option.browser) {
      combine(predefined, vars.browser);
      combine(predefined, vars.typed);
    }

    if (state.option.browserify) {
      combine(predefined, vars.browser);
      combine(predefined, vars.typed);
      combine(predefined, vars.browserify);
    }

    if (state.option.nonstandard) {
      combine(predefined, vars.nonstandard);
    }

    if (state.option.jasmine) {
      combine(predefined, vars.jasmine);
    }

    if (state.option.jquery) {
      combine(predefined, vars.jquery);
    }

    if (state.option.mootools) {
      combine(predefined, vars.mootools);
    }

    if (state.option.worker) {
      combine(predefined, vars.worker);
    }

    if (state.option.wsh) {
      combine(predefined, vars.wsh);
    }

    if (state.option.yui) {
      combine(predefined, vars.yui);
    }

    if (state.option.mocha) {
      combine(predefined, vars.mocha);
    }
  }

  // Produce an error warning.
  function quit(code, token, a, b) {
    var percentage = Math.floor((token.line / state.lines.length) * 100);
    var message = messages.errors[code].desc;

    var exception = {
      name: "JSHintError",
      line: token.line,
      character: token.from,
      message: message + " (" + percentage + "% scanned).",
      raw: message,
      code: code,
      a: a,
      b: b
    };

    exception.reason = supplant(message, exception) + " (" + percentage +
      "% scanned).";

    throw exception;
  }

  function removeIgnoredMessages() {
    var ignored = state.ignoredLines;

    if (_.isEmpty(ignored)) return;
    JSHINT.errors = _.reject(JSHINT.errors, function(err) { return ignored[err.line] });
  }

  function warning(code, t, a, b, c, d) {
    var ch, l, w, msg;

    if (/^W\d{3}$/.test(code)) {
      if (state.ignored[code])
        return;

      msg = messages.warnings[code];
    } else if (/E\d{3}/.test(code)) {
      msg = messages.errors[code];
    } else if (/I\d{3}/.test(code)) {
      msg = messages.info[code];
    }

    t = t || state.tokens.next || {};
    if (t.id === "(end)") {  // `~
      t = state.tokens.curr;
    }

    l = t.line;
    ch = t.from;

    w = {
      id: "(error)",
      raw: msg.desc,
      code: msg.code,
      evidence: state.lines[l - 1] || "",
      line: l,
      character: ch,
      scope: JSHINT.scope,
      a: a,
      b: b,
      c: c,
      d: d
    };

    w.reason = supplant(msg.desc, w);
    JSHINT.errors.push(w);

    removeIgnoredMessages();

    if (JSHINT.errors.length >= state.option.maxerr)
      quit("E043", t);

    return w;
  }

  function warningAt(m, l, ch, a, b, c, d) {
    return warning(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }

  function error(m, t, a, b, c, d) {
    warning(m, t, a, b, c, d);
  }

  function errorAt(m, l, ch, a, b, c, d) {
    return error(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }

  // Tracking of "internal" scripts, like eval containing a static string
  function addEvalCode(elem, token) {
    JSHINT.internals.push({
      id: "(internal)",
      elem: elem,
      token: token,
      code: token.value.replace(/([^\\])(\\*)\2\\n/g, "$1\n")
    });
  }

  /**
   * Process an inline linting directive
   *
   * @param {Token} directiveToken - the directive-bearing comment token
   * @param {Token} previous - the token that preceeds the directive
   */
  function lintingDirective(directiveToken, previous) {
    var body = directiveToken.body.split(",")
      .map(function(s) { return s.trim(); });
    var predef = {};

    if (directiveToken.type === "falls through") {
      previous.caseFallsThrough = true;
      return;
    }

    if (directiveToken.type === "globals") {
      body.forEach(function(g, idx) {
        g = g.split(":");
        var key = g[0].trim();
        var val = (g[1] || "").trim();

        if (key === "-" || !key.length) {
          // Ignore trailing comma
          if (idx > 0 && idx === body.length - 1) {
            return;
          }
          error("E002", directiveToken);
          return;
        }

        if (key.charAt(0) === "-") {
          key = key.slice(1);
          val = false;

          JSHINT.blacklist[key] = key;
          delete predefined[key];
        } else {
          predef[key] = (val === "true");
        }
      });

      combine(predefined, predef);

      for (var key in predef) {
        if (_.has(predef, key)) {
          declared[key] = directiveToken;
        }
      }
    }

    if (directiveToken.type === "exported") {
      body.forEach(function(e, idx) {
        if (!e.length) {
          // Ignore trailing comma
          if (idx > 0 && idx === body.length - 1) {
            return;
          }
          error("E002", directiveToken);
          return;
        }

        state.funct["(scope)"].addExported(e);
      });
    }

    if (directiveToken.type === "members") {
      membersOnly = membersOnly || {};

      body.forEach(function(m) {
        var ch1 = m.charAt(0);
        var ch2 = m.charAt(m.length - 1);

        if (ch1 === ch2 && (ch1 === "\"" || ch1 === "'")) {
          m = m
            .substr(1, m.length - 2)
            .replace("\\\"", "\"");
        }

        membersOnly[m] = false;
      });
    }

    var numvals = [
      "maxstatements",
      "maxparams",
      "maxdepth",
      "maxcomplexity",
      "maxerr",
      "maxlen",
      "indent"
    ];

    if (directiveToken.type === "jshint" || directiveToken.type === "jslint" ||
      directiveToken.type === "jshint.unstable") {
      body.forEach(function(g) {
        g = g.split(":");
        var key = g[0].trim();
        var val = (g[1] || "").trim();

        if (!checkOption(key, directiveToken.type !== "jshint.unstable", directiveToken)) {
          return;
        }

        if (numvals.indexOf(key) >= 0) {
          // GH988 - numeric options can be disabled by setting them to `false`
          if (val !== "false") {
            val = +val;

            if (typeof val !== "number" || !isFinite(val) || val <= 0 || Math.floor(val) !== val) {
              error("E032", directiveToken, g[1].trim());
              return;
            }

            state.option[key] = val;
          } else {
            state.option[key] = key === "indent" ? 4 : false;
          }

          return;
        }

        if (key === "validthis") {
          // `validthis` is valid only within a function scope.

          if (state.funct["(global)"])
            return void error("E009");

          if (val !== "true" && val !== "false")
            return void error("E002", directiveToken);

          state.option.validthis = (val === "true");
          return;
        }

        if (key === "quotmark") {
          switch (val) {
          case "true":
          case "false":
            state.option.quotmark = (val === "true");
            break;
          case "double":
          case "single":
            state.option.quotmark = val;
            break;
          default:
            error("E002", directiveToken);
          }
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
            error("E002", directiveToken);
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
            error("E002", directiveToken);
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
            error("E002", directiveToken);
          }
          return;
        }

        if (key === "ignore") {
          switch (val) {
          case "line":
            state.ignoredLines[directiveToken.line] = true;
            removeIgnoredMessages();
            break;
          default:
            error("E002", directiveToken);
          }
          return;
        }

        if (key === "strict") {
          switch (val) {
          case "true":
            state.option.strict = true;
            break;
          case "false":
            state.option.strict = false;
            break;
          case "global":
          case "implied":
            state.option.strict = val;
            break;
          default:
            error("E002", directiveToken);
          }
          return;
        }

        if (key === "module") {
          /**
           * TODO: Extend this restriction to *all* "environmental" options.
           */
          if (!hasParsedCode(state.funct)) {
            error("E055", directiveToken, "module");
          }
        }

        if (key === "esversion") {
          switch (val) {
          case "3":
          case "5":
          case "6":
          case "7":
            state.option.moz = false;
            state.option.esversion = +val;
            break;
          case "2015":
          case "2016":
            state.option.moz = false;
            // Translate specification publication year to version number.
            state.option.esversion = +val - 2009;
            break;
          default:
            error("E002", directiveToken);
          }
          if (!hasParsedCode(state.funct)) {
            error("E055", directiveToken, "esversion");
          }
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
          if (directiveToken.type === "jslint") {
            tn = options.renamed[key] || key;
            state.option[tn] = (val === "true");

            if (options.inverted[tn] !== undefined) {
              state.option[tn] = !state.option[tn];
            }
          } else if (directiveToken.type === "jshint.unstable") {
            state.option.unstable[key] = (val === "true");
          } else {
            state.option[key] = (val === "true");
          }

          return;
        }

        error("E002", directiveToken);
      });

      applyOptions();
    }
  }

  /**
   * Return a token beyond the token available in `state.tokens.next`. If no
   * such token exists, return the "(end)" token. This function is used to
   * determine parsing strategies in cases where the value of the next token
   * does not provide sufficient information, as is the case with `for` loops,
   * e.g.:
   *
   *     for ( var i in ...
   *
   * versus:
   *
   *     for ( var i = ...
   *
   * @param {number} [p] - offset of desired token; defaults to 0
   *
   * @returns {token}
   */
  function peek(p) {
    var i = p || 0, j = lookahead.length, t;

    if (i < j) {
      return lookahead[i];
    }

    while (j <= i) {
      t = lex.token();

      // When the lexer is exhausted, this function should produce the "(end)"
      // token, even in cases where the requested token is beyond the end of
      // the input stream.
      if (!t) {
        // If the lookahead buffer is empty, the expected "(end)" token was
        // already emitted by the most recent invocation of `advance` and is
        // available as the next token.
        if (!lookahead.length) {
          return state.tokens.next;
        }

        return lookahead[j - 1];
      }

      lookahead[j] = t;
      j += 1;
    }

    return t;
  }

  function peekIgnoreEOL() {
    var i = 0;
    var t;
    do {
      t = peek(i++);
    } while (t.id === "(endline)");
    return t;
  }

  /**
   * Consume the next token.
   *
   * @param {string} [expected] - the expected value of the next token's `id`
   *                              property (in the case of punctuators) or
   *                              `value` property (in the case of identifiers
   *                              and literals); if unspecified, any token will
   *                              be accepted
   * @param {object} [relatedToken] - the token that informed the expected
   *                                  value, if any (for example: the opening
   *                                  brace when a closing brace is expected);
   *                                  used to produce more meaningful errors
   */
  function advance(expected, relatedToken) {
    var nextToken = state.tokens.next;

    switch (state.tokens.curr.id) {
    case "(number)":
      if (nextToken.id === ".") {
        warning("W005", state.tokens.curr);
      }
      break;
    case "-":
      if (nextToken.id === "-" || nextToken.id === "--") {
        warning("W006");
      }
      break;
    case "+":
      if (nextToken.id === "+" || nextToken.id === "++") {
        warning("W007");
      }
      break;
    }

    if (expected && nextToken.id !== expected) {
      if (relatedToken) {
        if (nextToken.id === "(end)") {
          error("E019", relatedToken, relatedToken.id);
        } else {
          error("E020", nextToken, expected, relatedToken.id,
            relatedToken.line, nextToken.value);
        }
      } else if (nextToken.type !== "(identifier)" || nextToken.value !== expected) {
        error("E021", nextToken, expected, nextToken.value);
      }
    }

    state.tokens.prev = state.tokens.curr;
    state.tokens.curr = state.tokens.next;
    for (;;) {
      state.tokens.next = lookahead.shift() || lex.token();

      if (!state.tokens.next) { // No more tokens left, give up
        quit("E041", state.tokens.curr);
      }

      if (state.tokens.next.id === "(end)" || state.tokens.next.id === "(error)") {
        return;
      }

      if (state.tokens.next.check) {
        state.tokens.next.check();
      }

      if (state.tokens.next.isSpecial) {
        lintingDirective(state.tokens.next, state.tokens.curr);
      } else {
        if (state.tokens.next.id !== "(endline)") {
          break;
        }
      }
    }
  }

  /**
   * Determine whether a given token is an operator.
   *
   * @param {token} token
   *
   * @returns {boolean}
   */
  function isOperator(token) {
    return token.first || token.right || token.left || token.id === "yield";
  }

  function isEndOfExpr(context, curr, next) {
    if (arguments.length <= 1) {
      curr = state.tokens.curr;
      next = state.tokens.next;
    }

    if (next.id === "in" && context & prodParams.noin) {
      return true;
    }
    if (next.id === ";" || next.id === "}" || next.id === ":") {
      return true;
    }
    if (next.infix === curr.infix || curr.ltBoundary === "after" ||
      next.ltBoundary === "before") {
      return curr.line !== startLine(next);
    }
    return false;
  }

  /**
   * The `expression` function is the heart of JSHint's parsing behaior. It is
   * based on the Pratt parser, but it extends that model with a `fud` method.
   * Short for "firtst null denotation," it it similar to the `nud` ("null
   * denotation") function, but it is only used on the first token of a
   * statement. This simplifies usage in statement-oriented languages like
   * JavaScript.
   *
   * .nud  Null denotation
   * .fud  First null denotation
   * .led  Left denotation
   *  lbp  Left binding power
   *  rbp  Right binding power
   *
   * They are elements of the parsing method called Top Down Operator Precedence.
   *
   * In addition to parsing, this function applies a number of linting patterns.
   *
   * @param {number} rbp - the right-binding power of the token to be consumed
   * @param {number} context - the parsing context (a bitfield describing
   *                           conditions of the current parsing operation
   *                           which can influence how the next tokens are
   *                           interpreted); see `prod-params.js` for more
   *                           detail)
   */
  function expression(rbp, context) {
    var left, isArray = false, isObject = false;
    var initial = context & prodParams.initial;
    var curr;

    context &= ~prodParams.initial;

    state.nameStack.push();

    if (state.tokens.next.id === "(end)")
      error("E006", state.tokens.curr);

    var isDangerous =
      state.option.asi &&
      state.tokens.prev.line !== startLine(state.tokens.curr) &&
      _.includes(["]", ")"], state.tokens.prev.id) &&
      _.includes(["[", "("], state.tokens.curr.id);

    if (isDangerous)
      warning("W014", state.tokens.curr, state.tokens.curr.id);

    advance();

    if (initial) {
      state.funct["(verb)"] = state.tokens.curr.value;
      state.tokens.curr.beginsStmt = true;
    }

    curr = state.tokens.curr;

    if (initial && curr.fud && (!curr.useFud || curr.useFud(context))) {
      left = state.tokens.curr.fud(context);
    } else {
      if (state.tokens.curr.nud) {
        left = state.tokens.curr.nud(context, rbp);
      } else {
        error("E030", state.tokens.curr, state.tokens.curr.id);
      }

      while (rbp < state.tokens.next.lbp && !isEndOfExpr(context)) {
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
          warning("W009", state.tokens.curr);
        }

        if (isObject && state.tokens.curr.id === "(" && state.tokens.next.id === ")") {
          warning("W010", state.tokens.curr);
        }

        if (left && state.tokens.curr.led) {
          left = state.tokens.curr.led(context, left);
        } else {
          error("E033", state.tokens.curr, state.tokens.curr.id);
        }
      }
    }

    state.nameStack.pop();

    return left;
  }


  // Functions for conformance of style.

  function startLine(token) {
    return token.startLine || token.line;
  }

  function nobreaknonadjacent(left, right) {
    if (!state.option.laxbreak && left.line !== startLine(right)) {
      warning("W014", right, right.value);
    }
  }

  function nolinebreak(t) {
    t = t;
    if (t.line !== startLine(state.tokens.next)) {
      warning("E022", t, t.value);
    }
  }

  function nobreakcomma(left, right) {
    if (left.line !== startLine(right)) {
      if (!state.option.laxcomma) {
        if (parseComma.first) {
          warning("I001");
          parseComma.first = false;
        }
        warning("W014", left, right.value);
      }
    }
  }

  function parseComma(opts) {
    opts = opts || {};

    if (!opts.peek) {
      nobreakcomma(state.tokens.curr, state.tokens.next);
      advance(",");
    } else {
      nobreakcomma(state.tokens.prev, state.tokens.curr);
    }

    if (state.tokens.next.identifier && !(opts.property && state.inES5())) {
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
        error("E024", state.tokens.next, state.tokens.next.value);
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
        error("E024", state.tokens.next, state.tokens.next.value);
        return false;
      }
    }
    return true;
  }

  /**
   * Factory function for creating "symbols"--objects that will be inherited by
   * tokens. The objects created by this function are stored in a symbol table
   * and set as the prototype of the tokens generated by the lexer.
   *
   * Note that this definition of "symbol" describes an implementation detail
   * of JSHint and is not related to the ECMAScript value type introduced in
   * ES2015.
   *
   * @param {string} s - the name of the token; for keywords (e.g. `void`) and
   *                     delimiters (e.g.. `[`), this is the token's text
   *                     representation; for literals (e.g. numbers) and other
   *                     "special" tokens (e.g. the end-of-file marker) this is
   *                     a parenthetical value
   * @param {number} p - the left-binding power of the token as used by the
   *                     Pratt parsing semantics
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function symbol(s, p) {
    var x = state.syntax[s];
    if (!x || typeof x !== "object") {
      state.syntax[s] = x = {
        id: s,
        lbp: p,
        // Symbols that accept a right-hand side do so with a binding power
        // that is commonly identical to their left-binding power. (This value
        // is relevant when determining if the grouping operator is necessary
        // to override the precedence of surrounding operators.) Because the
        // exponentiation operator's left-binding power and right-binding power
        // are distinct, the values must be encoded separately.
        rbp: p,
        value: s
      };
    }
    return x;
  }

  /**
   * Convenience function for defining delimiter symbols.
   *
   * @param {string} s - the name of the symbol
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function delim(s) {
    var x = symbol(s, 0);
    x.delim = true;
    return x;
  }

  /**
   * Convenience function for defining statement-denoting symbols.
   *
   * @param {string} s - the name of the symbol
   * @param {function} f - the first null denotation function for the symbol;
   *                       see the `expression` function for more detail
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function stmt(s, f) {
    var x = delim(s);
    x.identifier = x.reserved = true;
    x.fud = f;
    return x;
  }

  /**
   * Convenience function for defining block-statement-denoting symbols.
   *
   * @param {string} s - the name of the symbol
   * @param {function} - the first null denotation function for the symbol; see
   *                     the `expression` function for more detail
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function blockstmt(s, f) {
    var x = stmt(s, f);
    x.block = true;
    return x;
  }
  /**
   * Denote a given JSHint symbol as an identifier and a reserved keyword.
   *
   * @param {object} - a JSHint symbol value
   *
   * @returns {object} - the provided object
   */
  function reserveName(x) {
    var c = x.id.charAt(0);
    if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
      x.identifier = x.reserved = true;
    }
    return x;
  }

  /**
   * Convenience function for defining "prefix" symbols--operators that accept
   * expressions as a right-hand side.
   *
   * @param {string} s - the name of the symbol
   * @param {function} [f] - the first null denotation function for the symbol;
   *                         see the `expression` function for more detail
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function prefix(s, f) {
    var x = symbol(s, 150);
    reserveName(x);

    x.nud = (typeof f === "function") ? f : function(context) {
      this.arity = "unary";
      this.right = expression(150, context);

      if (this.id === "++" || this.id === "--") {
        if (state.option.plusplus) {
          warning("W016", this, this.id);
        }

        if (this.right) {
          checkLeftSideAssign(this.right, this);
        }
      }

      return this;
    };

    return x;
  }

  /**
   * Convenience function for defining "type" symbols--those that describe
   * literal values.
   *
   * @param {string} s - the name of the symbol
   * @param {function} f - the first null denotation function for the symbol;
   *                       see the `expression` function for more detail
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function type(s, f) {
    var x = delim(s);
    x.type = s;
    x.nud = f;
    return x;
  }

  /**
   * Convenience function for defining JSHint symbols for reserved
   * keywords--those that are restricted from use as bindings (and as propery
   * names in ECMAScript 3 environments).
   *
   * @param {string} s - the name of the symbol
   * @param {function} func - the first null denotation function for the
   *                          symbol; see the `expression` function for more
   *                          detail
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function reserve(name, func) {
    var x = type(name, func);
    x.identifier = true;
    x.reserved = true;
    return x;
  }

  /**
   * Convenience function for defining JSHint symbols for keywords that are
   * only reserved in some circumstances.
   *
   * @param {string} s - the name of the symbol
   * @param {object} [meta] - a collection of optional arguments
   * @param {function} [meta.nud] -the null denotation function for the symbol;
   *                   see the `expression` function for more detail
   * @param {boolean} [meta.es5] - `true` if the identifier is reserved
   *                               in ECMAScript 5 or later
   * @param {boolean} [meta.moduleOnly] - `true` if the identifier is only
   *                                      reserved in module code
   * @param {boolean} [meta.strictOnly] - `true` if the identifier is only
   *                                      reserved in strict mode code.
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function FutureReservedWord(name, meta) {
    var x = type(name, (meta && meta.nud) || function() {
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

  /**
   * Convenience function for defining JSHint symbols for reserved
   * binding identifiers.
   *
   * @param {string} s - the name of the symbol
   * @param {function} v - the first null denotation function for the symbol;
   *                       see the `expression` function for more detail
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function reservevar(s, v) {
    return reserve(s, function() {
      if (typeof v === "function") {
        v(this);
      }
      return this;
    });
  }

  /**
   * Convenience function for defining "infix" symbols--operators that require
   * operands as both "land-hand side" and "right-hand side".
   *
   * @param {string} s - the name of the symbol
   * @param {function} [f] - a function to be invoked that consumes the
   *                         right-hand side of the operator
   * @param {number} p - the left-binding power of the token as used by the
   *                     Pratt parsing semantics
   * @param {boolean} [w] - if `true`
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function infix(s, f, p, w) {
    var x = symbol(s, p);
    reserveName(x);
    x.infix = true;
    x.led = function(context, left) {
      if (!w) {
        nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      }
      if ((s === "in" || s === "instanceof") && left.id === "!") {
        warning("W018", left, "!");
      }
      if (typeof f === "function") {
        return f(context, left, this);
      } else {
        this.left = left;
        this.right = expression(p, context);
        return this;
      }
    };
    return x;
  }

  /**
   * Convenience function for defining the `=>` token as used in arrow
   * functions.
   *
   * @param {string} s - the name of the symbol
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function application(s) {
    var x = symbol(s, 42);

    x.infix = true;
    x.led = function(context, left) {
      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);

      this.left = left;
      this.right = doFunction(context, { type: "arrow", loneArg: left });
      return this;
    };
    return x;
  }

  /**
   * Convenience function for defining JSHint symbols for relation operators.
   *
   * @param {string} s - the name of the symbol
   * @param {function} [f] - a function to be invoked to enforce any additional
   *                         linting rules.
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function relation(s, f) {
    var x = symbol(s, 100);

    x.infix = true;
    x.led = function(context, left) {
      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      this.left = left;
      var right = this.right = expression(100, context);

      if (isIdentifier(left, "NaN") || isIdentifier(right, "NaN")) {
        warning("W019", this);
      } else if (f) {
        f.apply(this, [context, left, right]);
      }

      if (!left || !right) {
        quit("E041", state.tokens.curr);
      }

      if (left.id === "!") {
        warning("W018", left, "!");
      }

      if (right.id === "!") {
        warning("W018", right, "!");
      }

      return this;
    };
    return x;
  }

  /**
   * Determine if a given token marks the beginning of a UnaryExpression.
   *
   * @param {object} token
   *
   * @returns {boolean}
   */
  function beginsUnaryExpression(token) {
    return token.arity === "unary" && token.id !== "++" && token.id !== "--";
  }

  var typeofValues = {};
  typeofValues.legacy = [
    // E4X extended the `typeof` operator to return "xml" for the XML and
    // XMLList types it introduced.
    // Ref: 11.3.2 The typeof Operator
    // http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-357.pdf
    "xml",
    // IE<9 reports "unknown" when the `typeof` operator is applied to an
    // object existing across a COM+ bridge. In lieu of official documentation
    // (which does not exist), see:
    // http://robertnyman.com/2005/12/21/what-is-typeof-unknown/
    "unknown"
  ];
  typeofValues.es3 = [
    "undefined", "boolean", "number", "string", "function", "object",
  ];
  typeofValues.es3 = typeofValues.es3.concat(typeofValues.legacy);
  typeofValues.es6 = typeofValues.es3.concat("symbol");

  /**
   * Validate comparisons between the result of a `typeof` expression and a
   * string literal.
   *
   * @param {token} [left] - one of the values being compared
   * @param {token} [right] - the other value being compared
   * @param {object} state - the global state object (see `state.js`)
   *
   * @returns {boolean} - `false` if the second token describes a `typeof`
   *                       expression and the first token is a string literal
   *                       whose value is never returned by that operator;
   *                       `true` otherwise
   */
  function isTypoTypeof(left, right, state) {
    var values;

    if (state.option.notypeof)
      return false;

    if (!left || !right)
      return false;

    values = state.inES6() ? typeofValues.es6 : typeofValues.es3;

    if (right.type === "(identifier)" && right.value === "typeof" && left.type === "(string)")
      return !_.includes(values, left.value);

    return false;
  }

  /**
   * Determine if a given token describes the built-in `eval` function.
   *
   * @param {token} left
   * @param {object} state - the global state object (see `state.js`)
   *
   * @returns {boolean}
   */
  function isGlobalEval(left, state) {
    var isGlobal = false;

    // permit methods to refer to an "eval" key in their own context
    if (left.type === "this" && state.funct["(context)"] === null) {
      isGlobal = true;
    }
    // permit use of "eval" members of objects
    else if (left.type === "(identifier)") {
      if (state.option.node && left.value === "global") {
        isGlobal = true;
      }

      else if (state.option.browser && (left.value === "window" || left.value === "document")) {
        isGlobal = true;
      }
    }

    return isGlobal;
  }

  /**
   * Determine if a given token describes a property of a built-in object.
   *
   * @param {token} left
   *
   * @returns {boolean}
   */
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

      if (obj.identifier && natives.indexOf(obj.value) >= 0 &&
          state.funct["(scope)"].isPredefined(obj.value)) {
        return obj.value;
      }
    }

    var prototype = walkPrototype(left);
    if (prototype) return walkNative(prototype);
  }

  /**
   * Determine if the given token is a valid assignment target; emit errors
   * and/or warnings as appropriate
   *
   * @param {token} left - the left hand side of the assignment
   * @param {token=} assignToken - the token for the assignment, used for
   *                               reporting
   * @param {object=} options - optional object
   * @param {boolean} options.allowDestructuring - whether to allow
   *                                               destructuring binding
   *
   * @returns {boolean} Whether the left hand side is OK
   */
  function checkLeftSideAssign(left, assignToken, options) {

    var allowDestructuring = options && options.allowDestructuring;

    assignToken = assignToken || left;

    if (state.option.freeze) {
      var nativeObject = findNativePrototype(left);
      if (nativeObject)
        warning("W121", left, nativeObject);
    }
    if (checkPunctuator(left, "...")) {
      left = left.right;
    }

    if (left.identifier && !left.isMetaProperty) {
      // The `reassign` method also calls `modify`, but we are specific in
      // order to catch function re-assignment and globals re-assignment
      state.funct["(scope)"].block.reassign(left.value, left);
    }

    if (left.id === ".") {
      if (!left.left || left.left.value === "arguments" && !state.isStrict()) {
        warning("E031", assignToken);
      }

      state.nameStack.set(state.tokens.prev);
      return true;
    } else if (left.id === "{" || left.id === "[") {
      if (!allowDestructuring || !left.destructAssign) {
        if (left.id === "{" || !left.left) {
          warning("E031", assignToken);
        } else if (left.left.value === "arguments" && !state.isStrict()) {
          warning("E031", assignToken);
        }
      }

      if (left.id === "[") {
        state.nameStack.set(left.right);
      }

      return true;
    } else if (left.identifier && !isReserved(left) && !left.isMetaProperty &&
      left.value !== "eval" && left.value !== "arguments") {
      if (state.funct["(scope)"].labeltype(left.value) === "exception") {
        warning("W022", left);
      }
      state.nameStack.set(left);
      return true;
    }

    error("E031", assignToken);

    return false;
  }

  /**
   * Convenience function for defining JSHint symbols for assignment operators.
   *
   * @param {string} s - the name of the symbol
   * @param {function} [f] - a function to be invoked that consumes the
   *                         right-hand side of the operator (see the `infix`
   *                         function)
   * @param {number} p - the left-binding power of the token as used by the
   *                     Pratt parsing semantics
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function assignop(s, f, p) {
    var x = infix(s, typeof f === "function" ? f : function(context, left, that) {
      that.left = left;

      checkLeftSideAssign(left, that, { allowDestructuring: true });

      that.right = expression(10, context);

      return that;
    }, p);

    x.exps = true;
    x.assign = true;
    return x;
  }

  /**
   * Convenience function for defining JSHint symbols for bitwise operators.
   *
   * @param {string} s - the name of the symbol
   * @param {function} [f] - the left denotation function for the symbol; see
   *                         the `expression` function for more detail
   * @param {number} p - the left-binding power of the token as used by the
   *                     Pratt parsing semantics
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function bitwise(s, f, p) {
    var x = symbol(s, p);
    reserveName(x);
    x.infix = true;
    x.led = (typeof f === "function") ? f : function(context, left) {
      if (state.option.bitwise) {
        warning("W016", this, this.id);
      }
      this.left = left;
      this.right = expression(p, context);
      return this;
    };
    return x;
  }

  /**
   * Convenience function for defining JSHint symbols for bitwise assignment
   * operators. See the `assignop` function for more detail.
   *
   * @param {string} s - the name of the symbol
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function bitwiseassignop(s) {
    return assignop(s, function(context, left, that) {
      if (state.option.bitwise) {
        warning("W016", that, that.id);
      }

      checkLeftSideAssign(left, that);

      that.right = expression(10, context);

      return that;
    }, 20);
  }

  /**
   * Convenience function for defining JSHint symbols for those operators which
   * have a single operand that appears before them in the source code.
   *
   * @param {string} s - the name of the symbol
   *
   * @returns {object} - the object describing the JSHint symbol (provided to
   *                     support cases where further refinement is necessary)
   */
  function suffix(s) {
    var x = symbol(s, 150);

    x.led = function(context, left) {
      // this = suffix e.g. "++" punctuator
      // left = symbol operated e.g. "a" identifier or "a.b" punctuator
      if (state.option.plusplus) {
        warning("W016", this, this.id);
      }

      checkLeftSideAssign(left, this);

      this.left = left;
      return this;
    };
    return x;
  }

  /**
   * Retrieve the value of the current token if it is an identifier and
   * optionally advance the parser.
   *
   * @param {boolean} [prop] -`true` if this identifier is that of an object
   *                           property
   * @param {boolean} [preserve] - `true` if the token should not be consumed
   *
   * @returns {string|undefined} - the value of the identifier, if present
   */
  function optionalidentifier(prop, preserve) {
    if (!state.tokens.next.identifier) {
      return;
    }

    if (!preserve) {
      advance();
    }

    var curr = state.tokens.curr;
    var val  = state.tokens.curr.value;

    if (!isReserved(curr)) {
      return val;
    }

    if (prop) {
      if (state.inES5()) {
        return val;
      }
    }

    warning("W024", state.tokens.curr, state.tokens.curr.id);
    return val;
  }

  /**
   * Consume the "..." token which designates "spread" and "rest" operations if
   * it is present. If the operator is repeated, consume every repetition, and
   * issue a single error describing the syntax error.
   *
   * @param {string} operation - either "spread" or "rest"
   *
   * @returns {boolean} a value describing whether or not any tokens were
   *                    consumed in this way
   */
  function spreadrest(operation) {
    if (!checkPunctuator(state.tokens.next, "...")) {
      return false;
    }

    if (!state.inES6(true)) {
      warning("W119", state.tokens.next, operation + " operator", "6");
    }
    advance();

    if (checkPunctuator(state.tokens.next, "...")) {
      warning("E024", state.tokens.next, "...");
      while (checkPunctuator(state.tokens.next, "...")) {
        advance();
      }
    }

    return true;
  }

  /**
   * Ensure that the current token is an identifier and retrieve its value.
   *
   * @param {boolean} [prop] -`true` if this identifier is that of an object
   *                           property
   *
   * @returns {string|undefined} - the value of the identifier, if present
   */
  function identifier(prop) {
    var i = optionalidentifier(prop, false);
    if (i) {
      return i;
    }

    error("E030", state.tokens.next, state.tokens.next.value);

    // The token should be consumed after a warning is issued so the parser
    // can continue as though an identifier were found. The semicolon token
    // should not be consumed in this way so that the parser interprets it as
    // a statement delimeter;
    if (state.tokens.next.id !== ";") {
      advance();
    }
  }


  /**
   * Determine if the provided token may be evaluated and emit a linting
   * warning if this is note the case.
   *
   * @param {token} controlToken
   */
  function reachable(controlToken) {
    var i = 0, t;
    if (state.tokens.next.id !== ";" || controlToken.inBracelessBlock) {
      return;
    }
    for (;;) {
      do {
        t = peek(i);
        i += 1;
      } while (t.id !== "(end)" && t.id === "(comment)");

      if (t.reach) {
        return;
      }
      if (t.id !== "(endline)") {
        if (t.id === "function") {
          if (state.option.latedef === true) {
            warning("W026", t);
          }
          break;
        }

        warning("W027", t, t.value, controlToken.value);
        break;
      }
    }
  }

  /**
   * Consume the semicolon that delimits the statement currently being parsed,
   * emitting relevant warnings/errors as appropriate.
   *
   * @param {token} stmt - token describing the statement under consideration
   */
  function parseFinalSemicolon(stmt) {
    if (state.tokens.next.id !== ";") {
      // don't complain about unclosed templates / strings
      if (state.tokens.next.isUnclosed) return advance();

      var sameLine = startLine(state.tokens.next) === state.tokens.curr.line &&
                     state.tokens.next.id !== "(end)";
      var blockEnd = checkPunctuator(state.tokens.next, "}");

      if (sameLine && !blockEnd && !(stmt.id === "do" && state.inES6(true))) {
        errorAt("E058", state.tokens.curr.line, state.tokens.curr.character);
      } else if (!state.option.asi) {

        // If this is the last statement in a block that ends on the same line
        // *and* option lastsemic is on, ignore the warning.  Otherwise, issue
        // a warning about missing semicolon.
        if (!(blockEnd && sameLine && state.option.lastsemic)) {
          warningAt("W033", state.tokens.curr.line, state.tokens.curr.character);
        }
      }
    } else {
      advance(";");
    }
  }

  /**
   * Consume a statement.
   *
   * @param {number} context - the parsing context; see `prod-params.js` for
   *                           more information
   *
   * @returns {token} - the token describing the statement
   */
  function statement(context) {
    var i = indent, r, t = state.tokens.next, hasOwnScope = false;

    context |= prodParams.initial;

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
      warning("W024", t, t.id);
      res = false;
    }

    if (t.identifier && !res && peek().id === ":") {
      advance();
      advance(":");

      hasOwnScope = true;
      state.funct["(scope)"].stack();
      state.funct["(scope)"].block.addBreakLabel(t.value, { token: state.tokens.curr });

      if (!state.tokens.next.labelled && state.tokens.next.value !== "{") {
        warning("W028", state.tokens.next, t.value, state.tokens.next.value);
      }

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
      var iscase = (state.funct["(verb)"] === "case" && state.tokens.curr.value === ":");
      block(context, true, true, false, false, iscase);

      if (hasOwnScope) {
        state.funct["(scope)"].unstack();
      }

      return;
    }

    // Parse the statement.

    r = expression(0, context);

    if (r && !(r.identifier && r.value === "function") &&
        !(r.type === "(punctuator)" && r.left &&
          r.left.identifier && r.left.value === "function")) {
      if (!state.isStrict() && state.stmtMissingStrict()) {
        warning("E007");
      }
    }

    // Look for the final semicolon.

    if (!t.block) {
      if (!state.option.expr && (!r || !r.exps)) {
        warning("W030", state.tokens.curr);
      } else if (state.option.nonew && r && r.left && r.id === "(" && r.left.id === "new") {
        warning("W031", t);
      }
      parseFinalSemicolon(t);
    }


    // Restore the indentation.

    indent = i;
    if (hasOwnScope) {
      state.funct["(scope)"].unstack();
    }
    return r;
  }

  /**
   * Consume a series of statements until encountering either the end of the
   * program or a token that interrupts control flow.
   *
   * @param {number} context - the parsing context; see `prod-params.js` for
   *                           more information
   *
   * @returns {Array<token>} - the tokens consumed
   */
  function statements(context) {
    var a = [], p;

    while (!state.tokens.next.reach && state.tokens.next.id !== "(end)") {
      if (state.tokens.next.id === ";") {
        p = peek();

        if (!p || (p.id !== "(" && p.id !== "[")) {
          warning("W032");
        }

        advance(";");
      } else {
        a.push(statement(context));
      }
    }
    return a;
  }


  /**
   * Parse any directives in a directive prologue.
   */
  function directives() {
    var current = state.tokens.next;
    while (state.tokens.next.id === "(string)") {
      var next = peekIgnoreEOL();
      if (!isEndOfExpr(0, current, next)) {
        break;
      }
      current = next;

      advance();
      var directive = state.tokens.curr.value;
      if (state.directive[directive] ||
          (directive === "use strict" && state.option.strict === "implied")) {
        warning("W034", state.tokens.curr, directive);
      }

      // From ECMAScript 2016:
      //
      // > 14.1.2 Static Semantics: Early Errors
      // >
      // > [...]
      // > - It is a Syntax Error if ContainsUseStrict of FunctionBody is true
      // >   and IsSimpleParameterList of FormalParameters is false.
      if (directive === "use strict" && state.inES7() &&
        !state.funct["(global)"] && state.funct["(hasSimpleParams)"] === false) {
        error("E065", state.tokens.curr);
      }

      // there's no directive negation, so always set to true
      state.directive[directive] = true;

      parseFinalSemicolon(current);
    }

    if (state.isStrict()) {
      state.option.undef = true;
    }
  }

  /**
   * Parses a single block. A block is a sequence of statements wrapped in
   * braces.
   *
   * @param {number} context - parsing context
   * @param {boolean} ordinary - `true` for everything but function bodies and
   *                             try blocks
   * @param {boolean} [stmt] - `true` if block can be a single statement (e.g.
   *                           in if/for/while)
   * @param {boolean} [isfunc] - `true` if block is a function body
   * @param {boolean} [isfatarrow] - `true` if its a body of a fat arrow
   *                                 function
   * @param {boolean} [iscase] - `true` if block is a switch case block
   *
   * @returns {token} - the token describing the block
   */
  function block(context, ordinary, stmt, isfunc, isfatarrow, iscase) {
    var a,
      b = inblock,
      old_indent = indent,
      m,
      t,
      d;

    inblock = ordinary;

    t = state.tokens.next;

    var metrics = state.funct["(metrics)"];
    metrics.nestedBlockDepth += 1;
    metrics.verifyMaxNestedBlockDepthPerFunction();

    if (state.tokens.next.id === "{") {
      advance("{");

      // create a new block scope
      state.funct["(scope)"].stack();
      state.funct["(noblockscopedvar)"] = false;

      if (state.tokens.next.id !== "}") {
        indent += state.option.indent;
        while (!ordinary && state.tokens.next.from > indent) {
          indent += state.option.indent;
        }

        if (isfunc) {
          m = {};
          for (d in state.directive) {
            m[d] = state.directive[d];
          }
          directives();

          state.funct["(isStrict)"] = state.isStrict();

          if (state.option.strict && state.funct["(context)"]["(global)"]) {
            if (!m["use strict"] && !state.isStrict()) {
              warning("E007");
            }
          }
        }

        a = statements(context);

        metrics.statementCount += a.length;

        indent -= state.option.indent;
      }

      advance("}", t);

      if (isfunc) {
        state.funct["(scope)"].validateParams(isfatarrow);
        if (m) {
          state.directive = m;
        }
      }

      state.funct["(scope)"].unstack();

      indent = old_indent;
    } else if (!ordinary) {
      if (isfunc) {
        state.funct["(scope)"].stack();

        if (stmt && !isfatarrow && !state.inMoz()) {
          error("W118", state.tokens.curr, "function closure expressions");
        }

        if (isfatarrow) {
          state.funct["(scope)"].validateParams(true);
        }

        expression(10, context);

        if (state.option.strict && state.funct["(context)"]["(global)"]) {
          if (!state.isStrict()) {
            warning("E007");
          }
        }

        state.funct["(scope)"].unstack();
      } else {
        error("E021", state.tokens.next, "{", state.tokens.next.value);
      }
    } else {

      // check to avoid let declaration not within a block
      // though is fine inside for loop initializer section
      state.funct["(noblockscopedvar)"] = state.tokens.next.id !== "for";
      state.funct["(scope)"].stack();

      if (!stmt || state.option.curly) {
        warning("W116", state.tokens.next, "{", state.tokens.next.value);
      }

      state.tokens.next.inBracelessBlock = true;
      indent += state.option.indent;
      // test indentation only if statement is in new line
      a = [statement(context)];
      indent -= state.option.indent;

      state.funct["(scope)"].unstack();
      delete state.funct["(noblockscopedvar)"];
    }

    // Don't clear and let it propagate out if it is "break", "return" or
    // similar in switch case
    switch (state.funct["(verb)"]) {
    case "break":
    case "continue":
    case "return":
    case "throw":
      if (iscase) {
        break;
      }

      /* falls through */
    default:
      state.funct["(verb)"] = null;
    }

    inblock = b;
    if (ordinary && state.option.noempty && (!a || a.length === 0)) {
      warning("W035", state.tokens.prev);
    }
    metrics.nestedBlockDepth -= 1;
    return a;
  }


  /**
   * Update the global state which tracks all statically-identifiable property
   * names, and emit a warning if the `members` linting directive is in use and
   * does not include the given name.
   *
   * @param {string} m - the property name
   */
  function countMember(m) {
    if (membersOnly && typeof membersOnly[m] !== "boolean") {
      warning("W036", state.tokens.curr, m);
    }
    if (typeof member[m] === "number") {
      member[m] += 1;
    } else {
      member[m] = 1;
    }
  }

  // Build the syntax table by declaring the syntactic elements of the language.

  type("(number)", function() {
    return this;
  });

  type("(string)", function() {
    return this;
  });

  state.syntax["(identifier)"] = {
    type: "(identifier)",
    lbp: 0,
    identifier: true,

    nud: function() {
      var v = this.value;

      // If this identifier is the lone parameter to a shorthand "fat arrow"
      // function definition, i.e.
      //
      //     x => x;
      //
      // ...it should not be considered as a variable in the current scope. It
      // will be added to the scope of the new function when the next token is
      // parsed, so it can be safely ignored for now.
      if (state.tokens.next.id === "=>") {
        return this;
      }

      if (!state.funct["(comparray)"].check(v)) {
        state.funct["(scope)"].block.use(v, state.tokens.curr);
      }
      return this;
    },

    led: function() {
      error("E033", state.tokens.next, state.tokens.next.value);
    }
  };

  var baseTemplateSyntax = {
    identifier: false,
    template: true,
  };
  state.syntax["(template)"] = _.extend({
    lbp: 155,
    type: "(template)",
    nud: doTemplateLiteral,
    led: doTemplateLiteral,
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(template middle)"] = _.extend({
    lbp: 0,
    type: "(template middle)",
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(template tail)"] = _.extend({
    lbp: 0,
    type: "(template tail)",
    tail: true,
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(no subst template)"] = _.extend({
    lbp: 155,
    type: "(template)",
    nud: doTemplateLiteral,
    led: doTemplateLiteral,
    noSubst: true,
    tail: true // mark as tail, since it's always the last component
  }, baseTemplateSyntax);

  type("(regexp)", function() {
    return this;
  });

  // ECMAScript parser

  delim("(endline)");
  (function(x) {
    x.line = x.from = 0;
  })(delim("(begin)"));
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
  reserve("true", function() { return this; });
  reserve("false", function() { return this; });
  reservevar("null");
  reservevar("this", function(x) {
    if (state.isStrict() && !isMethod() &&
        !state.option.validthis && ((state.funct["(statement)"] &&
        state.funct["(name)"].charAt(0) > "Z") || state.funct["(global)"])) {
      warning("W040", x);
    }
  });

  assignop("=", "assign", 20);
  assignop("+=", "assignadd", 20);
  assignop("-=", "assignsub", 20);
  assignop("*=", "assignmult", 20);
  assignop("/=", "assigndiv", 20).nud = function() {
    error("E014");
  };
  assignop("%=", "assignmod", 20);
  assignop("**=", function(context, left, that) {
    if (!state.inES7()) {
      warning("W119", that, "Exponentiation operator", "7");
    }

    that.left = left;

    checkLeftSideAssign(left, that);

    that.right = expression(10, context);

    return that;
  }, 20);

  bitwiseassignop("&=");
  bitwiseassignop("|=");
  bitwiseassignop("^=");
  bitwiseassignop("<<=");
  bitwiseassignop(">>=");
  bitwiseassignop(">>>=");
  infix(",", function(context, left, that) {
    var expr;
    that.exprs = [left];

    if (state.option.nocomma) {
      warning("W127");
    }

    if (!parseComma({ peek: true })) {
      return that;
    }
    while (true) {
      if (!(expr = expression(10, context))) {
        break;
      }
      that.exprs.push(expr);
      if (state.tokens.next.value !== "," || !parseComma()) {
        break;
      }
    }
    return that;
  }, 10, true);

  infix("?", function(context, left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(10, context & ~prodParams.noin);
    advance(":");
    expression(10, context);
    return that;
  }, 30);

  var orPrecendence = 40;
  infix("||", function(context, left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(orPrecendence, context);
    return that;
  }, orPrecendence);
  infix("&&", "and", 50);
  // The Exponentiation operator, introduced in ECMAScript 2016
  //
  // ExponentiationExpression[Yield] :
  //   UnaryExpression[?Yield]
  //   UpdateExpression[?Yield] ** ExponentiationExpression[?Yield]
  infix("**", function(context, left, that) {
    if (!state.inES7()) {
      warning("W119", that, "Exponentiation operator", "7");
    }

    // Disallow UnaryExpressions which are not wrapped in parenthesis
    if (!left.paren && beginsUnaryExpression(left)) {
      error("E024", that, "**");
    }

    that.left = left;
    that.right = expression(that.rbp, context);
    return that;
  }, 150);
  state.syntax["**"].rbp = 140;
  bitwise("|", "bitor", 70);
  bitwise("^", "bitxor", 80);
  bitwise("&", "bitand", 90);
  relation("==", function(context, left, right) {
    var eqnull = state.option.eqnull &&
      ((left && left.value) === "null" || (right && right.value) === "null");

    switch (true) {
      case !eqnull && state.option.eqeqeq:
        this.from = this.character;
        warning("W116", this, "===", "==");
        break;
      case isTypoTypeof(right, left, state):
        warning("W122", this, right.value);
        break;
      case isTypoTypeof(left, right, state):
        warning("W122", this, left.value);
        break;
    }

    return this;
  });
  relation("===", function(context, left, right) {
    if (isTypoTypeof(right, left, state)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right, state)) {
      warning("W122", this, left.value);
    }
    return this;
  });
  relation("!=", function(context, left, right) {
    var eqnull = state.option.eqnull &&
        ((left && left.value) === "null" || (right && right.value) === "null");

    if (!eqnull && state.option.eqeqeq) {
      this.from = this.character;
      warning("W116", this, "!==", "!=");
    } else if (isTypoTypeof(right, left, state)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right, state)) {
      warning("W122", this, left.value);
    }
    return this;
  });
  relation("!==", function(context, left, right) {
    if (isTypoTypeof(right, left, state)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right, state)) {
      warning("W122", this, left.value);
    }
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
  infix("instanceof", function(context, left, token) {
    var right;
    var scope = state.funct["(scope)"];
    token.left = left;
    token.right = right = expression(120, context);

    // This condition reflects a syntax error which will be reported by the
    // `expression` function.
    if (!right) {
      return token;
    }

    if (right.id === "(number)" ||
        right.id === "(string)" ||
        right.value === "null" ||
        (right.value === "undefined" && !scope.has("undefined")) ||
        right.arity === "unary" ||
        right.id === "{" ||
        (right.id === "[" && !right.right) ||
        right.id === "(regexp)" ||
        (right.id === "(template)" && !right.tag)) {
      error("E060");
    }

    if (right.id === "function") {
      warning("W139");
    }

    return token;
  }, 120);
  infix("+", function(context, left, that) {
    var right;
    that.left = left;
    that.right = right = expression(130, context);

    if (left && right && left.id === "(string)" && right.id === "(string)") {
      left.value += right.value;
      left.character = right.character;
      if (!state.option.scripturl && reg.javascriptURL.test(left.value)) {
        warning("W050", left);
      }
      return left;
    }

    return that;
  }, 130);
  prefix("+", "num");
  infix("-", "sub", 130);
  prefix("-", "neg");
  infix("*", "mult", 140);
  infix("/", "div", 140);
  infix("%", "mod", 140);

  suffix("++");
  prefix("++", "preinc");
  state.syntax["++"].exps = true;
  state.syntax["++"].ltBoundary = "before";

  suffix("--");
  prefix("--", "predec");
  state.syntax["--"].exps = true;
  state.syntax["--"].ltBoundary = "before";

  prefix("delete", function(context) {
    this.arity = "unary";
    var p = expression(150, context);
    if (!p) {
      return this;
    }

    if (p.id !== "." && p.id !== "[") {
      warning("W051");
    }
    this.first = p;

    // The `delete` operator accepts unresolvable references when not in strict
    // mode, so the operand may be undefined.
    if (p.identifier && !state.isStrict()) {
      p.forgiveUndef = true;
    }
    return this;
  }).exps = true;

  prefix("~", function(context) {
    if (state.option.bitwise) {
      warning("W016", this, "~");
    }
    this.arity = "unary";
    this.right = expression(150, context);
    return this;
  });

  infix("...");

  prefix("!", function(context) {
    this.arity = "unary";
    this.right = expression(150, context);

    if (!this.right) { // '!' followed by nothing? Give up.
      quit("E041", this);
    }

    if (bang[this.right.id] === true) {
      warning("W018", this, "!");
    }
    return this;
  });

  prefix("typeof", function(context) {
    this.arity = "unary";
    var p = expression(150, context);
    this.first = this.right = p;

    if (!p) { // 'typeof' followed by nothing? Give up.
      quit("E041", this);
    }

    // The `typeof` operator accepts unresolvable references, so the operand
    // may be undefined.
    if (p.identifier) {
      p.forgiveUndef = true;
    }
    return this;
  });
  prefix("new", function(context) {
    var mp = metaProperty("target", function() {
      if (!state.inES6(true)) {
        warning("W119", state.tokens.prev, "new.target", "6");
      }
      var inFunction, c = state.funct;
      while (c) {
        inFunction = !c["(global)"];
        if (!c["(arrow)"]) { break; }
        c = c["(context)"];
      }
      if (!inFunction) {
        warning("W136", state.tokens.prev, "new.target");
      }
    });
    if (mp) { return mp; }

    var c = expression(155, context), i;
    if (c && c.id !== "function") {
      if (c.identifier) {
        switch (c.value) {
        case "Number":
        case "String":
        case "Boolean":
        case "Math":
        case "JSON":
          warning("W053", state.tokens.prev, c.value);
          break;
        case "Symbol":
          if (state.inES6()) {
            warning("W053", state.tokens.prev, c.value);
          }
          break;
        case "Function":
          if (!state.option.evil) {
            warning("W054");
          }
          break;
        case "Date":
        case "RegExp":
        case "this":
          break;
        default:
          if (c.id !== "function") {
            i = c.value.substr(0, 1);
            if (state.option.newcap && (i < "A" || i > "Z") &&
              !state.funct["(scope)"].isPredefined(c.value)) {
              warning("W055", state.tokens.curr);
            }
          }
        }
      } else {
        if (c.id !== "." && c.id !== "[" && c.id !== "(") {
          warning("W056", state.tokens.curr);
        }
      }
    } else {
      if (!state.option.supernew)
        warning("W057", this);
    }
    if (state.tokens.next.id !== "(" && !state.option.supernew) {
      warning("W058", state.tokens.curr, state.tokens.curr.value);
    }
    this.first = this.right = c;
    return this;
  });
  state.syntax["new"].exps = true;

  prefix("void").exps = true;

  infix(".", function(context, left, that) {
    var m = identifier(true);

    if (typeof m === "string") {
      countMember(m);
    }

    that.left = left;
    that.right = m;

    if (m && m === "hasOwnProperty" && state.tokens.next.value === "=") {
      warning("W001");
    }

    if (left && left.value === "arguments" && (m === "callee" || m === "caller")) {
      if (state.option.noarg)
        warning("W059", left, m);
      else if (state.isStrict())
        error("E008");
    } else if (!state.option.evil && left && left.value === "document" &&
        (m === "write" || m === "writeln")) {
      warning("W060", left);
    }

    if (!state.option.evil && (m === "eval" || m === "execScript")) {
      if (isGlobalEval(left, state)) {
        warning("W061");
      }
    }

    return that;
  }, 160, true);

  infix("(", function(context, left, that) {
    if (state.option.immed && left && !left.immed && left.id === "function") {
      warning("W062");
    }

    var n = 0;
    var p = [];

    if (left) {
      if (left.type === "(identifier)") {
        if (left.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/)) {
          if ("Array Number String Boolean Date Object Error Symbol".indexOf(left.value) === -1) {
            if (left.value === "Math") {
              warning("W063", left);
            } else if (state.option.newcap) {
              warning("W064", left);
            }
          }
        }
      }
    }

    if (state.tokens.next.id !== ")") {
      for (;;) {
        spreadrest("spread");

        p[p.length] = expression(10, context);
        n += 1;
        if (state.tokens.next.id !== ",") {
          break;
        }
        parseComma();
      }
    }

    advance(")");

    if (typeof left === "object") {
      if (!state.inES5() && left.value === "parseInt" && n === 1) {
        warning("W065", state.tokens.curr);
      }
      if (!state.option.evil) {
        if (left.value === "eval" || left.value === "Function" ||
            left.value === "execScript") {
          warning("W061", left);

          // This conditional expression was initially implemented with a typo
          // which prevented the branch's execution in all cases. While
          // enabling the code will produce behavior that is consistent with
          // the other forms of code evaluation that follow, such a change is
          // also technically incompatable with prior versions of JSHint (due
          // to the fact that the behavior was never formally documented). This
          // branch should be enabled as part of a major release.
          //if (p[0] && p[0].id === "(string)") {
          //  addEvalCode(left, p[0]);
          //}
        } else if (p[0] && p[0].id === "(string)" &&
             (left.value === "setTimeout" ||
            left.value === "setInterval")) {
          warning("W066", left);
          addEvalCode(left, p[0]);

        // window.setTimeout/setInterval
        } else if (p[0] && p[0].id === "(string)" &&
             left.value === "." &&
             left.left.value === "window" &&
             (left.right === "setTimeout" ||
            left.right === "setInterval")) {
          warning("W066", left);
          addEvalCode(left, p[0]);
        }
      }
      if (!left.identifier && left.id !== "." && left.id !== "[" && left.id !== "=>" &&
          left.id !== "(" && left.id !== "&&" && left.id !== "||" && left.id !== "?" &&
          !(state.inES6() && left["(name)"])) {
        warning("W067", that);
      }
    }

    that.left = left;
    return that;
  }, 155, true).exps = true;

  prefix("(", function(context, rbp) {
    var pn = state.tokens.next, pn1, i = -1;
    var ret, triggerFnExpr, first, last;
    var parens = 1;
    var opening = state.tokens.curr;
    var preceeding = state.tokens.prev;
    var isNecessary = !state.option.singleGroups;

    do {
      if (pn.value === "(") {
        parens += 1;
      } else if (pn.value === ")") {
        parens -= 1;
      }

      i += 1;
      pn1 = pn;
      pn = peek(i);
    } while (!(parens === 0 && pn1.value === ")") && pn.type !== "(end)");

    if (state.tokens.next.id === "function") {
      triggerFnExpr = state.tokens.next.immed = true;
    }

    // If the balanced grouping operator is followed by a "fat arrow", the
    // current token marks the beginning of a "fat arrow" function and parsing
    // should proceed accordingly.
    if (pn.value === "=>") {
      pn.funct = doFunction(context, { type: "arrow", parsedOpening: true });
      return pn;
    }

    var exprs = [];

    if (state.tokens.next.id !== ")") {
      for (;;) {
        exprs.push(expression(10, context));

        if (state.tokens.next.id !== ",") {
          break;
        }

        if (state.option.nocomma) {
          warning("W127");
        }

        parseComma();
      }
    }

    advance(")", this);
    if (state.option.immed && exprs[0] && exprs[0].id === "function") {
      if (state.tokens.next.id !== "(" &&
        state.tokens.next.id !== "." && state.tokens.next.id !== "[") {
        warning("W068", this);
      }
    }

    if (!exprs.length) {
      return;
    }
    if (exprs.length > 1) {
      ret = Object.create(state.syntax[","]);
      ret.exprs = exprs;

      first = exprs[0];
      last = exprs[exprs.length - 1];
    } else {
      ret = first = last = exprs[0];

      if (!isNecessary) {
        isNecessary =
          // Used to distinguish from an ExpressionStatement which may not
          // begin with the `{` and `function` tokens
          (opening.beginsStmt && (ret.id === "{" || triggerFnExpr)) ||
          // Used to signal that a function expression is being supplied to
          // some other operator.
          (triggerFnExpr &&
            // For parenthesis wrapping a function expression to be considered
            // necessary, the grouping operator should be the left-hand-side of
            // some other operator--either within the parenthesis or directly
            // following them.
            (!isEndOfExpr() || state.tokens.prev.id !== "}")) ||
          // Used to demarcate an arrow function as the left-hand side of some
          // operator.
          (ret.id === "=>" && !isEndOfExpr()) ||
          // Used as the return value of a single-statement arrow function
          (ret.id === "{" && preceeding.id === "=>") ||
          // Used to cover a unary expression as the left-hand side of the
          // exponentiation operator
          (beginsUnaryExpression(ret) && state.tokens.next.id === "**") ||
          // Used to delineate an integer number literal from a dereferencing
          // punctuator (otherwise interpreted as a decimal point)
          (ret.type === "(number)" &&
            checkPunctuator(pn, ".") && /^\d+$/.test(ret.value)) ||
          // Used to wrap object destructuring assignment
          (opening.beginsStmt && ret.id === "=" && ret.left.id === "{");
      }
    }

    if (ret) {
      // The operator may be necessary to override the default binding power of
      // neighboring operators (whenever there is an operator in use within the
      // first expression *or* the current group contains multiple expressions)
      if (!isNecessary && (isOperator(first) || ret.exprs)) {
        isNecessary =
          (rbp > first.lbp) ||
          (rbp > 0 && rbp === first.lbp) ||
          (!isEndOfExpr() && last.rbp < state.tokens.next.lbp);
      }

      if (!isNecessary) {
        warning("W126", opening);
      }

      ret.paren = true;
    }

    return ret;
  });

  application("=>");

  infix("[", function(context, left, that) {
    var e = expression(10, context & ~prodParams.noin);
    var s, canUseDot;

    if (e && e.type === "(string)") {
      if (!state.option.evil && (e.value === "eval" || e.value === "execScript")) {
        if (isGlobalEval(left, state)) {
          warning("W061");
        }
      }

      countMember(e.value);
      if (!state.option.sub && reg.identifier.test(e.value)) {
        s = state.syntax[e.value];

        if (s) {
          canUseDot = !isReserved(s);
        } else {
          // This branch exists to preserve legacy behavior with version 2.9.5
          // and earlier. In those releases, `eval` and `arguments` were
          // incorrectly interpreted as reserved keywords, so Member
          // Expressions such as `object["eval"]` did not trigger warning W069.
          //
          // TODO: Remove in JSHint 3
          canUseDot = e.value !== "eval" && e.value !== "arguments";
        }

        if (canUseDot) {
          warning("W069", state.tokens.prev, e.value);
        }
      }
    }
    advance("]", that);

    if (e && e.value === "hasOwnProperty" && state.tokens.next.value === "=") {
      warning("W001");
    }

    that.left = left;
    that.right = e;
    return that;
  }, 160, true);

  function comprehensiveArrayExpression(context) {
    var res = {};
    res.exps = true;
    state.funct["(comparray)"].stack();

    // Handle reversed for expressions, used in spidermonkey
    var reversed = false;
    if (state.tokens.next.value !== "for") {
      reversed = true;
      if (!state.inMoz()) {
        warning("W116", state.tokens.next, "for", state.tokens.next.value);
      }
      state.funct["(comparray)"].setState("use");
      res.right = expression(10, context);
    }

    advance("for");
    if (state.tokens.next.value === "each") {
      advance("each");
      if (!state.inMoz()) {
        warning("W118", state.tokens.curr, "for each");
      }
    }
    advance("(");
    state.funct["(comparray)"].setState("define");
    res.left = expression(130, context);
    if (_.includes(["in", "of"], state.tokens.next.value)) {
      advance();
    } else {
      error("E045", state.tokens.curr);
    }
    state.funct["(comparray)"].setState("generate");
    expression(10, context);

    advance(")");
    if (state.tokens.next.value === "if") {
      advance("if");
      advance("(");
      state.funct["(comparray)"].setState("filter");
      expression(10, context);
      advance(")");
    }

    if (!reversed) {
      state.funct["(comparray)"].setState("use");
      res.right = expression(10, context);
    }

    advance("]");
    state.funct["(comparray)"].unstack();
    return res;
  }

  prefix("[", function(context) {
    var blocktype = lookupBlockType();
    if (blocktype.isCompArray) {
      if (!state.option.esnext && !state.inMoz()) {
        warning("W118", state.tokens.curr, "array comprehension");
      }
      return comprehensiveArrayExpression(context);
    } else if (blocktype.isDestAssign) {
      this.destructAssign = destructuringPattern(context, {
          openingParsed: true,
          assignment: true
        });
      return this;
    }
    var b = state.tokens.curr.line !== startLine(state.tokens.next);
    this.first = [];
    if (b) {
      indent += state.option.indent;
      if (state.tokens.next.from === indent + state.option.indent) {
        indent += state.option.indent;
      }
    }
    while (state.tokens.next.id !== "(end)") {
      while (state.tokens.next.id === ",") {
        if (!state.option.elision) {
          if (!state.inES5()) {
            // Maintain compat with old options --- ES5 mode without
            // elision=true will warn once per comma
            warning("W070");
          } else {
            warning("W128");
            do {
              advance(",");
            } while (state.tokens.next.id === ",");
            continue;
          }
        }
        advance(",");
      }

      if (state.tokens.next.id === "]") {
        break;
      }

      spreadrest("spread");

      this.first.push(expression(10, context));
      if (state.tokens.next.id === ",") {
        parseComma({ allowTrailing: true });
        if (state.tokens.next.id === "]" && !state.inES5()) {
          warning("W070", state.tokens.curr);
          break;
        }
      } else {
        if (state.option.trailingcomma && state.inES5()) {
          warningAt("W140", state.tokens.curr.line, state.tokens.curr.character);
        }
        break;
      }
    }
    if (b) {
      indent -= state.option.indent;
    }
    advance("]", this);
    return this;
  });


  function isMethod() {
    return state.funct["(statement)"] && state.funct["(statement)"].type === "class" ||
           state.funct["(context)"] && state.funct["(context)"]["(verb)"] === "class";
  }


  /**
   * Determine if the provided token may describe a property name in a class
   * body.
   *
   * @param {object} token
   *
   * @returns {boolean}
   */
  function isPropertyName(token) {
    return token.identifier || token.id === "(string)" || token.id === "(number)";
  }


  function propertyName(preserveOrToken) {
    var id;
    var preserve = true;
    if (typeof preserveOrToken === "object") {
      id = preserveOrToken;
    } else {
      preserve = preserveOrToken;
      id = optionalidentifier(true, preserve);
    }

    if (!id) {
      if (state.tokens.next.id === "(string)") {
        id = state.tokens.next.value;
        if (!preserve) {
          advance();
        }
      } else if (state.tokens.next.id === "(number)") {
        id = state.tokens.next.value.toString();
        if (!preserve) {
          advance();
        }
      }
    } else if (typeof id === "object") {
      if (id.id === "(string)" || id.id === "(identifier)") id = id.value;
      else if (id.id === "(number)") id = id.value.toString();
    }

    if (id === "hasOwnProperty") {
      warning("W001");
    }

    return id;
  }

  /**
   * @param {Number} context The parsing context
   * @param {Object} [options]
   * @param {token} [options.loneArg] The argument to the function in cases
   *                                  where it was defined using the
   *                                  single-argument shorthand.
   * @param {bool} [options.parsedOpening] Whether the opening parenthesis has
   *                                       already been parsed.
   *
   * @returns {{ arity: number, params: Array.<string>, isSimple: boolean }}
   */
  function functionparams(context, options) {
    var next;
    var paramsIds = [];
    var ident;
    var tokens = [];
    var t;
    var pastDefault = false;
    var pastRest = false;
    var arity = 0;
    var loneArg = options && options.loneArg;
    var hasDestructuring = false;

    if (loneArg && loneArg.identifier === true) {
      state.funct["(scope)"].addParam(loneArg.value, loneArg);
      return { arity: 1, params: [ loneArg.value ], isSimple: true };
    }

    next = state.tokens.next;

    if (!options || !options.parsedOpening) {
      advance("(");
    }

    if (state.tokens.next.id === ")") {
      advance(")");
      return;
    }

    function addParam(addParamArgs) {
      state.funct["(scope)"].addParam.apply(state.funct["(scope)"], addParamArgs);
    }

    for (;;) {
      arity++;
      // are added to the param scope
      var currentParams = [];

      if (_.includes(["{", "["], state.tokens.next.id)) {
        hasDestructuring = true;
        tokens = destructuringPattern(context);
        for (t in tokens) {
          t = tokens[t];
          if (t.id) {
            paramsIds.push(t.id);
            currentParams.push([t.id, t.token]);
          }
        }
      } else {
        pastRest = spreadrest("rest");
        ident = identifier();
        if (ident) {
          paramsIds.push(ident);
          currentParams.push([ident, state.tokens.curr]);
        } else {
          // Skip invalid parameter.
          while (!checkPunctuators(state.tokens.next, [",", ")"])) advance();
        }
      }

      // It is valid to have a regular argument after a default argument
      // since undefined can be used for missing parameters. Still warn as it is
      // a possible code smell.
      if (pastDefault) {
        if (state.tokens.next.id !== "=") {
          error("W138", state.tokens.curr);
        }
      }
      if (state.tokens.next.id === "=") {
        if (!state.inES6()) {
          warning("W119", state.tokens.next, "default parameters", "6");
        }

        if (pastRest) {
          error("E062", state.tokens.next);
        }

        advance("=");
        pastDefault = true;
        expression(10, context);
      }

      // now we have evaluated the default expression, add the variable to the param scope
      currentParams.forEach(addParam);

      if (state.tokens.next.id === ",") {
        if (pastRest) {
          warning("W131", state.tokens.next);
        }
        parseComma();
      } else {
        advance(")", next);
        return {
          arity: arity,
          params: paramsIds,
          isSimple: !hasDestructuring && !pastRest && !pastDefault
        };
      }
    }
  }

  /**
   * Factory function for creating objects used to track statistics of function
   * literals.
   *
   * @param {string} name - the identifier name to associate with the function
   * @param {object} [token] - token responsible for creating the function
   *                           object
   * @param {object} [overwrites] - a collection of properties that should
   *                                override the corresponding default value of
   *                                the new "functor" object
   */
  function functor(name, token, overwrites) {
    var funct = {
      "(name)"      : name,
      "(breakage)"  : 0,
      "(loopage)"   : 0,
      // The strictness of the function body is tracked via a dedicated
      // property (as opposed to via the global `state` object) so that the
      // value can be referenced after the body has been fully parsed (i.e.
      // when validating the identifier used in function declarations and
      // function expressions).
      "(isStrict)"  : "unknown",

      "(global)"    : false,

      "(line)"      : null,
      "(character)" : null,
      "(metrics)"   : null,
      "(statement)" : null,
      "(context)"   : null,
      "(scope)"     : null,
      "(comparray)" : null,
      "(generator)" : null,
      "(arrow)"     : null,
      "(params)"    : null
    };

    if (token) {
      _.extend(funct, {
        "(line)"     : token.line,
        "(character)": token.character,
        "(metrics)"  : createMetrics(token)
      });
    }

    _.extend(funct, overwrites);

    if (funct["(context)"]) {
      funct["(scope)"] = funct["(context)"]["(scope)"];
      funct["(comparray)"]  = funct["(context)"]["(comparray)"];
    }

    return funct;
  }

  /**
   * Determine if the parser has begun parsing executable code.
   *
   * @param {Token} funct - The current "functor" token
   *
   * @returns {boolean}
   */
  function hasParsedCode(funct) {
    return funct["(global)"] && !funct["(verb)"];
  }

  /**
   * This function is used as both a null-denotation method *and* a
   * left-denotation method, meaning the first parameter is overloaded.
   */
  function doTemplateLiteral(context, leftOrRbp) {
    // ASSERT: this.type === "(template)"
    // jshint validthis: true
    var ctx = this.context;
    var noSubst = this.noSubst;
    var depth = this.depth;
    var left = typeof leftOrRbp === "number" ? null : leftOrRbp;

    if (!noSubst) {
      while (!end()) {
        if (!state.tokens.next.template || state.tokens.next.depth > depth) {
          expression(0, context); // should probably have different rbp?
        } else {
          // skip template start / middle
          advance();
        }
      }
    }

    return {
      id: "(template)",
      type: "(template)",
      tag: left
    };

    function end() {
      if (state.tokens.curr.template && state.tokens.curr.tail &&
          state.tokens.curr.context === ctx) return true;
      var complete = (state.tokens.next.template && state.tokens.next.tail &&
                      state.tokens.next.context === ctx);
      if (complete) advance();
      return complete || state.tokens.next.isUnclosed;
    }
  }

  /**
   * Parse a function literal.
   *
   * @param {Number} context The parsing context
   * @param {Object} [options]
   * @param {string} [options.name] The identifier belonging to the function (if
   *                                any)
   * @param {token} [options.statement] The statement that triggered creation
   *                                    of the current function.
   * @param {string} [options.type] If specified, either "generator" or "arrow"
   * @param {token} [options.loneArg] The argument to the function in cases
   *                                  where it was defined using the
   *                                  single-argument shorthand
   * @param {bool} [options.parsedOpening] Whether the opening parenthesis has
   *                                       already been parsed
   * @param {string} [options.classExprBinding] Define a function with this
   *                                            identifier in the new function's
   *                                            scope, mimicking the bahavior of
   *                                            class expression names within
   *                                            the body of member functions.
   */
  function doFunction(context, options) {
    var f, token, name, statement, classExprBinding, isGenerator, isArrow,
      isMethod, ignoreLoopFunc;
    var oldOption = state.option;
    var oldIgnored = state.ignored;

    if (options) {
      name = options.name;
      statement = options.statement;
      classExprBinding = options.classExprBinding;
      isGenerator = options.type === "generator";
      isArrow = options.type === "arrow";
      isMethod = options.isMethod;
      ignoreLoopFunc = options.ignoreLoopFunc;
    }

    context &= ~prodParams.noin;

    state.option = Object.create(state.option);
    state.ignored = Object.create(state.ignored);

    state.funct = functor(name || state.nameStack.infer(), state.tokens.next, {
      "(statement)": statement,
      "(context)":   state.funct,
      "(arrow)":     isArrow,
      "(method)":    isMethod,
      "(generator)": isGenerator
    });

    f = state.funct;
    token = state.tokens.curr;

    functions.push(state.funct);

    // So that the function is available to itself and referencing itself is not
    // seen as a closure, add the function name to a new scope, but do not
    // test for unused (unused: false)
    // it is a new block scope so that params can override it, it can be block scoped
    // but declarations inside the function don't cause already declared error
    state.funct["(scope)"].stack("functionouter");
    var internallyAccessibleName = name || classExprBinding;
    if (internallyAccessibleName) {
      state.funct["(scope)"].block.add(internallyAccessibleName,
        classExprBinding ? "class" : "function", state.tokens.curr, false);
    }

    if (!isArrow) {
      state.funct["(scope)"].funct.add("arguments", "var", token, false);
    }

    // create the param scope (params added in functionparams)
    state.funct["(scope)"].stack("functionparams");

    var paramsInfo = functionparams(context, options);

    if (paramsInfo) {
      state.funct["(params)"] = paramsInfo.params;
      state.funct["(hasSimpleParams)"] = paramsInfo.isSimple;
      state.funct["(metrics)"].arity = paramsInfo.arity;
      state.funct["(metrics)"].verifyMaxParametersPerFunction();
    } else {
      state.funct["(metrics)"].arity = 0;
      state.funct["(hasSimpleParams)"] = true;
    }

    if (isArrow) {
      if (!state.inES6(true)) {
        warning("W119", state.tokens.curr, "arrow function syntax (=>)", "6");
      }

      if (!options.loneArg) {
        advance("=>");
      }
    }

    block(context, false, true, true, isArrow);

    if (!state.option.noyield && isGenerator &&
        state.funct["(generator)"] !== "yielded") {
      warning("W124", state.tokens.curr);
    }

    if (state.funct["(isStrict)"] === true &&
      (name === "arguments" || name === "eval")) {
      error("E008", token);
    }

    state.funct["(metrics)"].verifyMaxStatementsPerFunction();
    state.funct["(metrics)"].verifyMaxComplexityPerFunction();
    state.funct["(unusedOption)"] = state.option.unused;
    state.option = oldOption;
    state.ignored = oldIgnored;
    state.funct["(last)"] = state.tokens.curr.line;
    state.funct["(lastcharacter)"] = state.tokens.curr.character;

    // unstack the params scope
    state.funct["(scope)"].unstack(); // also does usage and label checks

    // unstack the function outer stack
    state.funct["(scope)"].unstack();

    state.funct = state.funct["(context)"];

    if (!ignoreLoopFunc && !state.option.loopfunc && state.funct["(loopage)"]) {
      // If the function we just parsed accesses any non-local variables
      // trigger a warning. Otherwise, the function is safe even within
      // a loop.
      if (f["(outerMutables)"]) {
        warning("W083", token, f["(outerMutables)"].join(", "));
      }
    }

    return f;
  }

  function createMetrics(functionStartToken) {
    return {
      statementCount: 0,
      nestedBlockDepth: -1,
      ComplexityCount: 1,
      arity: 0,

      verifyMaxStatementsPerFunction: function() {
        if (state.option.maxstatements &&
          this.statementCount > state.option.maxstatements) {
          warning("W071", functionStartToken, this.statementCount);
        }
      },

      verifyMaxParametersPerFunction: function() {
        if (_.isNumber(state.option.maxparams) &&
          this.arity > state.option.maxparams) {
          warning("W072", functionStartToken, this.arity);
        }
      },

      verifyMaxNestedBlockDepthPerFunction: function() {
        if (state.option.maxdepth &&
          this.nestedBlockDepth > 0 &&
          this.nestedBlockDepth === state.option.maxdepth + 1) {
          warning("W073", null, this.nestedBlockDepth);
        }
      },

      verifyMaxComplexityPerFunction: function() {
        var max = state.option.maxcomplexity;
        var cc = this.ComplexityCount;
        if (max && cc > max) {
          warning("W074", functionStartToken, cc);
        }
      }
    };
  }

  function increaseComplexityCount() {
    state.funct["(metrics)"].ComplexityCount += 1;
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
        warning("W084");
      }
    }
  }

  /**
   * Validate the properties defined within an object literal or class body.
   * See the `saveAccessor` and `saveProperty` functions for more detail.
   *
   * @param {object} props - Collection of objects describing the properties
   *                         encountered
   */
  function checkProperties(props) {
    // Check for lonely setters if in the ES5 mode.
    if (state.inES5()) {
      for (var name in props) {
        if (props[name] && props[name].setterToken && !props[name].getterToken) {
          warning("W078", props[name].setterToken);
        }
      }
    }
  }

  function metaProperty(name, c) {
    if (checkPunctuator(state.tokens.next, ".")) {
      var left = state.tokens.curr.id;
      advance(".");
      var id = identifier();
      state.tokens.curr.isMetaProperty = true;
      if (name !== id) {
        error("E057", state.tokens.prev, left, id);
      } else {
        c();
      }
      return state.tokens.curr;
    }
  }

  (function(x) {
    x.nud = function(context) {
      var b, f, i, p, t, isGeneratorMethod = false, nextVal;
      var props = Object.create(null); // All properties, including accessors

      b = state.tokens.curr.line !== startLine(state.tokens.next);
      if (b) {
        indent += state.option.indent;
        if (state.tokens.next.from === indent + state.option.indent) {
          indent += state.option.indent;
        }
      }

      var blocktype = lookupBlockType();
      if (blocktype.isDestAssign) {
        this.destructAssign = destructuringPattern(context, {
            openingParsed: true,
            assignment: true
          });
        return this;
      }

      for (;;) {
        if (state.tokens.next.id === "}") {
          break;
        }

        nextVal = state.tokens.next.value;
        if (state.tokens.next.identifier &&
            (peekIgnoreEOL().id === "," || peekIgnoreEOL().id === "}")) {
          if (!state.inES6()) {
            warning("W104", state.tokens.next, "object short notation", "6");
          }
          i = propertyName(true);
          saveProperty(props, i, state.tokens.next);

          expression(10, context);

        } else if (peek().id !== ":" && (nextVal === "get" || nextVal === "set")) {
          advance(nextVal);

          if (!state.inES5()) {
            error("E034");
          }

          if (state.tokens.next.id === "[") {
            i = computedPropertyName();
          } else {
            i = propertyName();

            // ES6 allows for get() {...} and set() {...} method
            // definition shorthand syntax, so we don't produce an error
            // if linting ECMAScript 6 code.
            if (!i && !state.inES6()) {
              error("E035");
            }
          }

          // We don't want to save this getter unless it's an actual getter
          // and not an ES6 concise method
          if (i) {
            saveAccessor(nextVal, props, i, state.tokens.curr);
          }

          t = state.tokens.next;
          f = doFunction(context, { isMethod: true });
          p = f["(params)"];

          // Don't warn about getter/setter pairs if this is an ES6 concise method
          if (nextVal === "get" && i && p) {
            warning("W076", t, p[0], i);
          } else if (nextVal === "set" && i && f["(metrics)"].arity !== 1) {
            warning("W077", t, i);
          }

        } else if (spreadrest("spread")) {
          if (!state.option.unstable.objspreadrest) {
            warning("W143", state.tokens.next, "object spread property", "objspreadrest");
          }

          expression(10, context);
        } else {
          if (state.tokens.next.value === "*" && state.tokens.next.type === "(punctuator)") {
            if (!state.inES6()) {
              warning("W104", state.tokens.next, "generator functions", "6");
            }
            advance("*");
            isGeneratorMethod = true;
          } else {
            isGeneratorMethod = false;
          }

          if (state.tokens.next.id === "[") {
            i = computedPropertyName(context);
            state.nameStack.set(i);
          } else {
            state.nameStack.set(state.tokens.next);
            i = propertyName();
            saveProperty(props, i, state.tokens.next);

            if (typeof i !== "string") {
              break;
            }
          }

          if (state.tokens.next.value === "(") {
            if (!state.inES6()) {
              warning("W104", state.tokens.curr, "concise methods", "6");
            }
            doFunction(context, {
              isMethod: true,
              type: isGeneratorMethod ? "generator" : null
            });
          } else {
            advance(":");
            expression(10, context);
          }
        }

        countMember(i);

        if (state.tokens.next.id === ",") {
          parseComma({ allowTrailing: true, property: true });
          if (state.tokens.next.id === ",") {
            warning("W070", state.tokens.curr);
          } else if (state.tokens.next.id === "}" && !state.inES5()) {
            warning("W070", state.tokens.curr);
          }
        } else {
          if (state.option.trailingcomma && state.inES5()) {
            warningAt("W140", state.tokens.curr.line, state.tokens.curr.character);
          }
          break;
        }
      }
      if (b) {
        indent -= state.option.indent;
      }
      advance("}", this);

      checkProperties(props);

      return this;
    };
    x.fud = function() {
      error("E036", state.tokens.curr);
    };
  }(delim("{")));

  function destructuringPattern(context, options) {
    var isAssignment = options && options.assignment;

    context &= ~prodParams.noin;

    if (!state.inES6()) {
      warning("W104", state.tokens.curr,
        isAssignment ? "destructuring assignment" : "destructuring binding", "6");
    }

    return destructuringPatternRecursive(context, options);
  }

  function destructuringPatternRecursive(context, options) {
    var ids, idx;
    var identifiers = [];
    var openingParsed = options && options.openingParsed;
    var isAssignment = options && options.assignment;
    var recursiveOptions = isAssignment ? { assignment: isAssignment } : null;
    var firstToken = openingParsed ? state.tokens.curr : state.tokens.next;

    var nextInnerDE = function() {
      var ident;
      if (checkPunctuators(state.tokens.next, ["[", "{"])) {
        ids = destructuringPatternRecursive(context, recursiveOptions);
        for (idx = 0; idx < ids.length; idx++) {
          identifiers.push({ id: ids[idx].id, token: ids[idx].token });
        }
      } else if (checkPunctuator(state.tokens.next, ",")) {
        identifiers.push({ id: null, token: state.tokens.curr });
      } else if (checkPunctuator(state.tokens.next, "(")) {
        advance("(");
        nextInnerDE();
        advance(")");
      } else {
        if (isAssignment) {
          var assignTarget = expression(20, context);
          if (assignTarget) {
            checkLeftSideAssign(assignTarget);

            // if the target was a simple identifier, add it to the list to return
            if (assignTarget.identifier) {
              ident = assignTarget.value;
            }
          }
        } else {
          ident = identifier();
        }
        if (ident) {
          identifiers.push({ id: ident, token: state.tokens.curr });
        }
      }
    };

    var assignmentProperty = function(context) {
      var id, expr;

      if (checkPunctuator(state.tokens.next, "[")) {
        advance("[");
        expression(10, context);
        advance("]");
        advance(":");
        nextInnerDE();
      } else if (state.tokens.next.id === "(string)" ||
                 state.tokens.next.id === "(number)") {
        advance();
        advance(":");
        nextInnerDE();
      } else {
        // this id will either be the property name or the property name and the assigning identifier
        var isRest = spreadrest("rest");

        if (isRest) {
          if (!state.option.unstable.objspreadrest) {
            warning("W143", state.tokens.next, "object rest property", "objspreadrest");
          }

          // Due to visual symmetry with the array rest property (and the early
          // design of the language feature), developers may mistakenly assume
          // any expression is valid in this position.  Parse an expression and
          // issue an error in order to recover more gracefully from this
          // condition.
          expr = expression(10, context);

          if (expr.type !== "(identifier)") {
            error("E030", expr, expr.value);
          }
        } else {
          id = identifier();
        }

        if (!isRest && checkPunctuator(state.tokens.next, ":")) {
          advance(":");
          nextInnerDE();
        } else if (id) {
          // in this case we are assigning (not declaring), so check assignment
          if (isAssignment) {
            checkLeftSideAssign(state.tokens.curr);
          }
          identifiers.push({ id: id, token: state.tokens.curr });
        }

        if (isRest && checkPunctuator(state.tokens.next, ",")) {
          warning("W130", state.tokens.next);
        }
      }
    };

    var id, value;
    if (checkPunctuator(firstToken, "[")) {
      if (!openingParsed) {
        advance("[");
      }
      if (checkPunctuator(state.tokens.next, "]")) {
        warning("W137", state.tokens.curr);
      }
      var element_after_rest = false;
      while (!checkPunctuator(state.tokens.next, "]")) {
        var isRest = spreadrest("rest");

        nextInnerDE();

        if (isRest && !element_after_rest &&
            checkPunctuator(state.tokens.next, ",")) {
          warning("W130", state.tokens.next);
          element_after_rest = true;
        }
        if (!isRest && checkPunctuator(state.tokens.next, "=")) {
          if (checkPunctuator(state.tokens.prev, "...")) {
            advance("]");
          } else {
            advance("=");
          }
          id = state.tokens.prev;
          value = expression(10, context);
          if (value && value.identifier && value.value === "undefined") {
            warning("W080", id, id.value);
          }
        }
        if (!checkPunctuator(state.tokens.next, "]")) {
          advance(",");
        }
      }
      advance("]");
    } else if (checkPunctuator(firstToken, "{")) {

      if (!openingParsed) {
        advance("{");
      }
      if (checkPunctuator(state.tokens.next, "}")) {
        warning("W137", state.tokens.curr);
      }
      while (!checkPunctuator(state.tokens.next, "}")) {
        assignmentProperty(context);
        if (checkPunctuator(state.tokens.next, "=")) {
          advance("=");
          id = state.tokens.prev;
          value = expression(10, context);
          if (value && value.identifier && value.value === "undefined") {
            warning("W080", id, id.value);
          }
        }
        if (!checkPunctuator(state.tokens.next, "}")) {
          advance(",");
          if (checkPunctuator(state.tokens.next, "}")) {
            // Trailing comma
            // ObjectBindingPattern: { BindingPropertyList , }
            break;
          }
        }
      }
      advance("}");
    }
    return identifiers;
  }

  function destructuringPatternMatch(tokens, value) {
    var first = value.first;

    if (!first)
      return;

    _.zip(tokens, Array.isArray(first) ? first : [ first ]).forEach(function(val) {
      var token = val[0];
      var value = val[1];

      if (token && value)
        token.first = value;
      else if (token && token.first && !value)
        warning("W080", token.first, token.first.value);
    });
  }

  function blockVariableStatement(type, statement, context) {
    // used for both let and const statements

    var noin = context & prodParams.noin;
    var inexport = context & prodParams.export;
    var isLet = type === "let";
    var isConst = type === "const";
    var tokens, lone, value, letblock;

    if (!state.inES6()) {
      warning("W104", state.tokens.curr, type, "6");
    }

    if (isLet && isMozillaLet()) {
      advance("(");
      state.funct["(scope)"].stack();
      letblock = true;
    } else if (state.funct["(noblockscopedvar)"]) {
      error("E048", state.tokens.curr, isConst ? "Const" : "Let");
    }

    statement.first = [];
    for (;;) {
      var names = [];
      if (_.includes(["{", "["], state.tokens.next.value)) {
        tokens = destructuringPattern(context);
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr } ];
        lone = true;
      }

      // A `const` declaration without an initializer is permissible within the
      // head of for-in and for-of statements. If this binding list is being
      // parsed as part of a `for` statement of any kind, allow the initializer
      // to be omitted. Although this may erroneously allow such forms from
      // "C-style" `for` statements (i.e. `for (;;) {}`, the `for` statement
      // logic includes dedicated logic to issue the error for such cases.
      if (!noin && isConst && state.tokens.next.id !== "=") {
        warning("E012", state.tokens.curr, state.tokens.curr.value);
      }

      for (var t in tokens) {
        if (tokens.hasOwnProperty(t)) {
          t = tokens[t];

          // It is a Syntax Error if the BoundNames of BindingList contains
          // "let".
          if (t.id === "let") {
            warning("W024", t.token, t.id);
          }

          if (state.funct["(scope)"].block.isGlobal()) {
            if (predefined[t.id] === false) {
              warning("W079", t.token, t.id);
            }
          }
          if (t.id && !state.funct["(noblockscopedvar)"]) {
            state.funct["(scope)"].addlabel(t.id, {
              type: type,
              token: t.token });
            names.push(t.token);
          }
        }
      }

      if (state.tokens.next.id === "=") {
        statement.hasInitializer = true;

        advance("=");
        if (!noin && peek(0).id === "=" && state.tokens.next.identifier) {
          warning("W120", state.tokens.next, state.tokens.next.value);
        }
        var id = state.tokens.prev;
        value = expression(10, context);
        if (value && value.identifier && value.value === "undefined") {
          warning("W080", id, id.value);
        }
        if (!lone) {
          destructuringPatternMatch(names, value);
        }
      }

      // Bindings are not immediately initialized in for-in and for-of
      // statements. As with `const` initializers (described above), the `for`
      // statement parsing logic includes
      if (!noin) {
        for (t in tokens) {
          if (tokens.hasOwnProperty(t)) {
            t = tokens[t];
            state.funct["(scope)"].initialize(t.id);

            if (lone && inexport) {
              state.funct["(scope)"].setExported(t.token.value, t.token);
            }
          }
        }
      }

      statement.first = statement.first.concat(names);

      if (state.tokens.next.id !== ",") {
        break;
      }

      statement.hasComma = true;
      parseComma();
    }
    if (letblock) {
      advance(")");
      block(context, true, true);
      statement.block = true;
      state.funct["(scope)"].unstack();
    }

    return statement;
  }

  var conststatement = stmt("const", function(context) {
    return blockVariableStatement("const", this, context);
  });
  conststatement.exps = true;


  /**
   * Determine if the current `let` token designates the beginning of a "let
   * block" or "let expression" as implemented in the Mozilla SpiderMonkey
   * engine.
   *
   * This function will only return `true` if Mozilla extensions have been
   * enabled. It would be preferable to detect the language feature regardless
   * of the parser's state because this would allow JSHint to instruct users to
   * enable the `moz` option where necessary. This is not possible because the
   * language extension is not compatible with standard JavaScript. For
   * example, the following program code may describe a "let block" or a
   * function invocation:
   *
   *     let(x)
   *     {
   *       typeof x;
   *     }
   *
   * @returns {boolean}
   */
  function isMozillaLet() {
    return state.tokens.next.id === "(" && state.inMoz();
  }
  var letstatement = stmt("let", function(context) {
    return blockVariableStatement("let", this, context);
  });
  letstatement.nud = function(context, rbp) {
    if (isMozillaLet()) {
      // create a new block scope we use only for the current expression
      state.funct["(scope)"].stack();
      advance("(");
      state.tokens.prev.fud(context);
      advance(")");
      expression(rbp, context);
      state.funct["(scope)"].unstack();
    } else {
      this.exps = false;
      return state.syntax["(identifier)"].nud.apply(this, arguments);
    }
  };
  letstatement.meta = { es5: true, isFutureReservedWord: true, strictOnly: true };
  letstatement.exps = true;
  letstatement.useFud = function() {
    var next = state.tokens.next;
    var nextIsBindingName;

    if (this.line !== next.line && !state.inES6()) {
      return false;
    }

    // JSHint generally interprets `let` as a reserved word even though it is
    // not considered as such by the ECMAScript specification because doing so
    // simplifies parsing logic. It is special-cased here so that code such as
    //
    //     let
    //     let
    //
    // is correctly interpreted as an invalid LexicalBinding. (Without this
    // consideration, the code above would be parsed as two
    // IdentifierReferences.)
    nextIsBindingName = next.identifier && (!isReserved(next) ||
      next.id === "let");

    return nextIsBindingName || checkPunctuators(next, ["{", "["]) ||
      isMozillaLet();
  };

  var varstatement = stmt("var", function(context) {
    var noin = context & prodParams.noin;
    var inexport = context & prodParams.export;
    var tokens, lone, value, id;

    this.first = [];
    for (;;) {
      var names = [];
      if (_.includes(["{", "["], state.tokens.next.value)) {
        tokens = destructuringPattern(context);
        lone = false;
      } else {
        tokens = [];
        id = identifier();

        if (id) {
          tokens.push({ id: id, token: state.tokens.curr });
        }

        lone = true;
      }

      if (state.option.varstmt) {
        warning("W132", this);
      }


      for (var t in tokens) {
        if (tokens.hasOwnProperty(t)) {
          t = tokens[t];
          if (state.funct["(global)"] && !state.impliedClosure()) {
            if (predefined[t.id] === false) {
              warning("W079", t.token, t.id);
            } else if (state.option.futurehostile === false) {
              if ((!state.inES5() && vars.ecmaIdentifiers[5][t.id] === false) ||
                (!state.inES6() && vars.ecmaIdentifiers[6][t.id] === false)) {
                warning("W129", t.token, t.id);
              }
            }
          }
          if (t.id) {
            state.funct["(scope)"].addlabel(t.id, {
              type: "var",
              token: t.token });

            if (lone && inexport) {
              state.funct["(scope)"].setExported(t.id, t.token);
            }
            names.push(t.token);
          }
        }
      }

      if (state.tokens.next.id === "=") {
        this.hasInitializer = true;

        state.nameStack.set(state.tokens.curr);

        advance("=");
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          if (!noin &&
              !state.funct["(params)"] ||
              state.funct["(params)"].indexOf(state.tokens.next.value) === -1) {
            warning("W120", state.tokens.next, state.tokens.next.value);
          }
        }
        id = state.tokens.prev;
        value = expression(10, context);
        if (value && !state.funct["(loopage)"] && value.identifier &&
          value.value === "undefined") {
          warning("W080", id, id.value);
        }
        if (!lone) {
          destructuringPatternMatch(names, value);
        }
      }

      this.first = this.first.concat(names);

      if (state.tokens.next.id !== ",") {
        break;
      }
      this.hasComma = true;
      parseComma();
    }

    return this;
  });
  varstatement.exps = true;

  blockstmt("class", function(context, rbp) {
    return classdef.call(this, context, rbp, true);
  });

  function classdef(context, rbp, isStatement) {

    /*jshint validthis:true */
    var wasInClassBody = state.inClassBody;
    state.inClassBody = true;

    if (!state.inES6()) {
      warning("W104", state.tokens.curr, "class", "6");
    }
    if (isStatement) {
      // BindingIdentifier
      this.name = identifier();

      state.funct["(scope)"].addlabel(this.name, {
        type: "class",
        token: state.tokens.curr });

    } else if (state.tokens.next.identifier && state.tokens.next.value !== "extends") {
      // BindingIdentifier(opt)
      this.name = identifier();
      this.namedExpr = true;
    } else {
      this.name = state.nameStack.infer();
    }

    classtail(context, this);

    state.inClassBody = wasInClassBody;

    if (isStatement) {
      state.funct["(scope)"].initialize(this.name);
    }

    return this;
  }

  function classtail(context, c) {
    // ClassHeritage(opt)
    if (state.tokens.next.value === "extends") {
      advance("extends");
      expression(10, context);
    }

    advance("{");
    // ClassBody(opt)
    classbody(context, c);
    advance("}");
  }

  function classbody(context, c) {
    var name;
    var isStatic;
    var isGenerator;
    var getset;
    var props = Object.create(null);
    var staticProps = Object.create(null);
    var computed;
    while (state.tokens.next.id !== "}") {
      name = state.tokens.next;
      isStatic = false;
      isGenerator = false;
      getset = null;

      // The ES6 grammar for ClassElement includes the `;` token, but it is
      // defined only as a placeholder to facilitate future language
      // extensions. In ES6 code, it serves no purpose.
      if (name.id === ";") {
        warning("W032");
        advance(";");
        continue;
      }

      if (name.id === "*") {
        isGenerator = true;
        advance("*");
        name = state.tokens.next;
      }
      if (name.id === "[") {
        name = computedPropertyName(context);
        computed = true;
      } else if (isPropertyName(name)) {
        // Non-Computed PropertyName
        advance();
        computed = false;
        if (name.identifier && name.value === "static") {
          if (checkPunctuator(state.tokens.next, "*")) {
            isGenerator = true;
            advance("*");
          }
          if (isPropertyName(state.tokens.next) || state.tokens.next.id === "[") {
            computed = state.tokens.next.id === "[";
            isStatic = true;
            name = state.tokens.next;
            if (state.tokens.next.id === "[") {
              name = computedPropertyName(context);
            } else advance();
          }
        }

        if (name.identifier && (name.value === "get" || name.value === "set")) {
          if (isPropertyName(state.tokens.next) || state.tokens.next.id === "[") {
            computed = state.tokens.next.id === "[";
            getset = name;
            name = state.tokens.next;
            if (state.tokens.next.id === "[") {
              name = computedPropertyName(context);
            } else advance();
          }
        }
      } else {
        warning("W052", state.tokens.next, state.tokens.next.value || state.tokens.next.type);
        advance();
        continue;
      }

      if (!checkPunctuator(state.tokens.next, "(")) {
        // error --- class properties must be methods
        error("E054", state.tokens.next, state.tokens.next.value);
        while (state.tokens.next.id !== "}" &&
               !checkPunctuator(state.tokens.next, "(")) {
          advance();
        }
        if (state.tokens.next.value !== "(") {
          doFunction(context, {
            isMethod: true,
            statement: c
          });
        }
      }

      if (!computed) {
        // We don't know how to determine if we have duplicate computed property names :(
        if (getset) {
          saveAccessor(
            getset.value, isStatic ? staticProps : props, name.value, name, true, isStatic);
        } else {
          if (name.value === "constructor") {
            state.nameStack.set(c);
          } else {
            state.nameStack.set(name);
          }
          saveProperty(isStatic ? staticProps : props, name.value, name, true, isStatic);
        }
      }

      if (getset && name.value === "constructor") {
        var propDesc = getset.value === "get" ? "class getter method" : "class setter method";
        error("E049", name, propDesc, "constructor");
      } else if (name.value === "prototype") {
        error("E049", name, "class method", "prototype");
      }

      propertyName(name);

      doFunction(context, {
        statement: c,
        isMethod: true,
        type: isGenerator ? "generator" : null,
        classExprBinding: c.namedExpr ? c.name : null
      });
    }

    checkProperties(props);
  }

  blockstmt("function", function(context) {
    var inexport = context & prodParams.export;
    var generator = false;
    if (state.tokens.next.value === "*") {
      advance("*");
      if (state.inES6(true)) {
        generator = true;
      } else {
        warning("W119", state.tokens.curr, "function*", "6");
      }
    }
    if (inblock) {
      warning("W082", state.tokens.curr);
    }
    var i = optionalidentifier();

    if (i === undefined) {
      warning("W025");
    } else {
      state.funct["(scope)"].addlabel(i, {
        type: generator ? "generator function" : "function",
        token: state.tokens.curr,
        initialized: true });

      if (inexport) {
        state.funct["(scope)"].setExported(i, state.tokens.prev);
      }
    }

    doFunction(context, {
      name: i,
      statement: this,
      type: generator ? "generator" : null,
      ignoreLoopFunc: inblock // a declaration may already have warned
    });
    if (state.tokens.next.id === "(" && state.tokens.next.line === state.tokens.curr.line) {
      error("E039");
    }
    return this;
  });

  prefix("function", function(context) {
    var generator = false;

    if (state.tokens.next.value === "*") {
      if (!state.inES6()) {
        warning("W119", state.tokens.curr, "function*", "6");
      }
      advance("*");
      generator = true;
    }

    var i = optionalidentifier();
    doFunction(context, { name: i, type: generator ? "generator" : null });
    return this;
  });

  blockstmt("if", function(context) {
    var t = state.tokens.next;
    increaseComplexityCount();
    state.condition = true;
    advance("(");
    var expr = expression(0, context);

    if (!expr) {
      quit("E041", this);
    }

    checkCondAssignment(expr);

    // When the if is within a for-in loop, check if the condition
    // starts with a negation operator
    var forinifcheck = null;
    if (state.option.forin && state.forinifcheckneeded) {
      state.forinifcheckneeded = false; // We only need to analyze the first if inside the loop
      forinifcheck = state.forinifchecks[state.forinifchecks.length - 1];
      if (expr.type === "(punctuator)" && expr.value === "!") {
        forinifcheck.type = "(negative)";
      } else {
        forinifcheck.type = "(positive)";
      }
    }

    advance(")", t);
    state.condition = false;
    var s = block(context, true, true);

    // When the if is within a for-in loop and the condition has a negative form,
    // check if the body contains nothing but a continue statement
    if (forinifcheck && forinifcheck.type === "(negative)") {
      if (s && s[0] && s[0].type === "(identifier)" && s[0].value === "continue") {
        forinifcheck.type = "(negative-with-continue)";
      }
    }

    if (state.tokens.next.id === "else") {
      advance("else");
      if (state.tokens.next.id === "if" || state.tokens.next.id === "switch") {
        statement(context);
      } else {
        block(context, true, true);
      }
    }
    return this;
  });

  blockstmt("try", function(context) {
    var b;

    function doCatch() {
      advance("catch");
      advance("(");

      state.funct["(scope)"].stack("catchparams");

      if (checkPunctuators(state.tokens.next, ["[", "{"])) {
        var tokens = destructuringPattern(context);
        _.each(tokens, function(token) {
          if (token.id) {
            state.funct["(scope)"].addParam(token.id, token, "exception");
          }
        });
      } else if (state.tokens.next.type !== "(identifier)") {
        warning("E030", state.tokens.next, state.tokens.next.value);
      } else {
        // only advance if an identifier is present. This allows JSHint to
        // recover from the case where no value is specified.
        state.funct["(scope)"].addParam(identifier(), state.tokens.curr, "exception");
      }

      if (state.tokens.next.value === "if") {
        if (!state.inMoz()) {
          warning("W118", state.tokens.curr, "catch filter");
        }
        advance("if");
        expression(0, context);
      }

      advance(")");

      block(context, false);

      state.funct["(scope)"].unstack();
    }

    block(context, true);

    while (state.tokens.next.id === "catch") {
      increaseComplexityCount();
      if (b && (!state.inMoz())) {
        warning("W118", state.tokens.next, "multiple catch blocks");
      }
      doCatch();
      b = true;
    }

    if (state.tokens.next.id === "finally") {
      advance("finally");
      block(context, true);
      return;
    }

    if (!b) {
      error("E021", state.tokens.next, "catch", state.tokens.next.value);
    }

    return this;
  });

  blockstmt("while", function(context) {
    var t = state.tokens.next;
    state.funct["(breakage)"] += 1;
    state.funct["(loopage)"] += 1;
    increaseComplexityCount();
    advance("(");
    checkCondAssignment(expression(0, context));
    advance(")", t);
    block(context, true, true);
    state.funct["(breakage)"] -= 1;
    state.funct["(loopage)"] -= 1;
    return this;
  }).labelled = true;

  blockstmt("with", function(context) {
    var t = state.tokens.next;
    if (state.isStrict()) {
      error("E010", state.tokens.curr);
    } else if (!state.option.withstmt) {
      warning("W085", state.tokens.curr);
    }

    advance("(");
    expression(0, context);
    advance(")", t);
    block(context, true, true);

    return this;
  });

  blockstmt("switch", function(context) {
    var t = state.tokens.next;
    var g = false;
    var noindent = false;

    state.funct["(breakage)"] += 1;
    advance("(");
    checkCondAssignment(expression(0, context));
    advance(")", t);
    t = state.tokens.next;
    advance("{");
    state.funct["(scope)"].stack();

    if (state.tokens.next.from === indent)
      noindent = true;

    if (!noindent)
      indent += state.option.indent;

    this.cases = [];

    for (;;) {
      switch (state.tokens.next.id) {
      case "case":
        switch (state.funct["(verb)"]) {
        case "yield":
        case "break":
        case "case":
        case "continue":
        case "return":
        case "switch":
        case "throw":
          break;
        case "default":
          if (state.option.leanswitch) {
            warning("W144", state.tokens.next);
          }

          break;
        default:
          // You can tell JSHint that you don't use break intentionally by
          // adding a comment /* falls through */ on a line just before
          // the next `case`.
          if (!state.tokens.curr.caseFallsThrough) {
            warning("W086", state.tokens.curr, "case");
          }
        }

        advance("case");
        this.cases.push(expression(0, context));
        increaseComplexityCount();
        g = true;
        advance(":");
        state.funct["(verb)"] = "case";
        break;
      case "default":
        switch (state.funct["(verb)"]) {
        case "yield":
        case "break":
        case "continue":
        case "return":
        case "throw":
          break;
        case "case":
          if (state.option.leanswitch) {
            warning("W144", state.tokens.curr);
          }

          break;
        default:
          // Do not display a warning if 'default' is the first statement or if
          // there is a special /* falls through */ comment.
          if (this.cases.length) {
            if (!state.tokens.curr.caseFallsThrough) {
              warning("W086", state.tokens.curr, "default");
            }
          }
        }

        advance("default");
        g = true;
        advance(":");
        state.funct["(verb)"] = "default";
        break;
      case "}":
        if (!noindent)
          indent -= state.option.indent;

        advance("}", t);
        state.funct["(scope)"].unstack();
        state.funct["(breakage)"] -= 1;
        state.funct["(verb)"] = undefined;
        return;
      case "(end)":
        error("E023", state.tokens.next, "}");
        return;
      default:
        indent += state.option.indent;
        if (g) {
          switch (state.tokens.curr.id) {
          case ",":
            error("E040");
            return;
          case ":":
            g = false;
            statements(context);
            break;
          default:
            error("E025", state.tokens.curr);
            return;
          }
        } else {
          if (state.tokens.curr.id === ":") {
            advance(":");
            error("E024", state.tokens.curr, ":");
            statements(context);
          } else {
            error("E021", state.tokens.next, "case", state.tokens.next.value);
            return;
          }
        }
        indent -= state.option.indent;
      }
    }
  }).labelled = true;

  stmt("debugger", function() {
    if (!state.option.debug) {
      warning("W087", this);
    }
    return this;
  }).exps = true;

  (function() {
    var x = stmt("do", function(context) {
      state.funct["(breakage)"] += 1;
      state.funct["(loopage)"] += 1;
      increaseComplexityCount();

      this.first = block(context, true, true);
      advance("while");
      var t = state.tokens.next;
      advance("(");
      checkCondAssignment(expression(0, context));
      advance(")", t);
      state.funct["(breakage)"] -= 1;
      state.funct["(loopage)"] -= 1;
      return this;
    });
    x.labelled = true;
    x.exps = true;
  }());

  blockstmt("for", function(context) {
    var s, t = state.tokens.next;
    var letscope = false;
    var foreachtok = null;

    if (t.value === "each") {
      foreachtok = t;
      advance("each");
      if (!state.inMoz()) {
        warning("W118", state.tokens.curr, "for each");
      }
    }

    increaseComplexityCount();
    advance("(");

    // what kind of for(…) statement it is? for(…of…)? for(…in…)? for(…;…;…)?
    var nextop; // contains the token of the "in" or "of" operator
    var comma; // First comma punctuator at level 0
    var initializer; // First initializer at level 0
    var bindingPower;
    var targets;
    var target;
    var decl;
    var afterNext = peek();

    var headContext = context | prodParams.noin;

    if (state.tokens.next.id === "var") {
      advance("var");
      decl = state.tokens.curr.fud(headContext);
      comma = decl.hasComma ? decl : null;
      initializer = decl.hasInitializer ? decl : null;
    } else if (state.tokens.next.id === "const" ||
      // The "let" keyword only signals a lexical binding if it is followed by
      // an identifier, `{`, or `[`. Otherwise, it should be parsed as an
      // IdentifierReference (i.e. in a subsquent branch).
      (state.tokens.next.id === "let" &&
        ((afterNext.identifier && afterNext.id !== "in") ||
         checkPunctuators(afterNext, ["{", "["])))) {
      advance(state.tokens.next.id);
      // create a new block scope
      letscope = true;
      state.funct["(scope)"].stack();
      decl = state.tokens.curr.fud(headContext);
      comma = decl.hasComma ? decl : null;
      initializer = decl.hasInitializer ? decl : null;
    } else if (!checkPunctuator(state.tokens.next, ";")) {
      targets = [];

      while (state.tokens.next.value !== "in" &&
        state.tokens.next.value !== "of" &&
        !checkPunctuator(state.tokens.next, ";")) {

        if (checkPunctuators(state.tokens.next, ["{", "["])) {
          destructuringPattern(headContext, { assignment: true })
            .forEach(function(elem) {
              this.push(elem.token);
            }, targets);
          if (checkPunctuator(state.tokens.next, "=")) {
            advance("=");
            initializer = state.tokens.curr;
            expression(10, headContext);
          }
        } else {
          target = expression(10, headContext);

          if (target) {
            if (target.type === "(identifier)") {
              targets.push(target);
            } else if (checkPunctuator(target, "=")) {
              initializer = target;
              targets.push(target);
            }
          }
        }

        if (checkPunctuator(state.tokens.next, ",")) {
          advance(",");

          if (!comma) {
            comma = state.tokens.curr;
          }
        }
      }

      //checkLeftSideAssign(target, nextop);

      // In the event of a syntax error, do no issue warnings regarding the
      // implicit creation of bindings.
      if (!initializer && !comma) {
        targets.forEach(function(token) {
          if (!state.funct["(scope)"].has(token.value)) {
            warning("W088", token, token.value);
          }
        });
      }
    }

    nextop = state.tokens.next;

    // if we're in a for (… in|of …) statement
    if (_.includes(["in", "of"], nextop.value)) {
      if (nextop.value === "of") {
        bindingPower = 20;

        if (!state.inES6()) {
          warning("W104", nextop, "for of", "6");
        }
      } else {
        bindingPower = 0;
      }
      if (comma) {
        error("W133", comma, nextop.value, "more than one ForBinding");
      }
      if (initializer) {
        error("W133", initializer, nextop.value, "initializer is forbidden");
      }
      if (target && !comma && !initializer) {
        checkLeftSideAssign(target, nextop);
      }

      advance(nextop.value);

      // The binding power is variable because for-in statements accept any
      // Expression in this position, while for-of statements are limited to
      // AssignmentExpressions. For example:
      //
      //     for ( LeftHandSideExpression in Expression ) Statement
      //     for ( LeftHandSideExpression of AssignmentExpression ) Statement
      expression(bindingPower, context);
      advance(")", t);

      if (nextop.value === "in" && state.option.forin) {
        state.forinifcheckneeded = true;

        if (state.forinifchecks === undefined) {
          state.forinifchecks = [];
        }

        // Push a new for-in-if check onto the stack. The type will be modified
        // when the loop's body is parsed and a suitable if statement exists.
        state.forinifchecks.push({
          type: "(none)"
        });
      }

      state.funct["(breakage)"] += 1;
      state.funct["(loopage)"] += 1;

      s = block(context, true, true);

      if (nextop.value === "in" && state.option.forin) {
        if (state.forinifchecks && state.forinifchecks.length > 0) {
          var check = state.forinifchecks.pop();

          if (// No if statement or not the first statement in loop body
              s && s.length > 0 && (typeof s[0] !== "object" || s[0].value !== "if") ||
              // Positive if statement is not the only one in loop body
              check.type === "(positive)" && s.length > 1 ||
              // Negative if statement but no continue
              check.type === "(negative)") {
            warning("W089", this);
          }
        }

        // Reset the flag in case no if statement was contained in the loop body
        state.forinifcheckneeded = false;
      }

      state.funct["(breakage)"] -= 1;
      state.funct["(loopage)"] -= 1;

    } else {
      if (foreachtok) {
        error("E045", foreachtok);
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      if (decl) {
        decl.first.forEach(function(token) {
          state.funct["(scope)"].initialize(token.value);
        });
      }

      // start loopage after the first ; as the next two expressions are executed
      // on every loop
      state.funct["(loopage)"] += 1;
      if (state.tokens.next.id !== ";") {
        checkCondAssignment(expression(0, context));
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      if (state.tokens.next.id === ";") {
        error("E021", state.tokens.next, ")", ";");
      }
      if (state.tokens.next.id !== ")") {
        for (;;) {
          expression(0, context);
          if (state.tokens.next.id !== ",") {
            break;
          }
          parseComma();
        }
      }
      advance(")", t);
      state.funct["(breakage)"] += 1;
      block(context, true, true);
      state.funct["(breakage)"] -= 1;
      state.funct["(loopage)"] -= 1;
    }

    // unstack loop blockscope
    if (letscope) {
      state.funct["(scope)"].unstack();
    }
    return this;
  }).labelled = true;


  stmt("break", function() {
    var v = state.tokens.next.value;

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach &&
        state.tokens.curr.line === startLine(state.tokens.next)) {
      if (!state.funct["(scope)"].funct.hasBreakLabel(v)) {
        warning("W090", state.tokens.next, v);
      }
      this.first = state.tokens.next;
      advance();
    } else {
      if (state.funct["(breakage)"] === 0)
        warning("W052", state.tokens.next, this.value);
    }

    reachable(this);

    return this;
  }).exps = true;


  stmt("continue", function() {
    var v = state.tokens.next.value;

    if (state.funct["(breakage)"] === 0 || !state.funct["(loopage)"]) {
      warning("W052", state.tokens.next, this.value);
    }

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
      if (state.tokens.curr.line === startLine(state.tokens.next)) {
        if (!state.funct["(scope)"].funct.hasBreakLabel(v)) {
          warning("W090", state.tokens.next, v);
        }
        this.first = state.tokens.next;
        advance();
      }
    }

    reachable(this);

    return this;
  }).exps = true;


  stmt("return", function(context) {
    if (this.line === startLine(state.tokens.next)) {
      if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
        this.first = expression(0, context);

        if (this.first &&
            this.first.type === "(punctuator)" && this.first.value === "=" &&
            !this.first.paren && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      }
    } else {
      if (state.tokens.next.type === "(punctuator)" &&
        ["[", "{", "+", "-"].indexOf(state.tokens.next.value) > -1) {
        nolinebreak(this); // always warn (Line breaking error)
      }
    }

    reachable(this);

    return this;
  }).exps = true;

  (function(x) {
    x.exps = true;
    x.lbp = x.rbp = 25;
    x.ltBoundary = "after";
  }(prefix("yield", function(context) {
    if (state.inMoz()) {
      return mozYield.call(this, context);
    }
    var prev = state.tokens.prev;

    if (!this.beginsStmt && prev.lbp > 30 && !checkPunctuators(prev, ["("])) {
      error("E061", this);
    }

    if (state.inES6(true) && !state.funct["(generator)"]) {
      // If it's a yield within a catch clause inside a generator then that's ok
      if (!("(catch)" === state.funct["(name)"] && state.funct["(context)"]["(generator)"])) {
        error("E046", state.tokens.curr, "yield");
      }
    } else if (!state.inES6()) {
      warning("W104", state.tokens.curr, "yield", "6");
    }
    state.funct["(generator)"] = "yielded";

    if (state.tokens.next.value === "*") {
      advance("*");
    }

    // Parse operand
    if (!isEndOfExpr() && state.tokens.next.id !== ",") {
      if (state.tokens.next.nud) {

        nobreaknonadjacent(state.tokens.curr, state.tokens.next);
        this.first = expression(10, context);

        if (this.first.type === "(punctuator)" && this.first.value === "=" &&
            !this.first.paren && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      } else if (state.tokens.next.led) {
        if (state.tokens.next.id !== ",") {
          error("W017", state.tokens.next);
        }
      }
    }

    return this;
  })));

  /**
   * Parsing logic for non-standard Mozilla implementation of `yield`
   * expressions.
   */
  var mozYield = function(context) {
    var prev = state.tokens.prev;
    if (state.inES6(true) && !state.funct["(generator)"]) {
      // If it's a yield within a catch clause inside a generator then that's ok
      if (!("(catch)" === state.funct["(name)"] && state.funct["(context)"]["(generator)"])) {
        error("E046", state.tokens.curr, "yield");
      }
    }
    state.funct["(generator)"] = "yielded";
    var delegatingYield = false;

    if (state.tokens.next.value === "*") {
      delegatingYield = true;
      advance("*");
    }

    if (this.line === startLine(state.tokens.next)) {
      if (delegatingYield ||
          (state.tokens.next.id !== ";" && !state.option.asi &&
           !state.tokens.next.reach && state.tokens.next.nud)) {

        nobreaknonadjacent(state.tokens.curr, state.tokens.next);
        this.first = expression(10, context);

        if (this.first.type === "(punctuator)" && this.first.value === "=" &&
            !this.first.paren && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      }

      if (state.tokens.next.id !== ")" &&
          (prev.lbp > 30 || (!prev.assign && !isEndOfExpr()) || prev.id === "yield")) {
        error("E050", this);
      }
    } else if (!state.option.asi) {
      nolinebreak(this); // always warn (Line breaking error)
    }
    return this;
  };

  stmt("throw", function(context) {
    nolinebreak(this);
    this.first = expression(20, context);

    reachable(this);

    return this;
  }).exps = true;

  stmt("import", function() {
    if (!state.funct["(scope)"].block.isGlobal()) {
      error("E053", state.tokens.curr, "Import");
    }

    if (!state.inES6()) {
      warning("W119", state.tokens.curr, "import", "6");
    }

    if (state.tokens.next.type === "(string)") {
      // ModuleSpecifier :: StringLiteral
      advance("(string)");
      return this;
    }

    if (state.tokens.next.identifier) {
      // ImportClause :: ImportedDefaultBinding
      this.name = identifier();
      // Import bindings are immutable (see ES6 8.1.1.5.5)
      state.funct["(scope)"].addlabel(this.name, {
        type: "import",
        initialized: true,
        token: state.tokens.curr });

      if (state.tokens.next.value === ",") {
        // ImportClause :: ImportedDefaultBinding , NameSpaceImport
        // ImportClause :: ImportedDefaultBinding , NamedImports
        advance(",");
        // At this point, we intentionally fall through to continue matching
        // either NameSpaceImport or NamedImports.
        // Discussion:
        // https://github.com/jshint/jshint/pull/2144#discussion_r23978406
      } else {
        advance("from");
        advance("(string)");
        return this;
      }
    }

    if (state.tokens.next.id === "*") {
      // ImportClause :: NameSpaceImport
      advance("*");
      advance("as");
      if (state.tokens.next.identifier) {
        this.name = identifier();
        // Import bindings are immutable (see ES6 8.1.1.5.5)
        state.funct["(scope)"].addlabel(this.name, {
          type: "import",
          initialized: true,
          token: state.tokens.curr });
      }
    } else {
      // ImportClause :: NamedImports
      advance("{");
      for (;;) {
        if (state.tokens.next.value === "}") {
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

        // Import bindings are immutable (see ES6 8.1.1.5.5)
        state.funct["(scope)"].addlabel(importName, {
          type: "import",
          initialized: true,
          token: state.tokens.curr });

        if (state.tokens.next.value === ",") {
          advance(",");
        } else if (state.tokens.next.value === "}") {
          advance("}");
          break;
        } else {
          error("E024", state.tokens.next, state.tokens.next.value);
          break;
        }
      }
    }

    // FromClause
    advance("from");
    advance("(string)");

    // Support for ES2015 modules was released without warning for `import`
    // declarations that lack bindings. Issuing a warning would therefor
    // constitute a breaking change.
    // TODO: enable this warning in JSHint 3
    // if (hasBindings) {
    //   warning("W142", this, "import", moduleSpecifier);
    // }

    return this;
  }).exps = true;

  stmt("export", function(context) {
    var ok = true;
    var token;
    var identifier;
    var moduleSpecifier;

    if (!state.inES6()) {
      warning("W119", state.tokens.curr, "export", "6");
      ok = false;
    }

    if (!state.funct["(scope)"].block.isGlobal()) {
      error("E053", state.tokens.curr, "Export");
      ok = false;
    }

    if (state.tokens.next.value === "*") {
      // ExportDeclaration :: export * FromClause
      advance("*");
      advance("from");
      advance("(string)");
      return this;
    }

    if (state.tokens.next.type === "default") {
      // ExportDeclaration ::
      //      export default [lookahead ∉ { function, class }] AssignmentExpression[In] ;
      //      export default HoistableDeclaration
      //      export default ClassDeclaration
      state.nameStack.set(state.tokens.next);
      advance("default");
      var exportType = state.tokens.next.id;
      if (exportType === "function" || exportType === "class") {
        this.block = true;
      }

      token = peek();

      expression(10, context);

      identifier = token.value;

      if (this.block) {
        state.funct["(scope)"].addlabel(identifier, {
          type: exportType,
          initialized: true,
          token: token });

        state.funct["(scope)"].setExported(identifier, token);
      }

      return this;
    }

    if (state.tokens.next.value === "{") {
      // ExportDeclaration :: export ExportClause
      advance("{");
      var exportedTokens = [];
      while (!checkPunctuator(state.tokens.next, "}")) {
        if (!state.tokens.next.identifier) {
          error("E030", state.tokens.next, state.tokens.next.value);
        }
        advance();

        exportedTokens.push(state.tokens.curr);

        if (state.tokens.next.value === "as") {
          advance("as");
          if (!state.tokens.next.identifier) {
            error("E030", state.tokens.next, state.tokens.next.value);
          }
          advance();
        }

        if (!checkPunctuator(state.tokens.next, "}")) {
          advance(",");
        }
      }
      advance("}");
      if (state.tokens.next.value === "from") {
        // ExportDeclaration :: export ExportClause FromClause
        advance("from");
        moduleSpecifier = state.tokens.next;
        advance("(string)");
      } else if (ok) {
        exportedTokens.forEach(function(token) {
          state.funct["(scope)"].setExported(token.value, token);
        });
      }

      if (exportedTokens.length === 0) {
        if (moduleSpecifier) {
          warning("W142", this, "export", moduleSpecifier.value);
        } else {
          warning("W141", this, "export");
        }
      }

      return this;
    }

    if (state.tokens.next.id === "var") {
      // ExportDeclaration :: export VariableStatement
      advance("var");
      state.tokens.curr.fud(context | prodParams.export);
    } else if (state.tokens.next.id === "let") {
      // ExportDeclaration :: export VariableStatement
      advance("let");
      state.tokens.curr.fud(context | prodParams.export);
    } else if (state.tokens.next.id === "const") {
      // ExportDeclaration :: export VariableStatement
      advance("const");
      state.tokens.curr.fud(context | prodParams.export);
    } else if (state.tokens.next.id === "function") {
      // ExportDeclaration :: export Declaration
      this.block = true;
      advance("function");
      state.syntax["function"].fud(context | prodParams.export);
    } else if (state.tokens.next.id === "class") {
      // ExportDeclaration :: export Declaration
      this.block = true;
      advance("class");
      var classNameToken = state.tokens.next;
      state.syntax["class"].fud(context);
      state.funct["(scope)"].setExported(classNameToken.value, classNameToken);
    } else {
      error("E024", state.tokens.next, state.tokens.next.value);
    }

    return this;
  }).exps = true;

  /**
   * Determine if SuperCall or SuperProperty may be used in the current context
   * (as described by the provided "functor" object).
   *
   * @param {string} type - one of "property" or "call"
   * @param {object} funct - a "functor" object describing the current function
   *                         context
   *
   * @returns {boolean}
   */
  function supportsSuper(type, funct) {
    if (type === "property" && funct["(method)"]) {
      return true;
    }

    if (type === "call" && funct["(statement)"] &&
      funct["(statement)"].id === "class") {
      return true;
    }

    if (funct["(arrow)"]) {
      return supportsSuper(type, funct["(context)"]);
    }

    return false;
  }

  var superNud = function() {
    var next = state.tokens.next;

    if (checkPunctuators(next, ["[", "."])) {
      if (!supportsSuper("property", state.funct)) {
        error("E063", this);
      }
    } else if (checkPunctuator(next, "(")) {
      if (!supportsSuper("call", state.funct)) {
        error("E064", this);
      }
    } else {
      error("E024", next, next.value || next.id);
    }

    return this;
  };

  // Future Reserved Words

  FutureReservedWord("abstract");
  FutureReservedWord("await", { es5: true, moduleOnly: true });
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
  FutureReservedWord("super", { es5: true, nud: superNud });
  FutureReservedWord("synchronized");
  FutureReservedWord("transient");
  FutureReservedWord("volatile");

  // this function is used to determine whether a squarebracket or a curlybracket
  // expression is a comprehension array, destructuring assignment or a json value.

  var lookupBlockType = function() {
    var pn, pn1, prev;
    var i = -1;
    var bracketStack = 0;
    var ret = {};
    if (checkPunctuators(state.tokens.curr, ["[", "{"])) {
      bracketStack += 1;
    }
    do {
      prev = i === -1 ? state.tokens.curr : pn;
      pn = i === -1 ? state.tokens.next : peek(i);
      pn1 = peek(i + 1);
      i = i + 1;
      if (checkPunctuators(pn, ["[", "{"])) {
        bracketStack += 1;
      } else if (checkPunctuators(pn, ["]", "}"])) {
        bracketStack -= 1;
      }
      if (bracketStack === 1 && pn.identifier && pn.value === "for" &&
          !checkPunctuator(prev, ".")) {
        ret.isCompArray = true;
        ret.notJson = true;
        break;
      }
      if (bracketStack === 0 && checkPunctuators(pn, ["}", "]"])) {
        if (pn1.value === "=") {
          ret.isDestAssign = true;
          ret.notJson = true;
          break;
        } else if (pn1.value === ".") {
          ret.notJson = true;
          break;
        }
      }
      if (checkPunctuator(pn, ";")) {
        ret.notJson = true;
      }
    } while (bracketStack > 0 && pn.id !== "(end)");
    return ret;
  };

  /**
   * Update an object used to track property names within object initializers
   * and class bodies. Produce warnings in response to duplicated names.
   *
   * @param {object} props - a collection of all properties of the object or
   *                         class to which the current property is being
   *                         assigned
   * @param {string} name - the property name
   * @param {object} tkn - the token defining the property
   * @param {boolean} [isClass] - whether the accessor is part of an ES6 Class
   *                              definition
   * @param {boolean} [isStatic] - whether the accessor is a static method
   */
  function saveProperty(props, name, tkn, isClass, isStatic) {
    var msg = ["key", "class method", "static class method"];
    msg = msg[(isClass || false) + (isStatic || false)];
    if (tkn.identifier) {
      name = tkn.value;
    }

    if (props[name] && name !== "__proto__") {
      warning("W075", state.tokens.next, msg, name);
    } else {
      props[name] = Object.create(null);
    }

    props[name].basic = true;
    props[name].basictkn = tkn;
  }

  /**
   * Update an object used to track property names within object initializers
   * and class bodies. Produce warnings in response to duplicated names.
   *
   * @param {string} accessorType - Either "get" or "set"
   * @param {object} props - a collection of all properties of the object or
   *                         class to which the current accessor is being
   *                         assigned
   * @param {object} tkn - the identifier token representing the accessor name
   * @param {boolean} [isClass] - whether the accessor is part of an ES6 Class
   *                              definition
   * @param {boolean} [isStatic] - whether the accessor is a static method
   */
  function saveAccessor(accessorType, props, name, tkn, isClass, isStatic) {
    var flagName = accessorType === "get" ? "getterToken" : "setterToken";
    var msg = "";

    if (isClass) {
      if (isStatic) {
        msg += "static ";
      }
      msg += accessorType + "ter method";
    } else {
      msg = "key";
    }

    state.tokens.curr.accessorType = accessorType;
    state.nameStack.set(tkn);

    if (props[name]) {
      if ((props[name].basic || props[name][flagName]) && name !== "__proto__") {
        warning("W075", state.tokens.next, msg, name);
      }
    } else {
      props[name] = Object.create(null);
    }

    props[name][flagName] = tkn;
  }

  /**
   * Parse a computed property name within object initializers and class bodies
   * as introduced by ES2015. For example:
   *
   *     void {
   *       [object.method()]: null
   *     };
   *
   * @param {number} context - the parsing context
   *
   * @returns {object} - the token value that describes the expression which
   *                     defines the property name
   */
  function computedPropertyName(context) {
    advance("[");
    if (!state.inES6()) {
      warning("W119", state.tokens.curr, "computed property names", "6");
    }
    var value = expression(10, context & ~prodParams.noin);
    advance("]");
    return value;
  }

  /**
   * Test whether a given token is a punctuator whose `value` property matches
   * one of the specified values. This function explicitly verifies the token's
   * `type` property so that like-valued string literals (e.g. `";"`) do not
   * produce false positives.
   *
   * @param {Token} token
   * @param {Array.<string>} values
   *
   * @returns {boolean}
   */
  function checkPunctuators(token, values) {
    if (token.type === "(punctuator)") {
      return _.includes(values, token.value);
    }
    return false;
  }

  /**
   * Test whether a given token is a punctuator whose `value` property matches
   * the specified value. This function explicitly verifies the token's `type`
   * property so that like-valued string literals (e.g. `";"`) do not produce
   * false positives.
   *
   * @param {Token} token
   * @param {string} value
   *
   * @returns {boolean}
   */
  function checkPunctuator(token, value) {
    return token.type === "(punctuator)" && token.value === value;
  }

  // Check whether this function has been reached for a destructuring assign with undeclared values
  function destructuringAssignOrJsonValue(context) {
    // lookup for the assignment (ECMAScript 6 only)
    // if it has semicolons, it is a block, so go parse it as a block
    // or it's not a block, but there are assignments, check for undeclared variables

    var block = lookupBlockType();
    if (block.notJson) {
      if (!state.inES6() && block.isDestAssign) {
        warning("W104", state.tokens.curr, "destructuring assignment", "6");
      }
      statements(context);
    // otherwise parse json value
    } else {
      state.option.laxbreak = true;
      state.jsonMode = true;
      jsonValue();
    }
  }

  /**
   * Parse and define the three states of a list comprehension in order to
   * avoid defining global variables, but keeping them to the list
   * comprehension scope only. The order of the states are as follows:
   *
   * - "use" - which will be the returned iterative part of the list
   *   comprehension
   * - "define" - which will define the variables local to the list
   *   comprehension
   * - "filter" - which will help filter out values
   */
  var arrayComprehension = function() {
    var CompArray = function() {
      this.mode = "use";
      this.variables = [];
    };
    var _carrays = [];
    var _current;
    function declare(v) {
      var l = _current.variables.filter(function(elt) {
        // if it has, change its undef state
        if (elt.value === v) {
          elt.undef = false;
          return v;
        }
      }).length;
      return l !== 0;
    }
    function use(v) {
      var l = _current.variables.filter(function(elt) {
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
    return { stack: function() {
          _current = new CompArray();
          _carrays.push(_current);
        },
        unstack: function() {
          _current.variables.filter(function(v) {
            if (v.unused)
              warning("W098", v.token, v.token.raw_text || v.value);
            if (v.undef)
              state.funct["(scope)"].block.use(v.value, v.token);
          });
          _carrays.splice(-1, 1);
          _current = _carrays[_carrays.length - 1];
        },
        setState: function(s) {
          if (_.includes(["use", "define", "generate", "filter"], s))
            _current.mode = s;
        },
        check: function(v) {
          if (!_current) {
            return;
          }
          // When we are in "use" state of the list comp, we enqueue that var
          if (_current && _current.mode === "use") {
            if (use(v)) {
              _current.variables.push({
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
                token: state.tokens.curr,
                value: v,
                undef: false,
                unused: true
              });
            }
            return true;
          // When we are in the "generate" state of the list comp,
          } else if (_current && _current.mode === "generate") {
            state.funct["(scope)"].block.use(v, state.tokens.curr);
            return true;
          // When we are in "filter" state,
          } else if (_current && _current.mode === "filter") {
            // we check whether current variable has been declared
            if (use(v)) {
              // if not we warn about it
              state.funct["(scope)"].block.use(v, state.tokens.curr);
            }
            return true;
          }
          return false;
        }
        };
  };


  /**
   * Parse input according to the JSON format.
   *
   * http://json.org/
   */
  function jsonValue() {
    function jsonObject() {
      var o = {}, t = state.tokens.next;
      advance("{");
      if (state.tokens.next.id !== "}") {
        for (;;) {
          if (state.tokens.next.id === "(end)") {
            error("E026", state.tokens.next, t.line);
          } else if (state.tokens.next.id === "}") {
            warning("W094", state.tokens.curr);
            break;
          } else if (state.tokens.next.id === ",") {
            error("E028", state.tokens.next);
          } else if (state.tokens.next.id !== "(string)") {
            warning("W095", state.tokens.next, state.tokens.next.value);
          }
          if (o[state.tokens.next.value] === true) {
            warning("W075", state.tokens.next, "key", state.tokens.next.value);
          } else if ((state.tokens.next.value === "__proto__" &&
            !state.option.proto) || (state.tokens.next.value === "__iterator__" &&
            !state.option.iterator)) {
            warning("W096", state.tokens.next, state.tokens.next.value);
          } else {
            o[state.tokens.next.value] = true;
          }
          advance();
          advance(":");
          jsonValue();
          if (state.tokens.next.id !== ",") {
            break;
          }
          advance(",");
        }
      }
      advance("}");
    }

    function jsonArray() {
      var t = state.tokens.next;
      advance("[");
      if (state.tokens.next.id !== "]") {
        for (;;) {
          if (state.tokens.next.id === "(end)") {
            error("E027", state.tokens.next, t.line);
          } else if (state.tokens.next.id === "]") {
            warning("W094", state.tokens.curr);
            break;
          } else if (state.tokens.next.id === ",") {
            error("E028", state.tokens.next);
          }
          jsonValue();
          if (state.tokens.next.id !== ",") {
            break;
          }
          advance(",");
        }
      }
      advance("]");
    }

    switch (state.tokens.next.id) {
    case "{":
      jsonObject();
      break;
    case "[":
      jsonArray();
      break;
    case "true":
    case "false":
    case "null":
    case "(number)":
    case "(string)":
      advance();
      break;
    case "-":
      advance("-");
      advance("(number)");
      break;
    default:
      error("E003", state.tokens.next);
    }
  }

  /**
   * Lint dynamically-evaluated code, appending any resulting errors/warnings
   * into the global `errors` array.
   *
   * @param {array} internals - collection of "internals" objects describing
   *                            string tokens that contain evaluated code
   * @param {object} options - linting options to apply
   * @param {object} globals - globally-defined bindings for the evaluated code
   */
  function lintEvalCode(internals, options, globals) {
    var priorErrorCount, idx, jdx, internal;

    for (idx = 0; idx < internals.length; idx += 1) {
      internal = internals[idx];
      options.scope = internal.elem;
      priorErrorCount = JSHINT.errors.length;

      itself(internal.code, options, globals);

      for (jdx = priorErrorCount; jdx < JSHINT.errors.length; jdx += 1) {
        JSHINT.errors[jdx].line += internal.token.line - 1;
      }
    }
  }

  var escapeRegex = function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  // The actual JSHINT function itself.
  var itself = function(s, o, g) {
    var x, reIgnoreStr, reIgnore;
    var optionKeys, newOptionObj, newIgnoredObj;

    o = _.clone(o);
    state.reset();
    newOptionObj = state.option;
    newIgnoredObj = state.ignored;

    if (o && o.scope) {
      JSHINT.scope = o.scope;
    } else {
      JSHINT.errors = [];
      JSHINT.internals = [];
      JSHINT.blacklist = {};
      JSHINT.scope = "(main)";
    }

    predefined = Object.create(null);
    combine(predefined, vars.ecmaIdentifiers[3]);
    combine(predefined, vars.reservedVars);

    combine(predefined, g || {});

    declared = Object.create(null);
    var exported = Object.create(null); // Variables that live outside the current file

    function each(obj, cb) {
      if (!obj)
        return;

      if (!Array.isArray(obj) && typeof obj === "object")
        obj = Object.keys(obj);

      obj.forEach(cb);
    }

    if (o) {
      each(o.predef || null, function(item) {
        var slice, prop;

        if (item[0] === "-") {
          slice = item.slice(1);
          JSHINT.blacklist[slice] = slice;
          // remove from predefined if there
          delete predefined[slice];
        } else {
          prop = Object.getOwnPropertyDescriptor(o.predef, item);
          predefined[item] = prop ? prop.value : false;
        }
      });

      each(o.exported || null, function(item) {
        exported[item] = true;
      });

      delete o.predef;
      delete o.exported;

      optionKeys = Object.keys(o);
      for (x = 0; x < optionKeys.length; x++) {
        if (/^-W\d{3}$/g.test(optionKeys[x])) {
          newIgnoredObj[optionKeys[x].slice(1)] = true;
        } else {
          var optionKey = optionKeys[x];
          newOptionObj[optionKey] = o[optionKey];
        }
      }
    }

    state.option = newOptionObj;
    state.ignored = newIgnoredObj;

    state.option.indent = state.option.indent || 4;
    state.option.maxerr = state.option.maxerr || 50;

    indent = 1;

    var scopeManagerInst = scopeManager(state, predefined, exported, declared);
    scopeManagerInst.on("warning", function(ev) {
      warning.apply(null, [ ev.code, ev.token].concat(ev.data));
    });

    scopeManagerInst.on("error", function(ev) {
      error.apply(null, [ ev.code, ev.token ].concat(ev.data));
    });

    state.funct = functor("(global)", null, {
      "(global)"    : true,
      "(scope)"     : scopeManagerInst,
      "(comparray)" : arrayComprehension(),
      "(metrics)"   : createMetrics(state.tokens.next)
    });

    functions = [state.funct];
    urls = [];
    member = {};
    membersOnly = null;
    inblock = false;
    lookahead = [];

    if (!isString(s) && !Array.isArray(s)) {
      errorAt("E004", 0);
      return false;
    }

    api = {
      get isJSON() {
        return state.jsonMode;
      },

      getOption: function(name) {
        return state.option[name] || null;
      },

      getCache: function(name) {
        return state.cache[name];
      },

      setCache: function(name, value) {
        state.cache[name] = value;
      },

      warn: function(code, data) {
        warningAt.apply(null, [ code, data.line, data.char ].concat(data.data));
      },

      on: function(names, listener) {
        names.split(" ").forEach(function(name) {
          emitter.on(name, listener);
        }.bind(this));
      }
    };

    emitter.removeAllListeners();
    (extraModules || []).forEach(function(func) {
      func(api);
    });

    state.tokens.prev = state.tokens.curr = state.tokens.next = state.syntax["(begin)"];

    if (o && o.ignoreDelimiters) {

      if (!Array.isArray(o.ignoreDelimiters)) {
        o.ignoreDelimiters = [o.ignoreDelimiters];
      }

      o.ignoreDelimiters.forEach(function(delimiterPair) {
        if (!delimiterPair.start || !delimiterPair.end)
            return;

        reIgnoreStr = escapeRegex(delimiterPair.start) +
                      "[\\s\\S]*?" +
                      escapeRegex(delimiterPair.end);

        reIgnore = new RegExp(reIgnoreStr, "ig");

        s = s.replace(reIgnore, function(match) {
          return match.replace(/./g, " ");
        });
      });
    }

    lex = new Lexer(s);

    lex.on("warning", function(ev) {
      warningAt.apply(null, [ ev.code, ev.line, ev.character].concat(ev.data));
    });

    lex.on("error", function(ev) {
      errorAt.apply(null, [ ev.code, ev.line, ev.character ].concat(ev.data));
    });

    lex.on("fatal", function(ev) {
      quit("E041", ev);
    });

    lex.on("Identifier", function(ev) {
      emitter.emit("Identifier", ev);
    });

    lex.on("String", function(ev) {
      emitter.emit("String", ev);
    });

    lex.on("Number", function(ev) {
      emitter.emit("Number", ev);
    });

    // Check options
    var name;
    for (name in o) {
      if (_.has(o, name)) {
        checkOption(name, true, state.tokens.curr);
      }
    }
    if (o) {
      for (name in o.unstable) {
        if (_.has(o.unstable, name)) {
          checkOption(name, false, state.tokens.curr);
        }
      }
    }

    try {
      applyOptions();

      // combine the passed globals after we've assumed all our options
      combine(predefined, g || {});

      //reset values
      parseComma.first = true;

      advance();
      switch (state.tokens.next.id) {
      case "{":
      case "[":
        destructuringAssignOrJsonValue(0);
        break;
      default:
        directives();

        if (state.directive["use strict"]) {
          if (!state.allowsGlobalUsd()) {
            warning("W097", state.tokens.prev);
          }
        }

        statements(0);
      }

      if (state.tokens.next.id !== "(end)") {
        quit("E041", state.tokens.curr);
      }

      state.funct["(scope)"].unstack();

    } catch (err) {
      if (err && err.name === "JSHintError") {
        var nt = state.tokens.next || {};
        JSHINT.errors.push({
          scope     : "(main)",
          raw       : err.raw,
          code      : err.code,
          reason    : err.reason,
          line      : err.line || nt.line,
          character : err.character || nt.from
        });
      } else {
        throw err;
      }
    }

    // Loop over the listed "internals", and check them as well.
    if (JSHINT.scope === "(main)") {
      lintEvalCode(JSHINT.internals, o || {}, g);
    }

    return JSHINT.errors.length === 0;
  };

  // Modules.
  itself.addModule = function(func) {
    extraModules.push(func);
  };

  itself.addModule(style.register);

  // Data summary.
  itself.data = function() {
    var data = {
      functions: [],
      options: state.option
    };

    var fu, f, i, n, globals;

    if (itself.errors.length) {
      data.errors = itself.errors;
    }

    if (state.jsonMode) {
      data.json = true;
    }

    var impliedGlobals = state.funct["(scope)"].getImpliedGlobals();
    if (impliedGlobals.length > 0) {
      data.implieds = impliedGlobals;
    }

    if (urls.length > 0) {
      data.urls = urls;
    }

    globals = state.funct["(scope)"].getUsedOrDefinedGlobals();
    if (globals.length > 0) {
      data.globals = globals;
    }

    for (i = 1; i < functions.length; i += 1) {
      f = functions[i];
      fu = {};

      fu.name = f["(name)"];
      fu.param = f["(params)"];
      fu.line = f["(line)"];
      fu.character = f["(character)"];
      fu.last = f["(last)"];
      fu.lastcharacter = f["(lastcharacter)"];

      fu.metrics = {
        complexity: f["(metrics)"].ComplexityCount,
        parameters: f["(metrics)"].arity,
        statements: f["(metrics)"].statementCount
      };

      data.functions.push(fu);
    }

    var unuseds = state.funct["(scope)"].getUnuseds();
    if (unuseds.length > 0) {
      data.unused = unuseds;
    }

    for (n in member) {
      if (typeof member[n] === "number") {
        data.member = member;
        break;
      }
    }

    return data;
  };

  itself.jshint = itself;

  return itself;
}());

// Make JSHINT a Node module, if possible.
if (typeof exports === "object" && exports) {
  exports.JSHINT = JSHINT;
}
