/*! 2.6.3 */
var JSHINT;
if (typeof window === 'undefined') window = {};
(function () {
var require;
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var identifierStartTable = [];

for (var i = 0; i < 128; i++) {
  identifierStartTable[i] =
    i === 36 ||           // $
    i >= 65 && i <= 90 || // A-Z
    i === 95 ||           // _
    i >= 97 && i <= 122;  // a-z
}

var identifierPartTable = [];

for (var i = 0; i < 128; i++) {
  identifierPartTable[i] =
    identifierStartTable[i] || // $, _, A-Z, a-z
    i >= 48 && i <= 57;        // 0-9
}

module.exports = {
  asciiIdentifierStartTable: identifierStartTable,
  asciiIdentifierPartTable: identifierPartTable
};

},{}],2:[function(require,module,exports){
var arr = [], str =  [[768,1],[769,111],[1155,5],[1425,45],[1471,1],[1473,2],[1476,2],[1479,1],[1552,11],[1611,31],[1648,1],[1750,7],[1759,6],[1767,2],[1770,4],[1776,10],[1809,1],[1840,27],[1958,11],[1984,10],[2027,9],[2070,4],[2075,9],[2085,3],[2089,5],[2137,3],[2276,27],[2304,4],[2362,3],[2366,18],[2385,7],[2402,2],[2406,10],[2433,3],[2492,1],[2494,7],[2503,2],[2507,3],[2519,1],[2530,2],[2534,10],[2561,3],[2620,1],[2622,5],[2631,2],[2635,3],[2641,1],[2662,12],[2677,1],[2689,3],[2748,1],[2750,8],[2759,3],[2763,3],[2786,2],[2790,10],[2817,3],[2876,1],[2878,7],[2887,2],[2891,3],[2902,2],[2914,2],[2918,10],[2946,1],[3006,5],[3014,3],[3018,4],[3031,1],[3046,10],[3073,3],[3134,7],[3142,3],[3146,4],[3157,2],[3170,2],[3174,10],[3202,2],[3260,1],[3262,7],[3270,3],[3274,4],[3285,2],[3298,2],[3302,10],[3330,2],[3390,7],[3398,3],[3402,4],[3415,1],[3426,2],[3430,10],[3458,2],[3530,1],[3535,6],[3542,1],[3544,8],[3570,2],[3633,1],[3636,7],[3655,8],[3664,10],[3761,1],[3764,6],[3771,2],[3784,6],[3792,10],[3864,2],[3872,10],[3893,1],[3895,1],[3897,1],[3902,2],[3953,20],[3974,2],[3981,11],[3993,36],[4038,1],[4139,20],[4160,10],[4182,4],[4190,3],[4194,3],[4199,7],[4209,4],[4226,12],[4239,15],[4957,3],[5906,3],[5938,3],[5970,2],[6002,2],[6068,32],[6109,1],[6112,10],[6155,3],[6160,10],[6313,1],[6432,12],[6448,12],[6470,10],[6576,17],[6600,2],[6608,10],[6679,5],[6741,10],[6752,29],[6783,11],[6800,10],[6912,5],[6964,17],[6992,10],[7019,9],[7040,3],[7073,13],[7088,10],[7142,14],[7204,20],[7232,10],[7248,10],[7376,3],[7380,21],[7405,1],[7410,3],[7616,39],[7676,4],[8204,2],[8255,2],[8276,1],[8400,13],[8417,1],[8421,12],[11503,3],[11647,1],[11744,32],[12330,6],[12441,2],[42528,10],[42607,1],[42612,10],[42655,1],[42736,2],[43010,1],[43014,1],[43019,1],[43043,5],[43136,2],[43188,17],[43216,10],[43232,18],[43264,10],[43302,8],[43335,13],[43392,4],[43443,14],[43472,10],[43561,14],[43587,1],[43596,2],[43600,10],[43643,1],[43696,1],[43698,3],[43703,2],[43710,2],[43713,1],[43755,5],[43765,2],[44003,8],[44012,2],[44016,10],[64286,1],[65024,16],[65056,7],[65075,2],[65101,3],[65296,10],[65343,1]];
for (var i = 0 ; i<str.length ; i++)
  for (var a=0 ; a<str[i][1] ; a++)
    arr.push(str[i][0]+a);
module.exports = arr;
},{}],3:[function(require,module,exports){
var arr = [], str =  [[170,1],[181,1],[186,1],[192,23],[216,31],[248,458],[710,12],[736,5],[748,1],[750,1],[880,5],[886,2],[890,4],[902,1],[904,3],[908,1],[910,20],[931,83],[1015,139],[1162,158],[1329,38],[1369,1],[1377,39],[1488,27],[1520,3],[1568,43],[1646,2],[1649,99],[1749,1],[1765,2],[1774,2],[1786,3],[1791,1],[1808,1],[1810,30],[1869,89],[1969,1],[1994,33],[2036,2],[2042,1],[2048,22],[2074,1],[2084,1],[2088,1],[2112,25],[2208,1],[2210,11],[2308,54],[2365,1],[2384,1],[2392,10],[2417,7],[2425,7],[2437,8],[2447,2],[2451,22],[2474,7],[2482,1],[2486,4],[2493,1],[2510,1],[2524,2],[2527,3],[2544,2],[2565,6],[2575,2],[2579,22],[2602,7],[2610,2],[2613,2],[2616,2],[2649,4],[2654,1],[2674,3],[2693,9],[2703,3],[2707,22],[2730,7],[2738,2],[2741,5],[2749,1],[2768,1],[2784,2],[2821,8],[2831,2],[2835,22],[2858,7],[2866,2],[2869,5],[2877,1],[2908,2],[2911,3],[2929,1],[2947,1],[2949,6],[2958,3],[2962,4],[2969,2],[2972,1],[2974,2],[2979,2],[2984,3],[2990,12],[3024,1],[3077,8],[3086,3],[3090,23],[3114,10],[3125,5],[3133,1],[3160,2],[3168,2],[3205,8],[3214,3],[3218,23],[3242,10],[3253,5],[3261,1],[3294,1],[3296,2],[3313,2],[3333,8],[3342,3],[3346,41],[3389,1],[3406,1],[3424,2],[3450,6],[3461,18],[3482,24],[3507,9],[3517,1],[3520,7],[3585,48],[3634,2],[3648,7],[3713,2],[3716,1],[3719,2],[3722,1],[3725,1],[3732,4],[3737,7],[3745,3],[3749,1],[3751,1],[3754,2],[3757,4],[3762,2],[3773,1],[3776,5],[3782,1],[3804,4],[3840,1],[3904,8],[3913,36],[3976,5],[4096,43],[4159,1],[4176,6],[4186,4],[4193,1],[4197,2],[4206,3],[4213,13],[4238,1],[4256,38],[4295,1],[4301,1],[4304,43],[4348,333],[4682,4],[4688,7],[4696,1],[4698,4],[4704,41],[4746,4],[4752,33],[4786,4],[4792,7],[4800,1],[4802,4],[4808,15],[4824,57],[4882,4],[4888,67],[4992,16],[5024,85],[5121,620],[5743,17],[5761,26],[5792,75],[5870,3],[5888,13],[5902,4],[5920,18],[5952,18],[5984,13],[5998,3],[6016,52],[6103,1],[6108,1],[6176,88],[6272,41],[6314,1],[6320,70],[6400,29],[6480,30],[6512,5],[6528,44],[6593,7],[6656,23],[6688,53],[6823,1],[6917,47],[6981,7],[7043,30],[7086,2],[7098,44],[7168,36],[7245,3],[7258,36],[7401,4],[7406,4],[7413,2],[7424,192],[7680,278],[7960,6],[7968,38],[8008,6],[8016,8],[8025,1],[8027,1],[8029,1],[8031,31],[8064,53],[8118,7],[8126,1],[8130,3],[8134,7],[8144,4],[8150,6],[8160,13],[8178,3],[8182,7],[8305,1],[8319,1],[8336,13],[8450,1],[8455,1],[8458,10],[8469,1],[8473,5],[8484,1],[8486,1],[8488,1],[8490,4],[8495,11],[8508,4],[8517,5],[8526,1],[8544,41],[11264,47],[11312,47],[11360,133],[11499,4],[11506,2],[11520,38],[11559,1],[11565,1],[11568,56],[11631,1],[11648,23],[11680,7],[11688,7],[11696,7],[11704,7],[11712,7],[11720,7],[11728,7],[11736,7],[11823,1],[12293,3],[12321,9],[12337,5],[12344,5],[12353,86],[12445,3],[12449,90],[12540,4],[12549,41],[12593,94],[12704,27],[12784,16],[13312,6582],[19968,20941],[40960,1165],[42192,46],[42240,269],[42512,16],[42538,2],[42560,47],[42623,25],[42656,80],[42775,9],[42786,103],[42891,4],[42896,4],[42912,11],[43000,10],[43011,3],[43015,4],[43020,23],[43072,52],[43138,50],[43250,6],[43259,1],[43274,28],[43312,23],[43360,29],[43396,47],[43471,1],[43520,41],[43584,3],[43588,8],[43616,23],[43642,1],[43648,48],[43697,1],[43701,2],[43705,5],[43712,1],[43714,1],[43739,3],[43744,11],[43762,3],[43777,6],[43785,6],[43793,6],[43808,7],[43816,7],[43968,35],[44032,11172],[55216,23],[55243,49],[63744,366],[64112,106],[64256,7],[64275,5],[64285,1],[64287,10],[64298,13],[64312,5],[64318,1],[64320,2],[64323,2],[64326,108],[64467,363],[64848,64],[64914,54],[65008,12],[65136,5],[65142,135],[65313,26],[65345,26],[65382,89],[65474,6],[65482,6],[65490,6],[65498,3]];
for (var i = 0 ; i<str.length ; i++)
  for (var a=0 ; a<str[i][1] ; a++)
    arr.push(str[i][0]+a);
module.exports = arr;
},{}],4:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":9}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],6:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],7:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],8:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],9:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":8,"_process":7,"inherits":6}],10:[function(require,module,exports){
(function (global){
/*global window, global*/
var util = require("util")
var assert = require("assert")
var now = require("date-now")

var slice = Array.prototype.slice
var console
var times = {}

if (typeof global !== "undefined" && global.console) {
    console = global.console
} else if (typeof window !== "undefined" && window.console) {
    console = window.console
} else {
    console = {}
}

var functions = [
    [log, "log"],
    [info, "info"],
    [warn, "warn"],
    [error, "error"],
    [time, "time"],
    [timeEnd, "timeEnd"],
    [trace, "trace"],
    [dir, "dir"],
    [consoleAssert, "assert"]
]

for (var i = 0; i < functions.length; i++) {
    var tuple = functions[i]
    var f = tuple[0]
    var name = tuple[1]

    if (!console[name]) {
        console[name] = f
    }
}

module.exports = console

function log() {}

function info() {
    console.log.apply(console, arguments)
}

function warn() {
    console.log.apply(console, arguments)
}

function error() {
    console.warn.apply(console, arguments)
}

function time(label) {
    times[label] = now()
}

function timeEnd(label) {
    var time = times[label]
    if (!time) {
        throw new Error("No such label: " + label)
    }

    var duration = now() - time
    console.log(label + ": " + duration + "ms")
}

function trace() {
    var err = new Error()
    err.name = "Trace"
    err.message = util.format.apply(null, arguments)
    console.error(err.stack)
}

function dir(object) {
    console.log(util.inspect(object) + "\n")
}

function consoleAssert(expression) {
    if (!expression) {
        var arr = slice.call(arguments, 1)
        assert.ok(false, util.format.apply(null, arr))
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"assert":4,"date-now":11,"util":9}],11:[function(require,module,exports){
module.exports = now

function now() {
    return new Date().getTime()
}

},{}],12:[function(require,module,exports){
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisherâ€“Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

},{}],13:[function(require,module,exports){
/*
 * Lexical analysis and token construction.
 */

"use strict";

var _      = require("underscore");
var events = require("events");
var reg    = require("./reg.js");
var state  = require("./state.js").state;

var unicodeData = require("../data/ascii-identifier-data.js");
var asciiIdentifierStartTable = unicodeData.asciiIdentifierStartTable;
var asciiIdentifierPartTable = unicodeData.asciiIdentifierPartTable;
var nonAsciiIdentifierStartTable = require("../data/non-ascii-identifier-start.js");
var nonAsciiIdentifierPartTable = require("../data/non-ascii-identifier-part-only.js");

// Some of these token types are from JavaScript Parser API
// while others are specific to JSHint parser.
// JS Parser API: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

var Token = {
  Identifier: 1,
  Punctuator: 2,
  NumericLiteral: 3,
  StringLiteral: 4,
  Comment: 5,
  Keyword: 6,
  NullLiteral: 7,
  BooleanLiteral: 8,
  RegExp: 9,
  TemplateHead: 10,
  TemplateMiddle: 11,
  TemplateTail: 12,
  NoSubstTemplate: 13
};

var Context = {
  Block: 1,
  Template: 2
};

// Object that handles postponed lexing verifications that checks the parsed
// environment state.

function asyncTrigger() {
  var _checks = [];

  return {
    push: function(fn) {
      _checks.push(fn);
    },

    check: function() {
      for (var check = 0; check < _checks.length; ++check) {
        _checks[check]();
      }

      _checks.splice(0, _checks.length);
    }
  };
}

/*
 * Lexer for JSHint.
 *
 * This object does a char-by-char scan of the provided source code
 * and produces a sequence of tokens.
 *
 *   var lex = new Lexer("var i = 0;");
 *   lex.start();
 *   lex.token(); // returns the next token
 *
 * You have to use the token() method to move the lexer forward
 * but you don't have to use its return value to get tokens. In addition
 * to token() method returning the next token, the Lexer object also
 * emits events.
 *
 *   lex.on("Identifier", function(data) {
 *     if (data.name.indexOf("_") >= 0) {
 *       // Produce a warning.
 *     }
 *   });
 *
 * Note that the token() method returns tokens in a JSLint-compatible
 * format while the event emitter uses a slightly modified version of
 * Mozilla's JavaScript Parser API. Eventually, we will move away from
 * JSLint format.
 */
function Lexer(source) {
  var lines = source;

  if (typeof lines === "string") {
    lines = lines
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n");
  }

  // If the first line is a shebang (#!), make it a blank and move on.
  // Shebangs are used by Node scripts.

  if (lines[0] && lines[0].substr(0, 2) === "#!") {
    if (lines[0].indexOf("node") !== -1) {
      state.option.node = true;
    }
    lines[0] = "";
  }

  this.emitter = new events.EventEmitter();
  this.source = source;
  this.setLines(lines);
  this.prereg = true;

  this.line = 0;
  this.char = 1;
  this.from = 1;
  this.input = "";
  this.inComment = false;
  this.context = [];
  this.templateStarts = [];

  for (var i = 0; i < state.option.indent; i += 1) {
    state.tab += " ";
  }
}

Lexer.prototype = {
  _lines: [],

  inContext: function(ctxType) {
    return this.context.length > 0 && this.context[this.context.length - 1].type === ctxType;
  },

  pushContext: function(ctxType) {
    this.context.push({ type: ctxType });
  },

  popContext: function() {
    return this.context.pop();
  },

  isContext: function(context) {
    return this.context.length > 0 && this.context[this.context.length - 1] === context;
  },

  currentContext: function() {
    return this.context.length > 0 && this.context[this.context.length - 1];
  },

  getLines: function() {
    this._lines = state.lines;
    return this._lines;
  },

  setLines: function(val) {
    this._lines = val;
    state.lines = this._lines;
  },

  /*
   * Return the next i character without actually moving the
   * char pointer.
   */
  peek: function(i) {
    return this.input.charAt(i || 0);
  },

  /*
   * Move the char pointer forward i times.
   */
  skip: function(i) {
    i = i || 1;
    this.char += i;
    this.input = this.input.slice(i);
  },

  /*
   * Subscribe to a token event. The API for this method is similar
   * Underscore.js i.e. you can subscribe to multiple events with
   * one call:
   *
   *   lex.on("Identifier Number", function(data) {
   *     // ...
   *   });
   */
  on: function(names, listener) {
    names.split(" ").forEach(function(name) {
      this.emitter.on(name, listener);
    }.bind(this));
  },

  /*
   * Trigger a token event. All arguments will be passed to each
   * listener.
   */
  trigger: function() {
    this.emitter.emit.apply(this.emitter, Array.prototype.slice.call(arguments));
  },

  /*
   * Postpone a token event. the checking condition is set as
   * last parameter, and the trigger function is called in a
   * stored callback. To be later called using the check() function
   * by the parser. This avoids parser's peek() to give the lexer
   * a false context.
   */
  triggerAsync: function(type, args, checks, fn) {
    checks.push(function() {
      if (fn()) {
        this.trigger(type, args);
      }
    }.bind(this));
  },

  /*
   * Extract a punctuator out of the next sequence of characters
   * or return 'null' if its not possible.
   *
   * This method's implementation was heavily influenced by the
   * scanPunctuator function in the Esprima parser's source code.
   */
  scanPunctuator: function() {
    var ch1 = this.peek();
    var ch2, ch3, ch4;

    switch (ch1) {
    // Most common single-character punctuators
    case ".":
      if ((/^[0-9]$/).test(this.peek(1))) {
        return null;
      }
      if (this.peek(1) === "." && this.peek(2) === ".") {
        return {
          type: Token.Punctuator,
          value: "..."
        };
      }
      /* falls through */
    case "(":
    case ")":
    case ";":
    case ",":
    case "[":
    case "]":
    case ":":
    case "~":
    case "?":
      return {
        type: Token.Punctuator,
        value: ch1
      };

    // A block/object opener
    case "{":
      this.pushContext(Context.Block);
      return {
        type: Token.Punctuator,
        value: ch1
      };

    // A block/object closer
    case "}":
      if (this.inContext(Context.Block)) {
        this.popContext();
      }
      return {
        type: Token.Punctuator,
        value: ch1
      };

    // A pound sign (for Node shebangs)
    case "#":
      return {
        type: Token.Punctuator,
        value: ch1
      };

    // We're at the end of input
    case "":
      return null;
    }

    // Peek more characters

    ch2 = this.peek(1);
    ch3 = this.peek(2);
    ch4 = this.peek(3);

    // 4-character punctuator: >>>=

    if (ch1 === ">" && ch2 === ">" && ch3 === ">" && ch4 === "=") {
      return {
        type: Token.Punctuator,
        value: ">>>="
      };
    }

    // 3-character punctuators: === !== >>> <<= >>=

    if (ch1 === "=" && ch2 === "=" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "==="
      };
    }

    if (ch1 === "!" && ch2 === "=" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "!=="
      };
    }

    if (ch1 === ">" && ch2 === ">" && ch3 === ">") {
      return {
        type: Token.Punctuator,
        value: ">>>"
      };
    }

    if (ch1 === "<" && ch2 === "<" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "<<="
      };
    }

    if (ch1 === ">" && ch2 === ">" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: ">>="
      };
    }

    // Fat arrow punctuator
    if (ch1 === "=" && ch2 === ">") {
      return {
        type: Token.Punctuator,
        value: ch1 + ch2
      };
    }

    // 2-character punctuators: <= >= == != ++ -- << >> && ||
    // += -= *= %= &= |= ^= (but not /=, see below)
    if (ch1 === ch2 && ("+-<>&|".indexOf(ch1) >= 0)) {
      return {
        type: Token.Punctuator,
        value: ch1 + ch2
      };
    }

    if ("<>=!+-*%&|^".indexOf(ch1) >= 0) {
      if (ch2 === "=") {
        return {
          type: Token.Punctuator,
          value: ch1 + ch2
        };
      }

      return {
        type: Token.Punctuator,
        value: ch1
      };
    }

    // Special case: /=.

    if (ch1 === "/") {
      if (ch2 === "=") {
        return {
          type: Token.Punctuator,
          value: "/="
        };
      }

      return {
        type: Token.Punctuator,
        value: "/"
      };
    }

    return null;
  },

  /*
   * Extract a comment out of the next sequence of characters and/or
   * lines or return 'null' if its not possible. Since comments can
   * span across multiple lines this method has to move the char
   * pointer.
   *
   * In addition to normal JavaScript comments (// and /*) this method
   * also recognizes JSHint- and JSLint-specific comments such as
   * /*jshint, /*jslint, /*globals and so on.
   */
  scanComments: function() {
    var ch1 = this.peek();
    var ch2 = this.peek(1);
    var rest = this.input.substr(2);
    var startLine = this.line;
    var startChar = this.char;

    // Create a comment token object and make sure it
    // has all the data JSHint needs to work with special
    // comments.

    function commentToken(label, body, opt) {
      var special = ["jshint", "jslint", "members", "member", "globals", "global", "exported"];
      var isSpecial = false;
      var value = label + body;
      var commentType = "plain";
      opt = opt || {};

      if (opt.isMultiline) {
        value += "*/";
      }

      body = body.replace(/\n/g, " ");

      special.forEach(function(str) {
        if (isSpecial) {
          return;
        }

        // Don't recognize any special comments other than jshint for single-line
        // comments. This introduced many problems with legit comments.
        if (label === "//" && str !== "jshint") {
          return;
        }

        if (body.charAt(str.length) === " " && body.substr(0, str.length) === str) {
          isSpecial = true;
          label = label + str;
          body = body.substr(str.length);
        }

        if (!isSpecial && body.charAt(0) === " " && body.charAt(str.length + 1) === " " &&
          body.substr(1, str.length) === str) {
          isSpecial = true;
          label = label + " " + str;
          body = body.substr(str.length + 1);
        }

        if (!isSpecial) {
          return;
        }

        switch (str) {
        case "member":
          commentType = "members";
          break;
        case "global":
          commentType = "globals";
          break;
        default:
          commentType = str;
        }
      });

      return {
        type: Token.Comment,
        commentType: commentType,
        value: value,
        body: body,
        isSpecial: isSpecial,
        isMultiline: opt.isMultiline || false,
        isMalformed: opt.isMalformed || false
      };
    }

    // End of unbegun comment. Raise an error and skip that input.
    if (ch1 === "*" && ch2 === "/") {
      this.trigger("error", {
        code: "E018",
        line: startLine,
        character: startChar
      });

      this.skip(2);
      return null;
    }

    // Comments must start either with // or /*
    if (ch1 !== "/" || (ch2 !== "*" && ch2 !== "/")) {
      return null;
    }

    // One-line comment
    if (ch2 === "/") {
      this.skip(this.input.length); // Skip to the EOL.
      return commentToken("//", rest);
    }

    var body = "";

    /* Multi-line comment */
    if (ch2 === "*") {
      this.inComment = true;
      this.skip(2);

      while (this.peek() !== "*" || this.peek(1) !== "/") {
        if (this.peek() === "") { // End of Line
          body += "\n";

          // If we hit EOF and our comment is still unclosed,
          // trigger an error and end the comment implicitly.
          if (!this.nextLine()) {
            this.trigger("error", {
              code: "E017",
              line: startLine,
              character: startChar
            });

            this.inComment = false;
            return commentToken("/*", body, {
              isMultiline: true,
              isMalformed: true
            });
          }
        } else {
          body += this.peek();
          this.skip();
        }
      }

      this.skip(2);
      this.inComment = false;
      return commentToken("/*", body, { isMultiline: true });
    }
  },

  /*
   * Extract a keyword out of the next sequence of characters or
   * return 'null' if its not possible.
   */
  scanKeyword: function() {
    var result = /^[a-zA-Z_$][a-zA-Z0-9_$]*/.exec(this.input);
    var keywords = [
      "if", "in", "do", "var", "for", "new",
      "try", "let", "this", "else", "case",
      "void", "with", "enum", "while", "break",
      "catch", "throw", "const", "yield", "class",
      "super", "return", "typeof", "delete",
      "switch", "export", "import", "default",
      "finally", "extends", "function", "continue",
      "debugger", "instanceof"
    ];

    if (result && keywords.indexOf(result[0]) >= 0) {
      return {
        type: Token.Keyword,
        value: result[0]
      };
    }

    return null;
  },

  /*
   * Extract a JavaScript identifier out of the next sequence of
   * characters or return 'null' if its not possible. In addition,
   * to Identifier this method can also produce BooleanLiteral
   * (true/false) and NullLiteral (null).
   */
  scanIdentifier: function() {
    var id = "";
    var index = 0;
    var type, char;

    function isNonAsciiIdentifierStart(code) {
      return nonAsciiIdentifierStartTable.indexOf(code) > -1;
    }

    function isNonAsciiIdentifierPart(code) {
      return isNonAsciiIdentifierStart(code) || nonAsciiIdentifierPartTable.indexOf(code) > -1;
    }

    function isHexDigit(str) {
      return (/^[0-9a-fA-F]$/).test(str);
    }

    var readUnicodeEscapeSequence = function() {
      /*jshint validthis:true */
      index += 1;

      if (this.peek(index) !== "u") {
        return null;
      }

      var ch1 = this.peek(index + 1);
      var ch2 = this.peek(index + 2);
      var ch3 = this.peek(index + 3);
      var ch4 = this.peek(index + 4);
      var code;

      if (isHexDigit(ch1) && isHexDigit(ch2) && isHexDigit(ch3) && isHexDigit(ch4)) {
        code = parseInt(ch1 + ch2 + ch3 + ch4, 16);

        if (asciiIdentifierPartTable[code] || isNonAsciiIdentifierPart(code)) {
          index += 5;
          return "\\u" + ch1 + ch2 + ch3 + ch4;
        }

        return null;
      }

      return null;
    }.bind(this);

    var getIdentifierStart = function() {
      /*jshint validthis:true */
      var chr = this.peek(index);
      var code = chr.charCodeAt(0);

      if (code === 92) {
        return readUnicodeEscapeSequence();
      }

      if (code < 128) {
        if (asciiIdentifierStartTable[code]) {
          index += 1;
          return chr;
        }

        return null;
      }

      if (isNonAsciiIdentifierStart(code)) {
        index += 1;
        return chr;
      }

      return null;
    }.bind(this);

    var getIdentifierPart = function() {
      /*jshint validthis:true */
      var chr = this.peek(index);
      var code = chr.charCodeAt(0);

      if (code === 92) {
        return readUnicodeEscapeSequence();
      }

      if (code < 128) {
        if (asciiIdentifierPartTable[code]) {
          index += 1;
          return chr;
        }

        return null;
      }

      if (isNonAsciiIdentifierPart(code)) {
        index += 1;
        return chr;
      }

      return null;
    }.bind(this);

    function removeEscapeSequences(id) {
      return id.replace(/\\u([0-9a-fA-F]{4})/g, function(m0, codepoint) {
        return String.fromCharCode(parseInt(codepoint, 16));
      });
    }

    char = getIdentifierStart();
    if (char === null) {
      return null;
    }

    id = char;
    for (;;) {
      char = getIdentifierPart();

      if (char === null) {
        break;
      }

      id += char;
    }

    switch (id) {
    case "true":
    case "false":
      type = Token.BooleanLiteral;
      break;
    case "null":
      type = Token.NullLiteral;
      break;
    default:
      type = Token.Identifier;
    }

    return {
      type: type,
      value: removeEscapeSequences(id),
      text: id,
      tokenLength: id.length
    };
  },

  /*
   * Extract a numeric literal out of the next sequence of
   * characters or return 'null' if its not possible. This method
   * supports all numeric literals described in section 7.8.3
   * of the EcmaScript 5 specification.
   *
   * This method's implementation was heavily influenced by the
   * scanNumericLiteral function in the Esprima parser's source code.
   */
  scanNumericLiteral: function() {
    var index = 0;
    var value = "";
    var length = this.input.length;
    var char = this.peek(index);
    var bad;
    var isAllowedDigit = isDecimalDigit;
    var base = 10;
    var isLegacy = false;

    function isDecimalDigit(str) {
      return (/^[0-9]$/).test(str);
    }

    function isOctalDigit(str) {
      return (/^[0-7]$/).test(str);
    }

    function isBinaryDigit(str) {
      return (/^[01]$/).test(str);
    }

    function isHexDigit(str) {
      return (/^[0-9a-fA-F]$/).test(str);
    }

    function isIdentifierStart(ch) {
      return (ch === "$") || (ch === "_") || (ch === "\\") ||
        (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
    }

    // Numbers must start either with a decimal digit or a point.

    if (char !== "." && !isDecimalDigit(char)) {
      return null;
    }

    if (char !== ".") {
      value = this.peek(index);
      index += 1;
      char = this.peek(index);

      if (value === "0") {
        // Base-16 numbers.
        if (char === "x" || char === "X") {
          isAllowedDigit = isHexDigit;
          base = 16;

          index += 1;
          value += char;
        }

        // Base-8 numbers.
        if (char === "o" || char === "O") {
          isAllowedDigit = isOctalDigit;
          base = 8;

          if (!state.option.esnext) {
            this.trigger("warning", {
              code: "W119",
              line: this.line,
              character: this.char,
              data: [ "Octal integer literal" ]
            });
          }

          index += 1;
          value += char;
        }

        // Base-2 numbers.
        if (char === "b" || char === "B") {
          isAllowedDigit = isBinaryDigit;
          base = 2;

          if (!state.option.esnext) {
            this.trigger("warning", {
              code: "W119",
              line: this.line,
              character: this.char,
              data: [ "Binary integer literal" ]
            });
          }

          index += 1;
          value += char;
        }

        // Legacy base-8 numbers.
        if (isOctalDigit(char)) {
          isAllowedDigit = isOctalDigit;
          base = 8;
          isLegacy = true;
          bad = false;

          index += 1;
          value += char;
        }

        // Decimal numbers that start with '0' such as '09' are illegal
        // but we still parse them and return as malformed.

        if (!isOctalDigit(char) && isDecimalDigit(char)) {
          index += 1;
          value += char;
        }
      }

      while (index < length) {
        char = this.peek(index);

        if (isLegacy && isDecimalDigit(char)) {
          // Numbers like '019' (note the 9) are not valid octals
          // but we still parse them and mark as malformed.
          bad = true;
        } else if (!isAllowedDigit(char)) {
          break;
        }
        value += char;
        index += 1;
      }

      if (isAllowedDigit !== isDecimalDigit) {
        if (!isLegacy && value.length <= 2) { // 0x
          return {
            type: Token.NumericLiteral,
            value: value,
            isMalformed: true
          };
        }

        if (index < length) {
          char = this.peek(index);
          if (isIdentifierStart(char)) {
            return null;
          }
        }

        return {
          type: Token.NumericLiteral,
          value: value,
          base: base,
          isLegacy: isLegacy,
          isMalformed: false
        };
      }
    }

    // Decimal digits.

    if (char === ".") {
      value += char;
      index += 1;

      while (index < length) {
        char = this.peek(index);
        if (!isDecimalDigit(char)) {
          break;
        }
        value += char;
        index += 1;
      }
    }

    // Exponent part.

    if (char === "e" || char === "E") {
      value += char;
      index += 1;
      char = this.peek(index);

      if (char === "+" || char === "-") {
        value += this.peek(index);
        index += 1;
      }

      char = this.peek(index);
      if (isDecimalDigit(char)) {
        value += char;
        index += 1;

        while (index < length) {
          char = this.peek(index);
          if (!isDecimalDigit(char)) {
            break;
          }
          value += char;
          index += 1;
        }
      } else {
        return null;
      }
    }

    if (index < length) {
      char = this.peek(index);
      if (isIdentifierStart(char)) {
        return null;
      }
    }

    return {
      type: Token.NumericLiteral,
      value: value,
      base: base,
      isMalformed: !isFinite(value)
    };
  },


  // Assumes previously parsed character was \ (=== '\\') and was not skipped.
  scanEscapeSequence: function(checks) {
    var allowNewLine = false;
    var jump = 1;
    this.skip();
    var char = this.peek();

    switch (char) {
    case "'":
      this.triggerAsync("warning", {
        code: "W114",
        line: this.line,
        character: this.char,
        data: [ "\\'" ]
      }, checks, function() {return state.jsonMode; });
      break;
    case "b":
      char = "\\b";
      break;
    case "f":
      char = "\\f";
      break;
    case "n":
      char = "\\n";
      break;
    case "r":
      char = "\\r";
      break;
    case "t":
      char = "\\t";
      break;
    case "0":
      char = "\\0";

      // Octal literals fail in strict mode.
      // Check if the number is between 00 and 07.
      var n = parseInt(this.peek(1), 10);
      this.triggerAsync("warning", {
        code: "W115",
        line: this.line,
        character: this.char
      }, checks,
      function() { return n >= 0 && n <= 7 && state.directive["use strict"]; });
      break;
    case "u":
      var hexCode = this.input.substr(1, 4);
      var code = parseInt(hexCode, 16);
      if (isNaN(code)) {
        this.trigger("warning", {
          code: "W052",
          line: this.line,
          character: this.char,
          data: [ "u" + hexCode ]
        });
      }
      char = String.fromCharCode(code);
      jump = 5;
      break;
    case "v":
      this.triggerAsync("warning", {
        code: "W114",
        line: this.line,
        character: this.char,
        data: [ "\\v" ]
      }, checks, function() { return state.jsonMode; });

      char = "\v";
      break;
    case "x":
      var  x = parseInt(this.input.substr(1, 2), 16);

      this.triggerAsync("warning", {
        code: "W114",
        line: this.line,
        character: this.char,
        data: [ "\\x-" ]
      }, checks, function() { return state.jsonMode; });

      char = String.fromCharCode(x);
      jump = 3;
      break;
    case "\\":
      char = "\\\\";
      break;
    case "\"":
      char = "\\\"";
      break;
    case "/":
      break;
    case "":
      allowNewLine = true;
      char = "";
      break;
    }

    return { char: char, jump: jump, allowNewLine: allowNewLine };
  },

  /*
   * Extract a template literal out of the next sequence of characters
   * and/or lines or return 'null' if its not possible. Since template
   * literals can span across multiple lines, this method has to move
   * the char pointer.
   */
  scanTemplateLiteral: function(checks) {
    var tokenType;
    var value = "";
    var ch;
    var startLine = this.line;
    var startChar = this.char;
    var depth = this.templateStarts.length;

    if (!state.option.esnext) {
      // Only lex template strings in ESNext mode.
      return null;
    } else if (this.peek() === "`") {
      // Template must start with a backtick.
      tokenType = Token.TemplateHead;
      this.templateStarts.push({ line: this.line, char: this.char });
      depth = this.templateStarts.length;
      this.skip(1);
      this.pushContext(Context.Template);
    } else if (this.inContext(Context.Template) && this.peek() === "}") {
      // If we're in a template context, and we have a '}', lex a TemplateMiddle.
      tokenType = Token.TemplateMiddle;
    } else {
      // Go lex something else.
      return null;
    }

    while (this.peek() !== "`") {
      while ((ch = this.peek()) === "") {
        value += "\n";
        if (!this.nextLine()) {
          // Unclosed template literal --- point to the starting "`"
          var startPos = this.templateStarts.pop();
          this.trigger("error", {
            code: "E052",
            line: startPos.line,
            character: startPos.char
          });
          return {
            type: tokenType,
            value: value,
            startLine: startLine,
            startChar: startChar,
            isUnclosed: true,
            depth: depth,
            context: this.popContext()
          };
        }
      }

      if (ch === '$' && this.peek(1) === '{') {
        value += '${';
        this.skip(2);
        return {
          type: tokenType,
          value: value,
          startLine: startLine,
          startChar: startChar,
          isUnclosed: false,
          depth: depth,
          context: this.currentContext()
        };
      } else if (ch === '\\') {
        var escape = this.scanEscapeSequence(checks);
        value += escape.char;
        this.skip(escape.jump);
      } else if (ch !== '`') {
        // Otherwise, append the value and continue.
        value += ch;
        this.skip(1);
      }
    }

    // Final value is either NoSubstTemplate or TemplateTail
    tokenType = tokenType === Token.TemplateHead ? Token.NoSubstTemplate : Token.TemplateTail;
    this.skip(1);
    this.templateStarts.pop();

    return {
      type: tokenType,
      value: value,
      startLine: startLine,
      startChar: startChar,
      isUnclosed: false,
      depth: depth,
      context: this.popContext()
    };
  },

  /*
   * Extract a string out of the next sequence of characters and/or
   * lines or return 'null' if its not possible. Since strings can
   * span across multiple lines this method has to move the char
   * pointer.
   *
   * This method recognizes pseudo-multiline JavaScript strings:
   *
   *   var str = "hello\
   *   world";
   */
  scanStringLiteral: function(checks) {
    /*jshint loopfunc:true */
    var quote = this.peek();

    // String must start with a quote.
    if (quote !== "\"" && quote !== "'") {
      return null;
    }

    // In JSON strings must always use double quotes.
    this.triggerAsync("warning", {
      code: "W108",
      line: this.line,
      character: this.char // +1?
    }, checks, function() { return state.jsonMode && quote !== "\""; });

    var value = "";
    var startLine = this.line;
    var startChar = this.char;
    var allowNewLine = false;

    this.skip();

    while (this.peek() !== quote) {
      while (this.peek() === "") { // End Of Line

        // If an EOL is not preceded by a backslash, show a warning
        // and proceed like it was a legit multi-line string where
        // author simply forgot to escape the newline symbol.
        //
        // Another approach is to implicitly close a string on EOL
        // but it generates too many false positives.

        if (!allowNewLine) {
          this.trigger("warning", {
            code: "W112",
            line: this.line,
            character: this.char
          });
        } else {
          allowNewLine = false;

          // Otherwise show a warning if multistr option was not set.
          // For JSON, show warning no matter what.

          this.triggerAsync("warning", {
            code: "W043",
            line: this.line,
            character: this.char
          }, checks, function() { return !state.option.multistr; });

          this.triggerAsync("warning", {
            code: "W042",
            line: this.line,
            character: this.char
          }, checks, function() { return state.jsonMode && state.option.multistr; });
        }

        // If we get an EOF inside of an unclosed string, show an
        // error and implicitly close it at the EOF point.

        if (!this.nextLine()) {
          this.trigger("error", {
            code: "E029",
            line: startLine,
            character: startChar
          });

          return {
            type: Token.StringLiteral,
            value: value,
            startLine: startLine,
            startChar: startChar,
            isUnclosed: true,
            quote: quote
          };
        }
      }

      allowNewLine = false;
      var char = this.peek();
      var jump = 1; // A length of a jump, after we're done
                    // parsing this character.

      if (char < " ") {
        // Warn about a control character in a string.
        this.trigger("warning", {
          code: "W113",
          line: this.line,
          character: this.char,
          data: [ "<non-printable>" ]
        });
      }

      // Special treatment for some escaped characters.
      if (char === "\\") {
        var parsed = this.scanEscapeSequence(checks);
        char = parsed.char;
        jump = parsed.jump;
        allowNewLine = parsed.allowNewLine;
      }

      value += char;
      this.skip(jump);
    }

    this.skip();
    return {
      type: Token.StringLiteral,
      value: value,
      startLine: startLine,
      startChar: startChar,
      isUnclosed: false,
      quote: quote
    };
  },

  /*
   * Extract a regular expression out of the next sequence of
   * characters and/or lines or return 'null' if its not possible.
   *
   * This method is platform dependent: it accepts almost any
   * regular expression values but then tries to compile and run
   * them using system's RegExp object. This means that there are
   * rare edge cases where one JavaScript engine complains about
   * your regular expression while others don't.
   */
  scanRegExp: function() {
    var index = 0;
    var length = this.input.length;
    var char = this.peek();
    var value = char;
    var body = "";
    var flags = [];
    var malformed = false;
    var isCharSet = false;
    var terminated;

    var scanUnexpectedChars = function() {
      // Unexpected control character
      if (char < " ") {
        malformed = true;
        this.trigger("warning", {
          code: "W048",
          line: this.line,
          character: this.char
        });
      }

      // Unexpected escaped character
      if (char === "<") {
        malformed = true;
        this.trigger("warning", {
          code: "W049",
          line: this.line,
          character: this.char,
          data: [ char ]
        });
      }
    }.bind(this);

    // Regular expressions must start with '/'
    if (!this.prereg || char !== "/") {
      return null;
    }

    index += 1;
    terminated = false;

    // Try to get everything in between slashes. A couple of
    // cases aside (see scanUnexpectedChars) we don't really
    // care whether the resulting expression is valid or not.
    // We will check that later using the RegExp object.

    while (index < length) {
      char = this.peek(index);
      value += char;
      body += char;

      if (isCharSet) {
        if (char === "]") {
          if (this.peek(index - 1) !== "\\" || this.peek(index - 2) === "\\") {
            isCharSet = false;
          }
        }

        if (char === "\\") {
          index += 1;
          char = this.peek(index);
          body += char;
          value += char;

          scanUnexpectedChars();
        }

        index += 1;
        continue;
      }

      if (char === "\\") {
        index += 1;
        char = this.peek(index);
        body += char;
        value += char;

        scanUnexpectedChars();

        if (char === "/") {
          index += 1;
          continue;
        }

        if (char === "[") {
          index += 1;
          continue;
        }
      }

      if (char === "[") {
        isCharSet = true;
        index += 1;
        continue;
      }

      if (char === "/") {
        body = body.substr(0, body.length - 1);
        terminated = true;
        index += 1;
        break;
      }

      index += 1;
    }

    // A regular expression that was never closed is an
    // error from which we cannot recover.

    if (!terminated) {
      this.trigger("error", {
        code: "E015",
        line: this.line,
        character: this.from
      });

      return void this.trigger("fatal", {
        line: this.line,
        from: this.from
      });
    }

    // Parse flags (if any).

    while (index < length) {
      char = this.peek(index);
      if (!/[gim]/.test(char)) {
        break;
      }
      flags.push(char);
      value += char;
      index += 1;
    }

    // Check regular expression for correctness.

    try {
      new RegExp(body, flags.join(""));
    } catch (err) {
      malformed = true;
      this.trigger("error", {
        code: "E016",
        line: this.line,
        character: this.char,
        data: [ err.message ] // Platform dependent!
      });
    }

    return {
      type: Token.RegExp,
      value: value,
      flags: flags,
      isMalformed: malformed
    };
  },

  /*
   * Scan for any occurrence of non-breaking spaces. Non-breaking spaces
   * can be mistakenly typed on OS X with option-space. Non UTF-8 web
   * pages with non-breaking pages produce syntax errors.
   */
  scanNonBreakingSpaces: function() {
    return state.option.nonbsp ?
      this.input.search(/(\u00A0)/) : -1;
  },

  /*
   * Scan for characters that get silently deleted by one or more browsers.
   */
  scanUnsafeChars: function() {
    return this.input.search(reg.unsafeChars);
  },

  /*
   * Produce the next raw token or return 'null' if no tokens can be matched.
   * This method skips over all space characters.
   */
  next: function(checks) {
    this.from = this.char;

    // Move to the next non-space character.
    var start;
    if (/\s/.test(this.peek())) {
      start = this.char;

      while (/\s/.test(this.peek())) {
        this.from += 1;
        this.skip();
      }
    }

    // Methods that work with multi-line structures and move the
    // character pointer.

    var match = this.scanComments() ||
      this.scanStringLiteral(checks) ||
      this.scanTemplateLiteral(checks);

    if (match) {
      return match;
    }

    // Methods that don't move the character pointer.

    match =
      this.scanRegExp() ||
      this.scanPunctuator() ||
      this.scanKeyword() ||
      this.scanIdentifier() ||
      this.scanNumericLiteral();

    if (match) {
      this.skip(match.tokenLength || match.value.length);
      return match;
    }

    // No token could be matched, give up.

    return null;
  },

  /*
   * Switch to the next line and reset all char pointers. Once
   * switched, this method also checks for other minor warnings.
   */
  nextLine: function() {
    var char;

    if (this.line >= this.getLines().length) {
      return false;
    }

    this.input = this.getLines()[this.line];
    this.line += 1;
    this.char = 1;
    this.from = 1;

    var inputTrimmed = this.input.trim();

    var startsWith = function() {
      return _.some(arguments, function(prefix) {
        return inputTrimmed.indexOf(prefix) === 0;
      });
    };

    var endsWith = function() {
      return _.some(arguments, function(suffix) {
        return inputTrimmed.indexOf(suffix, inputTrimmed.length - suffix.length) !== -1;
      });
    };

    // If we are ignoring linter errors, replace the input with empty string
    // if it doesn't already at least start or end a multi-line comment
    if (state.ignoreLinterErrors === true) {
      if (!startsWith("/*", "//") && !(this.inComment && endsWith("*/"))) {
        this.input = "";
      }
    }

    char = this.scanNonBreakingSpaces();
    if (char >= 0) {
      this.trigger("warning", { code: "W125", line: this.line, character: char + 1 });
    }

    this.input = this.input.replace(/\t/g, state.tab);
    char = this.scanUnsafeChars();

    if (char >= 0) {
      this.trigger("warning", { code: "W100", line: this.line, character: char });
    }

    // If there is a limit on line length, warn when lines get too
    // long.

    if (state.option.maxlen && state.option.maxlen < this.input.length) {
      var inComment = this.inComment ||
        startsWith.call(inputTrimmed, "//") ||
        startsWith.call(inputTrimmed, "/*");

      var shouldTriggerError = !inComment || !reg.maxlenException.test(inputTrimmed);

      if (shouldTriggerError) {
        this.trigger("warning", { code: "W101", line: this.line, character: this.input.length });
      }
    }

    return true;
  },

  /*
   * This is simply a synonym for nextLine() method with a friendlier
   * public name.
   */
  start: function() {
    this.nextLine();
  },

  /*
   * Produce the next token. This function is called by advance() to get
   * the next token. It returns a token in a JSLint-compatible format.
   */
  token: function() {
    /*jshint loopfunc:true */
    var checks = asyncTrigger();
    var token;


    function isReserved(token, isProperty) {
      if (!token.reserved) {
        return false;
      }
      var meta = token.meta;

      if (meta && meta.isFutureReservedWord && state.option.inES5()) {
        // ES3 FutureReservedWord in an ES5 environment.
        if (!meta.es5) {
          return false;
        }

        // Some ES5 FutureReservedWord identifiers are active only
        // within a strict mode environment.
        if (meta.strictOnly) {
          if (!state.option.strict && !state.directive["use strict"]) {
            return false;
          }
        }

        if (isProperty) {
          return false;
        }
      }

      return true;
    }

    // Produce a token object.
    var create = function(type, value, isProperty, token) {
      /*jshint validthis:true */
      var obj;

      if (type !== "(endline)" && type !== "(end)") {
        this.prereg = false;
      }

      if (type === "(punctuator)") {
        switch (value) {
        case ".":
        case ")":
        case "~":
        case "#":
        case "]":
        case "++":
        case "--":
          this.prereg = false;
          break;
        default:
          this.prereg = true;
        }

        obj = Object.create(state.syntax[value] || state.syntax["(error)"]);
      }

      if (type === "(identifier)") {
        if (value === "return" || value === "case" || value === "typeof") {
          this.prereg = true;
        }

        if (_.has(state.syntax, value)) {
          obj = Object.create(state.syntax[value] || state.syntax["(error)"]);

          // If this can't be a reserved keyword, reset the object.
          if (!isReserved(obj, isProperty && type === "(identifier)")) {
            obj = null;
          }
        }
      }

      if (!obj) {
        obj = Object.create(state.syntax[type]);
      }

      obj.identifier = (type === "(identifier)");
      obj.type = obj.type || type;
      obj.value = value;
      obj.line = this.line;
      obj.character = this.char;
      obj.from = this.from;
      if (obj.identifier && token) obj.raw_text = token.text || token.value;
      if (token && token.startLine && token.startLine !== this.line) {
        obj.startLine = token.startLine;
      }
      if (token && token.context) {
        // Context of current token
        obj.context = token.context;
      }
      if (token && token.depth) {
        // Nested template depth
        obj.depth = token.depth;
      }
      if (token && token.isUnclosed) {
        // Mark token as unclosed string / template literal
        obj.isUnclosed = token.isUnclosed;
      }

      if (isProperty && obj.identifier) {
        obj.isProperty = isProperty;
      }

      obj.check = checks.check;

      return obj;
    }.bind(this);

    for (;;) {
      if (!this.input.length) {
        return create(this.nextLine() ? "(endline)" : "(end)", "");
      }

      token = this.next(checks);

      if (!token) {
        if (this.input.length) {
          // Unexpected character.
          this.trigger("error", {
            code: "E024",
            line: this.line,
            character: this.char,
            data: [ this.peek() ]
          });

          this.input = "";
        }

        continue;
      }

      switch (token.type) {
      case Token.StringLiteral:
        this.triggerAsync("String", {
          line: this.line,
          char: this.char,
          from: this.from,
          startLine: token.startLine,
          startChar: token.startChar,
          value: token.value,
          quote: token.quote
        }, checks, function() { return true; });

        return create("(string)", token.value, null, token);

      case Token.TemplateHead:
        this.trigger("TemplateHead", {
          line: this.line,
          char: this.char,
          from: this.from,
          startLine: token.startLine,
          startChar: token.startChar,
          value: token.value
        });
        return create("(template)", token.value, null, token);

      case Token.TemplateMiddle:
        this.trigger("TemplateMiddle", {
          line: this.line,
          char: this.char,
          from: this.from,
          startLine: token.startLine,
          startChar: token.startChar,
          value: token.value
        });
        return create("(template middle)", token.value, null, token);

      case Token.TemplateTail:
        this.trigger("TemplateTail", {
          line: this.line,
          char: this.char,
          from: this.from,
          startLine: token.startLine,
          startChar: token.startChar,
          value: token.value
        });
        return create("(template tail)", token.value, null, token);

      case Token.NoSubstTemplate:
        this.trigger("NoSubstTemplate", {
          line: this.line,
          char: this.char,
          from: this.from,
          startLine: token.startLine,
          startChar: token.startChar,
          value: token.value
        });
        return create("(no subst template)", token.value, null, token);

      case Token.Identifier:
        this.trigger("Identifier", {
          line: this.line,
          char: this.char,
          from: this.form,
          name: token.value,
          raw_name: token.text,
          isProperty: state.tokens.curr.id === "."
        });

        /* falls through */
      case Token.Keyword:
      case Token.NullLiteral:
      case Token.BooleanLiteral:
        return create("(identifier)", token.value, state.tokens.curr.id === ".", token);

      case Token.NumericLiteral:
        if (token.isMalformed) {
          this.trigger("warning", {
            code: "W045",
            line: this.line,
            character: this.char,
            data: [ token.value ]
          });
        }

        this.triggerAsync("warning", {
          code: "W114",
          line: this.line,
          character: this.char,
          data: [ "0x-" ]
        }, checks, function() { return token.base === 16 && state.jsonMode; });

        this.triggerAsync("warning", {
          code: "W115",
          line: this.line,
          character: this.char
        }, checks, function() {
          return state.directive["use strict"] && token.base === 8 && token.isLegacy;
        });

        this.trigger("Number", {
          line: this.line,
          char: this.char,
          from: this.from,
          value: token.value,
          base: token.base,
          isMalformed: token.malformed
        });

        return create("(number)", token.value);

      case Token.RegExp:
        return create("(regexp)", token.value);

      case Token.Comment:
        state.tokens.curr.comment = true;

        if (token.isSpecial) {
          return {
            id: '(comment)',
            value: token.value,
            body: token.body,
            type: token.commentType,
            isSpecial: token.isSpecial,
            line: this.line,
            character: this.char,
            from: this.from
          };
        }

        break;

      case "":
        break;

      default:
        return create("(punctuator)", token.value);
      }
    }
  }
};

exports.Lexer = Lexer;
exports.Context = Context;

},{"../data/ascii-identifier-data.js":1,"../data/non-ascii-identifier-part-only.js":2,"../data/non-ascii-identifier-start.js":3,"./reg.js":17,"./state.js":18,"events":5,"underscore":12}],14:[function(require,module,exports){
"use strict";

var _ = require("underscore");

var errors = {
  // JSHint options
  E001: "Bad option: '{a}'.",
  E002: "Bad option value.",

  // JSHint input
  E003: "Expected a JSON value.",
  E004: "Input is neither a string nor an array of strings.",
  E005: "Input is empty.",
  E006: "Unexpected early end of program.",

  // Strict mode
  E007: "Missing \"use strict\" statement.",
  E008: "Strict violation.",
  E009: "Option 'validthis' can't be used in a global scope.",
  E010: "'with' is not allowed in strict mode.",

  // Constants
  E011: "const '{a}' has already been declared.",
  E012: "const '{a}' is initialized to 'undefined'.",
  E013: "Attempting to override '{a}' which is a constant.",

  // Regular expressions
  E014: "A regular expression literal can be confused with '/='.",
  E015: "Unclosed regular expression.",
  E016: "Invalid regular expression.",

  // Tokens
  E017: "Unclosed comment.",
  E018: "Unbegun comment.",
  E019: "Unmatched '{a}'.",
  E020: "Expected '{a}' to match '{b}' from line {c} and instead saw '{d}'.",
  E021: "Expected '{a}' and instead saw '{b}'.",
  E022: "Line breaking error '{a}'.",
  E023: "Missing '{a}'.",
  E024: "Unexpected '{a}'.",
  E025: "Missing ':' on a case clause.",
  E026: "Missing '}' to match '{' from line {a}.",
  E027: "Missing ']' to match '[' from line {a}.",
  E028: "Illegal comma.",
  E029: "Unclosed string.",

  // Everything else
  E030: "Expected an identifier and instead saw '{a}'.",
  E031: "Bad assignment.", // FIXME: Rephrase
  E032: "Expected a small integer or 'false' and instead saw '{a}'.",
  E033: "Expected an operator and instead saw '{a}'.",
  E034: "get/set are ES5 features.",
  E035: "Missing property name.",
  E036: "Expected to see a statement and instead saw a block.",
  E037: null,
  E038: null,
  E039: "Function declarations are not invocable. Wrap the whole function invocation in parens.",
  E040: "Each value should have its own case label.",
  E041: "Unrecoverable syntax error.",
  E042: "Stopping.",
  E043: "Too many errors.",
  E044: null,
  E045: "Invalid for each loop.",
  E046: "A yield statement shall be within a generator function (with syntax: `function*`)",
  E047: null, // Vacant
  E048: "Let declaration not directly within block.",
  E049: "A {a} cannot be named '{b}'.",
  E050: "Mozilla requires the yield expression to be parenthesized here.",
  E051: "Regular parameters cannot come after default parameters.",
  E052: "Unclosed template literal.",
  E053: "Export declaration must be in global scope.",
  E054: "Class properties must be methods. Expected '(' but instead saw '{a}'."
};

var warnings = {
  W001: "'hasOwnProperty' is a really bad name.",
  W002: "Value of '{a}' may be overwritten in IE 8 and earlier.",
  W003: "'{a}' was used before it was defined.",
  W004: "'{a}' is already defined.",
  W005: "A dot following a number can be confused with a decimal point.",
  W006: "Confusing minuses.",
  W007: "Confusing plusses.",
  W008: "A leading decimal point can be confused with a dot: '{a}'.",
  W009: "The array literal notation [] is preferable.",
  W010: "The object literal notation {} is preferable.",
  W011: null,
  W012: null,
  W013: null,
  W014: "Bad line breaking before '{a}'.",
  W015: null,
  W016: "Unexpected use of '{a}'.",
  W017: "Bad operand.",
  W018: "Confusing use of '{a}'.",
  W019: "Use the isNaN function to compare with NaN.",
  W020: "Read only.",
  W021: "'{a}' is a function.",
  W022: "Do not assign to the exception parameter.",
  W023: "Expected an identifier in an assignment and instead saw a function invocation.",
  W024: "Expected an identifier and instead saw '{a}' (a reserved word).",
  W025: "Missing name in function declaration.",
  W026: "Inner functions should be listed at the top of the outer function.",
  W027: "Unreachable '{a}' after '{b}'.",
  W028: "Label '{a}' on {b} statement.",
  W030: "Expected an assignment or function call and instead saw an expression.",
  W031: "Do not use 'new' for side effects.",
  W032: "Unnecessary semicolon.",
  W033: "Missing semicolon.",
  W034: "Unnecessary directive \"{a}\".",
  W035: "Empty block.",
  W036: "Unexpected /*member '{a}'.",
  W037: "'{a}' is a statement label.",
  W038: "'{a}' used out of scope.",
  W039: "'{a}' is not allowed.",
  W040: "Possible strict violation.",
  W041: "Use '{a}' to compare with '{b}'.",
  W042: "Avoid EOL escaping.",
  W043: "Bad escaping of EOL. Use option multistr if needed.",
  W044: "Bad or unnecessary escaping.", /* TODO(caitp): remove W044 */
  W045: "Bad number '{a}'.",
  W046: "Don't use extra leading zeros '{a}'.",
  W047: "A trailing decimal point can be confused with a dot: '{a}'.",
  W048: "Unexpected control character in regular expression.",
  W049: "Unexpected escaped character '{a}' in regular expression.",
  W050: "JavaScript URL.",
  W051: "Variables should not be deleted.",
  W052: "Unexpected '{a}'.",
  W053: "Do not use {a} as a constructor.",
  W054: "The Function constructor is a form of eval.",
  W055: "A constructor name should start with an uppercase letter.",
  W056: "Bad constructor.",
  W057: "Weird construction. Is 'new' necessary?",
  W058: "Missing '()' invoking a constructor.",
  W059: "Avoid arguments.{a}.",
  W060: "document.write can be a form of eval.",
  W061: "eval can be harmful.",
  W062: "Wrap an immediate function invocation in parens " +
    "to assist the reader in understanding that the expression " +
    "is the result of a function, and not the function itself.",
  W063: "Math is not a function.",
  W064: "Missing 'new' prefix when invoking a constructor.",
  W065: "Missing radix parameter.",
  W066: "Implied eval. Consider passing a function instead of a string.",
  W067: "Bad invocation.",
  W068: "Wrapping non-IIFE function literals in parens is unnecessary.",
  W069: "['{a}'] is better written in dot notation.",
  W070: "Extra comma. (it breaks older versions of IE)",
  W071: "This function has too many statements. ({a})",
  W072: "This function has too many parameters. ({a})",
  W073: "Blocks are nested too deeply. ({a})",
  W074: "This function's cyclomatic complexity is too high. ({a})",
  W075: "Duplicate {a} '{b}'.",
  W076: "Unexpected parameter '{a}' in get {b} function.",
  W077: "Expected a single parameter in set {a} function.",
  W078: "Setter is defined without getter.",
  W079: "Redefinition of '{a}'.",
  W080: "It's not necessary to initialize '{a}' to 'undefined'.",
  W081: null,
  W082: "Function declarations should not be placed in blocks. " +
    "Use a function expression or move the statement to the top of " +
    "the outer function.",
  W083: "Don't make functions within a loop.",
  W084: "Expected a conditional expression and instead saw an assignment.",
  W085: "Don't use 'with'.",
  W086: "Expected a 'break' statement before '{a}'.",
  W087: "Forgotten 'debugger' statement?",
  W088: "Creating global 'for' variable. Should be 'for (var {a} ...'.",
  W089: "The body of a for in should be wrapped in an if statement to filter " +
    "unwanted properties from the prototype.",
  W090: "'{a}' is not a statement label.",
  W091: "'{a}' is out of scope.",
  W093: "Did you mean to return a conditional instead of an assignment?",
  W094: "Unexpected comma.",
  W095: "Expected a string and instead saw {a}.",
  W096: "The '{a}' key may produce unexpected results.",
  W097: "Use the function form of \"use strict\".",
  W098: "'{a}' is defined but never used.",
  W099: null,
  W100: "This character may get silently deleted by one or more browsers.",
  W101: "Line is too long.",
  W102: null,
  W103: "The '{a}' property is deprecated.",
  W104: "'{a}' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).",
  W105: "Unexpected {a} in '{b}'.",
  W106: "Identifier '{a}' is not in camel case.",
  W107: "Script URL.",
  W108: "Strings must use doublequote.",
  W109: "Strings must use singlequote.",
  W110: "Mixed double and single quotes.",
  W112: "Unclosed string.",
  W113: "Control character in string: {a}.",
  W114: "Avoid {a}.",
  W115: "Octal literals are not allowed in strict mode.",
  W116: "Expected '{a}' and instead saw '{b}'.",
  W117: "'{a}' is not defined.",
  W118: "'{a}' is only available in Mozilla JavaScript extensions (use moz option).",
  W119: "'{a}' is only available in ES6 (use esnext option).",
  W120: "You might be leaking a variable ({a}) here.",
  W121: "Extending prototype of native object: '{a}'.",
  W122: "Invalid typeof value '{a}'",
  W123: "'{a}' is already defined in outer scope.",
  W124: "A generator function shall contain a yield statement.",
  W125: "This line contains non-breaking spaces: http://jshint.com/doc/options/#nonbsp",
  W126: "Unnecessary grouping operator.",
  W127: "Unexpected use of a comma operator.",
  W128: "Empty array elements require elision=true.",
  W129: "'{a}' is defined in a future version of JavaScript. Use a " +
    "different variable name to avoid migration issues.",
  W130: "Trailing ',' is not valid in array destructuring assignment."
};

var info = {
  I001: "Comma warnings can be turned off with 'laxcomma'.",
  I002: null,
  I003: "ES5 option is now set per default"
};

exports.errors = {};
exports.warnings = {};
exports.info = {};

_.each(errors, function(desc, code) {
  exports.errors[code] = { code: code, desc: desc };
});

_.each(warnings, function(desc, code) {
  exports.warnings[code] = { code: code, desc: desc };
});

_.each(info, function(desc, code) {
  exports.info[code] = { code: code, desc: desc };
});

},{"underscore":12}],15:[function(require,module,exports){
"use strict";

function NameStack() {
  this._stack = [];
}

Object.defineProperty(NameStack.prototype, "length", {
  get: function() {
    return this._stack.length;
  }
});

/**
 * Create a new entry in the stack. Useful for tracking names across
 * expressions.
 */
NameStack.prototype.push = function() {
  this._stack.push(null);
};

/**
 * Discard the most recently-created name on the stack.
 */
NameStack.prototype.pop = function() {
  this._stack.pop();
};

/**
 * Update the most recent name on the top of the stack.
 *
 * @param {object} token The token to consider as the source for the most
 *                       recent name.
 */
NameStack.prototype.set = function(token) {
  this._stack[this.length - 1] = token;
};

/**
 * Generate a string representation of the most recent name.
 *
 * @returns {string}
 */
NameStack.prototype.infer = function() {
  var nameToken = this._stack[this.length - 1];
  var prefix = "";
  var type;

  // During expected operation, the topmost entry on the stack will only
  // reflect the current function's name when the function is declared without
  // the `function` keyword (i.e. for in-line accessor methods). In other
  // cases, the `function` expression itself will introduce an empty entry on
  // the top of the stack, and this should be ignored.
  if (!nameToken || nameToken.type === "class") {
    nameToken = this._stack[this.length - 2];
  }

  if (!nameToken) {
    return "(empty)";
  }

  type = nameToken.type;

  if (type !== "(string)" && type !== "(number)" && type !== "(identifier)" && type !== "default") {
    return "(expression)";
  }

  if (nameToken.accessorType) {
    prefix = nameToken.accessorType + " ";
  }

  return prefix + nameToken.value;
};

module.exports = NameStack;

},{}],16:[function(require,module,exports){
"use strict";

// These are the JSHint boolean options.
exports.bool = {
  enforcing: {

    /**
     * This option prohibits the use of bitwise operators such as `^` (XOR),
     * `|` (OR) and others. Bitwise operators are very rare in JavaScript
     * programs and quite often `&` is simply a mistyped `&&`.
     */
    bitwise     : true,

    /**
     *
     * This options prohibits overwriting prototypes of native objects such as
     * `Array`, `Date` and so on.
     *
     *     // jshint freeze:true
     *     Array.prototype.count = function (value) { return 4; };
     *     // -> Warning: Extending prototype of native object: 'Array'.
     */
    freeze      : true,

    /**
     * This option allows you to force all variable names to use either
     * camelCase style or UPPER_CASE with underscores.
     *
     * @deprecated JSHint is limiting its scope to issues of code correctness.
     *             If you would like to enforce rules relating to code style,
     *             check out [the JSCS
     *             project](https://github.com/jscs-dev/node-jscs).
     */
    camelcase   : true,

    /**
     * This option requires you to always put curly braces around blocks in
     * loops and conditionals. JavaScript allows you to omit curly braces when
     * the block consists of only one statement, for example:
     *
     *     while (day)
     *       shuffle();
     *
     * However, in some circumstances, it can lead to bugs (you'd think that
     * `sleep()` is a part of the loop while in reality it is not):
     *
     *     while (day)
     *       shuffle();
     *       sleep();
     */
    curly       : true,

    /**
     * This options prohibits the use of `==` and `!=` in favor of `===` and
     * `!==`. The former try to coerce values before comparing them which can
     * lead to some unexpected results. The latter don't do any coercion so
     * they are generally safer. If you would like to learn more about type
     * coercion in JavaScript, we recommend [Truth, Equality and
     * JavaScript](http://javascriptweblog.wordpress.com/2011/02/07/truth-equality-and-javascript/)
     * by Angus Croll.
     */
    eqeqeq      : true,

    /**
     * This option enables warnings about the use of identifiers which are
     * defined in future versions of JavaScript. Although overwriting them has
     * no effect in contexts where they are not implemented, this practice can
     * cause issues when migrating codebases to newer versions of the language.
     */
    futurehostile: true,

    /**
     * This option suppresses warnings about invalid `typeof` operator values.
     * This operator has only [a limited set of possible return
     * values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof).
     * By default, JSHint warns when you compare its result with an invalid
     * value which often can be a typo.
     *
     *     // 'fuction' instead of 'function'
     *     if (typeof a == "fuction") { // Invalid typeof value 'fuction'
     *       // ...
     *     }
     *
     * Do not use this option unless you're absolutely sure you don't want
     * these checks.
     */
    notypeof    : true,

    /**
     * This option tells JSHint that your code needs to adhere to ECMAScript 3
     * specification. Use this option if you need your program to be executable
     * in older browsersâ€”such as Internet Explorer 6/7/8/9â€”and other legacy
     * JavaScript environments.
     */
    es3         : true,

    /**
     * This option enables syntax first defined in [the ECMAScript 5.1
     * specification](http://es5.github.io/). This includes allowing reserved
     * keywords as object properties.
     */
    es5         : true,

    /**
     * This option requires all `for in` loops to filter object's items. The
     * for in statement allows for looping through the names of all of the
     * properties of an object including those inherited through the prototype
     * chain. This behavior can lead to unexpected items in your object so it
     * is generally safer to always filter inherited properties out as shown in
     * the example:
     *
     *     for (key in obj) {
     *       if (obj.hasOwnProperty(key)) {
     *         // We are sure that obj[key] belongs to the object and was not inherited.
     *       }
     *     }
     *
     * For more in-depth understanding of `for in` loops in JavaScript, read
     * [Exploring JavaScript for-in
     * loops](http://javascriptweblog.wordpress.com/2011/01/04/exploring-javascript-for-in-loops/)
     * by Angus Croll.
     */
    forin       : true,

    /**
     * This option suppresses warnings about declaring variables inside of
     * control
     * structures while accessing them later from the outside. Even though
     * JavaScript has only two real scopesâ€”global and functionâ€”such practice
     * leads to confusion among people new to the language and hard-to-debug
     * bugs. This is why, by default, JSHint warns about variables that are
     * used outside of their intended scope.
     *
     *     function test() {
     *       if (true) {
     *         var x = 0;
     *       }
     *
     *       x += 1; // Default: 'x' used out of scope.
     *                 // No warning when funcscope:true
     *     }
     */
    funcscope   : true,

    /**
     * This option suppresses warnings about the use of global strict mode.
     * Global strict mode can break third-party widgets so it is not
     * recommended.
     *
     * For more info about strict mode see the `strict` option.
     */
    globalstrict: true,

    /**
     * This option prohibits the use of immediate function invocations without
     * wrapping them in parentheses. Wrapping parentheses assists readers of
     * your code in understanding that the expression is the result of a
     * function, and not the function itself.
     *
     * @deprecated JSHint is limiting its scope to issues of code correctness.
     *             If you would like to enforce rules relating to code style,
     *             check out [the JSCS
     *             project](https://github.com/jscs-dev/node-jscs).
     */
    immed       : true,

    /**
     * This option suppresses warnings about the `__iterator__` property. This
     * property is not supported by all browsers so use it carefully.
     */
    iterator    : true,

    /**
     * This option requires you to capitalize names of constructor functions.
     * Capitalizing functions that are intended to be used with `new` operator
     * is just a convention that helps programmers to visually distinguish
     * constructor functions from other types of functions to help spot
     * mistakes when using `this`.
     *
     * Not doing so won't break your code in any browsers or environments but
     * it will be a bit harder to figure outâ€”by reading the codeâ€”if the
     * function was supposed to be used with or without new. And this is
     * important because when the function that was intended to be used with
     * `new` is used without it, `this` will point to the global object instead
     * of a new object.
     *
     * @deprecated JSHint is limiting its scope to issues of code correctness.
     *             If you would like to enforce rules relating to code style,
     *             check out [the JSCS
     *             project](https://github.com/jscs-dev/node-jscs).
     */
    newcap      : true,

    /**
     * This option prohibits the use of `arguments.caller` and
     * `arguments.callee`.  Both `.caller` and `.callee` make quite a few
     * optimizations impossible so they were deprecated in future versions of
     * JavaScript. In fact, ECMAScript 5 forbids the use of `arguments.callee`
     * in strict mode.
     */
    noarg       : true,

    /**
     * This option prohibits the use of the comma operator. When misused, the
     * comma operator can obscure the value of a statement and promote
     * incorrect code.
     */
    nocomma     : true,

    /**
     * This option warns when you have an empty block in your code. JSLint was
     * originally warning for all empty blocks and we simply made it optional.
     * There were no studies reporting that empty blocks in JavaScript break
     * your code in any way.
     *
     * @deprecated JSHint is limiting its scope to issues of code correctness.
     *             If you would like to enforce rules relating to code style,
     *             check out [the JSCS
     *             project](https://github.com/jscs-dev/node-jscs).
     */
    noempty     : true,

    /**
     * This option warns about "non-breaking whitespace" characters. These
     * characters can be entered with option-space on Mac computers and have a
     * potential of breaking non-UTF8 web pages.
     */
    nonbsp      : true,

    /**
     * This option prohibits the use of constructor functions for side-effects.
     * Some people like to call constructor functions without assigning its
     * result to any variable:
     *
     *     new MyConstructor();
     *
     * There is no advantage in this approach over simply calling
     * `MyConstructor` since the object that the operator `new` creates isn't
     * used anywhere so you should generally avoid constructors like this one.
     */
    nonew       : true,

    /**
     * This option prohibits the use of explicitly undeclared variables. This
     * option is very useful for spotting leaking and mistyped variables.
     *
     *     // jshint undef:true
     *
     *     function test() {
     *       var myVar = 'Hello, World';
     *       console.log(myvar); // Oops, typoed here. JSHint with undef will complain
     *     }
     *
     * If your variable is defined in another file, you can use the `global`
     * directive to tell JSHint about it.
     */
    undef       : true,

    /**
     * This option prohibits the use of the grouping operator when it is not
     * strictly required. Such usage commonly reflects a misunderstanding of
     * unary operators, for example:
     *
     *     // jshint singleGroups: true
     *
     *     delete(obj.attr); // Warning: Unnecessary grouping operator.
     */
    singleGroups: false,

    /**
     * This option is a short hand for the most strict JSHint configuration. It
     * enables all enforcing options and disables all relaxing options.
     *
     * @deprecated The option automatically opts users in to new features which
     *             can lead to unexpected warnings/errors in when upgrading
     *             between minor versions of JSHint.
     */
    enforceall : false
  },
  relaxing: {

    /**
     * This option suppresses warnings about missing semicolons. There is a lot
     * of FUD about semicolon spread by quite a few people in the community.
     * The common myths are that semicolons are required all the time (they are
     * not) and that they are unreliable. JavaScript has rules about semicolons
     * which are followed by *all* browsers so it is up to you to decide
     * whether you should or should not use semicolons in your code.
     *
     * For more information about semicolons in JavaScript read [An Open Letter
     * to JavaScript Leaders Regarding
     * Semicolons](http://blog.izs.me/post/2353458699/an-open-letter-to-javascript-leaders-regarding)
     * by Isaac Schlueter and [JavaScript Semicolon
     * Insertion](http://inimino.org/~inimino/blog/javascript_semicolons).
     */
    asi         : true,

    /**
     * This option suppresses warnings about multi-line strings. Multi-line
     * strings can be dangerous in JavaScript because all hell breaks loose if
     * you accidentally put a whitespace in between the escape character (`\`)
     * and a new line.
     *
     * Note that even though this option allows correct multi-line strings, it
     * still warns about multi-line strings without escape characters or with
     * anything in between the escape character and a whitespace.
     *
     *     // jshint multistr:true
     *
     *     var text = "Hello\
     *     World"; // All good.
     *
     *     text = "Hello
     *     World"; // Warning, no escape character.
     *
     *     text = "Hello\
     *     World"; // Warning, there is a space after \
     *
     * @deprecated JSHint is limiting its scope to issues of code correctness.
     *             If you would like to enforce rules relating to code style,
     *             check out [the JSCS
     *             project](https://github.com/jscs-dev/node-jscs).
     */
    multistr    : true,

    /**
     * This option suppresses warnings about the `debugger` statements in your
     * code.
     */
    debug       : true,

    /**
     * This option suppresses warnings about the use of assignments in cases
     * where comparisons are expected. More often than not, code like `if (a =
     * 10) {}` is a typo. However, it can be useful in cases like this one:
     *
     *     for (var i = 0, person; person = people[i]; i++) {}
     *
     * You can silence this error on a per-use basis by surrounding the assignment
     * with parenthesis, such as:
     *
     *     for (var i = 0, person; (person = people[i]); i++) {}
     */
    boss        : true,

    /**
     * This option defines globals available when your core is running inside
     * of the PhantomJS runtime environment. [PhantomJS](http://phantomjs.org/)
     * is a headless WebKit scriptable with a JavaScript API. It has fast and
     * native support for various web standards: DOM handling, CSS selector,
     * JSON, Canvas, and SVG.
     */
    phantom     : true,

    /**
     * This option suppresses warnings about the use of `eval`. The use of
     * `eval` is discouraged because it can make your code vulnerable to
     * various injection attacks and it makes it hard for JavaScript
     * interpreter to do certain optimizations.
    */
    evil        : true,

    /**
     * This option prohibits the use of unary increment and decrement
     * operators.  Some people think that `++` and `--` reduces the quality of
     * their coding styles and there are programming languagesâ€”such as
     * Pythonâ€”that go completely without these operators.
     */
    plusplus    : true,

    /**
     * This option suppresses warnings about the `__proto__` property.
     */
    proto       : true,

    /**
     * This option suppresses warnings about the use of script-targeted
     * URLsâ€”such as `javascript:...`.
     */
    scripturl   : true,

    /**
     * This option requires all functions to run in ECMAScript 5's strict mode.
     * [Strict mode](https://developer.mozilla.org/en/JavaScript/Strict_mode)
     * is a way to opt in to a restricted variant of JavaScript. Strict mode
     * eliminates some JavaScript pitfalls that didn't cause errors by changing
     * them to produce errors.  It also fixes mistakes that made it difficult
     * for the JavaScript engines to perform certain optimizations.
     *
     * *Note:* This option enables strict mode for function scope only. It
     * *prohibits* the global scoped strict mode because it might break
     * third-party widgets on your page. If you really want to use global
     * strict mode, see the *globalstrict* option.
     */
    strict      : true,

    /**
     * This option suppresses warnings about using `[]` notation when it can be
     * expressed in dot notation: `person['name']` vs. `person.name`.
     *
     * @deprecated JSHint is limiting its scope to issues of code correctness.
     *             If you would like to enforce rules relating to code style,
     *             check out [the JSCS
     *             project](https://github.com/jscs-dev/node-jscs).
     */
    sub         : true,

    /**
     * This option suppresses warnings about "weird" constructions like
     * `new function () { ... }` and `new Object;`. Such constructions are
     * sometimes used to produce singletons in JavaScript:
     *
     *     var singleton = new function() {
     *       var privateVar;
     *
     *       this.publicMethod  = function () {}
     *       this.publicMethod2 = function () {}
     *     };
     */
    supernew    : true,

    /**
     * This option suppresses most of the warnings about possibly unsafe line
     * breakings in your code. It doesn't suppress warnings about comma-first
     * coding style. To suppress those you have to use `laxcomma` (see below).
     *
     * @deprecated JSHint is limiting its scope to issues of code correctness.
     *             If you would like to enforce rules relating to code style,
     *             check out [the JSCS
     *             project](https://github.com/jscs-dev/node-jscs).
     */
    laxbreak    : true,

    /**
     * This option suppresses warnings about comma-first coding style:
     *
     *     var obj = {
     *         name: 'Anton'
     *       , handle: 'valueof'
     *       , role: 'SW Engineer'
     *     };
     *
     * @deprecated JSHint is limiting its scope to issues of code correctness.
     *             If you would like to enforce rules relating to code style,
     *             check out [the JSCS
     *             project](https://github.com/jscs-dev/node-jscs).
     */
    laxcomma    : true,

    /**
     * This option suppresses warnings about possible strict violations when
     * the code is running in strict mode and you use `this` in a
     * non-constructor function. You should use this optionâ€”in a function scope
     * onlyâ€”when you are positive that your use of `this` is valid in the
     * strict mode (for example, if you call your function using
     * `Function.call`).
     *
     * **Note:** This option can be used only inside of a function scope.
     * JSHint will fail with an error if you will try to set this option
     * globally.
     */
    validthis   : true,

    /**
     * This option suppresses warnings about the use of the `with` statement.
     * The semantics of the `with` statement can cause confusion among
     * developers and accidental definition of global variables.
     *
     * More info:
     *
     * * [with Statement Considered
     *   Harmful](http://yuiblog.com/blog/2006/04/11/with-statement-considered-harmful/)
     */
    withstmt    : true,

    /**
     * This options tells JSHint that your code uses Mozilla JavaScript
     * extensions. Unless you develop specifically for the Firefox web browser
     * you don't need this option.
     *
     * More info:
     *
     * * [New in JavaScript
     *   1.7](https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7)
     */
    moz         : true,

    /**
     * This option suppresses warnings about generator functions with no
     * `yield` statement in them.
     */
    noyield     : true,

    /**
     * This option suppresses warnings about `== null` comparisons. Such
     * comparisons are often useful when you want to check if a variable is
     * `null` or `undefined`.
     */
    eqnull      : true,

    /**
     * This option suppresses warnings about missing semicolons, but only when
     * the semicolon is omitted for the last statement in a one-line block:
     *
     *     var name = (function() { return 'Anton' }());
     *
     * This is a very niche use case that is useful only when you use automatic
     * JavaScript code generators.
     */
    lastsemic   : true,

    /**
     * This option suppresses warnings about functions inside of loops.
     * Defining functions inside of loops can lead to bugs such as this one:
     *
     *     var nums = [];
     *
     *     for (var i = 0; i < 10; i++) {
     *       nums[i] = function (j) {
     *         return i + j;
     *       };
     *     }
     *
     *     nums[0](2); // Prints 12 instead of 2
     *
     * To fix the code above you need to copy the value of `i`:
     *
     *     var nums = [];
     *
     *     for (var i = 0; i < 10; i++) {
     *       (function (i) {
     *         nums[i] = function (j) {
     *             return i + j;
     *         };
     *       }(i));
     *     }
     */
    loopfunc    : true,

    /**
     * This option suppresses warnings about the use of expressions where
     * normally you would expect to see assignments or function calls. Most of
     * the time, such code is a typo. However, it is not forbidden by the spec
     * and that's why this warning is optional.
     */
    expr        : true,

    /**
     * This option tells JSHint that your code uses ECMAScript 6 specific
     * syntax. Note that these features are not finalized yet and not all
     * browsers implement them.
     *
     * More info:
     *
     * * [Draft Specification for ES.next (ECMA-262 Ed.
     *   6)](http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts)
     */
    esnext      : true,

    /**
     * This option tells JSHint that your code uses ES3 array elision elements,
     * or empty elements (for example, `[1, , , 4, , , 7]`).
     */
    elision     : true,
  },

  // Third party globals
  environments: {

    /**
     * This option defines globals exposed by the
     * [MooTools](http://mootools.net/) JavaScript framework.
     */
    mootools    : true,

    /**
     * This option defines globals exposed by
     * [CouchDB](http://couchdb.apache.org/). CouchDB is a document-oriented
     * database that can be queried and indexed in a MapReduce fashion using
     * JavaScript.
     */
    couch       : true,

    /**
     * This option defines globals exposed by [the Jasmine unit testing
     * framework](https://jasmine.github.io/).
     */
    jasmine     : true,

    /**
     * This option defines globals exposed by the [jQuery](http://jquery.com/)
     * JavaScript library.
     */
    jquery      : true,

    /**
     * This option defines globals available when your code is running inside
     * of the Node runtime environment. [Node.js](http://nodejs.org/) is a
     * server-side JavaScript environment that uses an asynchronous
     * event-driven model. This option also skips some warnings that make sense
     * in the browser environments but don't make sense in Node such as
     * file-level `use strict` pragmas and `console.log` statements.
     */
    node        : true,

    /**
     * This option defines globals exposed by [the QUnit unit testing
     * framework](http://qunitjs.com/).
     */
    qunit       : true,

    /**
     * This option defines globals available when your code is running inside
     * of the Rhino runtime environment. [Rhino](http://www.mozilla.org/rhino/)
     * is an open-source implementation of JavaScript written entirely in Java.
     */
    rhino       : true,

    /**
     * This option defines globals exposed by [the ShellJS
     * library](http://documentup.com/arturadib/shelljs).
     */
    shelljs     : true,

    /**
     * This option defines globals exposed by the
     * [Prototype](http://www.prototypejs.org/) JavaScript framework.
     */
    prototypejs : true,

    /**
     * This option defines globals exposed by the [YUI](http://yuilibrary.com/)
     * JavaScript framework.
     */
    yui         : true,

    /**
     * This option defines globals exposed by the "BDD" and "TDD" UIs of the
     * [Mocha unit testing framework](http://mochajs.org/).
     */
    mocha       : true,

    /**
     * This option defines globals available when your code is running as a
     * script for the [Windows Script
     * Host](http://en.wikipedia.org/wiki/Windows_Script_Host).
     */
    wsh         : true,

    /**
     * This option defines globals available when your code is running inside
     * of a Web Worker. [Web
     * Workers](https://developer.mozilla.org/en/Using_web_workers) provide a
     * simple means for web content to run scripts in background threads.
     */
    worker      : true,

    /**
     * This option defines non-standard but widely adopted globals such as
     * `escape` and `unescape`.
     */
    nonstandard : true,

    /**
     * This option defines globals exposed by modern browsers: all the way from
     * good old `document` and `navigator` to the HTML5 `FileReader` and other
     * new developments in the browser world.
     *
     * **Note:** This option doesn't expose variables like `alert` or
     * `console`. See option `devel` for more information.
     */
    browser     : true,

    /**
     * This option defines globals available when using [the Browserify
     * tool](http://browserify.org/) to build a project.
     */
    browserify  : true,

    /**
     * This option defines globals that are usually used for logging poor-man's
     * debugging: `console`, `alert`, etc. It is usually a good idea to not
     * ship them in production because, for example, `console.log` breaks in
     * legacy versions of Internet Explorer.
     */
    devel       : true,

    /**
     * This option defines globals exposed by the [Dojo
     * Toolkit](http://dojotoolkit.org/).
     */
    dojo        : true,

    /**
     * This option defines globals for typed array constructors.
     *
     * More info:
     *
     * * [JavaScript typed
     *   arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)
     */
    typed       : true
  },

  // Obsolete options
  obsolete: {
    onecase     : true, // if one case switch statements should be allowed
    regexp      : true, // if the . should not be allowed in regexp literals
    regexdash   : true  // if unescaped first/last dash (-) inside brackets
                        // should be tolerated
  }
};

// These are the JSHint options that can take any value
// (we use this object to detect invalid options)
exports.val = {

  /**
   * This option lets you set the maximum length of a line.
   *
   * @deprecated JSHint is limiting its scope to issues of code correctness. If
   *             you would like to enforce rules relating to code style, check
   *             out [the JSCS project](https://github.com/jscs-dev/node-jscs).
   */
  maxlen       : false,

  /**
   * This option sets a specific tab width for your code.
   *
   * @deprecated JSHint is limiting its scope to issues of code correctness. If
   *             you would like to enforce rules relating to code style, check
   *             out [the JSCS project](https://github.com/jscs-dev/node-jscs).
   */
  indent       : false,

  /**
   * This options allows you to set the maximum amount of warnings JSHint will
   * produce before giving up. Default is 50.
   */
  maxerr       : false,

  predef       : false, // predef is deprecated and being replaced by globals

  /**
   * This option can be used to specify a white list of global variables that
   * are not formally defined in the source code. This is most useful when
   * combined with the `undef` option in order to suppress warnings for
   * project-specific global variables.
   *
   * Setting an entry to `true` enables reading and writing to that variable.
   * Setting it to `false` will trigger JSHint to consider that variable
   * read-only.
   *
   * See also the "environment" options: a set of options to be used as short
   * hand for enabling global variables defined in common JavaScript
   * environments.
   */
  globals      : false,

  /**
   * This option enforces the consistency of quotation marks used throughout
   * your code. It accepts three values: `true` if you don't want to enforce
   * one particular style but want some consistency, `"single"` if you want to
   * allow only single quotes and `"double"` if you want to allow only double
   * quotes.
   *
   * @deprecated JSHint is limiting its scope to issues of code correctness. If
   *             you would like to enforce rules relating to code style, check
   *             out [the JSCS project](https://github.com/jscs-dev/node-jscs).
   */
  quotmark     : false,

  scope        : false,

  /**
   * This option lets you set the max number of statements allowed per function:
   *
   *     // jshint maxstatements:4
   *
   *     function main() {
   *       var i = 0;
   *       var j = 0;
   *
   *       // Function declarations count as one statement. Their bodies
   *       // don't get taken into account for the outer function.
   *       function inner() {
   *         var i2 = 1;
   *         var j2 = 1;
   *
   *         return i2 + j2;
   *       }
   *
   *       j = i + j;
   *       return j; // JSHint: Too many statements per function. (5)
   *     }
   */
  maxstatements: false,

  /**
   * This option lets you control how nested do you want your blocks to be:
   *
   *     // jshint maxdepth:2
   *
   *     function main(meaning) {
   *       var day = true;
   *
   *       if (meaning === 42) {
   *         while (day) {
   *           shuffle();
   *
   *           if (tired) { // JSHint: Blocks are nested too deeply (3).
   *               sleep();
   *           }
   *         }
   *       }
   *     }
   */
  maxdepth     : false,

  /**
   * This option lets you set the max number of formal parameters allowed per
   * function:
   *
   *     // jshint maxparams:3
   *
   *     function login(request, onSuccess) {
   *       // ...
   *     }
   *
   *     // JSHint: Too many parameters per function (4).
   *     function logout(request, isManual, whereAmI, onSuccess) {
   *       // ...
   *     }
   */
  maxparams    : false,

  /**
   * This option lets you control cyclomatic complexity throughout your code.
   * Cyclomatic complexity measures the number of linearly independent paths
   * through a program's source code. Read more about [cyclomatic complexity on
   * Wikipedia](http://en.wikipedia.org/wiki/Cyclomatic_complexity).
   */
  maxcomplexity: false,

  /**
   * This option suppresses warnings about variable shadowing i.e. declaring a
   * variable that had been already declared somewhere in the outer scope.
   *
   * - "inner"  - check for variables defined in the same scope only
   * - "outer"  - check for variables defined in outer scopes as well
   * - false    - same as inner
   * - true     - allow variable shadowing
   */
  shadow       : false,

  /**
   * This option warns when you define and never use your variables. It is very
   * useful for general code cleanup, especially when used in addition to
   * `undef`.
   *
   *     // jshint unused:true
   *
   *     function test(a, b) {
   *       var c, d = 2;
   *
   *       return a + d;
   *     }
   *
   *     test(1, 2);
   *
   *     // Line 3: 'b' was defined but never used.
   *     // Line 4: 'c' was defined but never used.
   *
   * In addition to that, this option will warn you about unused global
   * variables declared via the `global` directive.
   *
   * This can be set to `vars` to only check for variables, not function
   * parameters, or `strict` to check all variables and parameters.  The
   * default (true) behavior is to allow unused parameters that are followed by
   * a used parameter.
   */
  unused       : true,

  /**
   * This option prohibits the use of a variable before it was defined.
   * JavaScript has function scope only and, in addition to that, all variables
   * are always movedâ€”or hoistedâ€” to the top of the function. This behavior can
   * lead to some very nasty bugs and that's why it is safer to always use
   * variable only after they have been explicitly defined.
   *
   * Setting this option to "nofunc" will allow function declarations to be
   * ignored.
   *
   * For more in-depth understanding of scoping and hoisting in JavaScript,
   * read [JavaScript Scoping and
   * Hoisting](http://www.adequatelygood.com/2010/2/JavaScript-Scoping-and-Hoisting)
   * by Ben Cherry.
   */
  latedef      : false,

  ignore       : false, // start/end ignoring lines of code, bypassing the lexer
                        //   start    - start ignoring lines, including the current line
                        //   end      - stop ignoring lines, starting on the next line
                        //   line     - ignore warnings / errors for just a single line
                        //              (this option does not bypass the lexer)
  ignoreDelimiters: false // array of start/end delimiters used to ignore
                          // certain chunks from code
};

// These are JSHint boolean options which are shared with JSLint
// where the definition in JSHint is opposite JSLint
exports.inverted = {
  bitwise : true,
  forin   : true,
  newcap  : true,
  plusplus: true,
  regexp  : true,
  undef   : true,

  // Inverted and renamed, use JSHint name here
  eqeqeq  : true,
  strict  : true
};

exports.validNames = Object.keys(exports.val)
  .concat(Object.keys(exports.bool.relaxing))
  .concat(Object.keys(exports.bool.enforcing))
  .concat(Object.keys(exports.bool.obsolete))
  .concat(Object.keys(exports.bool.environments));

// These are JSHint boolean options which are shared with JSLint
// where the name has been changed but the effect is unchanged
exports.renamed = {
  eqeq   : "eqeqeq",
  windows: "wsh",
  sloppy : "strict"
};

exports.removed = {
  nomen: true,
  onevar: true,
  passfail: true,
  white: true,
  gcl: true,
  smarttabs: true,
  trailing: true
};

},{}],17:[function(require,module,exports){
/*
 * Regular expressions. Some of these are stupidly long.
 */

/*jshint maxlen:1000 */

"use strict";

// Unsafe comment or string (ax)
exports.unsafeString =
  /@cc|<\/?|script|\]\s*\]|<\s*!|&lt/i;

// Unsafe characters that are silently deleted by one or more browsers (cx)
exports.unsafeChars =
  /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;

// Characters in strings that need escaping (nx and nxg)
exports.needEsc =
  /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;

exports.needEscGlobal =
  /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

// Star slash (lx)
exports.starSlash = /\*\//;

// Identifier (ix)
exports.identifier = /^([a-zA-Z_$][a-zA-Z0-9_$]*)$/;

// JavaScript URL (jx)
exports.javascriptURL = /^(?:javascript|jscript|ecmascript|vbscript|livescript)\s*:/i;

// Catches /* falls through */ comments (ft)
exports.fallsThrough = /^\s*\/\*\s*falls?\sthrough\s*\*\/\s*$/;

// very conservative rule (eg: only one space between the start of the comment and the first character)
// to relax the maxlen option
exports.maxlenException = /^(?:(?:\/\/|\/\*|\*) ?)?[^ ]+$/;

},{}],18:[function(require,module,exports){
"use strict";
var NameStack = require("./name-stack.js");

var state = {
  syntax: {},

  reset: function() {
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
    this.forinifcheckneeded = false;
    this.nameStack = new NameStack();

    // Blank out non-multi-line-commented lines when ignoring linter errors
    this.ignoreLinterErrors = false;
  }
};

exports.state = state;

},{"./name-stack.js":15}],19:[function(require,module,exports){
"use strict";

exports.register = function(linter) {
  // Check for properties named __proto__. This special property was
  // deprecated and then re-introduced for ES6.

  linter.on("Identifier", function style_scanProto(data) {
    if (linter.getOption("proto")) {
      return;
    }

    if (data.name === "__proto__") {
      linter.warn("W103", {
        line: data.line,
        char: data.char,
        data: [ data.name ]
      });
    }
  });

  // Check for properties named __iterator__. This is a special property
  // available only in browsers with JavaScript 1.7 implementation.

  linter.on("Identifier", function style_scanIterator(data) {
    if (linter.getOption("iterator")) {
      return;
    }

    if (data.name === "__iterator__") {
      linter.warn("W104", {
        line: data.line,
        char: data.char,
        data: [ data.name ]
      });
    }
  });

  // Check that all identifiers are using camelCase notation.
  // Exceptions: names like MY_VAR and _myVar.

  linter.on("Identifier", function style_scanCamelCase(data) {
    if (!linter.getOption("camelcase")) {
      return;
    }

    if (data.name.replace(/^_+|_+$/g, "").indexOf("_") > -1 && !data.name.match(/^[A-Z0-9_]*$/)) {
      linter.warn("W106", {
        line: data.line,
        char: data.from,
        data: [ data.name ]
      });
    }
  });

  // Enforce consistency in style of quoting.

  linter.on("String", function style_scanQuotes(data) {
    var quotmark = linter.getOption("quotmark");
    var code;

    if (!quotmark) {
      return;
    }

    // If quotmark is set to 'single' warn about all double-quotes.

    if (quotmark === "single" && data.quote !== "'") {
      code = "W109";
    }

    // If quotmark is set to 'double' warn about all single-quotes.

    if (quotmark === "double" && data.quote !== "\"") {
      code = "W108";
    }

    // If quotmark is set to true, remember the first quotation style
    // and then warn about all others.

    if (quotmark === true) {
      if (!linter.getCache("quotmark")) {
        linter.setCache("quotmark", data.quote);
      }

      if (linter.getCache("quotmark") !== data.quote) {
        code = "W110";
      }
    }

    if (code) {
      linter.warn(code, {
        line: data.line,
        char: data.char,
      });
    }
  });

  linter.on("Number", function style_scanNumbers(data) {
    if (data.value.charAt(0) === ".") {
      // Warn about a leading decimal point.
      linter.warn("W008", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }

    if (data.value.substr(data.value.length - 1) === ".") {
      // Warn about a trailing decimal point.
      linter.warn("W047", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }

    if (/^00+/.test(data.value)) {
      // Multiple leading zeroes.
      linter.warn("W046", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }
  });

  // Warn about script URLs.

  linter.on("String", function style_scanJavaScriptURLs(data) {
    var re = /^(?:javascript|jscript|ecmascript|vbscript|livescript)\s*:/i;

    if (linter.getOption("scripturl")) {
      return;
    }

    if (re.test(data.value)) {
      linter.warn("W107", {
        line: data.line,
        char: data.char
      });
    }
  });
};

},{}],20:[function(require,module,exports){
// jshint -W001

"use strict";

// Identifiers provided by the ECMAScript standard.

exports.reservedVars = {
  arguments : false,
  NaN       : false
};

exports.ecmaIdentifiers = {
  3: {
    Array              : false,
    Boolean            : false,
    Date               : false,
    decodeURI          : false,
    decodeURIComponent : false,
    encodeURI          : false,
    encodeURIComponent : false,
    Error              : false,
    "eval"             : false,
    EvalError          : false,
    Function           : false,
    hasOwnProperty     : false,
    isFinite           : false,
    isNaN              : false,
    Math               : false,
    Number             : false,
    Object             : false,
    parseInt           : false,
    parseFloat         : false,
    RangeError         : false,
    ReferenceError     : false,
    RegExp             : false,
    String             : false,
    SyntaxError        : false,
    TypeError          : false,
    URIError           : false
  },
  5: {
    JSON               : false
  },
  6: {
    Map                : false,
    Promise            : false,
    Proxy              : false,
    Reflect            : false,
    Set                : false,
    Symbol             : false,
    WeakMap            : false,
    WeakSet            : false
  }
};

// Global variables commonly provided by a web browser environment.

exports.browser = {
  Audio                : false,
  Blob                 : false,
  addEventListener     : false,
  applicationCache     : false,
  atob                 : false,
  blur                 : false,
  btoa                 : false,
  cancelAnimationFrame : false,
  CanvasGradient       : false,
  CanvasPattern        : false,
  CanvasRenderingContext2D: false,
  CSS                  : false,
  clearInterval        : false,
  clearTimeout         : false,
  close                : false,
  closed               : false,
  Comment              : false,
  CustomEvent          : false,
  DOMParser            : false,
  defaultStatus        : false,
  Document             : false,
  document             : false,
  DocumentFragment     : false,
  Element              : false,
  ElementTimeControl   : false,
  Event                : false,
  event                : false,
  FileReader           : false,
  FormData             : false,
  focus                : false,
  frames               : false,
  getComputedStyle     : false,
  HTMLElement          : false,
  HTMLAnchorElement    : false,
  HTMLBaseElement      : false,
  HTMLBlockquoteElement: false,
  HTMLBodyElement      : false,
  HTMLBRElement        : false,
  HTMLButtonElement    : false,
  HTMLCanvasElement    : false,
  HTMLDirectoryElement : false,
  HTMLDivElement       : false,
  HTMLDListElement     : false,
  HTMLFieldSetElement  : false,
  HTMLFontElement      : false,
  HTMLFormElement      : false,
  HTMLFrameElement     : false,
  HTMLFrameSetElement  : false,
  HTMLHeadElement      : false,
  HTMLHeadingElement   : false,
  HTMLHRElement        : false,
  HTMLHtmlElement      : false,
  HTMLIFrameElement    : false,
  HTMLImageElement     : false,
  HTMLInputElement     : false,
  HTMLIsIndexElement   : false,
  HTMLLabelElement     : false,
  HTMLLayerElement     : false,
  HTMLLegendElement    : false,
  HTMLLIElement        : false,
  HTMLLinkElement      : false,
  HTMLMapElement       : false,
  HTMLMenuElement      : false,
  HTMLMetaElement      : false,
  HTMLModElement       : false,
  HTMLObjectElement    : false,
  HTMLOListElement     : false,
  HTMLOptGroupElement  : false,
  HTMLOptionElement    : false,
  HTMLParagraphElement : false,
  HTMLParamElement     : false,
  HTMLPreElement       : false,
  HTMLQuoteElement     : false,
  HTMLScriptElement    : false,
  HTMLSelectElement    : false,
  HTMLStyleElement     : false,
  HTMLTableCaptionElement: false,
  HTMLTableCellElement : false,
  HTMLTableColElement  : false,
  HTMLTableElement     : false,
  HTMLTableRowElement  : false,
  HTMLTableSectionElement: false,
  HTMLTextAreaElement  : false,
  HTMLTitleElement     : false,
  HTMLUListElement     : false,
  HTMLVideoElement     : false,
  history              : false,
  Image                : false,
  Intl                 : false,
  length               : false,
  localStorage         : false,
  location             : false,
  matchMedia           : false,
  MessageChannel       : false,
  MessageEvent         : false,
  MessagePort          : false,
  MouseEvent           : false,
  moveBy               : false,
  moveTo               : false,
  MutationObserver     : false,
  name                 : false,
  Node                 : false,
  NodeFilter           : false,
  NodeList             : false,
  Notification         : false,
  navigator            : false,
  onbeforeunload       : true,
  onblur               : true,
  onerror              : true,
  onfocus              : true,
  onload               : true,
  onresize             : true,
  onunload             : true,
  open                 : false,
  openDatabase         : false,
  opener               : false,
  Option               : false,
  parent               : false,
  print                : false,
  Range                : false,
  requestAnimationFrame : false,
  removeEventListener  : false,
  resizeBy             : false,
  resizeTo             : false,
  screen               : false,
  scroll               : false,
  scrollBy             : false,
  scrollTo             : false,
  sessionStorage       : false,
  setInterval          : false,
  setTimeout           : false,
  SharedWorker         : false,
  status               : false,
  SVGAElement          : false,
  SVGAltGlyphDefElement: false,
  SVGAltGlyphElement   : false,
  SVGAltGlyphItemElement: false,
  SVGAngle             : false,
  SVGAnimateColorElement: false,
  SVGAnimateElement    : false,
  SVGAnimateMotionElement: false,
  SVGAnimateTransformElement: false,
  SVGAnimatedAngle     : false,
  SVGAnimatedBoolean   : false,
  SVGAnimatedEnumeration: false,
  SVGAnimatedInteger   : false,
  SVGAnimatedLength    : false,
  SVGAnimatedLengthList: false,
  SVGAnimatedNumber    : false,
  SVGAnimatedNumberList: false,
  SVGAnimatedPathData  : false,
  SVGAnimatedPoints    : false,
  SVGAnimatedPreserveAspectRatio: false,
  SVGAnimatedRect      : false,
  SVGAnimatedString    : false,
  SVGAnimatedTransformList: false,
  SVGAnimationElement  : false,
  SVGCSSRule           : false,
  SVGCircleElement     : false,
  SVGClipPathElement   : false,
  SVGColor             : false,
  SVGColorProfileElement: false,
  SVGColorProfileRule  : false,
  SVGComponentTransferFunctionElement: false,
  SVGCursorElement     : false,
  SVGDefsElement       : false,
  SVGDescElement       : false,
  SVGDocument          : false,
  SVGElement           : false,
  SVGElementInstance   : false,
  SVGElementInstanceList: false,
  SVGEllipseElement    : false,
  SVGExternalResourcesRequired: false,
  SVGFEBlendElement    : false,
  SVGFEColorMatrixElement: false,
  SVGFEComponentTransferElement: false,
  SVGFECompositeElement: false,
  SVGFEConvolveMatrixElement: false,
  SVGFEDiffuseLightingElement: false,
  SVGFEDisplacementMapElement: false,
  SVGFEDistantLightElement: false,
  SVGFEFloodElement    : false,
  SVGFEFuncAElement    : false,
  SVGFEFuncBElement    : false,
  SVGFEFuncGElement    : false,
  SVGFEFuncRElement    : false,
  SVGFEGaussianBlurElement: false,
  SVGFEImageElement    : false,
  SVGFEMergeElement    : false,
  SVGFEMergeNodeElement: false,
  SVGFEMorphologyElement: false,
  SVGFEOffsetElement   : false,
  SVGFEPointLightElement: false,
  SVGFESpecularLightingElement: false,
  SVGFESpotLightElement: false,
  SVGFETileElement     : false,
  SVGFETurbulenceElement: false,
  SVGFilterElement     : false,
  SVGFilterPrimitiveStandardAttributes: false,
  SVGFitToViewBox      : false,
  SVGFontElement       : false,
  SVGFontFaceElement   : false,
  SVGFontFaceFormatElement: false,
  SVGFontFaceNameElement: false,
  SVGFontFaceSrcElement: false,
  SVGFontFaceUriElement: false,
  SVGForeignObjectElement: false,
  SVGGElement          : false,
  SVGGlyphElement      : false,
  SVGGlyphRefElement   : false,
  SVGGradientElement   : false,
  SVGHKernElement      : false,
  SVGICCColor          : false,
  SVGImageElement      : false,
  SVGLangSpace         : false,
  SVGLength            : false,
  SVGLengthList        : false,
  SVGLineElement       : false,
  SVGLinearGradientElement: false,
  SVGLocatable         : false,
  SVGMPathElement      : false,
  SVGMarkerElement     : false,
  SVGMaskElement       : false,
  SVGMatrix            : false,
  SVGMetadataElement   : false,
  SVGMissingGlyphElement: false,
  SVGNumber            : false,
  SVGNumberList        : false,
  SVGPaint             : false,
  SVGPathElement       : false,
  SVGPathSeg           : false,
  SVGPathSegArcAbs     : false,
  SVGPathSegArcRel     : false,
  SVGPathSegClosePath  : false,
  SVGPathSegCurvetoCubicAbs: false,
  SVGPathSegCurvetoCubicRel: false,
  SVGPathSegCurvetoCubicSmoothAbs: false,
  SVGPathSegCurvetoCubicSmoothRel: false,
  SVGPathSegCurvetoQuadraticAbs: false,
  SVGPathSegCurvetoQuadraticRel: false,
  SVGPathSegCurvetoQuadraticSmoothAbs: false,
  SVGPathSegCurvetoQuadraticSmoothRel: false,
  SVGPathSegLinetoAbs  : false,
  SVGPathSegLinetoHorizontalAbs: false,
  SVGPathSegLinetoHorizontalRel: false,
  SVGPathSegLinetoRel  : false,
  SVGPathSegLinetoVerticalAbs: false,
  SVGPathSegLinetoVerticalRel: false,
  SVGPathSegList       : false,
  SVGPathSegMovetoAbs  : false,
  SVGPathSegMovetoRel  : false,
  SVGPatternElement    : false,
  SVGPoint             : false,
  SVGPointList         : false,
  SVGPolygonElement    : false,
  SVGPolylineElement   : false,
  SVGPreserveAspectRatio: false,
  SVGRadialGradientElement: false,
  SVGRect              : false,
  SVGRectElement       : false,
  SVGRenderingIntent   : false,
  SVGSVGElement        : false,
  SVGScriptElement     : false,
  SVGSetElement        : false,
  SVGStopElement       : false,
  SVGStringList        : false,
  SVGStylable          : false,
  SVGStyleElement      : false,
  SVGSwitchElement     : false,
  SVGSymbolElement     : false,
  SVGTRefElement       : false,
  SVGTSpanElement      : false,
  SVGTests             : false,
  SVGTextContentElement: false,
  SVGTextElement       : false,
  SVGTextPathElement   : false,
  SVGTextPositioningElement: false,
  SVGTitleElement      : false,
  SVGTransform         : false,
  SVGTransformList     : false,
  SVGTransformable     : false,
  SVGURIReference      : false,
  SVGUnitTypes         : false,
  SVGUseElement        : false,
  SVGVKernElement      : false,
  SVGViewElement       : false,
  SVGViewSpec          : false,
  SVGZoomAndPan        : false,
  Text                 : false,
  TextDecoder          : false,
  TextEncoder          : false,
  TimeEvent            : false,
  top                  : false,
  URL                  : false,
  WebGLActiveInfo      : false,
  WebGLBuffer          : false,
  WebGLContextEvent    : false,
  WebGLFramebuffer     : false,
  WebGLProgram         : false,
  WebGLRenderbuffer    : false,
  WebGLRenderingContext: false,
  WebGLShader          : false,
  WebGLShaderPrecisionFormat: false,
  WebGLTexture         : false,
  WebGLUniformLocation : false,
  WebSocket            : false,
  window               : false,
  Worker               : false,
  XDomainRequest       : false,
  XMLHttpRequest       : false,
  XMLSerializer        : false,
  XPathEvaluator       : false,
  XPathException       : false,
  XPathExpression      : false,
  XPathNamespace       : false,
  XPathNSResolver      : false,
  XPathResult          : false
};

exports.devel = {
  alert  : false,
  confirm: false,
  console: false,
  Debug  : false,
  opera  : false,
  prompt : false
};

exports.worker = {
  importScripts  : true,
  postMessage    : true,
  self           : true,
  FileReaderSync : true
};

// Widely adopted global names that are not part of ECMAScript standard
exports.nonstandard = {
  escape  : false,
  unescape: false
};

// Globals provided by popular JavaScript environments.

exports.couch = {
  "require" : false,
  respond   : false,
  getRow    : false,
  emit      : false,
  send      : false,
  start     : false,
  sum       : false,
  log       : false,
  exports   : false,
  module    : false,
  provides  : false
};

exports.node = {
  __filename    : false,
  __dirname     : false,
  GLOBAL        : false,
  global        : false,
  module        : false,
  require       : false,

  // These globals are writeable because Node allows the following
  // usage pattern: var Buffer = require("buffer").Buffer;

  Buffer        : true,
  console       : true,
  exports       : true,
  process       : true,
  setTimeout    : true,
  clearTimeout  : true,
  setInterval   : true,
  clearInterval : true,
  setImmediate  : true, // v0.9.1+
  clearImmediate: true  // v0.9.1+
};

exports.browserify = {
  __filename    : false,
  __dirname     : false,
  global        : false,
  module        : false,
  require       : false,
  Buffer        : true,
  exports       : true,
  process       : true
};

exports.phantom = {
  phantom      : true,
  require      : true,
  WebPage      : true,
  console      : true, // in examples, but undocumented
  exports      : true  // v1.7+
};

exports.qunit = {
  asyncTest      : false,
  deepEqual      : false,
  equal          : false,
  expect         : false,
  module         : false,
  notDeepEqual   : false,
  notEqual       : false,
  notPropEqual   : false,
  notStrictEqual : false,
  ok             : false,
  propEqual      : false,
  QUnit          : false,
  raises         : false,
  start          : false,
  stop           : false,
  strictEqual    : false,
  test           : false,
  "throws"       : false
};

exports.rhino = {
  defineClass  : false,
  deserialize  : false,
  gc           : false,
  help         : false,
  importClass  : false,
  importPackage: false,
  "java"       : false,
  load         : false,
  loadClass    : false,
  Packages     : false,
  print        : false,
  quit         : false,
  readFile     : false,
  readUrl      : false,
  runCommand   : false,
  seal         : false,
  serialize    : false,
  spawn        : false,
  sync         : false,
  toint32      : false,
  version      : false
};

exports.shelljs = {
  target       : false,
  echo         : false,
  exit         : false,
  cd           : false,
  pwd          : false,
  ls           : false,
  find         : false,
  cp           : false,
  rm           : false,
  mv           : false,
  mkdir        : false,
  test         : false,
  cat          : false,
  sed          : false,
  grep         : false,
  which        : false,
  dirs         : false,
  pushd        : false,
  popd         : false,
  env          : false,
  exec         : false,
  chmod        : false,
  config       : false,
  error        : false,
  tempdir      : false
};

exports.typed = {
  ArrayBuffer         : false,
  ArrayBufferView     : false,
  DataView            : false,
  Float32Array        : false,
  Float64Array        : false,
  Int16Array          : false,
  Int32Array          : false,
  Int8Array           : false,
  Uint16Array         : false,
  Uint32Array         : false,
  Uint8Array          : false,
  Uint8ClampedArray   : false
};

exports.wsh = {
  ActiveXObject            : true,
  Enumerator               : true,
  GetObject                : true,
  ScriptEngine             : true,
  ScriptEngineBuildVersion : true,
  ScriptEngineMajorVersion : true,
  ScriptEngineMinorVersion : true,
  VBArray                  : true,
  WSH                      : true,
  WScript                  : true,
  XDomainRequest           : true
};

// Globals provided by popular JavaScript libraries.

exports.dojo = {
  dojo     : false,
  dijit    : false,
  dojox    : false,
  define   : false,
  "require": false
};

exports.jquery = {
  "$"    : false,
  jQuery : false
};

exports.mootools = {
  "$"           : false,
  "$$"          : false,
  Asset         : false,
  Browser       : false,
  Chain         : false,
  Class         : false,
  Color         : false,
  Cookie        : false,
  Core          : false,
  Document      : false,
  DomReady      : false,
  DOMEvent      : false,
  DOMReady      : false,
  Drag          : false,
  Element       : false,
  Elements      : false,
  Event         : false,
  Events        : false,
  Fx            : false,
  Group         : false,
  Hash          : false,
  HtmlTable     : false,
  IFrame        : false,
  IframeShim    : false,
  InputValidator: false,
  instanceOf    : false,
  Keyboard      : false,
  Locale        : false,
  Mask          : false,
  MooTools      : false,
  Native        : false,
  Options       : false,
  OverText      : false,
  Request       : false,
  Scroller      : false,
  Slick         : false,
  Slider        : false,
  Sortables     : false,
  Spinner       : false,
  Swiff         : false,
  Tips          : false,
  Type          : false,
  typeOf        : false,
  URI           : false,
  Window        : false
};

exports.prototypejs = {
  "$"               : false,
  "$$"              : false,
  "$A"              : false,
  "$F"              : false,
  "$H"              : false,
  "$R"              : false,
  "$break"          : false,
  "$continue"       : false,
  "$w"              : false,
  Abstract          : false,
  Ajax              : false,
  Class             : false,
  Enumerable        : false,
  Element           : false,
  Event             : false,
  Field             : false,
  Form              : false,
  Hash              : false,
  Insertion         : false,
  ObjectRange       : false,
  PeriodicalExecuter: false,
  Position          : false,
  Prototype         : false,
  Selector          : false,
  Template          : false,
  Toggle            : false,
  Try               : false,
  Autocompleter     : false,
  Builder           : false,
  Control           : false,
  Draggable         : false,
  Draggables        : false,
  Droppables        : false,
  Effect            : false,
  Sortable          : false,
  SortableObserver  : false,
  Sound             : false,
  Scriptaculous     : false
};

exports.yui = {
  YUI       : false,
  Y         : false,
  YUI_config: false
};

exports.mocha = {
  // BDD
  describe    : false,
  xdescribe   : false,
  it          : false,
  xit         : false,
  context     : false,
  xcontext    : false,
  before      : false,
  after       : false,
  beforeEach  : false,
  afterEach   : false,
  // TDD
  suite         : false,
  test          : false,
  setup         : false,
  teardown      : false,
  suiteSetup    : false,
  suiteTeardown : false
};

exports.jasmine = {
  jasmine     : false,
  describe    : false,
  it          : false,
  xit         : false,
  beforeEach  : false,
  afterEach   : false,
  setFixtures : false,
  loadFixtures: false,
  spyOn       : false,
  expect      : false,
  // Jasmine 1.3
  runs        : false,
  waitsFor    : false,
  waits       : false,
  // Jasmine 2.1
  beforeAll   : false,
  afterAll    : false,
  fail        : false,
  fdescribe   : false,
  fit         : false
};

},{}],"jshint":[function(require,module,exports){
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
/*global console:true */
/*exported console */

var _        = require("underscore");
var events   = require("events");
var vars     = require("./vars.js");
var messages = require("./messages.js");
var Lexer    = require("./lex.js").Lexer;
var reg      = require("./reg.js");
var state    = require("./state.js").state;
var style    = require("./style.js");
var options  = require("./options.js");

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
    exported, // Variables that are used outside of the current file.

    functionicity = [
      "closure", "exception", "global", "label",
      "outer", "unused", "var"
    ],

    funct, // The current function
    functions, // All of the functions

    global, // The global scope
    implied, // Implied globals
    inblock,
    indent,
    lookahead,
    lex,
    member,
    membersOnly,
    predefined,    // Global variables defined by option

    scope,  // The current scope
    stack,
    unuseds,
    urls,

    extraModules = [],
    emitter = new events.EventEmitter();

  function checkOption(name, t) {
    name = name.trim();

    if (/^[+-]W\d{3}$/g.test(name)) {
      return true;
    }

    if (options.validNames.indexOf(name) === -1) {
      if (t.type !== "jslint" && !_.has(options.removed, name)) {
        error("E001", t, name);
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

    if (meta && meta.isFutureReservedWord && state.option.inES5()) {
      // ES3 FutureReservedWord in an ES5 environment.
      if (!meta.es5) {
        return false;
      }

      // Some ES5 FutureReservedWord identifiers are active only
      // within a strict mode environment.
      if (meta.strictOnly) {
        if (!state.option.strict && !state.directive["use strict"]) {
          return false;
        }
      }

      if (token.isProperty) {
        return false;
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
        if (state.option[enforceopt] === undefined) {
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

  function assume() {
    if (state.option.es5) {
      warning("I003");
    }

    processenforceall();

    if (!state.option.es3) {
      combine(predefined, vars.ecmaIdentifiers[5]);
    }

    if (state.option.esnext) {
      combine(predefined, vars.ecmaIdentifiers[6]);
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

    if (state.option.globalstrict && state.option.strict !== false) {
      state.option.strict = true;
    }

    if (state.option.yui) {
      combine(predefined, vars.yui);
    }

    if (state.option.mocha) {
      combine(predefined, vars.mocha);
    }

    // Let's assume that chronologically ES3 < ES5 < ES6/ESNext < Moz

    state.option.inMoz = function(strict) {
      if (strict) {
        return state.option.moz && !state.option.esnext;
      }
      return state.option.moz;
    };

    state.option.inESNext = function(strict) {
      if (strict) {
        return !state.option.moz && state.option.esnext;
      }
      return state.option.moz || state.option.esnext;
    };

    state.option.inES5 = function(/* strict */) {
      return !state.option.es3;
    };

    state.option.inES3 = function(strict) {
      if (strict) {
        return !state.option.moz && !state.option.esnext && state.option.es3;
      }
      return state.option.es3;
    };
  }

  // Produce an error warning.
  function quit(code, line, chr) {
    var percentage = Math.floor((line / state.lines.length) * 100);
    var message = messages.errors[code].desc;

    throw {
      name: "JSHintError",
      line: line,
      character: chr,
      message: message + " (" + percentage + "% scanned).",
      raw: message,
      code: code
    };
  }

  function isundef(scope, code, token, a) {
    if (!state.ignored[code] && state.option.undef !== false) {
      JSHINT.undefs.push([scope, code, token, a]);
    }
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

    t = t || state.tokens.next;
    if (t.id === "(end)") {  // `~
      t = state.tokens.curr;
    }

    l = t.line || 0;
    ch = t.from || 0;

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
      quit("E043", l, ch);

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
  function addInternalSrc(elem, src) {
    var i;
    i = {
      id: "(internal)",
      elem: elem,
      value: src
    };
    JSHINT.internals.push(i);
    return i;
  }

  // name: string
  // opts: { type: string, token: token, islet: bool }
  function addlabel(name, opts) {
    opts = opts || {};

    var type  = opts.type;
    var token = opts.token;
    var islet = opts.islet;

    // Define label in the current function in the current scope.
    if (type === "exception") {
      if (_.has(funct["(context)"], name)) {
        if (funct[name] !== true && !state.option.node) {
          warning("W002", state.tokens.next, name);
        }
      }
    }

    if (_.has(funct, name) && !funct["(global)"]) {
      if (funct[name] === true) {
        if (state.option.latedef) {
          if ((state.option.latedef === true && _.contains([funct[name], type], "unction")) ||
              !_.contains([funct[name], type], "unction")) {
            warning("W003", state.tokens.next, name);
          }
        }
      } else {
        if ((!state.option.shadow || _.contains([ "inner", "outer" ], state.option.shadow)) &&
            type !== "exception" || funct["(blockscope)"].getlabel(name)) {
          warning("W004", state.tokens.next, name);
        }
      }
    }

    if (funct["(context)"] && _.has(funct["(context)"], name) && type !== "function") {
      if (state.option.shadow === "outer") {
        warning("W123", state.tokens.next, name);
      }
    }

    // if the identifier is from a let, adds it only to the current blockscope
    if (islet) {
      funct["(blockscope)"].current.add(name, type, state.tokens.curr);
      if (funct["(blockscope)"].atTop() && exported[name]) {
        state.tokens.curr.exported = true;
      }
    } else {
      funct["(blockscope)"].shadow(name);
      funct[name] = type;

      if (token) {
        funct["(tokens)"][name] = token;
      }

      setprop(funct, name, { unused: opts.unused || false });

      if (funct["(global)"]) {
        global[name] = funct;
        if (_.has(implied, name)) {
          if (state.option.latedef) {
            if ((state.option.latedef === true && _.contains([funct[name], type], "unction")) ||
                !_.contains([funct[name], type], "unction")) {
              warning("W003", state.tokens.next, name);
            }
          }

          delete implied[name];
        }
      } else {
        scope[name] = funct;
      }
    }
  }

  function doOption() {
    var nt = state.tokens.next;
    var body = nt.body.split(",").map(function(s) { return s.trim(); });
    var predef = {};

    if (nt.type === "globals") {
      body.forEach(function(g) {
        g = g.split(":");
        var key = (g[0] || "").trim();
        var val = (g[1] || "").trim();

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
          declared[key] = nt;
        }
      }
    }

    if (nt.type === "exported") {
      body.forEach(function(e) {
        exported[e] = true;
      });
    }

    if (nt.type === "members") {
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

    if (nt.type === "jshint" || nt.type === "jslint") {
      body.forEach(function(g) {
        g = g.split(":");
        var key = (g[0] || "").trim();
        var val = (g[1] || "").trim();

        if (!checkOption(key, nt)) {
          return;
        }

        if (numvals.indexOf(key) >= 0) {
          // GH988 - numeric options can be disabled by setting them to `false`
          if (val !== "false") {
            val = +val;

            if (typeof val !== "number" || !isFinite(val) || val <= 0 || Math.floor(val) !== val) {
              error("E032", nt, g[1].trim());
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

          if (funct["(global)"])
            return void error("E009");

          if (val !== "true" && val !== "false")
            return void error("E002", nt);

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
            error("E002", nt);
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
            error("E002", nt);
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
            error("E002", nt);
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
            error("E002", nt);
          }
          return;
        }

        if (key === "ignore") {
          switch (val) {
          case "start":
            state.ignoreLinterErrors = true;
            break;
          case "end":
            state.ignoreLinterErrors = false;
            break;
          case "line":
            state.ignoredLines[nt.line] = true;
            removeIgnoredMessages();
            break;
          default:
            error("E002", nt);
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
          if (nt.type === "jslint") {
            tn = options.renamed[key] || key;
            state.option[tn] = (val === "true");

            if (options.inverted[tn] !== undefined) {
              state.option[tn] = !state.option[tn];
            }
          } else {
            state.option[key] = (val === "true");
          }

          if (key === "newcap") {
            state.option["(explicitNewcap)"] = true;
          }
          return;
        }

        error("E002", nt);
      });

      assume();
    }
  }

  // We need a peek function. If it has an argument, it peeks that much farther
  // ahead. It is used to distinguish
  //     for ( var i in ...
  // from
  //     for ( var i = ...

  function peek(p) {
    var i = p || 0, j = 0, t;

    while (j <= i) {
      t = lookahead[j];
      if (!t) {
        t = lookahead[j] = lex.token();
      }
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

  // Produce the next token. It looks for programming errors.

  function advance(id, t) {

    switch (state.tokens.curr.id) {
    case "(number)":
      if (state.tokens.next.id === ".") {
        warning("W005", state.tokens.curr);
      }
      break;
    case "-":
      if (state.tokens.next.id === "-" || state.tokens.next.id === "--") {
        warning("W006");
      }
      break;
    case "+":
      if (state.tokens.next.id === "+" || state.tokens.next.id === "++") {
        warning("W007");
      }
      break;
    }

    if (id && state.tokens.next.id !== id) {
      if (t) {
        if (state.tokens.next.id === "(end)") {
          error("E019", t, t.id);
        } else {
          error("E020", state.tokens.next, id, t.id, t.line, state.tokens.next.value);
        }
      } else if (state.tokens.next.type !== "(identifier)" || state.tokens.next.value !== id) {
        // parameter destructuring with rest operator
        if (state.tokens.next.value === "...") {
          if (!state.option.esnext) {
            warning("W119", state.tokens.next, "spread/rest operator");
          }
        } else {
          warning("W116", state.tokens.next, id, state.tokens.next.value);
        }
      }
    }

    state.tokens.prev = state.tokens.curr;
    state.tokens.curr = state.tokens.next;
    for (;;) {
      state.tokens.next = lookahead.shift() || lex.token();

      if (!state.tokens.next) { // No more tokens left, give up
        quit("E041", state.tokens.curr.line);
      }

      if (state.tokens.next.id === "(end)" || state.tokens.next.id === "(error)") {
        return;
      }

      if (state.tokens.next.check) {
        state.tokens.next.check();
      }

      if (state.tokens.next.isSpecial) {
        doOption();
      } else {
        if (state.tokens.next.id !== "(endline)") {
          break;
        }
      }
    }
  }

  function isInfix(token) {
    return token.infix || (!token.identifier && !!token.led);
  }

  function isEndOfExpr() {
    var curr = state.tokens.curr;
    var next = state.tokens.next;
    if (next.id === ";" || next.id === "}" || next.id === ":") {
      return true;
    }
    if (isInfix(next) === isInfix(curr) || (curr.id === "yield" && state.option.inMoz(true))) {
      return curr.line !== startLine(next);
    }
    return false;
  }

  function isBeginOfExpr(prev) {
    return !prev.left && prev.arity !== "unary";
  }

  // This is the heart of JSHINT, the Pratt parser. In addition to parsing, it
  // is looking for ad hoc lint patterns. We add .fud to Pratt's model, which is
  // like .nud except that it is only used on the first token of a statement.
  // Having .fud makes it much easier to define statement-oriented languages like
  // JavaScript. I retained Pratt's nomenclature.

  // .nud  Null denotation
  // .fud  First null denotation
  // .led  Left denotation
  //  lbp  Left binding power
  //  rbp  Right binding power

  // They are elements of the parsing method called Top Down Operator Precedence.

  function expression(rbp, initial) {
    var left, isArray = false, isObject = false, isLetExpr = false;

    state.nameStack.push();

    // if current expression is a let expression
    if (!initial && state.tokens.next.value === "let" && peek(0).value === "(") {
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.next, "let expressions");
      }
      isLetExpr = true;
      // create a new block scope we use only for the current expression
      funct["(blockscope)"].stack();
      advance("let");
      advance("(");
      state.syntax["let"].fud.call(state.syntax["let"].fud, false);
      advance(")");
    }

    if (state.tokens.next.id === "(end)")
      error("E006", state.tokens.curr);

    var isDangerous =
      state.option.asi &&
      state.tokens.prev.line !== startLine(state.tokens.curr) &&
      _.contains(["]", ")"], state.tokens.prev.id) &&
      _.contains(["[", "("], state.tokens.curr.id);

    if (isDangerous)
      warning("W014", state.tokens.curr, state.tokens.curr.id);

    advance();

    if (initial) {
      funct["(verb)"] = state.tokens.curr.value;
      state.tokens.curr.beginsStmt = true;
    }

    if (initial === true && state.tokens.curr.fud) {
      left = state.tokens.curr.fud();
    } else {
      if (state.tokens.curr.nud) {
        left = state.tokens.curr.nud();
      } else {
        error("E030", state.tokens.curr, state.tokens.curr.id);
      }

      // TODO: use pratt mechanics rather than special casing template tokens
      while ((rbp < state.tokens.next.lbp || state.tokens.next.type === "(template)") &&
              !isEndOfExpr()) {
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
          left = state.tokens.curr.led(left);
        } else {
          error("E033", state.tokens.curr, state.tokens.curr.id);
        }
      }
    }
    if (isLetExpr) {
      funct["(blockscope)"].unstack();
    }

    state.nameStack.pop();

    return left;
  }


  // Functions for conformance of style.

  function startLine(token) {
    return token.startLine || token.line;
  }

  function nobreaknonadjacent(left, right) {
    left = left || state.tokens.curr;
    right = right || state.tokens.next;
    if (!state.option.laxbreak && left.line !== startLine(right)) {
      warning("W014", right, right.value);
    }
  }

  function nolinebreak(t) {
    t = t || state.tokens.curr;
    if (t.line !== startLine(state.tokens.next)) {
      warning("E022", t, t.value);
    }
  }

  function nobreakcomma(left, right) {
    if (left.line !== startLine(right)) {
      if (!state.option.laxcomma) {
        if (comma.first) {
          warning("I001");
          comma.first = false;
        }
        warning("W014", left, right.value);
      }
    }
  }

  function comma(opts) {
    opts = opts || {};

    if (!opts.peek) {
      nobreakcomma(state.tokens.curr, state.tokens.next);
      advance(",");
    } else {
      nobreakcomma(state.tokens.prev, state.tokens.curr);
    }

    if (state.tokens.next.identifier && !(opts.property && state.option.inES5())) {
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

  // Functional constructors for making the symbols that will be inherited by
  // tokens.

  function symbol(s, p) {
    var x = state.syntax[s];
    if (!x || typeof x !== "object") {
      state.syntax[s] = x = {
        id: s,
        lbp: p,
        value: s
      };
    }
    return x;
  }

  function delim(s) {
    var x = symbol(s, 0);
    x.delim = true;
    return x;
  }

  function stmt(s, f) {
    var x = delim(s);
    x.identifier = x.reserved = true;
    x.fud = f;
    return x;
  }

  function blockstmt(s, f) {
    var x = stmt(s, f);
    x.block = true;
    return x;
  }

  function reserveName(x) {
    var c = x.id.charAt(0);
    if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
      x.identifier = x.reserved = true;
    }
    return x;
  }

  function prefix(s, f) {
    var x = symbol(s, 150);
    reserveName(x);

    x.nud = (typeof f === "function") ? f : function() {
      this.arity = "unary";
      this.right = expression(150);

      if (this.id === "++" || this.id === "--") {
        if (state.option.plusplus) {
          warning("W016", this, this.id);
        } else if (this.right && (!this.right.identifier || isReserved(this.right)) &&
            this.right.id !== "." && this.right.id !== "[") {
          warning("W017", this);
        }
      }

      return this;
    };

    return x;
  }

  function type(s, f) {
    var x = delim(s);
    x.type = s;
    x.nud = f;
    return x;
  }

  function reserve(name, func) {
    var x = type(name, func);
    x.identifier = true;
    x.reserved = true;
    return x;
  }

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

  function reservevar(s, v) {
    return reserve(s, function() {
      if (typeof v === "function") {
        v(this);
      }
      return this;
    });
  }

  function infix(s, f, p, w) {
    var x = symbol(s, p);
    reserveName(x);
    x.infix = true;
    x.led = function(left) {
      if (!w) {
        nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      }
      if (s === "in" && left.id === "!") {
        warning("W018", left, "!");
      }
      if (typeof f === "function") {
        return f(left, this);
      } else {
        this.left = left;
        this.right = expression(p);
        return this;
      }
    };
    return x;
  }


  function application(s) {
    var x = symbol(s, 42);

    x.led = function(left) {
      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);

      this.left = left;
      this.right = doFunction({ type: "arrow", loneArg: left });
      return this;
    };
    return x;
  }

  function relation(s, f) {
    var x = symbol(s, 100);

    x.led = function(left) {
      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      var right = expression(100);

      if (isIdentifier(left, "NaN") || isIdentifier(right, "NaN")) {
        warning("W019", this);
      } else if (f) {
        f.apply(this, [left, right]);
      }

      if (!left || !right) {
        quit("E041", state.tokens.curr.line);
      }

      if (left.id === "!") {
        warning("W018", left, "!");
      }

      if (right.id === "!") {
        warning("W018", right, "!");
      }

      this.left = left;
      this.right = right;
      return this;
    };
    return x;
  }

  function isPoorRelation(node) {
    return node &&
        ((node.type === "(number)" && +node.value === 0) ||
         (node.type === "(string)" && node.value === "") ||
         (node.type === "null" && !state.option.eqnull) ||
        node.type === "true" ||
        node.type === "false" ||
        node.type === "undefined");
  }

  // Checks whether the 'typeof' operator is used with the correct
  // value. For docs on 'typeof' see:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof

  function isTypoTypeof(left, right) {
    if (state.option.notypeof)
      return false;

    if (!left || !right)
      return false;

    var values = [
      "undefined", "object", "boolean", "number",
      "string", "function", "xml", "object", "unknown"
    ];

    if (right.type === "(identifier)" && right.value === "typeof" && left.type === "(string)")
      return !_.contains(values, left.value);

    return false;
  }

  function isGlobalEval(left, state, funct) {
    var isGlobal = false;

    // permit methods to refer to an "eval" key in their own context
    if (left.type === "this" && funct["(context)"] === null) {
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

      if (obj.identifier && natives.indexOf(obj.value) >= 0)
        return obj.value;
    }

    var prototype = walkPrototype(left);
    if (prototype) return walkNative(prototype);
  }

  function assignop(s, f, p) {
    var x = infix(s, typeof f === "function" ? f : function(left, that) {
      that.left = left;

      if (left) {
        if (state.option.freeze) {
          var nativeObject = findNativePrototype(left);
          if (nativeObject)
            warning("W121", left, nativeObject);
        }

        if (predefined[left.value] === false &&
            scope[left.value]["(global)"] === true) {
          warning("W020", left);
        } else if (left["function"]) {
          warning("W021", left, left.value);
        }

        if (funct[left.value] === "const") {
          error("E013", left, left.value);
        }

        if (left.id === ".") {
          if (!left.left) {
            warning("E031", that);
          } else if (left.left.value === "arguments" && !state.directive["use strict"]) {
            warning("E031", that);
          }

          state.nameStack.set(state.tokens.prev);
          that.right = expression(10);
          return that;
        } else if (left.id === "[") {
          if (state.tokens.curr.left.first) {
            state.tokens.curr.left.first.forEach(function(t) {
              if (t && funct[t.value] === "const") {
                error("E013", t, t.value);
              }
            });
          } else if (!left.left) {
            warning("E031", that);
          } else if (left.left.value === "arguments" && !state.directive["use strict"]) {
            warning("E031", that);
          }

          state.nameStack.set(left.right);

          that.right = expression(10);
          return that;
        } else if (left.identifier && !isReserved(left)) {
          if (funct[left.value] === "exception") {
            warning("W022", left);
          }
          state.nameStack.set(left);
          that.right = expression(10);
          return that;
        }

        if (left === state.syntax["function"]) {
          warning("W023", state.tokens.curr);
        }
      }

      error("E031", that);
    }, p);

    x.exps = true;
    x.assign = true;
    return x;
  }


  function bitwise(s, f, p) {
    var x = symbol(s, p);
    reserveName(x);
    x.led = (typeof f === "function") ? f : function(left) {
      if (state.option.bitwise) {
        warning("W016", this, this.id);
      }
      this.left = left;
      this.right = expression(p);
      return this;
    };
    return x;
  }


  function bitwiseassignop(s) {
    return assignop(s, function(left, that) {
      if (state.option.bitwise) {
        warning("W016", that, that.id);
      }

      if (left) {
        if (left.id === "." || left.id === "[" ||
            (left.identifier && !isReserved(left))) {
          expression(10);
          return that;
        }
        if (left === state.syntax["function"]) {
          warning("W023", state.tokens.curr);
        }
        return that;
      }
      error("E031", that);
    }, 20);
  }


  function suffix(s) {
    var x = symbol(s, 150);

    x.led = function(left) {
      if (state.option.plusplus) {
        warning("W016", this, this.id);
      } else if ((!left.identifier || isReserved(left)) && left.id !== "." && left.id !== "[") {
        warning("W017", this);
      }

      this.left = left;
      return this;
    };
    return x;
  }

  // fnparam means that this identifier is being defined as a function
  // argument (see identifier())
  // prop means that this identifier is that of an object property

  function optionalidentifier(fnparam, prop, preserve) {
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
      if (state.option.inES5()) {
        return val;
      }
    }

    if (fnparam && val === "undefined") {
      return val;
    }

    warning("W024", state.tokens.curr, state.tokens.curr.id);
    return val;
  }

  // fnparam means that this identifier is being defined as a function
  // argument
  // prop means that this identifier is that of an object property
  function identifier(fnparam, prop) {
    var i = optionalidentifier(fnparam, prop, false);
    if (i) {
      return i;
    }

    // parameter destructuring with rest operator
    if (state.tokens.next.value === "...") {
      if (!state.option.esnext) {
        warning("W119", state.tokens.next, "spread/rest operator");
      }
    } else {
      error("E030", state.tokens.next, state.tokens.next.value);

      // The token should be consumed after a warning is issued so the parser
      // can continue as though an identifier were found. The semicolon token
      // should not be consumed in this way so that the parser interprets it as
      // a statement delimeter;
      if (state.tokens.next.id !== ";") {
        advance();
      }
    }
  }


  function reachable(controlToken) {
    var i = 0, t;
    if (state.tokens.next.id !== ";" || controlToken.inBracelessBlock) {
      return;
    }
    for (;;) {
      do {
        t = peek(i);
        i += 1;
      } while (t.id != "(end)" && t.id === "(comment)");

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

  function parseFinalSemicolon() {
    if (state.tokens.next.id !== ";") {
      // don't complain about unclosed templates / strings
      if (state.tokens.next.isUnclosed) return advance();
      if (!state.option.asi) {
        // If this is the last statement in a block that ends on
        // the same line *and* option lastsemic is on, ignore the warning.
        // Otherwise, complain about missing semicolon.
        if (!state.option.lastsemic || state.tokens.next.id !== "}" ||
          startLine(state.tokens.next) !== state.tokens.curr.line) {
          warningAt("W033", state.tokens.curr.line, state.tokens.curr.character);
        }
      }
    } else {
      advance(";");
    }
  }

  function statement() {
    var i = indent, r, s = scope, t = state.tokens.next;

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

    // detect a module import declaration
    if (t.value === "module" && t.type === "(identifier)") {
      if (peek().type === "(identifier)") {
        if (!state.option.inESNext()) {
          warning("W119", state.tokens.curr, "module");
        }

        advance("module");
        var name = identifier();
        addlabel(name, { type: "unused", token: state.tokens.curr });
        advance("from");
        advance("(string)");
        parseFinalSemicolon();
        return;
      }
    }

    if (t.identifier && !res && peek().id === ":") {
      advance();
      advance(":");
      scope = Object.create(s);
      addlabel(t.value, { type: "label" });

      if (!state.tokens.next.labelled && state.tokens.next.value !== "{") {
        warning("W028", state.tokens.next, t.value, state.tokens.next.value);
      }

      state.tokens.next.label = t.value;
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
      var iscase = (funct["(verb)"] === "case" && state.tokens.curr.value === ":");
      block(true, true, false, false, iscase);
      return;
    }

    // Parse the statement.

    r = expression(0, true);

    if (r && (!r.identifier || r.value !== "function") && (r.type !== "(punctuator)")) {
      if (!state.directive["use strict"] &&
          state.option.globalstrict &&
          state.option.strict) {
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
      parseFinalSemicolon();
    }


    // Restore the indentation.

    indent = i;
    scope = s;
    return r;
  }


  function statements() {
    var a = [], p;

    while (!state.tokens.next.reach && state.tokens.next.id !== "(end)") {
      if (state.tokens.next.id === ";") {
        p = peek();

        if (!p || (p.id !== "(" && p.id !== "[")) {
          warning("W032");
        }

        advance(";");
      } else {
        a.push(statement());
      }
    }
    return a;
  }


  /*
   * read all directives
   * recognizes a simple form of asi, but always
   * warns, if it is used
   */
  function directives() {
    var i, p, pn;

    while (state.tokens.next.id === "(string)") {
      p = peek(0);
      if (p.id === "(endline)") {
        i = 1;
        do {
          pn = peek(i++);
        } while (pn.id === "(endline)");
        if (pn.id === ";") {
          p = pn;
        } else if (pn.value === "[" || pn.value === ".") {
          // string -> [ | . is a valid production
          return;
        } else if (!state.option.asi || pn.value === "(") {
          // string -> ( is not a valid production
          warning("W033", state.tokens.next);
        }
      } else if (p.id === "." || p.id === "[") {
        return;
      } else if (p.id !== ";") {
        warning("W033", p);
      }

      advance();
      if (state.directive[state.tokens.curr.value]) {
        warning("W034", state.tokens.curr, state.tokens.curr.value);
      }

      if (state.tokens.curr.value === "use strict") {
        if (!state.option["(explicitNewcap)"]) {
          state.option.newcap = true;
        }
        state.option.undef = true;
      }

      // there's no directive negation, so always set to true
      state.directive[state.tokens.curr.value] = true;

      if (p.id === ";") {
        advance(";");
      }
    }
  }


  /*
   * Parses a single block. A block is a sequence of statements wrapped in
   * braces.
   *
   * ordinary   - true for everything but function bodies and try blocks.
   * stmt       - true if block can be a single statement (e.g. in if/for/while).
   * isfunc     - true if block is a function body
   * isfatarrow - true if its a body of a fat arrow function
   * iscase      - true if block is a switch case block
   */
  function block(ordinary, stmt, isfunc, isfatarrow, iscase) {
    var a,
      b = inblock,
      old_indent = indent,
      m,
      s = scope,
      t,
      line,
      d;

    inblock = ordinary;

    if (!ordinary || !state.option.funcscope)
      scope = Object.create(scope);

    t = state.tokens.next;

    var metrics = funct["(metrics)"];
    metrics.nestedBlockDepth += 1;
    metrics.verifyMaxNestedBlockDepthPerFunction();

    if (state.tokens.next.id === "{") {
      advance("{");

      // create a new block scope
      funct["(blockscope)"].stack();

      line = state.tokens.curr.line;
      if (state.tokens.next.id !== "}") {
        indent += state.option.indent;
        while (!ordinary && state.tokens.next.from > indent) {
          indent += state.option.indent;
        }

        if (isfunc) {
          m = {};
          for (d in state.directive) {
            if (_.has(state.directive, d)) {
              m[d] = state.directive[d];
            }
          }
          directives();

          if (state.option.strict && funct["(context)"]["(global)"]) {
            if (!m["use strict"] && !state.directive["use strict"]) {
              warning("E007");
            }
          }
        }

        a = statements();

        metrics.statementCount += a.length;

        if (isfunc) {
          state.directive = m;
        }

        indent -= state.option.indent;
      }

      advance("}", t);

      funct["(blockscope)"].unstack();

      indent = old_indent;
    } else if (!ordinary) {
      if (isfunc) {
        m = {};
        if (stmt && !isfatarrow && !state.option.inMoz(true)) {
          error("W118", state.tokens.curr, "function closure expressions");
        }

        if (!stmt) {
          for (d in state.directive) {
            if (_.has(state.directive, d)) {
              m[d] = state.directive[d];
            }
          }
        }
        expression(10);

        if (state.option.strict && funct["(context)"]["(global)"]) {
          if (!m["use strict"] && !state.directive["use strict"]) {
            warning("E007");
          }
        }
      } else {
        error("E021", state.tokens.next, "{", state.tokens.next.value);
      }
    } else {

      // check to avoid let declaration not within a block
      funct["(nolet)"] = true;

      if (!stmt || state.option.curly) {
        warning("W116", state.tokens.next, "{", state.tokens.next.value);
      }

      state.tokens.next.inBracelessBlock = true;
      indent += state.option.indent;
      // test indentation only if statement is in new line
      a = [statement()];
      indent -= state.option.indent;

      delete funct["(nolet)"];
    }

    // Don't clear and let it propagate out if it is "break", "return" or similar in switch case
    switch (funct["(verb)"]) {
    case "break":
    case "continue":
    case "return":
    case "throw":
      if (iscase) {
        break;
      }

      /* falls through */
    default:
      funct["(verb)"] = null;
    }

    if (!ordinary || !state.option.funcscope) scope = s;
    inblock = b;
    if (ordinary && state.option.noempty && (!a || a.length === 0)) {
      warning("W035", state.tokens.prev);
    }
    metrics.nestedBlockDepth -= 1;
    return a;
  }


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


  function note_implied(tkn) {
    var name = tkn.value;
    var desc = Object.getOwnPropertyDescriptor(implied, name);

    if (!desc)
      implied[name] = [tkn.line];
    else
      desc.value.push(tkn.line);
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
      var s = scope[v];
      var f;
      var block;

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

      if (typeof s === "function") {
        // Protection against accidental inheritance.
        s = undefined;
      } else if (!funct["(blockscope)"].current.has(v) && typeof s === "boolean") {
        f = funct;
        funct = functions[0];
        addlabel(v, { type: "var" });
        s = funct;
        funct = f;
      }

      block = funct["(blockscope)"].getlabel(v);

      // The name is in scope and defined in the current function.
      if (funct === s || block) {
        // Change 'unused' to 'var', and reject labels.
        // the name is in a block scope.
        switch (block ? block[v]["(type)"] : funct[v]) {
        case "unused":
          if (block) block[v]["(type)"] = "var";
          else funct[v] = "var";
          break;
        case "unction":
          if (block) block[v]["(type)"] = "function";
          else funct[v] = "function";
          this["function"] = true;
          break;
        case "const":
          setprop(funct, v, { unused: false });
          break;
        case "function":
          this["function"] = true;
          break;
        case "label":
          warning("W037", state.tokens.curr, v);
          break;
        }
      } else {
        // If the name is already defined in the current
        // function, but not as outer, then there is a scope error.

        switch (funct[v]) {
        case "closure":
        case "function":
        case "var":
        case "unused":
          warning("W038", state.tokens.curr, v);
          break;
        case "label":
          warning("W037", state.tokens.curr, v);
          break;
        case "outer":
        case "global":
          break;
        default:
          // If the name is defined in an outer function, make an outer entry,
          // and if it was unused, make it var.
          if (s === true) {
            funct[v] = true;
          } else if (s === null) {
            warning("W039", state.tokens.curr, v);
            note_implied(state.tokens.curr);
          } else if (typeof s !== "object") {
            // if we're in a list comprehension, variables are declared
            // locally and used before being defined. So we check
            // the presence of the given variable in the comp array
            // before declaring it undefined.

            if (!funct["(comparray)"].check(v)) {
              isundef(funct, "W117", state.tokens.curr, v);
            }

            // Explicitly mark the variable as used within function scopes
            if (!funct["(global)"]) {
              funct[v] = true;
            }

            note_implied(state.tokens.curr);
          } else {
            switch (s[v]) {
            case "function":
            case "unction":
              this["function"] = true;
              s[v] = "closure";
              funct[v] = s["(global)"] ? "global" : "outer";
              break;
            case "var":
            case "unused":
              s[v] = "closure";
              funct[v] = s["(global)"] ? "global" : "outer";
              break;
            case "const":
              setprop(s, v, { unused: false });
              break;
            case "closure":
              funct[v] = s["(global)"] ? "global" : "outer";
              break;
            case "label":
              warning("W037", state.tokens.curr, v);
            }
          }
        }
      }
      return this;
    },

    led: function() {
      error("E033", state.tokens.next, state.tokens.next.value);
    }
  };

  var baseTemplateSyntax = {
    lbp: 0,
    identifier: false,
    template: true,
  };
  state.syntax["(template)"] = _.extend({
    type: "(template)",
    nud: doTemplateLiteral,
    led: doTemplateLiteral,
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(template middle)"] = _.extend({
    type: "(template middle)",
    middle: true,
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(template tail)"] = _.extend({
    type: "(template tail)",
    tail: true,
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(no subst template)"] = _.extend({
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
  delim("(begin)");
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
  reservevar("arguments", function(x) {
    if (state.directive["use strict"] && funct["(global)"]) {
      warning("E008", x);
    }
  });
  reservevar("eval");
  reservevar("false");
  reservevar("Infinity");
  reservevar("null");
  reservevar("this", function(x) {
    if (state.directive["use strict"] && !isMethod() &&
        !state.option.validthis && ((funct["(statement)"] &&
        funct["(name)"].charAt(0) > "Z") || funct["(global)"])) {
      warning("W040", x);
    }
  });
  reservevar("true");
  reservevar("undefined");

  assignop("=", "assign", 20);
  assignop("+=", "assignadd", 20);
  assignop("-=", "assignsub", 20);
  assignop("*=", "assignmult", 20);
  assignop("/=", "assigndiv", 20).nud = function() {
    error("E014");
  };
  assignop("%=", "assignmod", 20);

  bitwiseassignop("&=");
  bitwiseassignop("|=");
  bitwiseassignop("^=");
  bitwiseassignop("<<=");
  bitwiseassignop(">>=");
  bitwiseassignop(">>>=");
  infix(",", function(left, that) {
    var expr;
    that.exprs = [left];

    if (state.option.nocomma) {
      warning("W127");
    }

    if (!comma({ peek: true })) {
      return that;
    }
    while (true) {
      if (!(expr = expression(10))) {
        break;
      }
      that.exprs.push(expr);
      if (state.tokens.next.value !== "," || !comma()) {
        break;
      }
    }
    return that;
  }, 10, true);

  infix("?", function(left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(10);
    advance(":");
    that["else"] = expression(10);
    return that;
  }, 30);

  var orPrecendence = 40;
  infix("||", function(left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(orPrecendence);
    return that;
  }, orPrecendence);
  infix("&&", "and", 50);
  bitwise("|", "bitor", 70);
  bitwise("^", "bitxor", 80);
  bitwise("&", "bitand", 90);
  relation("==", function(left, right) {
    var eqnull = state.option.eqnull && (left.value === "null" || right.value === "null");

    switch (true) {
      case !eqnull && state.option.eqeqeq:
        this.from = this.character;
        warning("W116", this, "===", "==");
        break;
      case isPoorRelation(left):
        warning("W041", this, "===", left.value);
        break;
      case isPoorRelation(right):
        warning("W041", this, "===", right.value);
        break;
      case isTypoTypeof(right, left):
        warning("W122", this, right.value);
        break;
      case isTypoTypeof(left, right):
        warning("W122", this, left.value);
        break;
    }

    return this;
  });
  relation("===", function(left, right) {
    if (isTypoTypeof(right, left)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right)) {
      warning("W122", this, left.value);
    }
    return this;
  });
  relation("!=", function(left, right) {
    var eqnull = state.option.eqnull &&
        (left.value === "null" || right.value === "null");

    if (!eqnull && state.option.eqeqeq) {
      this.from = this.character;
      warning("W116", this, "!==", "!=");
    } else if (isPoorRelation(left)) {
      warning("W041", this, "!==", left.value);
    } else if (isPoorRelation(right)) {
      warning("W041", this, "!==", right.value);
    } else if (isTypoTypeof(right, left)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right)) {
      warning("W122", this, left.value);
    }
    return this;
  });
  relation("!==", function(left, right) {
    if (isTypoTypeof(right, left)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right)) {
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
  infix("instanceof", "instanceof", 120);
  infix("+", function(left, that) {
    var right;
    that.left = left;
    that.right = right = expression(130);

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
  prefix("+++", function() {
    warning("W007");
    this.arity = "unary";
    this.right = expression(150);
    return this;
  });
  infix("+++", function(left) {
    warning("W007");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix("-", "sub", 130);
  prefix("-", "neg");
  prefix("---", function() {
    warning("W006");
    this.arity = "unary";
    this.right = expression(150);
    return this;
  });
  infix("---", function(left) {
    warning("W006");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix("*", "mult", 140);
  infix("/", "div", 140);
  infix("%", "mod", 140);

  suffix("++");
  prefix("++", "preinc");
  state.syntax["++"].exps = true;

  suffix("--");
  prefix("--", "predec");
  state.syntax["--"].exps = true;
  prefix("delete", function() {
    var p = expression(10);
    if (!p) {
      return this;
    }

    if (p.id !== "." && p.id !== "[") {
      warning("W051");
    }
    this.first = p;

    // The `delete` operator accepts unresolvable references when not in strict
    // mode, so the operand may be undefined.
    if (p.identifier && !state.directive["use strict"]) {
      p.forgiveUndef = true;
    }
    return this;
  }).exps = true;

  prefix("~", function() {
    if (state.option.bitwise) {
      warning("W016", this, "~");
    }
    this.arity = "unary";
    expression(150);
    return this;
  });

  prefix("...", function() {
    if (!state.option.esnext) {
      warning("W119", this, "spread/rest operator");
    }

    // TODO: Allow all AssignmentExpression
    // once parsing permits.
    //
    // How to handle eg. number, boolean when the built-in
    // prototype of may have an @@iterator definition?
    //
    // Number.prototype[Symbol.iterator] = function * () {
    //   yield this.valueOf();
    // };
    //
    // var a = [ ...1 ];
    // console.log(a); // [1];
    //
    // for (let n of [...10]) {
    //    console.log(n);
    // }
    // // 10
    //
    //
    // Boolean.prototype[Symbol.iterator] = function * () {
    //   yield this.valueOf();
    // };
    //
    // var a = [ ...true ];
    // console.log(a); // [true];
    //
    // for (let n of [...false]) {
    //    console.log(n);
    // }
    // // false
    //
    if (!state.tokens.next.identifier &&
        state.tokens.next.type !== "(string)" &&
          !checkPunctuators(state.tokens.next, ["[", "("])) {

      error("E030", state.tokens.next, state.tokens.next.value);
    }
    expression(150);
    return this;
  });

  prefix("!", function() {
    this.arity = "unary";
    this.right = expression(150);

    if (!this.right) { // '!' followed by nothing? Give up.
      quit("E041", this.line || 0);
    }

    if (bang[this.right.id] === true) {
      warning("W018", this, "!");
    }
    return this;
  });

  prefix("typeof", (function() {
    var p = expression(150);
    this.first = p;

    // The `typeof` operator accepts unresolvable references, so the operand
    // may be undefined.
    if (p.identifier) {
      p.forgiveUndef = true;
    }
    return this;
  }));
  prefix("new", function() {
    var c = expression(155), i;
    if (c && c.id !== "function") {
      if (c.identifier) {
        c["new"] = true;
        switch (c.value) {
        case "Number":
        case "String":
        case "Boolean":
        case "Math":
        case "JSON":
          warning("W053", state.tokens.prev, c.value);
          break;
        case "Symbol":
          if (state.option.esnext) {
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
            if (state.option.newcap && (i < "A" || i > "Z") && !_.has(global, c.value)) {
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
    this.first = c;
    return this;
  });
  state.syntax["new"].exps = true;

  prefix("void").exps = true;

  infix(".", function(left, that) {
    var m = identifier(false, true);

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
      else if (state.directive["use strict"])
        error("E008");
    } else if (!state.option.evil && left && left.value === "document" &&
        (m === "write" || m === "writeln")) {
      warning("W060", left);
    }

    if (!state.option.evil && (m === "eval" || m === "execScript")) {
      if (isGlobalEval(left, state, funct)) {
        warning("W061");
      }
    }

    return that;
  }, 160, true);

  infix("(", function(left, that) {
    if (state.option.immed && left && !left.immed && left.id === "function") {
      warning("W062");
    }

    var n = 0;
    var p = [];

    if (left) {
      if (left.type === "(identifier)") {
        if (left.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/)) {
          if ("Number String Boolean Date Object Error Symbol".indexOf(left.value) === -1) {
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
        p[p.length] = expression(10);
        n += 1;
        if (state.tokens.next.id !== ",") {
          break;
        }
        comma();
      }
    }

    advance(")");

    if (typeof left === "object") {
      if (state.option.inES3() && left.value === "parseInt" && n === 1) {
        warning("W065", state.tokens.curr);
      }
      if (!state.option.evil) {
        if (left.value === "eval" || left.value === "Function" ||
            left.value === "execScript") {
          warning("W061", left);

          if (p[0] && [0].id === "(string)") {
            addInternalSrc(left, p[0].value);
          }
        } else if (p[0] && p[0].id === "(string)" &&
             (left.value === "setTimeout" ||
            left.value === "setInterval")) {
          warning("W066", left);
          addInternalSrc(left, p[0].value);

        // window.setTimeout/setInterval
        } else if (p[0] && p[0].id === "(string)" &&
             left.value === "." &&
             left.left.value === "window" &&
             (left.right === "setTimeout" ||
            left.right === "setInterval")) {
          warning("W066", left);
          addInternalSrc(left, p[0].value);
        }
      }
      if (!left.identifier && left.id !== "." && left.id !== "[" &&
          left.id !== "(" && left.id !== "&&" && left.id !== "||" &&
          left.id !== "?" && !(state.option.esnext && left["(name)"])) {
        warning("W067", that);
      }
    }

    that.left = left;
    return that;
  }, 155, true).exps = true;

  prefix("(", function() {
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
    } while (!(parens === 0 && pn1.value === ")") && pn.value !== ";" && pn.type !== "(end)");

    if (state.tokens.next.id === "function") {
      triggerFnExpr = state.tokens.next.immed = true;
    }

    // If the balanced grouping operator is followed by a "fat arrow", the
    // current token marks the beginning of a "fat arrow" function and parsing
    // should proceed accordingly.
    if (pn.value === "=>") {
      return doFunction({ type: "arrow", parsedOpening: true });
    }

    var exprs = [];

    if (state.tokens.next.id !== ")") {
      for (;;) {
        exprs.push(expression(10));

        if (state.tokens.next.id !== ",") {
          break;
        }

        if (state.option.nocomma) {
          warning("W127");
        }

        comma();
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

      if (!isNecessary) {
        isNecessary = preceeding.assign || preceeding.delim;
      }
    } else {
      ret = first = last = exprs[0];

      if (!isNecessary) {
        isNecessary =
          // Used to distinguish from an ExpressionStatement which may not
          // begin with the `{` and `function` tokens
          (opening.beginsStmt && (ret.id === "{" || triggerFnExpr || isFunctor(ret))) ||
          // Used as the return value of a single-statement arrow function
          (ret.id === "{" && preceeding.id === "=>") ||
          // Used to prevent left-to-right application of adjacent addition
          // operators (the order of which effect type)
          (first.id === "+" && preceeding.id === "+");
      }
    }

    if (ret) {
      // The operator may be necessary to override the default binding power of
      // neighboring operators (whenever there is an operator in use within the
      // first expression *or* the current group contains multiple expressions)
      if (!isNecessary && (first.left || ret.exprs)) {
        isNecessary =
          (!isBeginOfExpr(preceeding) && first.lbp < preceeding.lbp) ||
          (!isEndOfExpr() && last.lbp < state.tokens.next.lbp);
      }

      if (!isNecessary) {
        warning("W126", opening);
      }

      ret.paren = true;
    }

    return ret;
  });

  application("=>");

  infix("[", function(left, that) {
    var e = expression(10), s;
    if (e && e.type === "(string)") {
      if (!state.option.evil && (e.value === "eval" || e.value === "execScript")) {
        if (isGlobalEval(left, state, funct)) {
          warning("W061");
        }
      }

      countMember(e.value);
      if (!state.option.sub && reg.identifier.test(e.value)) {
        s = state.syntax[e.value];
        if (!s || !isReserved(s)) {
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

  function comprehensiveArrayExpression() {
    var res = {};
    res.exps = true;
    funct["(comparray)"].stack();

    // Handle reversed for expressions, used in spidermonkey
    var reversed = false;
    if (state.tokens.next.value !== "for") {
      reversed = true;
      if (!state.option.inMoz(true)) {
        warning("W116", state.tokens.next, "for", state.tokens.next.value);
      }
      funct["(comparray)"].setState("use");
      res.right = expression(10);
    }

    advance("for");
    if (state.tokens.next.value === "each") {
      advance("each");
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.curr, "for each");
      }
    }
    advance("(");
    funct["(comparray)"].setState("define");
    res.left = expression(130);
    if (_.contains(["in", "of"], state.tokens.next.value)) {
      advance();
    } else {
      error("E045", state.tokens.curr);
    }
    funct["(comparray)"].setState("generate");
    expression(10);

    advance(")");
    if (state.tokens.next.value === "if") {
      advance("if");
      advance("(");
      funct["(comparray)"].setState("filter");
      res.filter = expression(10);
      advance(")");
    }

    if (!reversed) {
      funct["(comparray)"].setState("use");
      res.right = expression(10);
    }

    advance("]");
    funct["(comparray)"].unstack();
    return res;
  }

  prefix("[", function() {
    var blocktype = lookupBlockType();
    if (blocktype.isCompArray) {
      if (!state.option.inESNext()) {
        warning("W119", state.tokens.curr, "array comprehension");
      }
      return comprehensiveArrayExpression();
    } else if (blocktype.isDestAssign && !state.option.inESNext()) {
      warning("W104", state.tokens.curr, "destructuring assignment");
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
          if (!state.option.inES5()) {
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

      this.first.push(expression(10));
      if (state.tokens.next.id === ",") {
        comma({ allowTrailing: true });
        if (state.tokens.next.id === "]" && !state.option.inES5(true)) {
          warning("W070", state.tokens.curr);
          break;
        }
      } else {
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
    return funct["(statement)"] && funct["(statement)"].type === "class" ||
           funct["(context)"] && funct["(context)"]["(verb)"] === "class";
  }


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
      id = optionalidentifier(false, true, preserve);
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
   * @param {Object} [options]
   * @param {token} [options.loneArg] The argument to the function in cases
   *                                  where it was defined using the
   *                                  single-argument shorthand.
   * @param {bool} [options.parsedOpening] Whether the opening parenthesis has
   *                                       already been parsed.
   */
  function functionparams(options) {
    var next;
    var params = [];
    var ident;
    var tokens = [];
    var t;
    var pastDefault = false;
    var loneArg = options && options.loneArg;

    if (loneArg && loneArg.identifier === true) {
      addlabel(loneArg.value, { type: "unused", token: loneArg });
      return [loneArg];
    }

    next = state.tokens.next;

    if (!options || !options.parsedOpening) {
      advance("(");
    }

    if (state.tokens.next.id === ")") {
      advance(")");
      return;
    }

    for (;;) {
      if (_.contains(["{", "["], state.tokens.next.id)) {
        tokens = destructuringExpression();
        for (t in tokens) {
          t = tokens[t];
          if (t.id) {
            params.push(t.id);
            addlabel(t.id, { type: "unused", token: t.token });
          }
        }
      } else if (state.tokens.next.value === "...") {
        if (!state.option.esnext) {
          warning("W119", state.tokens.next, "spread/rest operator");
        }
        advance("...");
        ident = identifier(true);
        params.push(ident);
        addlabel(ident, { type: "unused", token: state.tokens.curr });
      } else {
        ident = identifier(true);
        params.push(ident);
        addlabel(ident, { type: "unused", token: state.tokens.curr });
      }

      // it is a syntax error to have a regular argument after a default argument
      if (pastDefault) {
        if (state.tokens.next.id !== "=") {
          error("E051", state.tokens.current);
        }
      }
      if (state.tokens.next.id === "=") {
        if (!state.option.inESNext()) {
          warning("W119", state.tokens.next, "default parameters");
        }
        advance("=");
        pastDefault = true;
        expression(10);
      }
      if (state.tokens.next.id === ",") {
        comma();
      } else {
        advance(")", next);
        return params;
      }
    }
  }

  function setprop(funct, name, values) {
    if (!funct["(properties)"][name]) {
      funct["(properties)"][name] = { unused: false };
    }

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
        "(metrics)"  : createMetrics(token)
      });
    }

    _.extend(funct, overwrites);

    if (funct["(context)"]) {
      funct["(blockscope)"] = funct["(context)"]["(blockscope)"];
      funct["(comparray)"]  = funct["(context)"]["(comparray)"];
    }

    return funct;
  }

  function isFunctor(token) {
    return "(scope)" in token;
  }

  function doTemplateLiteral(left) {
    // ASSERT: this.type === "(template)"
    // jshint validthis: true
    var ctx = this.context;
    var noSubst = this.noSubst;
    var depth = this.depth;

    if (!noSubst) {
      while (!end() && state.tokens.next.id !== "(end)") {
        if (!state.tokens.next.template || state.tokens.next.depth > depth) {
          expression(0); // should probably have different rbp?
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
   * @param {Object} [options]
   * @param {token} [options.name] The identifier belonging to the function (if
   *                               any)
   * @param {boolean} [options.statement] The statement that triggered creation
   *                                      of the current function.
   * @param {string} [options.type] If specified, either "generator" or "arrow"
   * @param {token} [options.loneArg] The argument to the function in cases
   *                                  where it was defined using the
   *                                  single-argument shorthand
   * @param {bool} [options.parsedOpening] Whether the opening parenthesis has
   *                                       already been parsed
   * @param {token} [options.classExprBinding] Define a function with this
   *                                           identifier in the new function's
   *                                           scope, mimicking the bahavior of
   *                                           class expression names within
   *                                           the body of member functions.
   */
  function doFunction(options) {
    var f, name, statement, classExprBinding, isGenerator, isArrow;
    var oldOption = state.option;
    var oldIgnored = state.ignored;
    var oldScope  = scope;

    if (options) {
      name = options.name;
      statement = options.statement;
      classExprBinding = options.classExprBinding;
      isGenerator = options.type === "generator";
      isArrow = options.type === "arrow";
    }

    state.option = Object.create(state.option);
    state.ignored = Object.create(state.ignored);
    scope = Object.create(scope);

    funct = functor(name || state.nameStack.infer(), state.tokens.next, scope, {
      "(statement)": statement,
      "(context)":   funct,
      "(generator)": isGenerator
    });

    f = funct;
    state.tokens.curr.funct = funct;

    functions.push(funct);

    if (name) {
      addlabel(name, { type: "function" });
    }

    if (classExprBinding) {
      addlabel(classExprBinding, { type: "function" });
    }

    funct["(params)"] = functionparams(options);
    funct["(metrics)"].verifyMaxParametersPerFunction(funct["(params)"]);

    if (isArrow) {
      if (!state.option.esnext) {
        warning("W119", state.tokens.curr, "arrow function syntax (=>)");
      }

      if (!options.loneArg) {
        advance("=>");
      }
    }

    block(false, true, true, isArrow);

    if (!state.option.noyield && isGenerator &&
        funct["(generator)"] !== "yielded") {
      warning("W124", state.tokens.curr);
    }

    funct["(metrics)"].verifyMaxStatementsPerFunction();
    funct["(metrics)"].verifyMaxComplexityPerFunction();
    funct["(unusedOption)"] = state.option.unused;

    scope = oldScope;
    state.option = oldOption;
    state.ignored = oldIgnored;
    funct["(last)"] = state.tokens.curr.line;
    funct["(lastcharacter)"] = state.tokens.curr.character;

    _.map(Object.keys(funct), function(key) {
      if (key[0] === "(") return;
      funct["(blockscope)"].unshadow(key);
    });

    funct = funct["(context)"];

    return f;
  }

  function createMetrics(functionStartToken) {
    return {
      statementCount: 0,
      nestedBlockDepth: -1,
      ComplexityCount: 1,

      verifyMaxStatementsPerFunction: function() {
        if (state.option.maxstatements &&
          this.statementCount > state.option.maxstatements) {
          warning("W071", functionStartToken, this.statementCount);
        }
      },

      verifyMaxParametersPerFunction: function(params) {
        params = params || [];

        if (state.option.maxparams && params.length > state.option.maxparams) {
          warning("W072", functionStartToken, params.length);
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
    funct["(metrics)"].ComplexityCount += 1;
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
   * @param {object} props Collection of property descriptors for a given
   *                       object.
   */
  function checkProperties(props) {
    // Check for lonely setters if in the ES5 mode.
    if (state.option.inES5()) {
      for (var name in props) {
        if (_.has(props, name) && props[name].setterToken && !props[name].getterToken) {
          warning("W078", props[name].setterToken);
        }
      }
    }
  }

  (function(x) {
    x.nud = function() {
      var b, f, i, p, t, g, nextVal;
      var props = {}; // All properties, including accessors

      b = state.tokens.curr.line !== startLine(state.tokens.next);
      if (b) {
        indent += state.option.indent;
        if (state.tokens.next.from === indent + state.option.indent) {
          indent += state.option.indent;
        }
      }

      for (;;) {
        if (state.tokens.next.id === "}") {
          break;
        }

        nextVal = state.tokens.next.value;
        if (peek().id !== ":" && (nextVal === "get" || nextVal === "set")) {
          advance(nextVal);

          if (!state.option.inES5()) {
            error("E034");
          }

          i = propertyName();

          // ES6 allows for get() {...} and set() {...} method
          // definition shorthand syntax, so we don't produce an error
          // if the esnext option is enabled.
          if (!i && !state.option.inESNext()) {
            error("E035");
          }

          // We don't want to save this getter unless it's an actual getter
          // and not an ES6 concise method
          if (i) {
            saveAccessor(nextVal, props, i, state.tokens.curr);
          }

          t = state.tokens.next;
          f = doFunction();
          p = f["(params)"];

          // Don't warn about getter/setter pairs if this is an ES6 concise method
          if (nextVal === "get" && i && p) {
            warning("W076", t, p[0], i);
          } else if (nextVal === "set" && i && (!p || p.length !== 1)) {
            warning("W077", t, i);
          }
        } else {
          if (state.tokens.next.value === "*" && state.tokens.next.type === "(punctuator)") {
            if (!state.option.inESNext()) {
              warning("W104", state.tokens.next, "generator functions");
            }
            advance("*");
            g = true;
          }
          if (state.tokens.next.identifier &&
              (peekIgnoreEOL().id === "," || peekIgnoreEOL().id === "}")) {
            if (!state.option.inESNext()) {
              warning("W104", state.tokens.next, "object short notation");
            }
            i = propertyName(true);
            saveProperty(props, i, state.tokens.next);

            expression(10);
          } else {
            if (state.tokens.next.id === "[") {
              i = computedPropertyName();
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
              if (!state.option.inESNext()) {
                warning("W104", state.tokens.curr, "concise methods");
              }
              doFunction({ type: g ? "generator" : null });
            } else {
              advance(":");
              expression(10);
            }
          }
        }

        countMember(i);

        if (state.tokens.next.id === ",") {
          comma({ allowTrailing: true, property: true });
          if (state.tokens.next.id === ",") {
            warning("W070", state.tokens.curr);
          } else if (state.tokens.next.id === "}" && !state.option.inES5(true)) {
            warning("W070", state.tokens.curr);
          }
        } else {
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

  function destructuringExpression() {
    var id, ids;
    var identifiers = [];
    if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "destructuring expression");
    }
    var nextInnerDE = function() {
      var ident;
      if (checkPunctuators(state.tokens.next, ["[", "{"])) {
        ids = destructuringExpression();
        for (var id in ids) {
          id = ids[id];
          identifiers.push({ id: id.id, token: id.token });
        }
      } else if (checkPunctuators(state.tokens.next, [","])) {
        identifiers.push({ id: null, token: state.tokens.curr });
      } else if (checkPunctuators(state.tokens.next, ["("])) {
        advance("(");
        nextInnerDE();
        advance(")");
      } else {
        ident = identifier();
        if (ident)
          identifiers.push({ id: ident, token: state.tokens.curr });
      }
    };
    if (checkPunctuators(state.tokens.next, ["["])) {
      advance("[");
      nextInnerDE();
      while (!checkPunctuators(state.tokens.next, ["]"])) {
        advance(",");
        if (checkPunctuators(state.tokens.next, ["]"])) {
          // Trailing commas are not allowed in ArrayBindingPattern
          warning("W130", state.tokens.next);
          break;
        }
        nextInnerDE();
      }
      advance("]");
    } else if (checkPunctuators(state.tokens.next, ["{"])) {
      advance("{");
      id = identifier();
      if (checkPunctuators(state.tokens.next, [":"])) {
        advance(":");
        nextInnerDE();
      } else {
        identifiers.push({ id: id, token: state.tokens.curr });
      }
      while (!checkPunctuators(state.tokens.next, ["}"])) {
        advance(",");
        if (checkPunctuators(state.tokens.next, ["}"])) {
          // Trailing comma
          // ObjectBindingPattern: { BindingPropertyList , }
          break;
        }
        id = identifier();
        if (checkPunctuators(state.tokens.next, [":"])) {
          advance(":");
          nextInnerDE();
        } else {
          identifiers.push({ id: id, token: state.tokens.curr });
        }
      }
      advance("}");
    }
    return identifiers;
  }

  function destructuringExpressionMatch(tokens, value) {
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

  var conststatement = stmt("const", function(prefix) {
    var tokens;
    var value;
    var lone; // State variable to know if it is a lone identifier, or a destructuring statement.

    if (!state.option.inESNext())
      warning("W104", state.tokens.curr, "const");

    this.first = [];
    for (;;) {
      var names = [];
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringExpression();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr } ];
        lone = true;
      }
      for (var t in tokens) {
        if (tokens.hasOwnProperty(t)) {
          t = tokens[t];
          if (funct[t.id] === "const") {
            warning("E011", null, t.id);
          }
          if (funct["(global)"] && predefined[t.id] === false) {
            warning("W079", t.token, t.id);
          }
          if (t.id) {
            addlabel(t.id, { token: t.token, type: "const", unused: true });
            names.push(t.token);
          }
        }
      }
      if (prefix) {
        break;
      }

      this.first = this.first.concat(names);

      if (state.tokens.next.id !== "=") {
        warning("E012", state.tokens.curr, state.tokens.curr.value);
      }

      if (state.tokens.next.id === "=") {
        advance("=");
        if (state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          warning("W120", state.tokens.next, state.tokens.next.value);
        }
        value = expression(10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringExpressionMatch(names, value);
        }
      }

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
    return this;
  });

  conststatement.exps = true;
  var varstatement = stmt("var", function(prefix) {
    // JavaScript does not have block scope. It only has function scope. So,
    // declaring a variable in a block can have unexpected consequences.
    var tokens, lone, value;

    this.first = [];
    for (;;) {
      var names = [];
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringExpression();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr } ];
        lone = true;
      }
      for (var t in tokens) {
        if (tokens.hasOwnProperty(t)) {
          t = tokens[t];
          if (state.option.inESNext() && funct[t.id] === "const") {
            warning("E011", null, t.id);
          }
          if (funct["(global)"]) {
            if (predefined[t.id] === false) {
              warning("W079", t.token, t.id);
            } else if (state.option.futurehostile === false) {
              if ((!state.option.inES5() && vars.ecmaIdentifiers[5][t.id] === false) ||
                (!state.option.inESNext() && vars.ecmaIdentifiers[6][t.id] === false)) {
                warning("W129", t.token, t.id);
              }
            }
          }
          if (t.id) {
            addlabel(t.id, { type: "unused", token: t.token });
            names.push(t.token);
          }
        }
      }
      if (prefix) {
        break;
      }

      this.first = this.first.concat(names);

      if (state.tokens.next.id === "=") {
        state.nameStack.set(state.tokens.curr);
        advance("=");
        if (state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          if (!funct["(params)"] || funct["(params)"].indexOf(state.tokens.next.value) === -1) {
            warning("W120", state.tokens.next, state.tokens.next.value);
          }
        }
        value = expression(10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringExpressionMatch(names, value);
        }
      }

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
    return this;
  });
  varstatement.exps = true;

  var letstatement = stmt("let", function(prefix) {
    var tokens, lone, value, letblock;

    if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "let");
    }

    if (state.tokens.next.value === "(") {
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.next, "let block");
      }
      advance("(");
      funct["(blockscope)"].stack();
      letblock = true;
    } else if (funct["(nolet)"]) {
      error("E048", state.tokens.curr);
    }

    this.first = [];
    for (;;) {
      var names = [];
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringExpression();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr.value } ];
        lone = true;
      }
      for (var t in tokens) {
        if (tokens.hasOwnProperty(t)) {
          t = tokens[t];
          if (state.option.inESNext() && funct[t.id] === "const") {
            warning("E011", null, t.id);
          }
          if (funct["(global)"] && predefined[t.id] === false) {
            warning("W079", t.token, t.id);
          }
          if (t.id && !funct["(nolet)"]) {
            addlabel(t.id, { type: "unused", token: t.token, islet: true });
            names.push(t.token);
          }
        }
      }
      if (prefix) {
        break;
      }

      this.first = this.first.concat(names);

      if (state.tokens.next.id === "=") {
        advance("=");
        if (state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          warning("W120", state.tokens.next, state.tokens.next.value);
        }
        value = expression(10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringExpressionMatch(names, value);
        }
      }

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
    if (letblock) {
      advance(")");
      block(true, true);
      this.block = true;
      funct["(blockscope)"].unstack();
    }

    return this;
  });
  letstatement.exps = true;

  blockstmt("class", function() {
    return classdef.call(this, true);
  });

  function classdef(isStatement) {

    /*jshint validthis:true */
    if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "class");
    }
    if (isStatement) {
      // BindingIdentifier
      this.name = identifier();
      addlabel(this.name, { type: "unused", token: state.tokens.curr });
    } else if (state.tokens.next.identifier && state.tokens.next.value !== "extends") {
      // BindingIdentifier(opt)
      this.name = identifier();
      this.namedExpr = true;
    } else {
      this.name = state.nameStack.infer();
    }
    classtail(this);
    return this;
  }

  function classtail(c) {
    var strictness = state.directive["use strict"];

    // ClassHeritage(opt)
    if (state.tokens.next.value === "extends") {
      advance("extends");
      c.heritage = expression(10);
    }

    // A ClassBody is always strict code.
    state.directive["use strict"] = true;
    advance("{");
    // ClassBody(opt)
    c.body = classbody(c);
    advance("}");
    state.directive["use strict"] = strictness;
  }

  function classbody(c) {
    var name;
    var isStatic;
    var isGenerator;
    var getset;
    var props = {};
    var staticProps = {};
    var computed;
    for (var i = 0; state.tokens.next.id !== "}"; ++i) {
      name = state.tokens.next;
      isStatic = false;
      isGenerator = false;
      getset = null;
      if (name.id === "*") {
        isGenerator = true;
        advance("*");
        name = state.tokens.next;
      }
      if (name.id === "[") {
        name = computedPropertyName();
      } else if (isPropertyName(name)) {
        // Non-Computed PropertyName
        advance();
        computed = false;
        if (name.identifier && name.value === "static") {
          if (checkPunctuators(state.tokens.next, ["*"])) {
            isGenerator = true;
            advance("*");
          }
          if (isPropertyName(state.tokens.next) || state.tokens.next.id === "[") {
            computed = state.tokens.next.id === "[";
            isStatic = true;
            name = state.tokens.next;
            if (state.tokens.next.id === "[") {
              name = computedPropertyName();
            } else advance();
          }
        }

        if (name.identifier && (name.value === "get" || name.value === "set")) {
          if (isPropertyName(state.tokens.next) || state.tokens.next.id === "[") {
            computed = state.tokens.next.id === "[";
            getset = name;
            name = state.tokens.next;
            if (state.tokens.next.id === "[") {
              name = computedPropertyName();
            } else advance();
          }
        }
      } else {
        warning("W052", state.tokens.next, state.tokens.next.value || state.tokens.next.type);
        advance();
        continue;
      }

      if (!checkPunctuators(state.tokens.next, ["("])) {
        // error --- class properties must be methods
        error("E054", state.tokens.next, state.tokens.next.value);
        while (state.tokens.next.id !== "}" &&
               !checkPunctuators(state.tokens.next, ["("])) {
          advance();
        }
        if (state.tokens.next.value !== "(") {
          doFunction({ statement: c });
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

      doFunction({
        statement: c,
        type: isGenerator ? "generator" : null,
        classExprBinding: c.namedExpr ? c.name : null
      });
    }

    checkProperties(props);
  }

  blockstmt("function", function() {
    var generator = false;
    if (state.tokens.next.value === "*") {
      advance("*");
      if (state.option.inESNext(true)) {
        generator = true;
      } else {
        warning("W119", state.tokens.curr, "function*");
      }
    }
    if (inblock) {
      warning("W082", state.tokens.curr);

    }
    var i = optionalidentifier();

    if (i === undefined) {
      warning("W025");
    }

    if (funct[i] === "const") {
      warning("E011", null, i);
    }
    addlabel(i, { type: "unction", token: state.tokens.curr });

    doFunction({
      name: i,
      statement: this,
      type: generator ? "generator" : null
    });
    if (state.tokens.next.id === "(" && state.tokens.next.line === state.tokens.curr.line) {
      error("E039");
    }
    return this;
  });

  prefix("function", function() {
    var generator = false;

    if (state.tokens.next.value === "*") {
      if (!state.option.inESNext()) {
        warning("W119", state.tokens.curr, "function*");
      }
      advance("*");
      generator = true;
    }

    var i = optionalidentifier();
    var fn = doFunction({ name: i, type: generator ? "generator" : null });

    function isVariable(name) { return name[0] !== "("; }
    function isLocal(name) { return fn[name] === "var"; }

    if (!state.option.loopfunc && funct["(loopage)"]) {
      // If the function we just parsed accesses any non-local variables
      // trigger a warning. Otherwise, the function is safe even within
      // a loop.
      if (_.some(fn, function(val, name) { return isVariable(name) && !isLocal(name); })) {
        warning("W083");
      }
    }
    return this;
  });

  blockstmt("if", function() {
    var t = state.tokens.next;
    increaseComplexityCount();
    state.condition = true;
    advance("(");
    var expr = expression(0);
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
    var s = block(true, true);

    // When the if is within a for-in loop and the condition has a negative form,
    // check if the body contains nothing but a continue statement
    if (forinifcheck && forinifcheck.type === "(negative)") {
      if (s && s.length === 1 && s[0].type === "(identifier)" && s[0].value === "continue") {
        forinifcheck.type = "(negative-with-continue)";
      }
    }

    if (state.tokens.next.id === "else") {
      advance("else");
      if (state.tokens.next.id === "if" || state.tokens.next.id === "switch") {
        statement();
      } else {
        block(true, true);
      }
    }
    return this;
  });

  blockstmt("try", function() {
    var b;

    function doCatch() {
      var oldScope = scope;
      var e;

      advance("catch");
      advance("(");

      scope = Object.create(oldScope);

      e = state.tokens.next.value;
      if (state.tokens.next.type !== "(identifier)") {
        e = null;
        warning("E030", state.tokens.next, e);
      }

      advance();

      funct = functor("(catch)", state.tokens.next, scope, {
        "(context)"  : funct,
        "(breakage)" : funct["(breakage)"],
        "(loopage)"  : funct["(loopage)"],
        "(statement)": false,
        "(catch)"    : true
      });

      if (e) {
        addlabel(e, { type: "exception" });
      }

      if (state.tokens.next.value === "if") {
        if (!state.option.inMoz(true)) {
          warning("W118", state.tokens.curr, "catch filter");
        }
        advance("if");
        expression(0);
      }

      advance(")");

      state.tokens.curr.funct = funct;
      functions.push(funct);

      block(false);

      scope = oldScope;

      funct["(last)"] = state.tokens.curr.line;
      funct["(lastcharacter)"] = state.tokens.curr.character;
      funct = funct["(context)"];
    }

    block(true);

    while (state.tokens.next.id === "catch") {
      increaseComplexityCount();
      if (b && (!state.option.inMoz(true))) {
        warning("W118", state.tokens.next, "multiple catch blocks");
      }
      doCatch();
      b = true;
    }

    if (state.tokens.next.id === "finally") {
      advance("finally");
      block(true);
      return;
    }

    if (!b) {
      error("E021", state.tokens.next, "catch", state.tokens.next.value);
    }

    return this;
  });

  blockstmt("while", function() {
    var t = state.tokens.next;
    funct["(breakage)"] += 1;
    funct["(loopage)"] += 1;
    increaseComplexityCount();
    advance("(");
    checkCondAssignment(expression(0));
    advance(")", t);
    block(true, true);
    funct["(breakage)"] -= 1;
    funct["(loopage)"] -= 1;
    return this;
  }).labelled = true;

  blockstmt("with", function() {
    var t = state.tokens.next;
    if (state.directive["use strict"]) {
      error("E010", state.tokens.curr);
    } else if (!state.option.withstmt) {
      warning("W085", state.tokens.curr);
    }

    advance("(");
    expression(0);
    advance(")", t);
    block(true, true);

    return this;
  });

  blockstmt("switch", function() {
    var t = state.tokens.next;
    var g = false;
    var noindent = false;

    funct["(breakage)"] += 1;
    advance("(");
    checkCondAssignment(expression(0));
    advance(")", t);
    t = state.tokens.next;
    advance("{");

    if (state.tokens.next.from === indent)
      noindent = true;

    if (!noindent)
      indent += state.option.indent;

    this.cases = [];

    for (;;) {
      switch (state.tokens.next.id) {
      case "case":
        switch (funct["(verb)"]) {
        case "yield":
        case "break":
        case "case":
        case "continue":
        case "return":
        case "switch":
        case "throw":
          break;
        default:
          // You can tell JSHint that you don't use break intentionally by
          // adding a comment /* falls through */ on a line just before
          // the next `case`.
          if (!reg.fallsThrough.test(state.lines[state.tokens.next.line - 2])) {
            warning("W086", state.tokens.curr, "case");
          }
        }

        advance("case");
        this.cases.push(expression(0));
        increaseComplexityCount();
        g = true;
        advance(":");
        funct["(verb)"] = "case";
        break;
      case "default":
        switch (funct["(verb)"]) {
        case "yield":
        case "break":
        case "continue":
        case "return":
        case "throw":
          break;
        default:
          // Do not display a warning if 'default' is the first statement or if
          // there is a special /* falls through */ comment.
          if (this.cases.length) {
            if (!reg.fallsThrough.test(state.lines[state.tokens.next.line - 2])) {
              warning("W086", state.tokens.curr, "default");
            }
          }
        }

        advance("default");
        g = true;
        advance(":");
        break;
      case "}":
        if (!noindent)
          indent -= state.option.indent;

        advance("}", t);
        funct["(breakage)"] -= 1;
        funct["(verb)"] = undefined;
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
            statements();
            break;
          default:
            error("E025", state.tokens.curr);
            return;
          }
        } else {
          if (state.tokens.curr.id === ":") {
            advance(":");
            error("E024", state.tokens.curr, ":");
            statements();
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
    var x = stmt("do", function() {
      funct["(breakage)"] += 1;
      funct["(loopage)"] += 1;
      increaseComplexityCount();

      this.first = block(true, true);
      advance("while");
      var t = state.tokens.next;
      advance("(");
      checkCondAssignment(expression(0));
      advance(")", t);
      funct["(breakage)"] -= 1;
      funct["(loopage)"] -= 1;
      return this;
    });
    x.labelled = true;
    x.exps = true;
  }());

  blockstmt("for", function() {
    var s, t = state.tokens.next;
    var letscope = false;
    var foreachtok = null;

    if (t.value === "each") {
      foreachtok = t;
      advance("each");
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.curr, "for each");
      }
    }

    funct["(breakage)"] += 1;
    funct["(loopage)"] += 1;
    increaseComplexityCount();
    advance("(");

    // what kind of for(â€¦) statement it is? for(â€¦ofâ€¦)? for(â€¦inâ€¦)? for(â€¦;â€¦;â€¦)?
    var nextop; // contains the token of the "in" or "of" operator
    var i = 0;
    var inof = ["in", "of"];
    do {
      nextop = peek(i);
      ++i;
    } while (!_.contains(inof, nextop.value) && nextop.value !== ";" && nextop.type !== "(end)");

    // if we're in a for (â€¦ in|of â€¦) statement
    if (_.contains(inof, nextop.value)) {
      if (!state.option.inESNext() && nextop.value === "of") {
        error("W104", nextop, "for of");
      }

      if (state.tokens.next.id === "var") {
        advance("var");
        state.syntax["var"].fud.call(state.syntax["var"].fud, true);
      } else if (state.tokens.next.id === "let") {
        advance("let");
        // create a new block scope
        letscope = true;
        funct["(blockscope)"].stack();
        state.syntax["let"].fud.call(state.syntax["let"].fud, true);
      } else if (!state.tokens.next.identifier) {
        error("E030", state.tokens.next, state.tokens.next.type);
        advance();
      } else {
        switch (funct[state.tokens.next.value]) {
        case "unused":
          funct[state.tokens.next.value] = "var";
          break;
        case "var":
          break;
        default:
          var ident = state.tokens.next.value;
          if (!funct["(blockscope)"].getlabel(ident) &&
              !(scope[ident] || {})[ident]) {
            warning("W088", state.tokens.next, state.tokens.next.value);
          }
        }
        advance();
      }
      advance(nextop.value);
      expression(20);
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

      s = block(true, true);

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

      funct["(breakage)"] -= 1;
      funct["(loopage)"] -= 1;
    } else {
      if (foreachtok) {
        error("E045", foreachtok);
      }
      if (state.tokens.next.id !== ";") {
        if (state.tokens.next.id === "var") {
          advance("var");
          state.syntax["var"].fud.call(state.syntax["var"].fud);
        } else if (state.tokens.next.id === "let") {
          advance("let");
          // create a new block scope
          letscope = true;
          funct["(blockscope)"].stack();
          state.syntax["let"].fud.call(state.syntax["let"].fud);
        } else {
          for (;;) {
            expression(0, "for");
            if (state.tokens.next.id !== ",") {
              break;
            }
            comma();
          }
        }
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      if (state.tokens.next.id !== ";") {
        checkCondAssignment(expression(0));
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      if (state.tokens.next.id === ";") {
        error("E021", state.tokens.next, ")", ";");
      }
      if (state.tokens.next.id !== ")") {
        for (;;) {
          expression(0, "for");
          if (state.tokens.next.id !== ",") {
            break;
          }
          comma();
        }
      }
      advance(")", t);
      block(true, true);
      funct["(breakage)"] -= 1;
      funct["(loopage)"] -= 1;

    }
    // unstack loop blockscope
    if (letscope) {
      funct["(blockscope)"].unstack();
    }
    return this;
  }).labelled = true;


  stmt("break", function() {
    var v = state.tokens.next.value;

    if (funct["(breakage)"] === 0)
      warning("W052", state.tokens.next, this.value);

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
      if (state.tokens.curr.line === startLine(state.tokens.next)) {
        if (funct[v] !== "label") {
          warning("W090", state.tokens.next, v);
        } else if (scope[v] !== funct) {
          warning("W091", state.tokens.next, v);
        }
        this.first = state.tokens.next;
        advance();
      }
    }

    reachable(this);

    return this;
  }).exps = true;


  stmt("continue", function() {
    var v = state.tokens.next.value;

    if (funct["(breakage)"] === 0)
      warning("W052", state.tokens.next, this.value);

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
      if (state.tokens.curr.line === startLine(state.tokens.next)) {
        if (funct[v] !== "label") {
          warning("W090", state.tokens.next, v);
        } else if (scope[v] !== funct) {
          warning("W091", state.tokens.next, v);
        }
        this.first = state.tokens.next;
        advance();
      }
    } else if (!funct["(loopage)"]) {
      warning("W052", state.tokens.next, this.value);
    }

    reachable(this);

    return this;
  }).exps = true;


  stmt("return", function() {
    if (this.line === startLine(state.tokens.next)) {
      if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
        this.first = expression(0);

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
    x.lbp = 25;
  }(prefix("yield", function() {
    var prev = state.tokens.prev;
    if (state.option.inESNext(true) && !funct["(generator)"]) {
      // If it's a yield within a catch clause inside a generator then that's ok
      if (!("(catch)" === funct["(name)"] && funct["(context)"]["(generator)"])) {
        error("E046", state.tokens.curr, "yield");
      }
    } else if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "yield");
    }
    funct["(generator)"] = "yielded";
    var delegatingYield = false;

    if (state.tokens.next.value === "*") {
      delegatingYield = true;
      advance("*");
    }

    if (this.line === startLine(state.tokens.next) || !state.option.inMoz(true)) {
      if (delegatingYield ||
          (state.tokens.next.id !== ";" && !state.tokens.next.reach && state.tokens.next.nud)) {

        nobreaknonadjacent(state.tokens.curr, state.tokens.next);
        this.first = expression(10);

        if (this.first.type === "(punctuator)" && this.first.value === "=" &&
            !this.first.paren && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      }

      if (state.option.inMoz(true) && state.tokens.next.id !== ")" &&
          (prev.lbp > 30 || (!prev.assign && !isEndOfExpr()) || prev.id === "yield")) {
        error("E050", this);
      }
    } else if (!state.option.asi) {
      nolinebreak(this); // always warn (Line breaking error)
    }
    return this;
  })));


  stmt("throw", function() {
    nolinebreak(this);
    this.first = expression(20);

    reachable(this);

    return this;
  }).exps = true;

  stmt("import", function() {
    if (!state.option.inESNext()) {
      warning("W119", state.tokens.curr, "import");
    }

    if (state.tokens.next.type === "(string)") {
      // ModuleSpecifier :: StringLiteral
      advance("(string)");
      return this;
    }

    if (state.tokens.next.identifier) {
      // ImportClause :: ImportedDefaultBinding
      this.name = identifier();
      addlabel(this.name, { type: "unused", token: state.tokens.curr });
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
        addlabel(this.name, { type: "unused", token: state.tokens.curr });
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
        addlabel(importName, { type: "unused", token: state.tokens.curr });

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
    return this;
  }).exps = true;

  stmt("export", function() {
    var ok = true;
    var token;
    var identifier;

    if (!state.option.inESNext()) {
      warning("W119", state.tokens.curr, "export");
      ok = false;
    }

    if (!funct["(global)"] || !funct["(blockscope)"].atTop()) {
      error("E053", state.tokens.curr);
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
      // ExportDeclaration :: export default HoistableDeclaration
      // ExportDeclaration :: export default ClassDeclaration
      state.nameStack.set(state.tokens.next);
      advance("default");
      if (state.tokens.next.id === "function" || state.tokens.next.id === "class") {
        this.block = true;
      }

      token = peek();

      expression(10);

      if (state.tokens.next.id === "class") {
        identifier = token.name;
      } else {
        identifier = token.value;
      }

      addlabel(identifier, {
        type: "function", token: token
      });

      return this;
    }

    if (state.tokens.next.value === "{") {
      // ExportDeclaration :: export ExportClause
      advance("{");
      var exportedTokens = [];
      for (;;) {
        if (!state.tokens.next.identifier) {
          error("E030", state.tokens.next, state.tokens.next.value);
        }
        advance();

        state.tokens.curr.exported = ok;
        exportedTokens.push(state.tokens.curr);

        if (state.tokens.next.value === "as") {
          advance("as");
          if (!state.tokens.next.identifier) {
            error("E030", state.tokens.next, state.tokens.next.value);
          }
          advance();
        }

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
      if (state.tokens.next.value === "from") {
        // ExportDeclaration :: export ExportClause FromClause
        advance("from");
        advance("(string)");
      } else if (ok) {
        exportedTokens.forEach(function(token) {
          if (!funct[token.value]) {
            isundef(funct, "W117", token, token.value);
          }
          exported[token.value] = true;
          funct["(blockscope)"].setExported(token.value);
        });
      }
      return this;
    }

    if (state.tokens.next.id === "var") {
      // ExportDeclaration :: export VariableStatement
      advance("var");
      exported[state.tokens.next.value] = ok;
      state.tokens.next.exported = true;
      state.syntax["var"].fud.call(state.syntax["var"].fud);
    } else if (state.tokens.next.id === "let") {
      // ExportDeclaration :: export VariableStatement
      advance("let");
      exported[state.tokens.next.value] = ok;
      state.tokens.next.exported = true;
      state.syntax["let"].fud.call(state.syntax["let"].fud);
    } else if (state.tokens.next.id === "const") {
      // ExportDeclaration :: export VariableStatement
      advance("const");
      exported[state.tokens.next.value] = ok;
      state.tokens.next.exported = true;
      state.syntax["const"].fud.call(state.syntax["const"].fud);
    } else if (state.tokens.next.id === "function") {
      // ExportDeclaration :: export Declaration
      this.block = true;
      advance("function");
      exported[state.tokens.next.value] = ok;
      state.tokens.next.exported = true;
      state.syntax["function"].fud();
    } else if (state.tokens.next.id === "class") {
      // ExportDeclaration :: export Declaration
      this.block = true;
      advance("class");
      exported[state.tokens.next.value] = ok;
      state.tokens.next.exported = true;
      state.syntax["class"].fud();
    } else {
      error("E024", state.tokens.next, state.tokens.next.value);
    }

    return this;
  }).exps = true;

  // Future Reserved Words

  FutureReservedWord("abstract");
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
  FutureReservedWord("super", { es5: true });
  FutureReservedWord("synchronized");
  FutureReservedWord("transient");
  FutureReservedWord("volatile");

  // this function is used to determine whether a squarebracket or a curlybracket
  // expression is a comprehension array, destructuring assignment or a json value.

  var lookupBlockType = function() {
    var pn, pn1;
    var i = -1;
    var bracketStack = 0;
    var ret = {};
    if (checkPunctuators(state.tokens.curr, ["[", "{"]))
      bracketStack += 1;
    do {
      pn = (i === -1) ? state.tokens.next : peek(i);
      pn1 = peek(i + 1);
      i = i + 1;
      if (checkPunctuators(pn, ["[", "{"])) {
        bracketStack += 1;
      } else if (checkPunctuators(pn, ["]", "}"])) {
        bracketStack -= 1;
      }
      if (pn.identifier && pn.value === "for" && bracketStack === 1) {
        ret.isCompArray = true;
        ret.notJson = true;
        break;
      }
      if (checkPunctuators(pn, ["}", "]"]) && bracketStack === 0) {
        if (pn1.value === "=") {
          ret.isDestAssign = true;
          ret.notJson = true;
          break;
        } else if (pn1.value === ".") {
          ret.notJson = true;
          break;
        }
      }
      if (pn.value === ";") {
        ret.isBlock = true;
        ret.notJson = true;
      }
    } while (bracketStack > 0 && pn.id !== "(end)");
    return ret;
  };

  function saveProperty(props, name, tkn, isClass, isStatic) {
    var msg = ["key", "class method", "static class method"];
    msg = msg[(isClass || false) + (isStatic || false)];
    if (tkn.identifier) {
      name = tkn.value;
    }

    if (props[name] && _.has(props, name)) {
      warning("W075", state.tokens.next, msg, name);
    } else {
      props[name] = {};
    }

    props[name].basic = true;
    props[name].basictkn = tkn;
  }

  /**
   * @param {string} accessorType - Either "get" or "set"
   * @param {object} props - a collection of all properties of the object to
   *                         which the current accessor is being assigned
   * @param {object} tkn - the identifier token representing the accessor name
   * @param {boolean} isClass - whether the accessor is part of an ES6 Class
   *                            definition
   * @param {boolean} isStatic - whether the accessor is a static method
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

    if (props[name] && _.has(props, name)) {
      if (props[name].basic || props[name][flagName]) {
        warning("W075", state.tokens.next, msg, name);
      }
    } else {
      props[name] = {};
    }

    props[name][flagName] = tkn;
  }

  function computedPropertyName() {
    advance("[");
    if (!state.option.esnext) {
      warning("W119", state.tokens.curr, "computed property names");
    }
    var value = expression(10);
    advance("]");
    return value;
  }

  // Test whether a given token is a punctuator matching one of the specified values
  function checkPunctuators(token, values) {
    return token.type === "(punctuator)" && _.contains(values, token.value);
  }

  // Check whether this function has been reached for a destructuring assign with undeclared values
  function destructuringAssignOrJsonValue() {
    // lookup for the assignment (esnext only)
    // if it has semicolons, it is a block, so go parse it as a block
    // or it's not a block, but there are assignments, check for undeclared variables

    var block = lookupBlockType();
    if (block.notJson) {
      if (!state.option.inESNext() && block.isDestAssign) {
        warning("W104", state.tokens.curr, "destructuring assignment");
      }
      statements();
    // otherwise parse json value
    } else {
      state.option.laxbreak = true;
      state.jsonMode = true;
      jsonValue();
    }
  }

  // array comprehension parsing function
  // parses and defines the three states of the list comprehension in order
  // to avoid defining global variables, but keeping them to the list comprehension scope
  // only. The order of the states are as follows:
  //  * "use" which will be the returned iterative part of the list comprehension
  //  * "define" which will define the variables local to the list comprehension
  //  * "filter" which will help filter out values

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
              warning("W098", v.token, v.raw_text || v.value);
            if (v.undef)
              isundef(v.funct, "W117", v.token, v.value);
          });
          _carrays.splice(-1, 1);
          _current = _carrays[_carrays.length - 1];
        },
        setState: function(s) {
          if (_.contains(["use", "define", "generate", "filter"], s))
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
                funct: funct,
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
                funct: funct,
                token: state.tokens.curr,
                value: v,
                undef: false,
                unused: true
              });
            }
            return true;
          // When we are in the "generate" state of the list comp,
          } else if (_current && _current.mode === "generate") {
            isundef(funct, "W117", state.tokens.curr, v);
            return true;
          // When we are in "filter" state,
          } else if (_current && _current.mode === "filter") {
            // we check whether current variable has been declared
            if (use(v)) {
              // if not we warn about it
              isundef(funct, "W117", state.tokens.curr, v);
            }
            return true;
          }
          return false;
        }
        };
  };


  // Parse JSON

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

  var blockScope = function() {
    var _current = {};
    var _variables = [_current];

    function _checkBlockLabels() {
      for (var t in _current) {
        if (_current[t]["(type)"] === "unused") {
          if (state.option.unused) {
            var tkn = _current[t]["(token)"];
            // Don't report exported labels as unused
            if (tkn.exported) {
              continue;
            }
            var line = tkn.line;
            var chr  = tkn.character;
            warningAt("W098", line, chr, t);
          }
        }
      }
    }

    return {
      stack: function() {
        _current = {};
        _variables.push(_current);
      },

      unstack: function() {
        _checkBlockLabels();
        _variables.splice(_variables.length - 1, 1);
        _current = _.last(_variables);
      },

      getlabel: function(l) {
        for (var i = _variables.length - 1 ; i >= 0; --i) {
          if (_.has(_variables[i], l) && !_variables[i][l]["(shadowed)"]) {
            return _variables[i];
          }
        }
      },

      shadow: function(name) {
        for (var i = _variables.length - 1; i >= 0; i--) {
          if (_.has(_variables[i], name)) {
            _variables[i][name]["(shadowed)"] = true;
          }
        }
      },

      unshadow: function(name) {
        for (var i = _variables.length - 1; i >= 0; i--) {
          if (_.has(_variables[i], name)) {
            _variables[i][name]["(shadowed)"] = false;
          }
        }
      },

      atTop: function() {
        return _variables.length === 1;
      },

      setExported: function(id) {
        if (funct["(blockscope)"].atTop()) {
          var item = _current[id];
          if (item && item["(token)"]) {
            item["(token)"].exported = true;
          }
        }
      },

      current: {
        has: function(t) {
          return _.has(_current, t);
        },

        add: function(t, type, tok) {
          _current[t] = { "(type)" : type, "(token)": tok, "(shadowed)": false };
        }
      }
    };
  };

  var escapeRegex = function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  // The actual JSHINT function itself.
  var itself = function(s, o, g) {
    var i, k, x, reIgnoreStr, reIgnore;
    var optionKeys;
    var newOptionObj = {};
    var newIgnoredObj = {};

    o = _.clone(o);
    state.reset();

    if (o && o.scope) {
      JSHINT.scope = o.scope;
    } else {
      JSHINT.errors = [];
      JSHINT.undefs = [];
      JSHINT.internals = [];
      JSHINT.blacklist = {};
      JSHINT.scope = "(main)";
    }

    predefined = Object.create(null);
    combine(predefined, vars.ecmaIdentifiers[3]);
    combine(predefined, vars.reservedVars);

    combine(predefined, g || {});

    declared = Object.create(null);
    exported = Object.create(null);

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
          newOptionObj[optionKeys[x]] = o[optionKeys[x]];

          if (optionKeys[x] === "newcap" && o[optionKeys[x]] === false)
            newOptionObj["(explicitNewcap)"] = true;
        }
      }
    }

    state.option = newOptionObj;
    state.ignored = newIgnoredObj;

    state.option.indent = state.option.indent || 4;
    state.option.maxerr = state.option.maxerr || 50;

    indent = 1;
    global = Object.create(predefined);
    scope = global;

    funct = functor("(global)", null, scope, {
      "(global)"    : true,
      "(blockscope)": blockScope(),
      "(comparray)" : arrayComprehension(),
      "(metrics)"   : createMetrics(state.tokens.next)
    });

    functions = [funct];
    urls = [];
    stack = null;
    member = {};
    membersOnly = null;
    implied = {};
    inblock = false;
    lookahead = [];
    unuseds = [];

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
      quit("E041", ev.line, ev.from);
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

    lex.start();

    // Check options
    for (var name in o) {
      if (_.has(o, name)) {
        checkOption(name, state.tokens.curr);
      }
    }

    assume();

    // combine the passed globals after we've assumed all our options
    combine(predefined, g || {});

    //reset values
    comma.first = true;

    try {
      advance();
      switch (state.tokens.next.id) {
      case "{":
      case "[":
        destructuringAssignOrJsonValue();
        break;
      default:
        directives();

        if (state.directive["use strict"]) {
          if (!state.option.globalstrict) {
            if (!(state.option.node || state.option.phantom || state.option.browserify)) {
              warning("W097", state.tokens.prev);
            }
          }
        }

        statements();
      }
      advance((state.tokens.next && state.tokens.next.value !== ".")  ? "(end)" : undefined);
      funct["(blockscope)"].unstack();

      var markDefined = function(name, context) {
        do {
          if (typeof context[name] === "string") {
            // JSHINT marks unused variables as 'unused' and
            // unused function declaration as 'unction'. This
            // code changes such instances back 'var' and
            // 'closure' so that the code in JSHINT.data()
            // doesn't think they're unused.

            if (context[name] === "unused")
              context[name] = "var";
            else if (context[name] === "unction")
              context[name] = "closure";

            return true;
          }

          context = context["(context)"];
        } while (context);

        return false;
      };

      var clearImplied = function(name, line) {
        if (!implied[name])
          return;

        var newImplied = [];
        for (var i = 0; i < implied[name].length; i += 1) {
          if (implied[name][i] !== line)
            newImplied.push(implied[name][i]);
        }

        if (newImplied.length === 0)
          delete implied[name];
        else
          implied[name] = newImplied;
      };

      var warnUnused = function(name, tkn, type, unused_opt) {
        var line = tkn.line;
        var chr  = tkn.from;
        var raw_name = tkn.raw_text || name;

        if (unused_opt === undefined) {
          unused_opt = state.option.unused;
        }

        if (unused_opt === true) {
          unused_opt = "last-param";
        }

        var warnable_types = {
          "vars": ["var"],
          "last-param": ["var", "param"],
          "strict": ["var", "param", "last-param"]
        };

        if (unused_opt) {
          if (warnable_types[unused_opt] && warnable_types[unused_opt].indexOf(type) !== -1) {
            if (!tkn.exported) {
              warningAt("W098", line, chr, raw_name);
            }
          }
        }

        unuseds.push({
          name: name,
          line: line,
          character: chr
        });
      };

      var checkUnused = function(func, key) {
        var type = func[key];
        var tkn = func["(tokens)"][key];

        if (key.charAt(0) === "(")
          return;

        if (type !== "unused" && type !== "unction" && type !== "const")
          return;

        // Params are checked separately from other variables.
        if (func["(params)"] && func["(params)"].indexOf(key) !== -1)
          return;

        // Variable is in global scope and defined as exported.
        if (func["(global)"] && _.has(exported, key))
          return;

        // Is this constant unused?
        if (type === "const" && !getprop(func, key, "unused"))
          return;

        warnUnused(key, tkn, "var");
      };

      // Check queued 'x is not defined' instances to see if they're still undefined.
      for (i = 0; i < JSHINT.undefs.length; i += 1) {
        k = JSHINT.undefs[i].slice(0);

        if (markDefined(k[2].value, k[0]) || k[2].forgiveUndef) {
          clearImplied(k[2].value, k[2].line);
        } else if (state.option.undef) {
          warning.apply(warning, k.slice(1));
        }
      }

      functions.forEach(function(func) {
        if (func["(unusedOption)"] === false) {
          return;
        }

        for (var key in func) {
          if (_.has(func, key)) {
            checkUnused(func, key);
          }
        }

        if (!func["(params)"])
          return;

        var params = func["(params)"].slice();
        var param  = params.pop();
        var type, unused_opt;

        while (param) {
          type = func[param];
          unused_opt = func["(unusedOption)"] || state.option.unused;
          unused_opt = unused_opt === true ? "last-param" : unused_opt;

          // 'undefined' is a special case for (function(window, undefined) { ... })();
          // patterns.

          if (param === "undefined")
            return;

          if (type === "unused" || type === "unction") {
            warnUnused(param, func["(tokens)"][param], "param", func["(unusedOption)"]);
          } else if (unused_opt === "last-param") {
            return;
          }

          param = params.pop();
        }
      });

      for (var key in declared) {
        if (_.has(declared, key) && !_.has(global, key) && !_.has(exported, key)) {
          warnUnused(key, declared[key], "var");
        }
      }

    } catch (err) {
      if (err && err.name === "JSHintError") {
        var nt = state.tokens.next || {};
        JSHINT.errors.push({
          scope     : "(main)",
          raw       : err.raw,
          code      : err.code,
          reason    : err.message,
          line      : err.line || nt.line,
          character : err.character || nt.from
        }, null);
      } else {
        throw err;
      }
    }

    // Loop over the listed "internals", and check them as well.

    if (JSHINT.scope === "(main)") {
      o = o || {};

      for (i = 0; i < JSHINT.internals.length; i += 1) {
        k = JSHINT.internals[i];
        o.scope = k.elem;
        itself(k.value, o, g);
      }
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

    var implieds = [];
    var members = [];
    var fu, f, i, j, n, globals;

    if (itself.errors.length) {
      data.errors = itself.errors;
    }

    if (state.jsonMode) {
      data.json = true;
    }

    for (n in implied) {
      if (_.has(implied, n)) {
        implieds.push({
          name: n,
          line: implied[n]
        });
      }
    }

    if (implieds.length > 0) {
      data.implieds = implieds;
    }

    if (urls.length > 0) {
      data.urls = urls;
    }

    globals = Object.keys(scope);
    if (globals.length > 0) {
      data.globals = globals;
    }

    for (i = 1; i < functions.length; i += 1) {
      f = functions[i];
      fu = {};

      for (j = 0; j < functionicity.length; j += 1) {
        fu[functionicity[j]] = [];
      }

      for (j = 0; j < functionicity.length; j += 1) {
        if (fu[functionicity[j]].length === 0) {
          delete fu[functionicity[j]];
        }
      }

      fu.name = f["(name)"];
      fu.param = f["(params)"];
      fu.line = f["(line)"];
      fu.character = f["(character)"];
      fu.last = f["(last)"];
      fu.lastcharacter = f["(lastcharacter)"];

      fu.metrics = {
        complexity: f["(metrics)"].ComplexityCount,
        parameters: (f["(params)"] || []).length,
        statements: f["(metrics)"].statementCount
      };

      data.functions.push(fu);
    }

    if (unuseds.length > 0) {
      data.unused = unuseds;
    }

    members = [];
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

},{"./lex.js":13,"./messages.js":14,"./options.js":16,"./reg.js":17,"./state.js":18,"./style.js":19,"./vars.js":20,"console-browserify":10,"events":5,"underscore":12}]},{},[]);

JSHINT = require('jshint').JSHINT;
if (typeof exports === 'object' && exports) exports.JSHINT = JSHINT;
}());
