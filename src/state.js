"use strict";
var NameStack = require("./name-stack.js");

var state = {
  syntax: {},

  /**
   * Determine if the code currently being linted is strict mode code.
   *
   * @returns {boolean}
   */
  isStrict: function() {
    return this.directive["use strict"] || this.inClassBody ||
      this.option.module || this.option.strict === "implied";
  },

  // Assumption: chronologically ES3 < ES5 < ES6/ESNext < Moz
  inMoz: function() {
    return this.option.moz && !this.option.esnext;
  },

  /**
   * @param {object} options
   * @param {boolean} options.strict - When `true`, only consider ESNext when
   *                                   in "esnext" code and *not* in "moz".
   */
  inESNext: function(strict) {
    if (strict) {
      return !this.option.moz && this.option.esnext;
    }
    return this.option.moz || this.option.esnext;
  },

  inES5: function() {
    return !this.option.es3;
  },

  inES3: function() {
    return this.option.es3;
  },


  reset: function() {
    this.tokens = {
      prev: null,
      next: null,
      curr: null
    };

    this.option = {};
    this.funct = null;
    this.ignored = {};
    this.directive = Object.create(null);
    this.jsonMode = false;
    this.jsonWarnings = [];
    this.lines = [];
    this.tab = "";
    this.cache = {}; // Node.JS doesn't have Map. Sniff.
    this.ignoredLines = {};
    this.forinifcheckneeded = false;
    this.nameStack = new NameStack();
    this.inClassBody = false;
  }
};

exports.state = state;
