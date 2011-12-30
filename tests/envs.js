/**
 * Tests for the environmental (browser, jquery, etc.) options
 */

/*jshint boss: true, laxbreak: true, node: true */
/*global wrap: true */

var JSHINT  = require('../jshint.js').JSHINT,
    assert  = require('assert'),
    fs      = require('fs'),
    TestRun = require("./testhelper").setup.testRun;

function wrap(globals) {
    return '(function () { return [ ' + globals.join(',') + ' ]; }());';
}

assert.globalsKnown = function (globals, options) {
    JSHINT(wrap(globals), options || {});
    var report = JSHINT.data();

    assert.isUndefined(report.implieds);
    assert.eql(report.globals.length, globals.length);

    var dict = {};
    for (var i = 0, g; g = report.globals[i]; i += 1)
        globals[g] = true;

    for (i = 0, g = null; g = globals[i]; i += 1)
        assert.ok(g in globals);
};

assert.globalsImplied = function (globals, options) {
    JSHINT(wrap(globals), options || {});
    var report = JSHINT.data();

    assert.isDefined(report.implieds);
    assert.isUndefined(report.globals, 0);

    var implieds = [];
    for (var i = 0, warn; warn = report.implieds[i]; i += 1)
        implieds.push(warn.name);

    assert.eql(implieds.length, globals.length);
};

/*
 * Option `node` predefines Node.js (v 0.5.9) globals
 *
 * More info:
 *  + http://nodejs.org/docs/v0.5.9/api/globals.html
 */
exports.node = function () {
    var globals = [
            "__filename"
          , "__dirname"
          , "Buffer"
          , "GLOBAL"
          , "global"
          , "module"
          , "process"
          , "require"
          , "exports"
          , "console"
          , "setTimeout"
          , "clearTimeout"
          , "setInterval"
          , "clearInterval"
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { node: true });

    // Make sure that the `node` option doesn't conflict with `nomen`
    var asGlobals = [
        'console.log(__dirname);',
        'console.log(__filename);'
    ];

    var asProps = [
        'console.log(a.__dirname);',
        'console.log(a.__filename);',
        'console.log(__hello);'
    ];

    TestRun().test(asGlobals, { node: true, nomen: true });
    TestRun()
        .addError(1, "Unexpected dangling '_' in '__dirname'.")
        .addError(2, "Unexpected dangling '_' in '__filename'.")
        .addError(3, "Unexpected dangling '_' in '__hello'.")
        .test(asProps, { node: true, nomen: true });
};

/** Option `jquery` predefines jQuery globals */
exports.jquery = function () {
    var globals = [ 'jQuery', '$' ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { jquery: true });
};

/** Option `couch` predefines CouchDB globals */
exports.couch = function () {
    var globals = [
            "require"
          , "respond"
          , "getRow"
          , "emit"
          , "send"
          , "start"
          , "sum"
          , "log"
          , "exports"
          , "module"
          , "provides"
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { couch: true });
};

/** Option `prototypejs` predefines Prototype.js and Scriptaculous globals */
exports.prototypejs = function () {
    var globals = [
            "$"
          , "$$"
          , "$A"
          , "$F"
          , "$H"
          , "$R"
          , "$break"
          , "$continue"
          , "$w"
          , "Abstract"
          , "Ajax"
          , "Class"
          , "Enumerable"
          , "Element"
          , "Event"
          , "Field"
          , "Form"
          , "Hash"
          , "Insertion"
          , "ObjectRange"
          , "PeriodicalExecuter"
          , "Position"
          , "Prototype"
          , "Selector"
          , "Template"
          , "Toggle"
          , "Try"
          , "Autocompleter"
          , "Builder"
          , "Control"
          , "Draggable"
          , "Draggables"
          , "Droppables"
          , "Effect"
          , "Sortable"
          , "SortableObserver"
          , "Sound"
          , "Scriptaculous"
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { prototypejs: true });
};

/**
 * Option `devel` predefines global functions used for development
 * (console, alert, etc.)
 */
exports.devel = function () {
    var globals = [
            "alert"
          , "confirm"
          , "console"
          , "Debug"
          , "opera"
          , "prompt"
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { devel: true });
};

/*
 * Option `browser` predefines globals usually found in browser environments.
 * In addition to stuff like window, setInterval,.. it also supports some
 * more or less stable HTML5 variables like FileReader, localStorage,..
 * and typed arrays like Int32Array, Uint32Array, etc.
 *
 * More info:
 *  + HTML5: http://www.html5rocks.com/
 *  + Typed arrays: https://developer.mozilla.org/en/JavaScript_typed_arrays
 */
