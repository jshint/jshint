"use strict";

var state = require("./state.js").state,
    _     = require("underscore");

exports.forLexer = {
  applyLexerHook: function(keywords) {
    keywords.push("async");
    keywords.push("await");
  }
};

exports.forMessages = {
  applyMessagesHook: function(errors, warnings) {
    warnings.W001EAA = "An async function shall contain an await statement.";
    warnings.W002EAA = "'{a}' is available in async/await extension(use asyncawait option).";

    errors.E001EAA = "A await statement shall be within an async function " +
      "(with syntax: `async function`).";
  }
};


exports.forJSHINT = function(addlabel, advance, blockstmt, doFunction, error,
    expression, funct, inblock, isEndOfExpr, nobreaknonadjacent, nolinebreak,
    optionalidentifier, peek, prefix, warning, warningAt) {

  var lookupBracketFatArrow = function () {
    if(state.tokens.next.value !== "(") {
      return;
    }
    var s = '';
    var pn;
    var i = -1;
    do {
      pn = (i === -1) ? state.tokens.next : peek(i);
      s += pn.value;
      i++;
    } while (pn.value !== ')' && pn.type !== '(end)');
    s += peek(i).value;
    if(s.match(/\((\w+(,\w+)*)?\)=>/)) {
      return s;
    }
  };

  // asyncawait : enables async/await functions support.
  // asyncreqawait : requires async functions to contain at least
  // one await statement.
  this.applyStateOptionHook = function() {
    state.option.asyncAwaitEnabled = function () {
      return state.option.experimental &&
        state.option.experimental.indexOf("asyncawait") >= 0;
    };

    state.option.asyncReqAwait = function () {
      return state.option.experimental &&
        state.option.experimental.indexOf("asyncreqawait") >= 0;
    };
  };

  this.ExpressionHook = function() {
    var isAsync = false;

    this.parse = function() {
      if ( state.tokens.curr.value === "async" &&
           state.tokens.curr.type === "(identifier)") {
        // 'async function' is processed by async prefix
        if(state.tokens.next.value === "function") { return }
        isAsync = !!lookupBracketFatArrow() || state.tokens.next.type !== "(punctuator)";
        if(isAsync) { advance(); }
      }
    };

    this.applicationWarning = function () {
      if (isAsync && !state.option.asyncAwaitEnabled()) {
        warning("W002EAA", state.tokens.curr, "async");
      }
    };

    this.updateRunFud = function(runFud) {
      if(state.tokens.curr.value === "async") {
        return runFud && state.tokens.next.type !== "(punctuator)";
      } else {
        return runFud;
      }
    };

    this.doFunctionParams = function() {
      return {asyncAwait: {isAsync: isAsync}};
    };
  };

  this.StatementHook = function(t) {
    var asyncIsBlock = null;
    if(t.value === "async") {
      var j = 0, next;
      do {
        next = peek(j++);
      } while (next.type === "(endline)");
      asyncIsBlock = t.block && next && next.type !== "(punctuator)";
    }

    this.isBlock = function(isBlock) {
      return asyncIsBlock !== null ? asyncIsBlock : isBlock;
    };
  };

  this.ExportHook = function(that, ok, exported) {
    this.check = function() {
      return state.option.asyncAwaitEnabled() && state.tokens.next.id === "async";
    };

    this.applyHook = function() {
      that.block = true;
      advance("async");
      exported[state.tokens.next.value] = ok;
      peek(0).exported = true;
      state.tokens.next.exported = true;
      state.syntax.async.fud();
    };
  };

  this.applyOptionalIdentifierHook = function(val) {
    if( val === "async"){
      if(["var", "function"].indexOf(state.tokens.prev.value) >= 0) return val;
    }
  };

  this.applyBalancedFatArrowHook = function() {
    var isAsync = state.tokens.prev && state.tokens.prev.value === "async";
    return {asyncAwait: {isAsync: isAsync}};
  };

  this.applyInitFunctorHook = function(functObj) {
    functObj["(async)"] = null;
  };

  this.ClassBodyHook = function(skipKeyword) {
    var isAsync = false;

    this.parse = function() {
      isAsync = skipKeyword("async");

      if(isAsync) {
        if (!state.option.asyncAwaitEnabled()) {
          warning("W002EAA", state.tokens.curr, "async");
        }
      }
    };

    this.doFunctionParams = function() {
      return  {asyncAwait: {isAsync: isAsync}};
    };
  };

  this.DoFunctionHook = function(opts) {
    if(opts.experimental && opts.experimental.asyncAwait) {
      opts.async = opts.experimental.asyncAwait.isAsync;
    }

    this.updateFunctor = function(functObj) {
      functObj["(async)"] =  opts.async ? true : null;
    };

    this.warnings = function() {
      if (state.option.asyncReqAwait() && opts.async &&
          funct()["(async)"] !== "awaited") {
        warning("W001EAA", state.tokens.curr);
      }
    };
  };

  this.applyBlockstmtHook = function() {
    blockstmt("async", function () {
      if (!state.option.asyncAwaitEnabled()) {
        warning("W002EAA", state.tokens.curr, "async");
      }
      if (state.tokens.next.value === "function") {
        advance("function");

        if (inblock()) {
          warning("W082", state.tokens.curr);
        }
        var i = optionalidentifier();

        if (i === undefined) {
          warning("W025");
        }

        if (funct()[i] === "const") {
          warning("E011", null, i);
        }
        addlabel(i, { type: "unction", token: state.tokens.curr });

        doFunction({name: i, statement: true, experimental: {asyncAwait:{isAsync: true}}});
        if (state.tokens.next.id === "(" && state.tokens.next.line === state.tokens.curr.line) {
          error("E039");
        }
      }
      return this;
    });
  };

  this.applyPrefixHook = function() {
    prefix("async", function () {
      if (!state.option.asyncAwaitEnabled()) {
        warning("W002EAA", state.tokens.curr, "async");
      }
      function isVariable(name) { return name[0] !== "("; }
      function isLocal(name) { return fn[name] === "var"; }
      if (state.tokens.next.value === "function") {
        advance("function");

        var i = optionalidentifier();
        var fn = doFunction({name: i, async: true});
        if (!state.option.loopfunc && funct()["(loopage)"]) {
          // If the function we just parsed accesses any non-local variables
          // trigger a warning. Otherwise, the function is safe even within
          // a loop.
          if (_.some(fn, function (val, name) { return isVariable(name) && !isLocal(name); })) {
            warning("W083");
          }
        }
      }
      return this;
    });

    (function (x) {
      x.exps = true;
      x.lbp = 25;
    }(prefix("await", function () {
      var prev = state.tokens.prev;
      if (state.option.asyncAwaitEnabled() && !funct()["(async)"]) {
        // If it's a await within a catch clause inside a generator then that's ok
        if (!("(catch)" === funct()["(name)"] && funct()["(context)"]["(async)"])) {
          error("E001EAA", state.tokens.curr, "await");
        }
      } else if (!state.option.asyncAwaitEnabled()) {
        warning("W002EAA", state.tokens.curr, "await");
      }
      funct()["(async)"] = "awaited";

      if (this.line === state.tokens.next.line || !state.option.inMoz(true)) {
        if (state.tokens.next.id !== ";" && !state.tokens.next.reach && state.tokens.next.nud) {

          nobreaknonadjacent(state.tokens.curr, state.tokens.next);
          this.first = expression(10);

          if (this.first.type === "(punctuator)" && this.first.value === "=" &&
              !this.first.paren && !state.option.boss) {
            warningAt("W093", this.first.line, this.first.character);
          }
        }

        if (state.option.inMoz(true) && state.tokens.next.id !== ")" &&
            (prev.lbp > 30 || (!prev.assign && !isEndOfExpr()) || prev.id === "async")) {
          error("E050", this);
        }
      } else if (!state.option.asi) {
        nolinebreak(this); // always warn (Line breaking error)
      }
      return this;
    })));
  };
};
