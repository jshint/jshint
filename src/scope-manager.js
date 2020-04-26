"use strict";
/**
 * A note on `__proto__`:
 *
 * This file uses ordinary objects to track identifiers that are observed in
 * the input source code. It creates these objects using `Object.create` so
 * that the tracking objects have no prototype, allowing the `__proto__`
 * property to be used to store a value *without* triggering the invocation of
 * the built-in `Object.prototype.__proto__` accessor method. Some environments
 * (e.g. PhantomJS) do not implement the correct semantics for property
 * enumeration. In those environments, methods like `Object.keys` and Lodash's
 * `values` do not include the property name. This file includes a number of
 * branches which ensure that JSHint behaves consistently in those
 * environments. The branches must be ignored by the test coverage verification
 * system because the workaround is not necessary in the environment where
 * coverage is verified (i.e. Node.js).
 */

var _      = require("lodash");
var events = require("events");

// Used to denote membership in lookup tables (a primitive value such as `true`
// would be silently rejected for the property name "__proto__" in some
// environments)
var marker = {};

/**
 * A factory function for creating scope managers. A scope manager tracks
 * bindings, detecting when variables are referenced (through "usages").
 *
 * @param {object} state - the global state object (see `state.js`)
 * @param {Array} predefined - a set of binding names for built-in bindings
 *                             provided by the environment
 * @param {object} exported - a hash for binding names that are intended to be
 *                            referenced in contexts beyond the current program
 *                            code
 * @param {object} declared - a hash for binding names that were defined as
 *                            global bindings via linting configuration
 *
 * @returns {object} - a scope manager
 */
