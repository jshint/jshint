"use strict";

var _ = require("underscore");

function setprop(funct, name, values) {
  if (!funct["(properties)"][name])
    funct["(properties)"][name] = { unused: false };

  _.extend(funct["(properties)"][name], values);
}

function getprop(funct, name, prop) {
  if (!funct["(properties)"][name])
    return null;

  return funct["(properties)"][name][prop] || null;
}

function functor(name, token, scope, overwrites) {
  var funct = {
    "(name)"      : name,
    "(breakage)"  : 0,
    "(loopage)"   : 0,
    "(scope)"     : scope,
    "(tokens)"    : {},
    "(properties)": {},

    "(catch)"     : false,
    "(global)"    : false,

    "(line)"      : null,
    "(character)" : null,
    "(metrics)"   : null,
    "(statement)" : null,
    "(context)"   : null,
    "(blockscope)": null,
    "(comparray)" : null,
    "(generator)" : null,
    "(params)"    : null
  };

  if (token) {
    _.extend(funct, {
      "(line)"     : token.line,
      "(character)": token.character,
      "(metrics)"  : metrics(token)
    });
  }

  _.extend(funct, overwrites);

  if (funct["(context)"]) {
    funct["(blockscope)"] = funct["(context)"]["(blockscope)"];
    funct["(comparray)"]  = funct["(context)"]["(comparray)"];
  }

  return funct;
}

// token: function start token
function metrics(token) {
  return {
    token      : token,
    statements : 0,
    blockDepth : -1,
    complexity : 1,
  };
}

module.exports = {
  setprop: setprop,
  getprop: getprop,
  functor: functor,
  metrics: metrics
};