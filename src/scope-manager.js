"use strict";

var _      = require("lodash");
var events = require("events");

// Used to denote membership in lookup tables (a primitive value such as `true`
// would be silently rejected for the property name "__proto__" in some
// environments)
var marker = {};

/**
 * A factory function for creating scope managers. A scope manager tracks
 * variables and JSHint "labels", detecting when variables are referenced
 * (through "usages").
 *
 * Note that in this context, the term "label" describes an implementation
 * detail of JSHint and is not related to the ECMAScript language construct of
 * the same name. Where possible, the former is referred to as a "JSHint label"
 * to avoid confusion.
 *
 * @param {object} state - the global state object (see `state.js`)
 * @param {Array} predefined - a set of JSHint label names for built-in
 *                             bindings provided by the environment
 * @param {object} exported - a hash for JSHint label names that are intended
 *                            to be referenced in contexts beyond the current
 *                            program code
 * @param {object} declared - a hash for JSHint label names that were defined
 *                            as global bindings via linting configuration
 *
 * @returns {object} - a scope manager
 */
var scopeManager = function(state, predefined, exported, declared) {

  var _current;
  var _scopeStack = [];

  function _newScope(type) {
    _current = {
      "(labels)": Object.create(null),
      "(usages)": Object.create(null),
      "(breakLabels)": Object.create(null),
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

  function _setupUsages(labelName) {
    if (!_current["(usages)"][labelName]) {
      _current["(usages)"][labelName] = {
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
    // function parameters are validated by a dedicated function
    // assume that parameters are the only thing declared in the param scope
    if (_current["(type)"] === "functionparams") {
      _checkParams();
      return;
    }
    var curentLabels = _current["(labels)"];
    for (var labelName in curentLabels) {
      if (curentLabels[labelName]["(type)"] !== "exception" &&
        curentLabels[labelName]["(unused)"]) {
        _warnUnused(labelName, curentLabels[labelName]["(token)"], "var");
      }
    }
  }

  /**
   * Check the current scope for unused parameters and issue warnings as
   * necessary. This function may only be invoked when the current scope is a
   * "function parameter" scope.
   */
  function _checkParams() {
    var params = _current["(params)"];

    if (!params) {
      return;
    }

    var param = params.pop();
    var unused_opt;

    while (param) {
      var label = _current["(labels)"][param];

      unused_opt = _getUnusedOption(state.funct["(unusedOption)"]);

      // 'undefined' is a special case for the common pattern where `undefined`
      // is used as a formal parameter name to defend against global
      // re-assignment, e.g.
      //
      //     (function(window, undefined) {
      //     })();
      if (param === "undefined")
        return;

      if (label["(unused)"]) {
        _warnUnused(param, label["(token)"], "param", state.funct["(unusedOption)"]);
      } else if (unused_opt === "last-param") {
        return;
      }

      param = params.pop();
    }
  }

  /**
   * Find the relevant JSHint label's scope. The owning scope is located by
   * first inspecting the current scope and then moving "downward" through the
   * stack of scopes.
   *
   * @param {string} labelName - the value of the identifier
   *
   * @returns {Object} - the scope in which the JSHint label was found
   */
  function _getLabel(labelName) {
    for (var i = _scopeStack.length - 1 ; i >= 0; --i) {
      var scopeLabels = _scopeStack[i]["(labels)"];
      if (scopeLabels[labelName]) {
        return scopeLabels;
      }
    }
  }

  /**
   * Determine if a given JSHint label name has been referenced within the
   * current function or any function defined within.
   *
   * @param {string} labelName - the value of the identifier
   *
   * @returns {boolean}
   */
  function usedSoFarInCurrentFunction(labelName) {
    for (var i = _scopeStack.length - 1; i >= 0; i--) {
      var current = _scopeStack[i];
      if (current["(usages)"][labelName]) {
        return current["(usages)"][labelName];
      }
      if (current === _currentFunctBody) {
        break;
      }
    }
    return false;
  }

  function _checkOuterShadow(labelName, token) {

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
      if (outsideCurrentFunction && stackItem["(labels)"][labelName]) {
        warning("W123", token, labelName);
      }
      if (stackItem["(breakLabels)"][labelName]) {
        warning("W123", token, labelName);
      }
    }
  }

  function _latedefWarning(type, labelName, token) {
    var isFunction;

    if (state.option.latedef) {
      isFunction = type === "function" || type === "generator function" ||
        type === "async function";

      // if either latedef is strict and this is a function
      //    or this is not a function
      if ((state.option.latedef === true && isFunction) || !isFunction) {
        warning("W003", token, labelName);
      }
    }
  }

  var scopeManagerInst = {

    on: function(names, listener) {
      names.split(" ").forEach(function(name) {
        emitter.on(name, listener);
      });
    },

    isPredefined: function(labelName) {
      return !this.has(labelName) && _.has(_scopeStack[0]["(predefined)"], labelName);
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
      var currentLabels = _current["(labels)"];
      var usedLabelNameList = Object.keys(currentUsages);

      /* istanbul ignore if */
      if (currentUsages.__proto__ && usedLabelNameList.indexOf("__proto__") === -1) {
        usedLabelNameList.push("__proto__");
      }

      for (i = 0; i < usedLabelNameList.length; i++) {
        var usedLabelName = usedLabelNameList[i];

        var usage = currentUsages[usedLabelName];
        var usedLabel = currentLabels[usedLabelName];
        if (usedLabel) {
          var usedLabelType = usedLabel["(type)"];
          isImmutable = usedLabelType === "const" || usedLabelType === "import";

          if (usedLabel["(useOutsideOfScope)"] && !state.option.funcscope) {
            var usedTokens = usage["(tokens)"];
            for (j = 0; j < usedTokens.length; j++) {
              // Keep the consistency of https://github.com/jshint/jshint/issues/2409
              if (usedLabel["(function)"] === usedTokens[j]["(function)"]) {
                error("W038", usedTokens[j], usedLabelName);
              }
            }
          }

          // mark the label used
          _current["(labels)"][usedLabelName]["(unused)"] = false;

          // check for modifying a const
          if (isImmutable && usage["(modified)"]) {
            for (j = 0; j < usage["(modified)"].length; j++) {
              error("E013", usage["(modified)"][j], usedLabelName);
            }
          }

          isFunction = usedLabelType === "function" ||
            usedLabelType === "generator function" ||
            usedLabelType === "async function";

          // check for re-assigning a function declaration
          if ((isFunction || usedLabelType === "class") && usage["(reassigned)"]) {
            for (j = 0; j < usage["(reassigned)"].length; j++) {
              if (!usage["(reassigned)"][j].ignoreW021) {
                warning("W021", usage["(reassigned)"][j], usedLabelName, usedLabelType);
              }
            }
          }
          continue;
        }

        if (subScope) {
          var labelType = this.labeltype(usedLabelName);
          isImmutable = labelType === "const" ||
            (labelType === null && _scopeStack[0]["(predefined)"][usedLabelName] === false);
          if (isUnstackingFunctionOuter && !isImmutable) {
            if (!state.funct["(outerMutables)"]) {
              state.funct["(outerMutables)"] = [];
            }
            state.funct["(outerMutables)"].push(usedLabelName);
          }

          // not exiting the global scope, so copy the usage down in case its an out of scope usage
          if (!subScope["(usages)"][usedLabelName]) {
            subScope["(usages)"][usedLabelName] = usage;
            if (isUnstackingFunctionBody) {
              subScope["(usages)"][usedLabelName]["(onlyUsedSubFunction)"] = true;
            }
          } else {
            var subScopeUsage = subScope["(usages)"][usedLabelName];
            subScopeUsage["(modified)"] = subScopeUsage["(modified)"].concat(usage["(modified)"]);
            subScopeUsage["(tokens)"] = subScopeUsage["(tokens)"].concat(usage["(tokens)"]);
            subScopeUsage["(reassigned)"] =
              subScopeUsage["(reassigned)"].concat(usage["(reassigned)"]);
          }
        } else {
          // this is exiting global scope, so we finalise everything here - we are at the end of the file
          if (typeof _current["(predefined)"][usedLabelName] === "boolean") {

            // remove the declared token, so we know it is used
            delete declared[usedLabelName];

            // note it as used so it can be reported
            usedPredefinedAndGlobals[usedLabelName] = marker;

            // check for re-assigning a read-only (set to false) predefined
            if (_current["(predefined)"][usedLabelName] === false && usage["(reassigned)"]) {
              for (j = 0; j < usage["(reassigned)"].length; j++) {
                if (!usage["(reassigned)"][j].ignoreW020) {
                  warning("W020", usage["(reassigned)"][j]);
                }
              }
            }
          }
          else {
            // label usage is not predefined and we have not found a declaration
            // so report as undeclared
            for (j = 0; j < usage["(tokens)"].length; j++) {
              var undefinedToken = usage["(tokens)"][j];
              // if its not a forgiven undefined (e.g. typof x)
              if (!undefinedToken.forgiveUndef) {
                // if undef is on and undef was on when the token was defined
                if (state.option.undef && !undefinedToken.ignoreUndef) {
                  warning("W117", undefinedToken, usedLabelName);
                }
                if (impliedGlobals[usedLabelName]) {
                  impliedGlobals[usedLabelName].line.push(undefinedToken.line);
                } else {
                  impliedGlobals[usedLabelName] = {
                    name: usedLabelName,
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
          .forEach(function(labelNotUsed) {
            _warnUnused(labelNotUsed, declared[labelNotUsed], "var");
          });
      }

      // If this is not a function boundary, transfer function-scoped labels to
      // the parent block (a rough simulation of variable hoisting). Previously
      // existing labels in the parent block should take precedence so that things and stuff.
      if (subScope && !isUnstackingFunctionBody &&
        !isUnstackingFunctionParams && !isUnstackingFunctionOuter) {
        var labelNames = Object.keys(currentLabels);
        for (i = 0; i < labelNames.length; i++) {

          var defLabelName = labelNames[i];
          var defLabel = currentLabels[defLabelName];

          if (!defLabel["(blockscoped)"] && defLabel["(type)"] !== "exception") {
            var shadowed = subScope["(labels)"][defLabelName];

            // Do not overwrite a label if it exists in the parent scope
            // because it is shared by adjacent blocks. Copy the `unused`
            // property so that any references found within the current block
            // are counted toward that higher-level declaration.
            if (shadowed) {
              shadowed["(unused)"] &= defLabel["(unused)"];

            // "Hoist" the variable to the parent block, decorating the label
            // so that future references, though technically valid, can be
            // reported as "out-of-scope" in the absence of the `funcscope`
            // option.
            } else {
              defLabel["(useOutsideOfScope)"] =
                // Do not warn about out-of-scope usages in the global scope
                _currentFunctBody["(type)"] !== "global" &&
                // When a higher scope contains a binding for the label, the
                // label is a re-declaration and should not prompt "used
                // out-of-scope" warnings.
                !this.funct.has(defLabelName, { excludeCurrent: true });

              subScope["(labels)"][defLabelName] = defLabel;
            }

            delete currentLabels[defLabelName];
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
     * @param {string} labelName - the value of the identifier
     * @param {Token} token
     * @param {string} [type] - JSHint label type; defaults to "param"
     */
    addParam: function(labelName, token, type) {
      type = type || "param";

      if (type === "exception") {
        // if defined in the current function
        var previouslyDefinedLabelType = this.funct.labeltype(labelName);
        if (previouslyDefinedLabelType && previouslyDefinedLabelType !== "exception") {
          // and has not been used yet in the current function scope
          if (!state.option.node) {
            warning("W002", state.tokens.next, labelName);
          }
        }

        if (state.isStrict() && (labelName === "arguments" || labelName === "eval")) {
          warning("E008", token);
        }
      }

      // The variable was declared in the current scope
      if (_.has(_current["(labels)"], labelName)) {
        _current["(labels)"][labelName].duplicated = true;

      // The variable was declared in an outer scope
      } else {
        // if this scope has the variable defined, it's a re-definition error
        _checkOuterShadow(labelName, token);

        _current["(labels)"][labelName] = {
          "(type)" : type,
          "(token)": token,
          "(unused)": true };

        _current["(params)"].push(labelName);
      }

      if (_.has(_current["(usages)"], labelName)) {
        var usage = _current["(usages)"][labelName];
        // if its in a sub function it is not necessarily an error, just latedef
        if (usage["(onlyUsedSubFunction)"]) {
          _latedefWarning(type, labelName, token);
        } else {
          // this is a clear illegal usage for block scoped variables
          warning("E056", token, labelName, type);
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
        return;
      }

      currentFunctParamScope["(params)"].forEach(function(labelName) {
        var label = currentFunctParamScope["(labels)"][labelName];

        if (label.duplicated) {
          if (isStrict || isArrow || isMethod || !isSimple) {
            warning("E011", label["(token)"], labelName);
          } else if (state.option.shadow !== true) {
            warning("W004", label["(token)"], labelName);
          }
        }

        if (isStrict && (labelName === "arguments" || labelName === "eval")) {
          warning("E008", label["(token)"]);
        }
      });
    },

    getUsedOrDefinedGlobals: function() {
      // jshint proto: true
      var list = Object.keys(usedPredefinedAndGlobals);

      // If `__proto__` is used as a global variable name, its entry in the
      // lookup table may not be enumerated by `Object.keys` (depending on the
      // environment).
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

      // If `__proto__` is an implied global variable, its entry in the lookup
      // table may not be enumerated by `_.values` (depending on the
      // environment).
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
     * @param {string} labelName - the value of the identifier
     *
     * @return {boolean}
     */
    has: function(labelName) {
      return Boolean(_getLabel(labelName));
    },

    /**
     * Retrieve  described by `labelName` or null
     *
     * @param {string} labelName - the value of the identifier
     *
     * @returns {string|null} - the type of the JSHint label or `null` if no
     *                          such label exists
     */
    labeltype: function(labelName) {
      var scopeLabels = _getLabel(labelName);
      if (scopeLabels) {
        return scopeLabels[labelName]["(type)"];
      }
      return null;
    },

    /**
     * For the exported options, indicating a variable is used outside the file
     *
     * @param {string} labelName - the value of the identifier
     */
    addExported: function(labelName) {
      var globalLabels = _scopeStack[0]["(labels)"];
      if (_.has(declared, labelName)) {
        // remove the declared token, so we know it is used
        delete declared[labelName];
      } else if (_.has(globalLabels, labelName)) {
        globalLabels[labelName]["(unused)"] = false;
      } else {
        for (var i = 1; i < _scopeStack.length; i++) {
          var scope = _scopeStack[i];
          // if `scope.(type)` is not defined, it is a block scope
          if (!scope["(type)"]) {
            if (_.has(scope["(labels)"], labelName) &&
                !scope["(labels)"][labelName]["(blockscoped)"]) {
              scope["(labels)"][labelName]["(unused)"] = false;
              return;
            }
          } else {
            break;
          }
        }
        exported[labelName] = true;
      }
    },

    /**
     * Mark a JSHint label as "exported" by an ES2015 module
     *
     * @param {string} labelName - the value of the identifier
     * @param {object} token
     */
    setExported: function(labelName, token) {
      this.block.use(labelName, token);
    },

    /**
     * Mark a JSHint label as "initialized." This is necessary to enforce the
     * "temporal dead zone" (TDZ) of block-scoped bindings which are not
     * hoisted.
     *
     * @param {string} labelName - the value of the identifier
     */
    initialize: function(labelName) {
      if (_current["(labels)"][labelName]) {
        _current["(labels)"][labelName]["(initialized)"] = true;
      }
    },

    /**
     * Create a new JSHint label and add it to the current scope. Delegates to
     * the internal `block.add` or `func.add` methods depending on the type.
     * Produces warnings and errors as necessary.
     *
     * @param {string} labelName
     * @param {Object} opts
     * @param {String} opts.type - the type of the label e.g. "param", "var",
     *                             "let, "const", "import", "function",
     *                             "generator function", "async function",
     *                             "async generator function"
     * @param {object} opts.token - the token pointing at the declaration
     * @param {boolean} opts.initialized - whether the binding should be
     *                                     created in an "initialized" state.
     */
    addlabel: function(labelName, opts) {

      var type  = opts.type;
      var token = opts.token;
      var isblockscoped = type === "let" || type === "const" ||
        type === "class" || type === "import" || type === "generator function" ||
        type === "async function" || type === "async generator function";
      var ishoisted = type === "function" || type === "generator function" ||
        type === "async function" || type === "import";
      var isexported    = (isblockscoped ? _current : _currentFunctBody)["(type)"] === "global" &&
                          _.has(exported, labelName);

      // outer shadow check (inner is only on non-block scoped)
      _checkOuterShadow(labelName, token);

      if (state.isStrict() && (labelName === "arguments" || labelName === "eval")) {
        warning("E008", token);
      }

      if (isblockscoped) {

        var declaredInCurrentScope = _current["(labels)"][labelName];
        // for block scoped variables, params are seen in the current scope as the root function
        // scope, so check these too.
        if (!declaredInCurrentScope && _current === _currentFunctBody &&
          _current["(type)"] !== "global") {
          declaredInCurrentScope = !!_currentFunctBody["(parent)"]["(labels)"][labelName];
        }

        // if its not already defined (which is an error, so ignore) and is used in TDZ
        if (!declaredInCurrentScope && _current["(usages)"][labelName]) {
          var usage = _current["(usages)"][labelName];
          // if its in a sub function it is not necessarily an error, just latedef
          if (usage["(onlyUsedSubFunction)"] || ishoisted) {
            _latedefWarning(type, labelName, token);
          } else if (!ishoisted) {
            // this is a clear illegal usage for block scoped variables
            warning("E056", token, labelName, type);
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
          warning("E011", token, labelName);
        }
        else if (state.option.shadow === "outer") {

          // if shadow is outer, for block scope we want to detect any shadowing within this function
          if (scopeManagerInst.funct.has(labelName)) {
            warning("W004", token, labelName);
          }
        }

        scopeManagerInst.block.add(
          labelName, type, token, !isexported, opts.initialized
        );

      } else {

        var declaredInCurrentFunctionScope = scopeManagerInst.funct.has(labelName);

        // check for late definition, ignore if already declared
        if (!declaredInCurrentFunctionScope && usedSoFarInCurrentFunction(labelName)) {
          _latedefWarning(type, labelName, token);
        }

        // defining with a var or a function when a block scope variable of the same name
        // is in scope is an error
        if (scopeManagerInst.funct.has(labelName, { onlyBlockscoped: true })) {
          warning("E011", token, labelName);
        } else if (state.option.shadow !== true) {
          // now since we didn't get any block scope variables, test for var/function
          // shadowing
          if (declaredInCurrentFunctionScope && labelName !== "__proto__") {

            // see https://github.com/jshint/jshint/issues/2400
            if (_currentFunctBody["(type)"] !== "global") {
              warning("W004", token, labelName);
            }
          }
        }

        scopeManagerInst.funct.add(labelName, type, token, !isexported);

        if (_currentFunctBody["(type)"] === "global" && !state.impliedClosure()) {
          usedPredefinedAndGlobals[labelName] = marker;
        }
      }
    },

    funct: {
      /**
       * Return the type of the provided JSHint label given certain options
       *
       * @param {string} labelName
       * @param {Object=} [options]
       * @param {boolean} [options.onlyBlockscoped] - only include block scoped
       *                                              labels
       * @param {boolean} [options.excludeParams] - exclude the param scope
       * @param {boolean} [options.excludeCurrent] - exclude the current scope
       *
       * @returns {String}
       */
      labeltype: function(labelName, options) {
        var onlyBlockscoped = options && options.onlyBlockscoped;
        var excludeParams = options && options.excludeParams;
        var currentScopeIndex = _scopeStack.length - (options && options.excludeCurrent ? 2 : 1);
        for (var i = currentScopeIndex; i >= 0; i--) {
          var current = _scopeStack[i];
          if (current["(labels)"][labelName] &&
            (!onlyBlockscoped || current["(labels)"][labelName]["(blockscoped)"])) {
            return current["(labels)"][labelName]["(type)"];
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
      hasBreakLabel: function(labelName) {
        for (var i = _scopeStack.length - 1; i >= 0; i--) {
          var current = _scopeStack[i];

          if (current["(breakLabels)"][labelName]) {
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
       * @param {string} labelName - the value of the identifier
       * @param {object} options - options as supported by the
       *                           `funct.labeltype` method
       *
       * @return {boolean}
       */
      has: function(labelName, options) {
        return Boolean(this.labeltype(labelName, options));
      },

      /**
       * Create a new function-scoped JSHint label and add it to the current
       * scope. See the `block.add` method for coresponding logic to create
       * block-scoped JSHint labels.
       *
       * @param {string} labelName - the value of the identifier
       * @param {string} type - the type of the JSHint label; either "function"
       *                        or "var"
       * @param {object} tok - the token that triggered the definition
       * @param {boolean} unused - `true` if the JSHint label has not been
       *                           referenced
       */
      add: function(labelName, type, tok, unused) {
        _current["(labels)"][labelName] = {
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
       * Resolve a reference to a binding and mark the corresponding JSHint
       * label as "used."
       *
       * @param {string} labelName - the value of the identifier
       * @param {object} token - the token value that triggered the reference
       */
      use: function(labelName, token) {
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
        if (paramScope && paramScope["(labels)"][labelName] &&
          paramScope["(labels)"][labelName]["(type)"] === "param") {

          // then check its not declared by a block scope variable
          if (!scopeManagerInst.funct.has(labelName,
                { excludeParams: true, onlyBlockscoped: true })) {
            paramScope["(labels)"][labelName]["(unused)"] = false;
          }
        }

        if (token && (state.ignored.W117 || state.option.undef === false)) {
          token.ignoreUndef = true;
        }

        _setupUsages(labelName);

        _current["(usages)"][labelName]["(onlyUsedSubFunction)"] = false;

        if (token) {
          token["(function)"] = _currentFunctBody;
          _current["(usages)"][labelName]["(tokens)"].push(token);
        }

        // Block-scoped bindings can't be used within their initializer due to
        // "temporal dead zone" (TDZ) restrictions.
        var label = _current["(labels)"][labelName];
        if (label && label["(blockscoped)"] && !label["(initialized)"]) {
          error("E056", token, labelName, label["(type)"]);
        }
      },

      reassign: function(labelName, token) {
        token.ignoreW020 = state.ignored.W020;
        token.ignoreW021 = state.ignored.W021;

        this.modify(labelName, token);

        _current["(usages)"][labelName]["(reassigned)"].push(token);
      },

      modify: function(labelName, token) {

        _setupUsages(labelName);

        _current["(usages)"][labelName]["(onlyUsedSubFunction)"] = false;
        _current["(usages)"][labelName]["(modified)"].push(token);
      },

      /**
       * Create a new block-scoped JSHint label and add it to the current
       * scope. See the `funct.add` method for coresponding logic to create
       * function-scoped JSHint labels.
       *
       * @param {string} labelName - the value of the identifier
       * @param {string} type - the type of the JSHint label; one of "class",
       *                        "const", "function", "import", or "let"
       * @param {object} tok - the token that triggered the definition
       * @param {boolean} unused - `true` if the JSHint label has not been
       *                           referenced
       * @param {boolean} initialized - `true` if the JSHint label has been
       *                                initialized (as is the case with JSHint
       *                                labels created via `import`
       *                                declarations)
       */
      add: function(labelName, type, tok, unused, initialized) {
        _current["(labels)"][labelName] = {
          "(type)" : type,
          "(token)": tok,
          "(initialized)": !!initialized,
          "(blockscoped)": true,
          "(unused)": unused };
      },

      addBreakLabel: function(labelName, opts) {
        var token = opts.token;
        if (scopeManagerInst.funct.hasBreakLabel(labelName)) {
          warning("E011", token, labelName);
        }
        else if (state.option.shadow === "outer") {
          if (scopeManagerInst.funct.has(labelName)) {
            warning("W004", token, labelName);
          } else {
            _checkOuterShadow(labelName, token);
          }
        }
        _current["(breakLabels)"][labelName] = token;
      }
    }
  };
  return scopeManagerInst;
};

module.exports = scopeManager;
