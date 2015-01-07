"use strict";
var _ = require('underscore');

var Plugger = function() {
  var plugins = [];
  var api;
  var __slice = Array.prototype.slice;

  this.addPlugin = function(plugin) {
    plugins.push(plugin);
    plugin.use(api);
  };

  this.use = function (_api) {
    api = _api;
    applyAll(plugins, 'use', [api]);
  };

  var allEnabled = function (targets, fn) {
    _(targets).chain()
      .filter(function(target) {
        return !target.isEnabled || target.isEnabled();
      }).each(function(target) {
        fn(target);
      });
  };

  var applyAll = function (targets, fname, args) {
    allEnabled(targets, function(target) {
      target[fname].apply(target, args);
    });
  };

  var addCallAllMethod = function (that, targets, fname) {
    that[fname] = function() {
      var args = __slice.call(arguments);
      applyAll(targets, fname, args);
    };
  };

  var mergeParams = function (targets, fname, args) {
    var params = {};
    allEnabled(targets, function(target) {
       _.extend(params, target[fname].apply(target, args));
    });
    return params;
  };

  // simple cases, just calling plugins sequentially
  var that = this;
  _([
    'applyStateOptionHook',
    'applyInitFunctorHook',
    'applyBlockstmtHook',
    'applyPrefixHook',
    'applyLexerHook',
    'applyMessagesHook'
  ]).each(function(fname) {
    addCallAllMethod(that, plugins, fname);
  });

  this.applyOptionalIdentifierHook = function(val) {
    var res = null;
    allEnabled(plugins, function(plugin) {
      res = res || plugin.applyOptionalIdentifierHook(val);
    });
    return res;
  };

  this.applyBalancedFatArrowHook = function() {
    return mergeParams(plugins, 'applyBalancedFatArrowHook');
  };

  this.ExpressionHook = function() {
    var hooks = [];
    allEnabled(plugins, function(plugin) {
      hooks.push(new plugin.ExpressionHook());
    });

    addCallAllMethod(this, hooks, 'parse');

    this.updateRunFud = function(runFud) {
      _(hooks).each(function(hook) {
        runFud = hook.updateRunFud(runFud);
      });
      return runFud;
    };

    this.doFunctionParams = function() {
      return mergeParams(hooks, 'doFunctionParams');
    };
  };

  this.StatementHook = function(t) {
    var hooks = [];
    allEnabled(plugins, function(plugin) {
      hooks.push(new plugin.StatementHook(t));
    });

    this.isBlock = function(isBlock) {
      _(hooks).each(function(hook) {
        isBlock = hook.isBlock(isBlock);
      });
      return isBlock;
    };
  };

  this.DoFunctionHook = function(opts) {
    var hooks = [];
    allEnabled(plugins, function(plugin) {
      hooks.push(new plugin.DoFunctionHook(opts));
    });

    addCallAllMethod(this, hooks,'updateFunctor');
    addCallAllMethod(this, hooks,'warnings');
  };

  this.ClassBodyHook = function(skipKeyword) {
    var hooks = [];
    allEnabled(plugins, function(plugin) {
      hooks.push(new plugin.ClassBodyHook(skipKeyword));
    });

    addCallAllMethod(this, hooks,'parse');

    this.doFunctionParams = function() {
      return mergeParams(hooks, 'doFunctionParams');
    };
  };

  this.ExportHook = function(that, ok, exported) {
    var hooks = [];
    allEnabled(plugins, function(plugin) {
      hooks.push(new plugin.ExportHook(that, ok, exported));
    });

    this.check = function() {
      var res = false;
      _(hooks).each(function(hook) {
        res = hook.check() || res;
      });
      return res;
    };

    addCallAllMethod(this, hooks,'applyHook');

  };

  return this;
};

module.exports = new Plugger();