var scopeManager = function(state, predefined, exported, declared) {

  var _current;
  var _scopeStack = [];

  function _newScope(type) {
    _current = {
      "(bindings)": Object.create(null),
      "(usages)": Object.create(null),
      "(labels)": Object.create(null),
      "(parent)": _current,
      "(type)": type,
      "(params)": (type === "functionparams" || type === "catchparams") ? [] : null
    };
    _scopeStack.push(_current);
  }

  _newScope("global");
  _current["(predefined)"] = predefined;

  var _currentFunctBody = _current; // this is the block after the params = function

  var usedPredefinedAndGlobals = Object.create(null);
  var impliedGlobals = Object.create(null);
  var unuseds = [];
  var emitter = new events.EventEmitter();

  function warning(code, token) {
    emitter.emit("warning", {
      code: code,
      token: token,
      data: _.slice(arguments, 2)
    });
  }

  function error(code, token) {
    emitter.emit("warning", {
      code: code,
      token: token,
      data: _.slice(arguments, 2)
    });
  }

  function _setupUsages(bindingName) {
    if (!_current["(usages)"][bindingName]) {
      _current["(usages)"][bindingName] = {
        "(modified)": [],
        "(reassigned)": [],
        "(tokens)": []
      };
    }
  }

  var _getUnusedOption = function(unused_opt) {
    if (unused_opt === undefined) {
      unused_opt = state.option.unused;
    }

    if (unused_opt === true) {
      unused_opt = "last-param";
    }

    return unused_opt;
  };

  var _warnUnused = function(name, tkn, type, unused_opt) {
    var line = tkn.line;
    var chr  = tkn.from;
    var raw_name = tkn.raw_text || name;

    unused_opt = _getUnusedOption(unused_opt);

    var warnable_types = {
      "vars": ["var"],
      "last-param": ["var", "param"],
      "strict": ["var", "param", "last-param"]
    };

    if (unused_opt) {
      if (warnable_types[unused_opt] && warnable_types[unused_opt].indexOf(type) !== -1) {
        warning("W098", { line: line, from: chr }, raw_name);
      }
    }

    // inconsistent - see gh-1894
    if (unused_opt || type === "var") {
      unuseds.push({
        name: name,
        line: line,
        character: chr
      });
    }
  };

  /**
   * Check the current scope for unused identifiers
   */
  function _checkForUnused() {
    if (_current["(type)"] !== "functionparams") {
      var currentBindings = _current["(bindings)"];
      for (var bindingName in currentBindings) {
        if (currentBindings[bindingName]["(type)"] !== "exception" &&
          currentBindings[bindingName]["(unused)"]) {
          _warnUnused(bindingName, currentBindings[bindingName]["(token)"], "var");
        }
      }
      return;
    }

    // Check the current scope for unused parameters and issue warnings as
    // necessary.
    var params = _current["(params)"];

    var param = params.pop();
    var unused_opt;

    while (param) {
      var binding = _current["(bindings)"][param];

      unused_opt = _getUnusedOption(state.funct["(unusedOption)"]);

      // 'undefined' is a special case for the common pattern where `undefined`
      // is used as a formal parameter name to defend against global
      // re-assignment, e.g.
      //
      //     (function(window, undefined) {
      //     })();
      if (param === "undefined")
        return;

      if (binding["(unused)"]) {
        _warnUnused(param, binding["(token)"], "param", state.funct["(unusedOption)"]);
      } else if (unused_opt === "last-param") {
        return;
      }

      param = params.pop();
    }
  }

  /**
   * Find the relevant binding's scope. The owning scope is located by first
   * inspecting the current scope and then moving "downward" through the stack
   * of scopes.
   *
   * @param {string} bindingName - the value of the identifier
   *
   * @returns {Object} - the scope in which the binding was found
   */
  function _getBinding(bindingName) {
    for (var i = _scopeStack.length - 1 ; i >= 0; --i) {
      var scopeBindings = _scopeStack[i]["(bindings)"];
      if (scopeBindings[bindingName]) {
        return scopeBindings;
      }
    }
  }

  /**
   * Determine if a given binding name has been referenced within the current
   * function or any function defined within.
   *
   * @param {string} bindingName - the value of the identifier
   *
   * @returns {boolean}
   */
  function usedSoFarInCurrentFunction(bindingName) {
    for (var i = _scopeStack.length - 1; i >= 0; i--) {
      var current = _scopeStack[i];
      if (current["(usages)"][bindingName]) {
        return current["(usages)"][bindingName];
      }
      if (current === _currentFunctBody) {
        break;
      }
    }
    return false;
  }

  function _checkOuterShadow(bindingName, token) {

    // only check if shadow is outer
    if (state.option.shadow !== "outer") {
      return;
    }

    var isGlobal = _currentFunctBody["(type)"] === "global",
      isNewFunction = _current["(type)"] === "functionparams";

    var outsideCurrentFunction = !isGlobal;
    for (var i = 0; i < _scopeStack.length; i++) {
      var stackItem = _scopeStack[i];

      if (!isNewFunction && _scopeStack[i + 1] === _currentFunctBody) {
        outsideCurrentFunction = false;
      }
      if (outsideCurrentFunction && stackItem["(bindings)"][bindingName]) {
        warning("W123", token, bindingName);
      }
      if (stackItem["(labels)"][bindingName]) {
        warning("W123", token, bindingName);
      }
    }
  }

  function _latedefWarning(type, bindingName, token) {
    var isFunction;

    if (state.option.latedef) {
      isFunction = type === "function" || type === "generator function" ||
        type === "async function";

      // if either latedef is strict and this is a function
      //    or this is not a function
      if ((state.option.latedef === true && isFunction) || !isFunction) {
        warning("W003", token, bindingName);
      }
    }
  }

  var scopeManagerInst = {

    on: function(names, listener) {
      names.split(" ").forEach(function(name) {
        emitter.on(name, listener);
      });
    },

    isPredefined: function(bindingName) {
      return !this.has(bindingName) && _.has(_scopeStack[0]["(predefined)"], bindingName);
    },

    /**
     * Create a new scope within the current scope. As the topmost value, the
     * new scope will be interpreted as the current scope until it is
     * exited--see the `unstack` method.
     *
     * @param {string} [type] - The type of the scope. Valid values are
     *                          "functionparams", "catchparams" and
     *                          "functionouter"
     */
    stack: function(type) {
      var previousScope = _current;
      _newScope(type);

      if (!type && previousScope["(type)"] === "functionparams") {

        _current["(isFuncBody)"] = true;
        _currentFunctBody = _current;
      }
    },

    /**
     * Valldate all binding references and declarations in the current scope
     * and set the next scope on the stack as the active scope.
     */
    unstack: function() {
      // jshint proto: true
      var subScope = _scopeStack.length > 1 ? _scopeStack[_scopeStack.length - 2] : null;
      var isUnstackingFunctionBody = _current === _currentFunctBody,
        isUnstackingFunctionParams = _current["(type)"] === "functionparams",
        isUnstackingFunctionOuter = _current["(type)"] === "functionouter";

      var i, j, isImmutable, isFunction;
      var currentUsages = _current["(usages)"];
      var currentBindings = _current["(bindings)"];
      var usedBindingNameList = Object.keys(currentUsages);

      // See comment, "A note on `__proto__`"
      /* istanbul ignore if */
      if (currentUsages.__proto__ && usedBindingNameList.indexOf("__proto__") === -1) {
        usedBindingNameList.push("__proto__");
      }

      for (i = 0; i < usedBindingNameList.length; i++) {
        var usedBindingName = usedBindingNameList[i];

        var usage = currentUsages[usedBindingName];
        var usedBinding = currentBindings[usedBindingName];
        if (usedBinding) {
          var usedBindingType = usedBinding["(type)"];
          isImmutable = usedBindingType === "const" || usedBindingType === "import";

          if (usedBinding["(useOutsideOfScope)"] && !state.option.funcscope) {
            var usedTokens = usage["(tokens)"];
            for (j = 0; j < usedTokens.length; j++) {
              // Keep the consistency of https://github.com/jshint/jshint/issues/2409
              if (usedBinding["(function)"] === usedTokens[j]["(function)"]) {
                error("W038", usedTokens[j], usedBindingName);
              }
            }
          }

          // mark the binding used
          _current["(bindings)"][usedBindingName]["(unused)"] = false;

          // check for modifying a const
          if (isImmutable && usage["(modified)"]) {
            for (j = 0; j < usage["(modified)"].length; j++) {
              error("E013", usage["(modified)"][j], usedBindingName);
            }
          }

          isFunction = usedBindingType === "function" ||
            usedBindingType === "generator function" ||
            usedBindingType === "async function";

          // check for re-assigning a function declaration
          if ((isFunction || usedBindingType === "class") && usage["(reassigned)"]) {
            for (j = 0; j < usage["(reassigned)"].length; j++) {
              if (!usage["(reassigned)"][j].ignoreW021) {
                warning("W021", usage["(reassigned)"][j], usedBindingName, usedBindingType);
              }
            }
          }
          continue;
        }

        if (subScope) {
          var bindingType = this.bindingtype(usedBindingName);
          isImmutable = bindingType === "const" ||
            (bindingType === null && _scopeStack[0]["(predefined)"][usedBindingName] === false);
          if (isUnstackingFunctionOuter && !isImmutable) {
            if (!state.funct["(outerMutables)"]) {
              state.funct["(outerMutables)"] = [];
            }
            state.funct["(outerMutables)"].push(usedBindingName);
          }

          // not exiting the global scope, so copy the usage down in case its an out of scope usage
          if (!subScope["(usages)"][usedBindingName]) {
            subScope["(usages)"][usedBindingName] = usage;
            if (isUnstackingFunctionBody) {
              subScope["(usages)"][usedBindingName]["(onlyUsedSubFunction)"] = true;
            }
          } else {
            var subScopeUsage = subScope["(usages)"][usedBindingName];
            subScopeUsage["(modified)"] = subScopeUsage["(modified)"].concat(usage["(modified)"]);
            subScopeUsage["(tokens)"] = subScopeUsage["(tokens)"].concat(usage["(tokens)"]);
            subScopeUsage["(reassigned)"] =
              subScopeUsage["(reassigned)"].concat(usage["(reassigned)"]);
          }
        } else {
          // this is exiting global scope, so we finalise everything here - we are at the end of the file
          if (typeof _current["(predefined)"][usedBindingName] === "boolean") {

            // remove the declared token, so we know it is used
            delete declared[usedBindingName];

            // note it as used so it can be reported
            usedPredefinedAndGlobals[usedBindingName] = marker;

            // check for re-assigning a read-only (set to false) predefined
            if (_current["(predefined)"][usedBindingName] === false && usage["(reassigned)"]) {
              for (j = 0; j < usage["(reassigned)"].length; j++) {
                if (!usage["(reassigned)"][j].ignoreW020) {
                  warning("W020", usage["(reassigned)"][j]);
                }
              }
            }
          }
          else {
            // binding usage is not predefined and we have not found a declaration
            // so report as undeclared
            for (j = 0; j < usage["(tokens)"].length; j++) {
              var undefinedToken = usage["(tokens)"][j];
              // if its not a forgiven undefined (e.g. typof x)
              if (!undefinedToken.forgiveUndef) {
                // if undef is on and undef was on when the token was defined
                if (state.option.undef && !undefinedToken.ignoreUndef) {
                  warning("W117", undefinedToken, usedBindingName);
                }
                if (impliedGlobals[usedBindingName]) {
                  impliedGlobals[usedBindingName].line.push(undefinedToken.line);
                } else {
                  impliedGlobals[usedBindingName] = {
                    name: usedBindingName,
                    line: [undefinedToken.line]
                  };
                }
              }
            }
          }
        }
      }

      // if exiting the global scope, we can warn about declared globals that haven't been used yet
      if (!subScope) {
        Object.keys(declared)
          .forEach(function(bindingNotUsed) {
            _warnUnused(bindingNotUsed, declared[bindingNotUsed], "var");
          });
      }

      // If this is not a function boundary, transfer function-scoped bindings to
      // the parent block (a rough simulation of variable hoisting). Previously
      // existing bindings in the parent block should take precedence so that
      // prior usages are not discarded.
      if (subScope && !isUnstackingFunctionBody &&
        !isUnstackingFunctionParams && !isUnstackingFunctionOuter) {
        var bindingNames = Object.keys(currentBindings);
        for (i = 0; i < bindingNames.length; i++) {

          var defBindingName = bindingNames[i];
          var defBinding = currentBindings[defBindingName];

          if (!defBinding["(blockscoped)"] && defBinding["(type)"] !== "exception") {
            var shadowed = subScope["(bindings)"][defBindingName];

            // Do not overwrite a binding if it exists in the parent scope
            // because it is shared by adjacent blocks. Copy the `unused`
            // property so that any references found within the current block
            // are counted toward that higher-level declaration.
            if (shadowed) {
              shadowed["(unused)"] &= defBinding["(unused)"];

            // "Hoist" the variable to the parent block, decorating the binding
            // so that future references, though technically valid, can be
            // reported as "out-of-scope" in the absence of the `funcscope`
            // option.
            } else {
              defBinding["(useOutsideOfScope)"] =
                // Do not warn about out-of-scope usages in the global scope
                _currentFunctBody["(type)"] !== "global" &&
                // When a higher scope contains a binding for the binding, the
                // binding is a re-declaration and should not prompt "used
                // out-of-scope" warnings.
                !this.funct.has(defBindingName, { excludeCurrent: true });

              subScope["(bindings)"][defBindingName] = defBinding;
            }

            delete currentBindings[defBindingName];
          }
        }
      }

      _checkForUnused();

      _scopeStack.pop();
      if (isUnstackingFunctionBody) {
        _currentFunctBody = _scopeStack[_.findLastIndex(_scopeStack, function(scope) {
          // if function or if global (which is at the bottom so it will only return true if we call back)
          return scope["(isFuncBody)"] || scope["(type)"] === "global";
        })];
      }

      _current = subScope;
    },

    /**
     * Add a function parameter to the current scope.
     *
     * @param {string} bindingName - the value of the identifier
     * @param {Token} token
     * @param {string} [type] - binding type; defaults to "param"
     */
    addParam: function(bindingName, token, type) {
      type = type || "param";

      if (type === "exception") {
        // if defined in the current function
        var previouslyDefinedBindingType = this.funct.bindingtype(bindingName);
        if (previouslyDefinedBindingType && previouslyDefinedBindingType !== "exception") {
          // and has not been used yet in the current function scope
          if (!state.option.node) {
            warning("W002", state.tokens.next, bindingName);
          }
        }

        if (state.isStrict() && (bindingName === "arguments" || bindingName === "eval")) {
          warning("E008", token);
        }
      }

      // The variable was declared in the current scope
      if (_.has(_current["(bindings)"], bindingName)) {
        _current["(bindings)"][bindingName].duplicated = true;

      // The variable was declared in an outer scope
      } else {
        // if this scope has the variable defined, it's a re-definition error
        _checkOuterShadow(bindingName, token);

        _current["(bindings)"][bindingName] = {
          "(type)" : type,
          "(token)": token,
          "(unused)": true };

        _current["(params)"].push(bindingName);
      }

      if (_.has(_current["(usages)"], bindingName)) {
        var usage = _current["(usages)"][bindingName];
        // if its in a sub function it is not necessarily an error, just latedef
        if (usage["(onlyUsedSubFunction)"]) {
          _latedefWarning(type, bindingName, token);
        } else {
          // this is a clear illegal usage for block scoped variables
          warning("E056", token, bindingName, type);
        }
      }
    },

    validateParams: function(isArrow) {
      var isStrict = state.isStrict();
      var currentFunctParamScope = _currentFunctBody["(parent)"];
      // From ECMAScript 2017:
      //
      // > 14.1.2Static Semantics: Early Errors
      // >
      // > [...]
      // > - It is a Syntax Error if IsSimpleParameterList of
      // >   FormalParameterList is false and BoundNames of FormalParameterList
      // >   contains any duplicate elements.
      var isSimple = state.funct['(hasSimpleParams)'];
      // Method definitions are defined in terms of UniqueFormalParameters, so
      // they cannot support duplicate parameter names regardless of strict
      // mode.
      var isMethod = state.funct["(method)"];

      if (!currentFunctParamScope["(params)"]) {
        /* istanbul ignore next */
        return;
      }

      currentFunctParamScope["(params)"].forEach(function(bindingName) {
        var binding = currentFunctParamScope["(bindings)"][bindingName];

        if (binding.duplicated) {
          if (isStrict || isArrow || isMethod || !isSimple) {
            warning("E011", binding["(token)"], bindingName);
          } else if (state.option.shadow !== true) {
            warning("W004", binding["(token)"], bindingName);
          }
        }

        if (isStrict && (bindingName === "arguments" || bindingName === "eval")) {
          warning("E008", binding["(token)"]);
        }
      });
    },

    getUsedOrDefinedGlobals: function() {
      // jshint proto: true
      var list = Object.keys(usedPredefinedAndGlobals);

      // See comment, "A note on `__proto__`"
      /* istanbul ignore if */
      if (usedPredefinedAndGlobals.__proto__ === marker &&
        list.indexOf("__proto__") === -1) {
        list.push("__proto__");
      }

      return list;
    },

    /**
     * Get an array of implied globals
     *
     * @returns {Array.<{ name: string, line: Array.<number>}>}
     */
    getImpliedGlobals: function() {
      // jshint proto: true
      var values = _.values(impliedGlobals);
      var hasProto = false;

      // See comment, "A note on `__proto__`"
      if (impliedGlobals.__proto__) {
        hasProto = values.some(function(value) {
          return value.name === "__proto__";
        });

        /* istanbul ignore if */
        if (!hasProto) {
          values.push(impliedGlobals.__proto__);
        }
      }

      return values;
    },

    /**
     * Get an array of objects describing unused bindings.
     *
     * @returns {Array<Object>}
     */
    getUnuseds: function() {
      return unuseds;
    },

    /**
     * Determine if a given name has been defined in the current scope or any
     * lower scope.
     *
     * @param {string} bindingName - the value of the identifier
     *
     * @return {boolean}
     */
    has: function(bindingName) {
      return Boolean(_getBinding(bindingName));
    },

    /**
     * Retrieve binding described by `bindingName` or null
     *
     * @param {string} bindingName - the value of the identifier
     *
     * @returns {string|null} - the type of the binding or `null` if no such
     *                          binding exists
     */
    bindingtype: function(bindingName) {
      var scopeBindings = _getBinding(bindingName);
      if (scopeBindings) {
        return scopeBindings[bindingName]["(type)"];
      }
      return null;
    },

    /**
     * For the exported options, indicating a variable is used outside the file
     *
     * @param {string} bindingName - the value of the identifier
     */
    addExported: function(bindingName) {
      var globalBindings = _scopeStack[0]["(bindings)"];
      if (_.has(declared, bindingName)) {
        // remove the declared token, so we know it is used
        delete declared[bindingName];
      } else if (_.has(globalBindings, bindingName)) {
        globalBindings[bindingName]["(unused)"] = false;
      } else {
        for (var i = 1; i < _scopeStack.length; i++) {
          var scope = _scopeStack[i];
          // if `scope.(type)` is not defined, it is a block scope
          if (!scope["(type)"]) {
            if (_.has(scope["(bindings)"], bindingName) &&
                !scope["(bindings)"][bindingName]["(blockscoped)"]) {
              scope["(bindings)"][bindingName]["(unused)"] = false;
              return;
            }
          } else {
            break;
          }
        }
        exported[bindingName] = true;
      }
    },

    /**
     * Mark a binding as "exported" by an ES2015 module
     *
     * @param {string} bindingName - the value of the identifier
     * @param {object} token
     */
    setExported: function(bindingName, token) {
      this.block.use(bindingName, token);
    },

    /**
     * Mark a binding as "initialized." This is necessary to enforce the
     * "temporal dead zone" (TDZ) of block-scoped bindings which are not
     * hoisted.
     *
     * @param {string} bindingName - the value of the identifier
     */
    initialize: function(bindingName) {
      if (_current["(bindings)"][bindingName]) {
        _current["(bindings)"][bindingName]["(initialized)"] = true;
      }
    },

    /**
     * Create a new binding and add it to the current scope. Delegates to the
     * internal `block.add` or `func.add` methods depending on the type.
     * Produces warnings and errors as necessary.
     *
     * @param {string} bindingName
     * @param {Object} opts
     * @param {String} opts.type - the type of the binding e.g. "param", "var",
     *                             "let, "const", "import", "function",
     *                             "generator function", "async function",
     *                             "async generator function"
     * @param {object} opts.token - the token pointing at the declaration
     * @param {boolean} opts.initialized - whether the binding should be
     *                                     created in an "initialized" state.
     */
    addbinding: function(bindingName, opts) {

      var type  = opts.type;
      var token = opts.token;
      var isblockscoped = type === "let" || type === "const" ||
        type === "class" || type === "import" || type === "generator function" ||
        type === "async function" || type === "async generator function";
      var ishoisted = type === "function" || type === "generator function" ||
        type === "async function" || type === "import";
      var isexported    = (isblockscoped ? _current : _currentFunctBody)["(type)"] === "global" &&
                          _.has(exported, bindingName);

      // outer shadow check (inner is only on non-block scoped)
      _checkOuterShadow(bindingName, token);

      if (state.isStrict() && (bindingName === "arguments" || bindingName === "eval")) {
        warning("E008", token);
      }

      if (isblockscoped) {

        var declaredInCurrentScope = _current["(bindings)"][bindingName];
        // for block scoped variables, params are seen in the current scope as the root function
        // scope, so check these too.
        if (!declaredInCurrentScope && _current === _currentFunctBody &&
          _current["(type)"] !== "global") {
          declaredInCurrentScope = !!_currentFunctBody["(parent)"]["(bindings)"][bindingName];
        }

        // if its not already defined (which is an error, so ignore) and is used in TDZ
        if (!declaredInCurrentScope && _current["(usages)"][bindingName]) {
          var usage = _current["(usages)"][bindingName];
          // if its in a sub function it is not necessarily an error, just latedef
          if (usage["(onlyUsedSubFunction)"] || ishoisted) {
            _latedefWarning(type, bindingName, token);
          } else if (!ishoisted) {
            // this is a clear illegal usage for block scoped variables
            warning("E056", token, bindingName, type);
          }
        }

        // If this scope has already declared a binding with the same name,
        // then this represents a redeclaration error if:
        //
        // 1. it is a "hoisted" block-scoped binding within a block. For
        //    instance: generator functions may be redeclared in the global
        //    scope but not within block statements
        // 2. this is not a "hoisted" block-scoped binding
        if (declaredInCurrentScope &&
          (!ishoisted || (_current["(type)"] !== "global" || type === "import"))) {
          warning("E011", token, bindingName);
        }
        else if (state.option.shadow === "outer") {

          // if shadow is outer, for block scope we want to detect any shadowing within this function
          if (scopeManagerInst.funct.has(bindingName)) {
            warning("W004", token, bindingName);
          }
        }

        scopeManagerInst.block.add(
          bindingName, type, token, !isexported, opts.initialized
        );

      } else {

        var declaredInCurrentFunctionScope = scopeManagerInst.funct.has(bindingName);

        // check for late definition, ignore if already declared
        if (!declaredInCurrentFunctionScope && usedSoFarInCurrentFunction(bindingName)) {
          _latedefWarning(type, bindingName, token);
        }

        // defining with a var or a function when a block scope variable of the same name
        // is in scope is an error
        if (scopeManagerInst.funct.has(bindingName, { onlyBlockscoped: true })) {
          warning("E011", token, bindingName);
        } else if (state.option.shadow !== true) {
          // now since we didn't get any block scope variables, test for var/function
          // shadowing
          if (declaredInCurrentFunctionScope && bindingName !== "__proto__") {

            // see https://github.com/jshint/jshint/issues/2400
            if (_currentFunctBody["(type)"] !== "global") {
              warning("W004", token, bindingName);
            }
          }
        }

        scopeManagerInst.funct.add(bindingName, type, token, !isexported);

        if (_currentFunctBody["(type)"] === "global" && !state.impliedClosure()) {
          usedPredefinedAndGlobals[bindingName] = marker;
        }
      }
    },

    funct: {
      /**
       * Return the type of the provided binding given certain options
       *
       * @param {string} bindingName
       * @param {Object=} [options]
       * @param {boolean} [options.onlyBlockscoped] - only include block scoped
       *                                              bindings
       * @param {boolean} [options.excludeParams] - exclude the param scope
       * @param {boolean} [options.excludeCurrent] - exclude the current scope
       *
       * @returns {String}
       */
      bindingtype: function(bindingName, options) {
        var onlyBlockscoped = options && options.onlyBlockscoped;
        var excludeParams = options && options.excludeParams;
        var currentScopeIndex = _scopeStack.length - (options && options.excludeCurrent ? 2 : 1);
        for (var i = currentScopeIndex; i >= 0; i--) {
          var current = _scopeStack[i];
          if (current["(bindings)"][bindingName] &&
            (!onlyBlockscoped || current["(bindings)"][bindingName]["(blockscoped)"])) {
            return current["(bindings)"][bindingName]["(type)"];
          }
          var scopeCheck = excludeParams ? _scopeStack[ i - 1 ] : current;
          if (scopeCheck && scopeCheck["(type)"] === "functionparams") {
            return null;
          }
        }
        return null;
      },

      /**
       * Determine whether a `break` statement label exists in the function
       * scope.
       *
       * @param {string} labelName - the value of the identifier
       *
       * @returns {boolean}
       */
      hasLabel: function(labelName) {
        for (var i = _scopeStack.length - 1; i >= 0; i--) {
          var current = _scopeStack[i];

          if (current["(labels)"][labelName]) {
            return true;
          }
          if (current["(type)"] === "functionparams") {
            return false;
          }
        }
        return false;
      },

      /**
       * Determine if a given name has been defined in the current function
       * scope.
       *
       * @param {string} bindingName - the value of the identifier
       * @param {object} options - options as supported by the
       *                           `funct.bindingtype` method
       *
       * @return {boolean}
       */
      has: function(bindingName, options) {
        return Boolean(this.bindingtype(bindingName, options));
      },

      /**
       * Create a new function-scoped binding and add it to the current scope.
       * See the `block.add` method for coresponding logic to create
       * block-scoped bindings.
       *
       * @param {string} bindingName - the value of the identifier
       * @param {string} type - the type of the binding; either "function" or
       *                        "var"
       * @param {object} tok - the token that triggered the definition
       * @param {boolean} unused - `true` if the binding has not been
       *                           referenced
       */
      add: function(bindingName, type, tok, unused) {
        _current["(bindings)"][bindingName] = {
          "(type)" : type,
          "(token)": tok,
          "(blockscoped)": false,
          "(function)": _currentFunctBody,
          "(unused)": unused };
      }
    },

    block: {

      /**
       * Determine whether the current block scope is the global scope.
       *
       * @returns Boolean
       */
      isGlobal: function() {
        return _current["(type)"] === "global";
      },

      /**
       * Resolve a reference to a binding and mark the corresponding binding as
       * "used."
       *
       * @param {string} bindingName - the value of the identifier
       * @param {object} token - the token value that triggered the reference
       */
      use: function(bindingName, token) {
        // If the name resolves to a parameter of the current function, then do
        // not store usage. This is because in cases such as the following:
        //
        //     function(a) {
        //       var a;
        //       a = a;
        //     }
        //
        // the usage of `a` will resolve to the parameter, not to the unset
        // variable binding.
        var paramScope = _currentFunctBody["(parent)"];
        if (paramScope && paramScope["(bindings)"][bindingName] &&
          paramScope["(bindings)"][bindingName]["(type)"] === "param") {

          // then check its not declared by a block scope variable
          if (!scopeManagerInst.funct.has(bindingName,
                { excludeParams: true, onlyBlockscoped: true })) {
            paramScope["(bindings)"][bindingName]["(unused)"] = false;
          }
        }

        if (token && (state.ignored.W117 || state.option.undef === false)) {
          token.ignoreUndef = true;
        }

        _setupUsages(bindingName);

        _current["(usages)"][bindingName]["(onlyUsedSubFunction)"] = false;

        if (token) {
          token["(function)"] = _currentFunctBody;
          _current["(usages)"][bindingName]["(tokens)"].push(token);
        }

        // Block-scoped bindings can't be used within their initializer due to
        // "temporal dead zone" (TDZ) restrictions.
        var binding = _current["(bindings)"][bindingName];
        if (binding && binding["(blockscoped)"] && !binding["(initialized)"]) {
          error("E056", token, bindingName, binding["(type)"]);
        }
      },

      reassign: function(bindingName, token) {
        token.ignoreW020 = state.ignored.W020;
        token.ignoreW021 = state.ignored.W021;

        this.modify(bindingName, token);

        _current["(usages)"][bindingName]["(reassigned)"].push(token);
      },

      modify: function(bindingName, token) {

        _setupUsages(bindingName);

        _current["(usages)"][bindingName]["(onlyUsedSubFunction)"] = false;
        _current["(usages)"][bindingName]["(modified)"].push(token);
      },

      /**
       * Create a new block-scoped binding and add it to the current scope. See
       * the `funct.add` method for coresponding logic to create
       * function-scoped bindings.
       *
       * @param {string} bindingName - the value of the identifier
       * @param {string} type - the type of the binding; one of "class",
       *                        "const", "function", "import", or "let"
       * @param {object} tok - the token that triggered the definition
       * @param {boolean} unused - `true` if the binding has not been
       *                           referenced
       * @param {boolean} initialized - `true` if the binding has been
       *                                initialized (as is the case with
       *                                bindings created via `import`
       *                                declarations)
       */
      add: function(bindingName, type, tok, unused, initialized) {
        _current["(bindings)"][bindingName] = {
          "(type)" : type,
          "(token)": tok,
          "(initialized)": !!initialized,
          "(blockscoped)": true,
          "(unused)": unused };
      },

      addLabel: function(labelName, opts) {
        var token = opts.token;
        if (scopeManagerInst.funct.hasLabel(labelName)) {
          warning("E011", token, labelName);
        }
        else if (state.option.shadow === "outer") {
          if (scopeManagerInst.funct.has(labelName)) {
            warning("W004", token, labelName);
          } else {
            _checkOuterShadow(labelName, token);
          }
        }
        _current["(labels)"][labelName] = token;
      }
    }
  };
  return scopeManagerInst;
};

module.exports = scopeManager;
