// atob and btoa
var a = atob("dGVzdA=="),
    b = btoa("test");

// DOMParser
var dp = new DOMParser();
var dom = dp.parseFromString("<test>jshint</test>", "text/xml");

// XMLSerializer
var xs = new XMLSerializer();
var dom_str = xs.serializeToString(dom);

// node
var filterAccept = NodeFilter.FILTER_ACCEPT;
var elementNode = Node.ELEMENT_NODE;

// MutationObserver
var mutationObserver = new MutationObserver(/* callback */);

// SVGElement
var svgProto = SVGElement.prototype;

// DOM4 Constructors
var comment = new Comment("");
var df = new DocumentFragment();
var range = new Range();
var text = new Text("");