exports.browser = function () {
    var globals = [
            'ArrayBuffer'
          , 'ArrayBufferView'
          , 'Audio'
          , 'addEventListener'
          , 'applicationCache'
          , 'blur'
          , 'clearInterval'
          , 'clearTimeout'
          , 'close'
          , 'closed'
          , 'DataView'
          , 'defaultStatus'
          , 'document'
          , 'event'
          , 'FileReader'
          , 'Float32Array'
          , 'Float64Array'
          , 'FormData'
          , 'focus'
          , 'frames'
          , 'getComputedStyle'
          , 'history'
          , 'HTMLElement'
          , 'HTMLAnchorElement'
          , 'HTMLBaseElement'
          , 'HTMLBlockquoteElement'
          , 'HTMLBodyElement'
          , 'HTMLBRElement'
          , 'HTMLButtonElement'
          , 'HTMLCanvasElement'
          , 'HTMLDirectoryElement'
          , 'HTMLDivElement'
          , 'HTMLDListElement'
          , 'HTMLFieldSetElement'
          , 'HTMLFontElement'
          , 'HTMLFormElement'
          , 'HTMLFrameElement'
          , 'HTMLFrameSetElement'
          , 'HTMLHeadElement'
          , 'HTMLHeadingElement'
          , 'HTMLHRElement'
          , 'HTMLHtmlElement'
          , 'HTMLIFrameElement'
          , 'HTMLImageElement'
          , 'HTMLInputElement'
          , 'HTMLIsIndexElement'
          , 'HTMLLabelElement'
          , 'HTMLLayerElement'
          , 'HTMLLegendElement'
          , 'HTMLLIElement'
          , 'HTMLLinkElement'
          , 'HTMLMapElement'
          , 'HTMLMenuElement'
          , 'HTMLMetaElement'
          , 'HTMLModElement'
          , 'HTMLObjectElement'
          , 'HTMLOListElement'
          , 'HTMLOptGroupElement'
          , 'HTMLOptionElement'
          , 'HTMLParagraphElement'
          , 'HTMLParamElement'
          , 'HTMLPreElement'
          , 'HTMLQuoteElement'
          , 'HTMLScriptElement'
          , 'HTMLSelectElement'
          , 'HTMLStyleElement'
          , 'HTMLTableCaptionElement'
          , 'HTMLTableCellElement'
          , 'HTMLTableColElement'
          , 'HTMLTableElement'
          , 'HTMLTableRowElement'
          , 'HTMLTableSectionElement'
          , 'HTMLTextAreaElement'
          , 'HTMLTitleElement'
          , 'HTMLUListElement'
          , 'HTMLVideoElement'
          , 'Int16Array'
          , 'Int32Array'
          , 'Int8Array'
          , 'Image'
          , 'length'
          , 'localStorage'
          , 'location'
          , 'moveBy'
          , 'moveTo'
          , 'name'
          , 'navigator'
          , 'onbeforeunload'
          , 'onblur'
          , 'onerror'
          , 'onfocus'
          , 'onload'
          , 'onresize'
          , 'onunload'
          , 'open'
          , 'openDatabase'
          , 'opener'
          , 'Option'
          , 'parent'
          , 'print'
          , 'removeEventListener'
          , 'resizeBy'
          , 'resizeTo'
          , 'screen'
          , 'scroll'
          , 'scrollBy'
          , 'scrollTo'
          , 'SharedWorker'
          , 'sessionStorage'
          , 'setInterval'
          , 'setTimeout'
          , 'status'
          , 'top'
          , 'Uint16Array'
          , 'Uint32Array'
          , 'Uint8Array'
          , 'WebSocket'
          , 'window'
          , 'Worker'
          , 'XMLHttpRequest'
          , 'XPathEvaluator'
          , 'XPathException'
          , 'XPathExpression'
          , 'XPathNamespace'
          , 'XPathNSResolver'
          , 'XPathResult'
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { browser: true });
};

exports.rhino = function () {
    var globals = [
            'defineClass'
          , 'deserialize'
          , 'gc'
          , 'help'
          , 'importPackage'
          , 'java'
          , 'load'
          , 'loadClass'
          , 'print'
          , 'quit'
          , 'readFile'
          , 'readUrl'
          , 'runCommand'
          , 'seal'
          , 'serialize'
          , 'spawn'
          , 'sync'
          , 'toint32'
          , 'version'
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { rhino: true });
};

exports.wsh = function () {
    var globals = [
            'ActiveXObject'
          , 'Enumerator'
          , 'GetObject'
          , 'ScriptEngine'
          , 'ScriptEngineBuildVersion'
          , 'ScriptEngineMajorVersion'
          , 'ScriptEngineMinorVersion'
          , 'VBArray'
          , 'WSH'
          , 'WScript'
          , 'XDomainRequest'
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { wsh: true });
};

