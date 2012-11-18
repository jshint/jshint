/*
 * Lexical analysis and token construction.
 */

"use strict";

var _      = require("underscore");
var events = require("events");
var reg    = require("./reg.js");
var state  = require("./state.js").state;

// Helper functions

function isIdentifierStart(ch) {
	return (ch === "$") || (ch === "_") || (ch === "\\") ||
		(ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
}

var Token = {
	Identifier: 1,
	Punctuator: 2,
	NumericLiteral: 3,
	StringLiteral: 4,
	CommentSymbol: 5,
	Keyword: 6,
	NullLiteral: 7,
	BooleanLiteral: 8
};

var Lexer = function (source) {
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
		lines[0] = "";
	}

	this.emitter = new events.EventEmitter();
	this.source = source;
	this.lines = lines;
	this.prereg = true;

	this.line = 0;
	this.char = 1;
	this.from = 1;
	this.input = "";

	for (var i = 0; i < state.option.indent; i += 1) {
		state.tab += " ";
	}
};

Lexer.prototype = {
	_lines: [],

	get lines() {
		this._lines = state.lines;
		return this._lines;
	},

	set lines(val) {
		this._lines = val;
		state.lines = this._lines;
	},

	peek: function (i) {
		return this.input.charAt(i || 0);
	},

	skip: function (i) {
		i = i || 1;
		this.char += i;
		this.input = this.input.slice(i);
	},

	on: function (names, listener) {
		names.split(" ").forEach(function (name) {
			this.emitter.on(name, listener);
		}.bind(this));
	},

	trigger: function () {
		this.emitter.emit.apply(this.emitter, Array.prototype.slice.call(arguments));
	},

	scanPunctuator: function () {
		var ch1 = this.peek();
		var ch2, ch3, ch4;

		switch (ch1) {
		// Most common single-character punctuators
		case ".":
		case "(":
		case ")":
		case ";":
		case ",":
		case "{":
		case "}":
		case "[":
		case "]":
		case ":":
		case "~":
		case "?":
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
				value: "<<="
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

		// Special case: /=. We need to make sure that this is an
		// operator and not a regular expression.

		if (ch1 === "/") {
			if (ch2 === "=" && /\/=(?!(\S*\/[gim]?))/.test(this.input)) {
				// /= is not a part of a regular expression, return it as a
				// punctuator.
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

	scanCommentSymbols: function () {
		var ch1 = this.peek();
		var ch2 = this.peek(1);
		var rest = this.input.substr(2);

		if (ch1 === "*" && ch2 === "/") {
			return {
				type: Token.CommentSymbol,
				value: "*/"
			};
		}

		if (ch1 === "/") {
			if (ch2 === "*" || ch2 === "/") {

				// Special comments: /*jshint, /*global

				if (rest.indexOf("jshint") === 0) {
					return {
						type: Token.CommentSymbol,
						value: ch1 + ch2 + "jshint"
					};
				}

				if (rest.indexOf("jslint") === 0) {
					return {
						type: Token.CommentSymbol,
						value: ch1 + ch2 + "jslint"
					};
				}

				if (rest.indexOf("member") === 0) {
					return {
						type: Token.CommentSymbol,
						value: ch1 + ch2 + "members"
					};
				}

				if (rest.indexOf("members") === 0) {
					return {
						type: Token.CommentSymbol,
						value: ch1 + ch2 + "members"
					};
				}

				if (rest.indexOf("global") === 0) {
					return {
						type: Token.CommentSymbol,
						value: ch1 + ch2 + "global"
					};
				}

				// If no special comments matched, return the marker itself

				return {
					type: Token.CommentSymbol,
					value: ch1 + ch2
				};
			}
		}

		return null;
	},

	scanKeyword: function () {
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

	scanIdentifier: function () {
		var result = /^[a-zA-Z_$][a-zA-Z0-9_$]*/.exec(this.input);
		var id, type;

		if (result) {
			id = result[0];

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
				value: id
			};
		}

		return null;
	},

	scanNumericLiteral: function () {
		var index = 0;
		var value = "";
		var length = this.input.length;
		var char = this.peek(index);
		var bad;

		function isDecimalDigit(str) {
			return (/^[0-9]$/).test(str);
		}

		function isOctalDigit(str) {
			return (/^[0-7]$/).test(str);
		}

		function isHexDigit(str) {
			return (/^[0-9a-fA-F]$/).test(str);
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
				if (char === "x" || char === "X") {
					index += 1;
					value += char;

					while (index < length) {
						char = this.peek(index);
						if (!isHexDigit(char)) {
							break;
						}
						value += char;
						index += 1;
					}

					if (value.length <= 2) { // 0x
						return {
							type: Token.NumericLiteral,
							value: value,
							malformed: true
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
						base: 16,
						malformed: false
					};
				}

				if (isOctalDigit(char)) {
					index += 1;
					value += char;
					bad = false;

					while (index < length) {
						char = this.peek(index);

						// Numbers like '019' (note the 9) are not valid octals
						// but we still parse them and mark as 'malformed'.

						if (isDecimalDigit(char)) {
							bad = true;
						} else if (!isOctalDigit(char)) {
							break;
						}
						value += char;
						index += 1;
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
						base: 8,
						malformed: false
					};
				}

				// Decimal numbers that start with '0' such as '09' are illegal
				// but we still parse them and return as malformed.

				if (isDecimalDigit(char)) {
					index += 1;
					value += char;
				}
			}

			while (index < length) {
				char = this.peek(index);
				if (!isDecimalDigit(char)) {
					break;
				}
				value += char;
				index += 1;
			}
		}

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

		if (char === "e" || char === "E") {
			value += char;
			index += 1;
			char = this.peek(index);

			if (char === "+" || char === "-") {
				value += this.input(index);
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
			base: 10,
			malformed: !isFinite(value)
		};
	},

	scanStringLiteral: function () {
		var quote = this.peek();

		// String must start with a quote.
		if (quote !== "\"" && quote !== "'") {
			return null;
		}

		// In JSON strings must always use double quotes.
		if (state.jsonMode && quote !== "\"") {
			this.trigger("warning", {
				code: "W108",
				line: this.line,
				character: this.char // +1?
			});
		}

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

					if (!state.option.multistr) {
						this.trigger("warning", {
							code: "W117",
							line: this.line,
							character: this.char
						});
					} else if (state.jsonMode) {
						this.trigger("warning", {
							code: "W116",
							line: this.line,
							character: this.char
						});
					}
				}

				// If we get an EOF inside of an unclosed string, show an
				// error and implicitly close it at the EOF point.

				if (!this.nextLine()) {
					this.trigger("error", {
						code: "E044",
						line: startLine,
						character: startChar
					});

					return {
						type: Token.StringLiteral,
						value: value,
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

			if (char === "\\") {
				this.skip();
				char = this.peek();

				switch (char) {
				case "'":
					if (state.jsonMode) {
						this.trigger("warning", {
							code: "W114",
							line: this.line,
							character: this.char,
							data: [ "\\'" ]
						});
					}
					break;
				case "b":
					char = "\b";
					break;
				case "f":
					char = "\f";
					break;
				case "n":
					char = "\n";
					break;
				case "r":
					char = "\r";
					break;
				case "t":
					char = "\t";
					break;
				case "0":
					char = "\0";

					// Octal literals fail in strict mode.
					// Check if the number is between 00 and 07.
					var n = parseInt(this.peek(), 10);
					if (n >= 0 && n <= 7 && state.directive["use strict"]) {
						this.trigger("warning", {
							code: "W115",
							line: this.line,
							character: this.char
						});
					}
					break;
				case "u":
					var u = parseInt(this.input.substr(1, 4), 16);

					if (u >= 32 && u <= 126 && u !== 34 && u !== 92 && u !== 39) {
						this.trigger("warning", {
							code: "W111",
							line: this.line,
							character: this.char
						});
					}

					char = String.fromCharCode(u);
					jump = 5;
					break;
				case "v":
					if (state.jsonMode) {
						this.trigger("warning", {
							code: "W114",
							line: this.line,
							character: this.char,
							data: [ "\\v" ]
						});
					}

					char = "\v";
					break;
				case "x":
					var	x = parseInt(this.input.substr(1, 2), 16);

					if (state.jsonMode) {
						this.trigger("warning", {
							code: "W114",
							line: this.line,
							character: this.char,
							data: [ "\\x-" ]
						});
					}

					char = String.fromCharCode(x);
					jump = 3;
					break;
				case "\\":
				case "\"":
				case "/":
					break;
				case "":
					allowNewLine = true;
					char = "";
					break;
				case "!":
					if (value.slice(value.length - 2) === "<") {
						break;
					}

					/*falls through */
				default:
					// Weird escapement.
					this.trigger("warning", {
						code: "W118",
						line: this.line,
						character: this.char
					});
				}
			}

			value += char;
			this.skip(jump);
		}

		this.skip();
		return {
			type: Token.StringLiteral,
			value: value,
			isUnclosed: false,
			quote: quote
		};
	},

	/*
	 * Scan for any occurence of mixed tabs and spaces. If smarttabs option
	 * is on, ignore tabs followed by spaces.
	 *
	 * Tabs followed by one space followed by a block comment are allowed.
	 */
	scanMixedSpacesAndTabs: function () {
		var at, match;

		if (state.option.smarttabs) {
			// Negative look-behind for "//"
			match = this.input.match(/(\/\/)? \t/);
			at = match && !match[1] ? 0 : -1;
		} else {
			at = this.input.search(/ \t|\t [^\*]/);
		}

		return at;
	},

	/*
	 * Scan for characters that get silently deleted by one or more browsers.
	 */
	scanUnsafeChars: function () {
		return this.input.search(reg.unsafeChars);
	},

	next: function () {
		this.from = this.char;

		// Move to the next non-space character.
		var start;
		if (/\s/.test(this.peek())) {
			start = this.char;

			while (/\s/.test(this.peek())) {
				this.from += 1;
				this.skip();
			}

			if (this.peek() === "") { // EOL
				if (state.option.trailing) {
					this.trigger("warning", { code: "W102", line: this.line, character: start });
				}
			}
		}

		// Methods that don't move the character pointer.

		var match =
			this.scanCommentSymbols() ||
			this.scanPunctuator() ||
			this.scanKeyword() ||
			this.scanIdentifier() ||
			this.scanNumericLiteral();

		if (match) {
			this.skip(match.value.length);
			return match;
		}

		// Methods that move the character pointer.

		match = this.scanStringLiteral();

		if (match) {
			return match;
		}

		// No token could be matched, give up.

		return null;
	},

	nextLine: function () {
		var char;

		if (this.line >= this.lines.length) {
			return false;
		}

		this.input = this.lines[this.line];
		this.line += 1;
		this.char = 1;
		this.from = 1;

		char = this.scanMixedSpacesAndTabs();
		if (char >= 0) {
			this.trigger("warning", { code: "W099", line: this.line, character: char + 1 });
		}

		this.input = this.input.replace(/\t/g, state.tab);
		char = this.scanUnsafeChars();

		if (char >= 0) {
			this.trigger("warning", { code: "W100", line: this.line, character: char });
		}

		// If there is a limit on line length, warn when lines get too
		// long.

		if (state.option.maxlen && state.option.maxlen < this.input.length) {
			this.trigger("warning", { code: "W101", line: this.line, character: this.input.length });
		}

		return true;
	},

	start: function () {
		this.nextLine();
	},

	/*
	 * Produce a token object. The token inherits from a syntax symbol.
	 */
	create: function (type, value) {
		var token;

		switch (true) {
		case type === "(range)":
			token = { type: type };
			break;
		case type === "(punctuator)":
		case type === "(identifier)" && _.has(state.syntax, value):
			token = state.syntax[value] || state.syntax["(error)"];
			break;
		default:
			token = state.syntax[type];
		}

		token = Object.create(token);

		if (type === "(string)" || type === "(range)") {
			if (!state.option.scripturl && reg.javascriptURL.test(value)) {
				this.trigger("warning", { code: "W107", line: this.line, character: this.from });
			}
		}

		if (type === "(identifier)") {
			token.identifier = true;

			this.trigger("Identifier", {
				line: this.line,
				char: this.character,
				from: this.from,
				name: value,
				isProperty: state.tokens.curr.id === "."
			});
		}

		token.value = value;
		token.line = this.line;
		token.character = this.char;
		token.from = this.from;

		var id = token.id;
		if (id !== "(endline)") {
			this.prereg = id && (("(,=:[!&|?{};".indexOf(id.charAt(id.length - 1)) >= 0) ||
				id === "return" || id === "case");
		}

		return token;
	},

	range: function (begin, end) {
		var chr, value = "";
		this.from = this.char;

		if (this.peek() !== begin) {
			this.trigger("error", {
				code: "E004",
				line: this.line,
				character: this.char,
				data: [ begin, this.peek() ]
			});
		}

		for (;;) {
			this.skip();
			chr = this.peek();

			switch (chr) {
			case "":
				this.trigger("error", {
					code: "E013",
					line: this.line,
					character: this.char,
					data: [ chr ]
				});
				break;
			case end:
				this.skip();
				return this.create("(range)", value);
			case "\\":
				this.trigger("warning", {
					code: "W052",
					line: this.line,
					character: this.char,
					data: [ chr ]
				});
			}

			value += chr;
		}
	},

	/*
	 * Produce the next token.
	 *
	 * This function is called by advance() to get the next token.
	 */
	token: function () {
		var b, c, captures, depth, high, i, l, low, q, t, isLiteral, isInRange;
		var token;

		for (;;) {
			if (!this.input.length) {
				return this.create(this.nextLine() ? "(endline)" : "(end)", "");
			}

			token = this.next();

			if (token) {
				t = token.value;
			}

			if (!token) {
				t = "";
				c = "";

				if (this.input.length) {
					// Unexpected character.
					this.trigger("error", {
						code: "E014",
						line: this.line,
						character: this.char,
						data: [ this.peek() ]
					});

					this.input = "";
				}
			} else {
				switch (token.type) {
				case Token.StringLiteral:
					this.trigger("String", {
						line: this.line,
						char: this.character,
						from: this.from,
						value: token.value,
						quote: token.quote
					});

					return this.create("(string)", token.value);
				case Token.Identifier:
				case Token.Keyword:
				case Token.NullLiteral:
				case Token.BooleanLiteral:
					return this.create("(identifier)", token.value);

				case Token.NumericLiteral:
					if (token.malformed) {
						this.trigger("warning", {
							code: "W119",
							line: this.line,
							character: this.char,
							data: [ token.value ]
						});
					}

					if (state.jsonMode && token.base === 16) {
						this.trigger("warning", {
							code: "W114",
							line: this.line,
							character: this.char,
							data: [ "0x-" ]
						});
					}

					if (state.directive["use strict"] && token.base === 8) {
						this.trigger("warning", {
							code: "W115",
							line: this.line,
							character: this.char
						});
					}

					this.trigger("Number", {
						line: this.line,
						char: this.character,
						from: this.from,
						value: token.value,
						base: token.base,
						malformed: token.malformed
					});

					return this.create("(number)", token.value);
				}

				c = t.charAt(0);

				switch (t) {

				// Single line comment

				case "//":
					this.input = "";
					state.tokens.curr.comment = true;
					break;

				// Block comment

				case "/*":
					for (;;) {
						i = this.input.search(reg.starSlash);
						if (i >= 0) {
							break;
						}

						// Is this comment unclosed?
						if (!this.nextLine()) {
							this.trigger("error", {
								code: "E015",
								line: this.line,
								character: this.char
							});
						}
					}

					this.input = this.input.substr(i + 2);
					state.tokens.curr.comment = true;
					break;

				//		/*members /*jshint /*global

				case "/*members":
				case "/*member":
				case "/*jshint":
				case "/*jslint":
				case "/*global":
				case "*/":
					return {
						value: t,
						type: "special",
						line: this.line,
						character: this.char,
						from: this.from
					};

				case "":
					break;

				//		/

				case "/":
					// Warn about '/=' (it can be confused with /= operator.
					if (this.peek() === "=") {
						this.trigger("error", {
							code: "E016",
							line: this.line,
							character: this.from
						});
					}

					if (this.prereg) {
						depth = 0;
						captures = 0;
						l = 0;
						for (;;) {
							b = true;
							c = this.peek(l);
							l += 1;
							switch (c) {
							case "":
								// Fatal: unclosed regular expression.
								this.trigger("error", {
									code: "E017",
									line: this.line,
									character: this.from
								});

								return void this.trigger("fatal", {
									line: this.line,
									from: this.from
								});
							case "/":
								// Check that all regexp groups were terminated.
								if (depth > 0) {
									this.trigger("warning", {
										code: "W122",
										line: this.line,
										character: this.from + l,
										data: [ depth ]
									});
								}

								c = this.input.substr(0, l - 1);

								q = {
									g: true,
									i: true,
									m: true
								};

								while (q[this.peek(l)] === true) {
									q[this.peek(l)] = false;
									l += 1;
								}

								this.skip(l);
								q = this.peek();

								if (q === "/" || q === "*") {
									this.trigger("error", {
										code: "E018",
										line: this.line,
										character: this.from
									});
								}

								return this.create("(regexp)", c);
							case "\\":
								c = this.peek(l);

								if (c < " ") {
									// Unexpected control character.
									this.trigger("warning", {
										code: "W123",
										line: this.line,
										character: this.from + l
									});
								} else if (c === "<") {
									// Unexpected escaped character.
									this.trigger("warning", {
										code: "W124",
										line: this.line,
										character: this.from + l,
										data: [ c ]
									});
								}

								l += 1;
								break;
							case "(":
								depth += 1;
								b = false;
								if (this.peek(l) === "?") {
									l += 1;
									switch (this.peek(l)) {
									case ":":
									case "=":
									case "!":
										l += 1;
										break;
									default:
										this.trigger("warning", {
											code: "W132",
											line: this.line,
											character: this.from + l,
											data: [ ":", this.peek(l) ]
										});
									}
								} else {
									captures += 1;
								}
								break;
							case "|":
								b = false;
								break;
							case ")":
								if (depth === 0) {
									// Warn about unexpected paren.
									this.trigger("warning", {
										code: "W125",
										line: this.line,
										character: this.from + l,
										data: [ ")" ]
									});
								} else {
									depth -= 1;
								}
								break;
							case " ":
								q = 1;
								while (this.peek(l) === " ") {
									l += 1;
									q += 1;
								}
								if (q > 1) {
									this.trigger("warning", {
										code: "W126",
										line: this.line,
										character: this.from + l,
										data: [ q ]
									});
								}
								break;
							case "[":
								c = this.peek(l);
								if (c === "^") {
									l += 1;
									if (this.peek(l) === "]") {
										this.trigger("error", {
											code: "E019",
											line: this.line,
											character: this.from + l,
											data: [ "^" ]
										});
									}
								}
								if (c === "]") {
									this.trigger("warning", {
										code: "W127",
										line: this.line,
										character: this.from + l - 1
									});
								}
								isLiteral = false;
								isInRange = false;
klass:
								do {
									c = this.peek(l);
									l += 1;
									switch (c) {
									case "[":
									case "^":
										this.trigger("warning", {
											code: "W125",
											line: this.line,
											character: this.from + l,
											data: [ c ]
										});

										if (isInRange) {
											isInRange = false;
										} else {
											isLiteral = true;
										}

										break;
									case "-":
										if (isLiteral && !isInRange) {
											isLiteral = false;
											isInRange = true;
										} else if (isInRange) {
											isInRange = false;
										} else if (this.peek(l) === "]") {
											isInRange = true;
										} else {
											if (state.option.regexdash !== (l === 2 || (l === 3 &&
												this.peek(1) === "^"))) {
												this.trigger("warning", {
													code: "W125",
													line: this.line,
													character: this.from + l - 1,
													data: [ "-" ]
												});
											}
											isLiteral = true;
										}
										break;
									case "]":
										if (isInRange && !state.option.regexdash) {
											this.trigger("warning", {
												code: "W125",
												line: this.line,
												character: this.from + l - 1,
												data: [ "-" ]
											});
										}
										break klass;
									case "\\":
										c = this.peek(l);

										if (c < " ") {
											this.trigger("warning", {
												code: "W123",
												line: this.line,
												character: this.from + l
											});
										} else if (c === "<") {
											this.trigger("warning", {
												code: "W124",
												line: this.line,
												character: this.from + l,
												data: [ c ]
											});
										}

										l += 1;

										// \w, \s and \d are never part of a character range
										if (/[wsd]/i.test(c)) {
											if (isInRange) {
												this.trigger("warning", {
													code: "W125",
													line: this.line,
													character: this.from + l,
													data: [ "-" ]
												});
												isInRange = false;
											}
											isLiteral = false;
										} else if (isInRange) {
											isInRange = false;
										} else {
											isLiteral = true;
										}
										break;
									case "/":
										this.trigger("warning", {
											code: "W128",
											line: this.line,
											character: this.from + l - 1,
											data: [ "/" ]
										});

										if (isInRange) {
											isInRange = false;
										} else {
											isLiteral = true;
										}

										break;
									case "<":
										if (isInRange) {
											isInRange = false;
										} else {
											isLiteral = true;
										}
										break;
									default:
										if (isInRange) {
											isInRange = false;
										} else {
											isLiteral = true;
										}
									}
								} while (c);
								break;
							case ".":
								if (state.option.regexp) {
									this.trigger("warning", {
										code: "W129",
										line: this.line,
										character: this.from + l,
										data: [ c ]
									});
								}
								break;
							case "]":
							case "?":
							case "{":
							case "}":
							case "+":
							case "*":
								this.trigger("warning", {
									code: "W125",
									line: this.line,
									character: this.from + l,
									data: [ c ]
								});
							}

							if (b) {
								switch (this.peek(l)) {
								case "?":
								case "+":
								case "*":
									l += 1;
									if (this.peek(l) === "?") {
										l += 1;
									}
									break;
								case "{":
									l += 1;
									c = this.peek(l);
									if (c < "0" || c > "9") {
										this.trigger("warning", {
											code: "W130",
											line: this.line,
											character: this.from + l,
											data: [ c ]
										});
										break; // No reason to continue checking numbers.
									}
									l += 1;
									low = +c;
									for (;;) {
										c = this.peek(l);
										if (c < "0" || c > "9") {
											break;
										}
										l += 1;
										low = +c + (low * 10);
									}
									high = low;
									if (c === ",") {
										l += 1;
										high = Infinity;
										c = this.peek(l);
										if (c >= "0" && c <= "9") {
											l += 1;
											high = +c;
											for (;;) {
												c = this.peek(l);
												if (c < "0" || c > "9") {
													break;
												}
												l += 1;
												high = +c + (high * 10);
											}
										}
									}
									if (this.peek(l) !== "}") {
										this.trigger("warning", {
											code: "W132",
											line: this.line,
											character: this.from + l,
											data: [ "}", c ]
										});
									} else {
										l += 1;
									}
									if (this.peek(l) === "?") {
										l += 1;
									}
									if (low > high) {
										this.trigger("warning", {
											code: "W131",
											line: this.line,
											character: this.from + l,
											data: [ low, high ]
										});
									}
								}
							}
						}
						c = this.input.substr(0, l - 1);
						this.skip(l);
						return this.create("(regexp)", c);
					}
					return this.create("(punctuator)", t);

				// punctuator

				case "#":
					return this.create("(punctuator)", t);
				default:
					return this.create("(punctuator)", t);
				}
			}
		}
	}
};

exports.Lexer = Lexer;