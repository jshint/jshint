"use strict";

var _ = require("underscore");

// Identifiers provided by the ECMAScript standard

exports.reservedVars = {
	undefined : false,
	arguments : false,
	NaN       : false
};

exports.ecmaIdentifiers = {
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
	JSON               : false,
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
};


// Errors and warnings

var errors = {
	E001: "Trailing comma causes errors in some versions of IE.",
	E002: "'with' statement is prohibited in strict mode.",
	E003: "'return' can be used only within functions.",
	E004: "'__iterator__' property is only available in JavaScript 1.7.",
	E005: "'__proto___' property is deprecated.",
	E006: "Missing semicolon.",
	E007: "Unexpected debugger statement.",
	E008: "'arguments.callee' is prohibited in strict mode.",
	E009: "Undefined variable in strict mode."
};

var warnings = {
	W001: "Bitwise operator. (mistyped logical operator?)",
	W002: "Unsafe comparison.",
	W003: "Redefined variable.",
	W004: "Undefined variable.",
	W005: "Avoid arguments.caller.",
	W006: "Avoid arguments.callee.",
	W007: "Object arguments outside of a function body.",
	W008: "Assignment instead of a conditionial expression. (typo?)",
	W009: "Insecure use of {sym} in a regular expression.",
	W010: "Empty regular expression class.",
	W011: "Unescaped {sym} in a regular expression.",
	W012: "Don't extend native objects."
};

exports.errors = {};
exports.warnings = {};

_.each(errors, function (desc, code) {
	exports.errors[code] = { code: code, desc: desc };
});

_.each(warnings, function (desc, code) {
	exports.warnings[code] = { code: code, desc: desc };
});
