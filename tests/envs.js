/**
 * Tests for the environmental (browser, jquery, etc.) options
 */

/*jshint boss: true, laxbreak: true, node: true */
/*global wrap: true */

var JSHINT = require('../jshint.js').JSHINT,
    assert = require('assert'),
    fs     = require('fs');

function wrap(globals) {
    return '(function () { return [ ' + globals.join(',') + ' ]; }());';
}

assert.globalsKnown = function (globals, options) {
    JSHINT(wrap(globals), options || {});
    var report = JSHINT.data();

    assert.isUndefined(report.implieds);
    assert.eql(report.globals.length, globals.length);

    var dict = {};
    for (var i = 0, g; g = report.globals[i]; i++)
        globals[g] = true;

    for (i = 0, g = null; g = globals[i]; i++)
        assert.ok(g in globals);
};

assert.globalsImplied = function (globals, options) {
    JSHINT(wrap(globals), options || {});
    var report = JSHINT.data();

    assert.isDefined(report.implieds);
    assert.isUndefined(report.globals, 0);

    var implieds = [];
    for (var i = 0, warn; warn = report.implieds[i]; i++)
        implieds.push(warn.name);

    assert.eql(implieds.length, globals.length);
};

/** Option `node` predefines Node.js globals */
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

    assert.ok(JSHINT(asGlobals, { node: true, nomen: true }));
    assert.ok(!JSHINT(asProps, { node: true, nomen: true }));
    assert.eql(JSHINT.errors.length, 3);
    assert.eql(JSHINT.errors[0].reason, "Unexpected dangling '_' in '__dirname'.");
    assert.eql(JSHINT.errors[1].reason, "Unexpected dangling '_' in '__filename'.");
    assert.eql(JSHINT.errors[2].reason, "Unexpected dangling '_' in '__hello'.");
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

/**
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
        ];

    assert.globalsImplied(globals);
    assert.globalsKnown(globals, { wsh: true });
};

exports.es5 = function () {
    var src = fs.readFileSync(__dirname + "/fixtures/es5.js", "utf8");

    assert.ok(!JSHINT(src));
    assert.eql(JSHINT.errors.length, 3);
    assert.eql(JSHINT.errors[0].line, 3);
    assert.eql(JSHINT.errors[0].reason, "Extra comma.");
    assert.eql(JSHINT.errors[1].line, 8);
    assert.eql(JSHINT.errors[1].reason, "Extra comma.");
    assert.eql(JSHINT.errors[2].line, 15);
    assert.eql(JSHINT.errors[2].reason, "get/set are ES5 features.");

    assert.ok(JSHINT(src, { es5: true }));

    // Make sure that JSHint parses getters/setters as function expressions
    // (https://github.com/jshint/jshint/issues/96)
    src = fs.readFileSync(__dirname + "/fixtures/es5.funcexpr.js", "utf8");
    assert.ok(JSHINT(src, { es5: true }));
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
