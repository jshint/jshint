"use strict";

exports.has = function(obj, key) {
  return obj !== null && obj !== undefined && Object.prototype.hasOwnProperty.call(obj, key);
};

exports.each = function(obj, fn) {
  if (Array.isArray(obj)) {
    obj.forEach(fn);
  } else {
    Object.keys(obj).forEach(function(k) { fn(obj[k], k); });
  }
};

exports.extend = function(dst) {
  for (var i = 1; i < arguments.length; i++) {
    var src = arguments[i];
    if (src) {
      for (var k in src) {
        if (Object.prototype.hasOwnProperty.call(src, k)) dst[k] = src[k];
      }
    }
  }
  return dst;
};

exports.clone = function(obj) {
  if (!obj) return obj;
  var r = {};
  for (var k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) r[k] = obj[k];
  }
  return r;
};

exports.includes = function(arr, val) { return arr.indexOf(val) !== -1; };

exports.isEmpty = function(val) {
  if (!val) return true;
  if (Array.isArray(val)) return val.length === 0;
  return Object.keys(val).length === 0;
};

exports.isNumber = function(val) { return typeof val === "number"; };

exports.reject = function(arr, fn) { return arr.filter(function(x) { return !fn(x); }); };

function makeZipMapper(i) {
  return function(a) { return a ? a[i] : undefined; };
}

exports.zip = function() {
  var args = Array.prototype.slice.call(arguments);
  var len = args.reduce(function(m, a) { return Math.max(m, a ? a.length : 0); }, 0);
  var result = [];
  for (var i = 0; i < len; i++) {
    result.push(args.map(makeZipMapper(i)));
  }
  return result;
};

exports.someArgs = function(args, fn) { return Array.prototype.some.call(args, fn); };

exports.findLastIndex = function(arr, fn) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (fn(arr[i])) return i;
  }
  return -1;
};

exports.sliceArgs = function(args, start, end) {
  return Array.prototype.slice.call(args, start, end);
};

exports.objectValues = function(obj) {
  return Object.keys(obj).map(function(k) { return obj[k]; });
};

exports.isArray = Array.isArray;

function mergeObjects(dst, src) {
  Object.keys(src).forEach(function(k) {
    if (src[k] && typeof src[k] === "object" && !Array.isArray(src[k])) {
      dst[k] = exports.mergeConfig(dst[k] && typeof dst[k] === "object" ? dst[k] : {}, src[k]);
    } else {
      dst[k] = src[k];
    }
  });
}

exports.mergeConfig = function mergeConfig(dst) {
  for (var i = 1; i < arguments.length; i++) {
    var src = arguments[i];
    if (!src || typeof src !== "object") continue;
    mergeObjects(dst, src);
  }
  return dst;
};