exports.es5 = function () {
    var src = fs.readFileSync(__dirname + "/fixtures/es5.js", "utf8");

    TestRun()
        .addError(3, "Extra comma.")
        .addError(8, "Extra comma.")
        .addError(15, "get/set are ES5 features.")
        .addError(16, "get/set are ES5 features.")
        .addError(20, "get/set are ES5 features.")
        .addError(22, "get/set are ES5 features.")
        .addError(26, "get/set are ES5 features.")
        .addError(30, "get/set are ES5 features.")
        .addError(31, "get/set are ES5 features.")
        .addError(36, "get/set are ES5 features.")
        .addError(41, "get/set are ES5 features.")
        .addError(42, "get/set are ES5 features.")
        .addError(43, "Duplicate member 'x'.")
        .addError(47, "get/set are ES5 features.")
        .addError(48, "get/set are ES5 features.")
        .addError(48, "Duplicate member 'x'.")
        .addError(52, "get/set are ES5 features.")
        .addError(53, "get/set are ES5 features.")
        .addError(54, "get/set are ES5 features.")
        .addError(54, "Duplicate member 'x'.")
        .addError(58, "get/set are ES5 features.")
        .addError(58, "Unexpected parameter 'a' in get x function.")
        .addError(59, "get/set are ES5 features.")
        .addError(59, "Unexpected parameter 'a' in get y function.")
        .addError(60, "get/set are ES5 features.")
        .addError(62, "get/set are ES5 features.")
        .addError(62, "Expected a single parameter in set x function.")
        .addError(63, "get/set are ES5 features.")
        .addError(64, "get/set are ES5 features.")
        .addError(64, "Expected a single parameter in set z function.")
        .addError(68, "get/set are ES5 features.")
        .addError(69, "get/set are ES5 features.")
        .addError(68, "Missing property name.")
        .addError(69, "Missing property name.")
        .addError(75, "get/set are ES5 features.")
        .addError(76, "get/set are ES5 features.")
        .test(src);

    TestRun()
        .addError(36, "Setter is defined without getter.")
        .addError(43, "Duplicate member 'x'.")
        .addError(48, "Duplicate member 'x'.")
        .addError(54, "Duplicate member 'x'.")
        .addError(58, "Unexpected parameter 'a' in get x function.")
        .addError(59, "Unexpected parameter 'a' in get y function.")
        .addError(62, "Expected a single parameter in set x function.")
        .addError(64, "Expected a single parameter in set z function.")
        .addError(68, "Missing property name.")
        .addError(69, "Missing property name.")
        .test(src, { es5: true });

    // Make sure that JSHint parses getters/setters as function expressions
    // (https://github.com/jshint/jshint/issues/96)
    src = fs.readFileSync(__dirname + "/fixtures/es5.funcexpr.js", "utf8");
    TestRun().test(src, { es5: true });
};

exports.mootools = function () {
    var globals = [
            '$'
          , '$$'
          , 'Assets'
          , 'Browser'
          , 'Chain'
          , 'Class'
          , 'Color'
          , 'Cookie'
          , 'Core'
          , 'Document'
          , 'DomReady'
          , 'DOMReady'
          , 'Drag'
          , 'Element'
          , 'Elements'
          , 'Event'
          , 'Events'
          , 'Fx'
          , 'Group'
          , 'Hash'
          , 'HtmlTable'
          , 'Iframe'
          , 'IframeShim'
          , 'InputValidator'
          , 'instanceOf'
          , 'Keyboard'
          , 'Locale'
          , 'Mask'
          , 'MooTools'
          , 'Native'
          , 'Options'
          , 'OverText'
          , 'Request'
          , 'Scroller'
          , 'Slick'
          , 'Slider'
          , 'Sortables'
          , 'Spinner'
          , 'Swiff'
          , 'Tips'
          , 'Type'
          , 'typeOf'
          , 'URI'
          , 'Window'
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { mootools: true });
};

exports.dojo = function () {
    var globals = [
        'dojo'
      , 'dijit'
      , 'dojox'
      , 'define'
      , 'require'
    ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { dojo: true });
};

exports.nonstandard = function () {
    var globals = [
        'escape'
      , 'unescape'
    ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { nonstandard: true });
};

/*
 * By default JSHint supports all globals provided by the ECMAScript 5.1 specification.
 *
 * More info:
 *  + http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 */
exports.standard = function () {
    var globals = [
        'Array'
      , 'Boolean'
      , 'Date'
      , 'decodeURI'
      , 'decodeURIComponent'
      , 'encodeURI'
      , 'encodeURIComponent'
      , 'Error'
      , 'EvalError'
      , 'Function'
      , 'hasOwnProperty'
      , 'isFinite'
      , 'isNaN'
      , 'JSON'
      , 'Math'
      , 'Number'
      , 'Object'
      , 'parseInt'
      , 'parseFloat'
      , 'RangeError'
      , 'ReferenceError'
      , 'RegExp'
      , 'String'
      , 'SyntaxError'
      , 'TypeError'
      , 'URIError'
    ];

    assert.globalsKnown(globals); // You don't need any option to recognize standard globals
};
