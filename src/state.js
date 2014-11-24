"use strict";
var NameStack = require("./name-stack.js");

var state = {
  syntax: {},
  reset: function () {
    this.tokens = {
      prev: null,
      next: null,
      curr: null
    };

    this.option = {};
    this.ignored = {};
    this.directive = {};
    this.jsonMode = false;
    this.jsonWarnings = [];
    this.lines = [];
    this.tab = "";
    this.cache = {}; // Node.JS doesn't have Map. Sniff.
    this.ignoredLines = {};
    this.nameStack = new NameStack();

    // Blank out non-multi-line-commented lines when ignoring linter errors
    this.ignoreLinterErrors = false;
  },

  // Let's assume that chronologically ES3 < ES5 < ES6/ESNext < Moz

  inMoz: function (strict) {
    if (strict) {
      return this.option.moz && !this.option.esnext;
    }
    return this.option.moz;
  },

  inESNext: function (strict) {
    if (strict) {
      return !this.option.moz && this.option.esnext;
    }
    return this.option.moz || this.option.esnext;
  },

  inES5: function (/* strict */) {
    return !this.option.es3;
  },

  inES3: function (strict) {
    if (strict) {
      return !this.option.moz && !this.option.esnext && this.option.es3;
    }
    return this.option.es3;
  },

  asyncAwaitEnabled: function () {
    return this.option.experimental &&
      this.option.experimental.indexOf("asyncawait") >= 0;
  },

  asyncReqAwait: function () {
    return this.option.experimental &&
      this.option.experimental.indexOf("asyncreqawait") >= 0;
  },

};

exports.state = state;
