"use strict";

var _     = require("underscore");

exports.plugin = function() {
  var state = require("../state.js").state,
      messages = require("../messages");
  var api;

  this.use = function(_api) {
    api = _api;
  };

  this.isEnabled = function() {
    return !!(state.option.experimental &&
      state.option.experimental.indexOf("asyncawait") >= 0);
  };

  var lookupBracketFatArrow = function () {
    if(state.tokens.next.value !== "(") {
      return;
    }
    var s = '';
    var pn;
    var i = -1;
    do {
      pn = (i === -1) ? state.tokens.next : api.peek(i);
      s += pn.value;
      i++;
    } while (pn.value !== ')' && pn.type !== '(end)');
    s += api.peek(i).value;
    if(s.match(/\((\w+(,\w+)*)?\)=>/)) {
      return s;
    }
  };

  // asyncawait : enables async/await functions support.
  // asyncreqawait : requires async functions to contain at least
  // one await statement.
  this.applyStateOptionHook = function() {
    state.option.asyncAwaitEnabled = function () {
      return !!(state.option.experimental &&
        state.option.experimental.indexOf("asyncawait") >= 0);
    };

    state.option.asyncReqAwait = function () {
      return !!(state.option.experimental &&
        state.option.experimental.indexOf("asyncreqawait") >= 0);
    };
  };


  this.applyLexerHook = function(keywords) {
    keywords.push("async");
    keywords.push("await");
  };

  this.applyMessagesHook = function() {
    messages.warnings.W001EAA = { code: "W001EAA",
      desc: "An async function shall contain an await statement." };
    messages.errors.E001EAA = { code: "E001EAA",
      desc: "A await statement shall be within an async function " +
            "(with syntax: `async function`)." };
  };

  this.ExpressionHook = function() {
    var isAsync = false;

    this.parse = function() {
      if ( state.tokens.curr.value === "async" &&
           state.tokens.curr.type === "(identifier)") {
        // 'async function' is processed by async prefix
        if(state.tokens.next.value === "function") { return }
        isAsync = !!lookupBracketFatArrow() || state.tokens.next.type !== "(punctuator)";
        if(isAsync) { api.advance(); }
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
        next = api.peek(j++);
      } while (next.type === "(endline)");
      asyncIsBlock = t.block && next && next.type !== "(punctuator)";
    }

    this.isBlock = function(isBlock) {
      return asyncIsBlock !== null ? asyncIsBlock : isBlock;
    };
  };

  this.ExportHook = function(that, ok) {
    var needsApply;

    this.check = function() {
      needsApply = state.option.asyncAwaitEnabled() && state.tokens.next.id === "async";
      return needsApply;
    };

    this.applyHook = function() {
      if(needsApply) {
        that.block = true;
        api.advance("async");
        api.exported[state.tokens.next.value] = ok;
        api.peek(0).exported = true;
        state.tokens.next.exported = true;
        state.syntax.async.fud();
      }
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
          api.funct()["(async)"] !== "awaited") {
        api.warning("W001EAA", state.tokens.curr);
      }
    };
  };

  this.applyBlockstmtHook = function() {
    if(!state.option.asyncAwaitEnabled()) return;
    api.blockstmt("async", function () {
      if (state.tokens.next.value === "function") {
        api.advance("function");

        if (api.inblock()) {
          api.warning("W082", state.tokens.curr);
        }
        var i = api.optionalidentifier();

        if (i === undefined) {
          api.warning("W025");
        }

        if (api.funct()[i] === "const") {
          api.warning("E011", null, i);
        }
        api.addlabel(i, { type: "unction", token: state.tokens.curr });

        api.doFunction({name: i, statement: true, experimental: {asyncAwait:{isAsync: true}}});
        if (state.tokens.next.id === "(" && state.tokens.next.line === state.tokens.curr.line) {
          api.error("E039");
        }
      }
      return this;
    });
  };

  this.applyPrefixHook = function() {
    if(!state.option.asyncAwaitEnabled()) return;
    api.prefix("async", function () {
      function isVariable(name) { return name[0] !== "("; }
      function isLocal(name) { return fn[name] === "var"; }
      if (state.tokens.next.value === "function") {
        api.advance("function");

        var i = api.optionalidentifier();
        var fn = api.doFunction({name: i, async: true});
        if (!state.option.loopfunc && api.funct()["(loopage)"]) {
          // If the function we just parsed accesses any non-local variables
          // trigger a warning. Otherwise, the function is safe even within
          // a loop.
          if (_.some(fn, function (val, name) { return isVariable(name) && !isLocal(name); })) {
            api.warning("W083");
          }
        }
      }
      return this;
    });

    (function (x) {
      x.exps = true;
      x.lbp = 25;
    }(api.prefix("await", function () {
      var prev = state.tokens.prev;
      if (state.option.asyncAwaitEnabled() && !api.funct()["(async)"]) {
        // If it's a await within a catch clause inside a generator then that's ok
        if (!("(catch)" === api.funct()["(name)"] && api.funct()["(context)"]["(async)"])) {
          api.error("E001EAA", state.tokens.curr, "await");
        }
      }
      api.funct()["(async)"] = "awaited";

      if (this.line === state.tokens.next.line || !state.option.inMoz(true)) {
        if (state.tokens.next.id !== ";" && !state.tokens.next.reach && state.tokens.next.nud) {

          api.nobreaknonadjacent(state.tokens.curr, state.tokens.next);
          this.first = api.expression(10);

          if (this.first.type === "(punctuator)" && this.first.value === "=" &&
              !this.first.paren && !state.option.boss) {
            api.warningAt("W093", this.first.line, this.first.character);
          }
        }

        if (state.option.inMoz(true) && state.tokens.next.id !== ")" &&
            (prev.lbp > 30 || (!prev.assign && !api.isEndOfExpr()) || prev.id === "async")) {
          api.error("E050", this);
        }
      } else if (!state.option.asi) {
        api.nolinebreak(this); // always warn (Line breaking error)
      }
      return this;
    })));
  };
  return this;
};
