/*
 * Lexical analysis and token construction.
 */

"use strict";

var _ = require("underscore");
var reg = require("./reg.js");
var state = require("./state.js").state;

// Helper functions

function isAlpha(str) {
	return (str >= "a" && str <= "z\uffff") ||
		(str >= "A" && str <= "Z\uffff");
}

function isDigit(str) {
	return (str >= "0" && str <= "9");
}

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
	this.line = 0;
	this.character = 1;
	this.input = null;

	this.nextLine();
	
	this.from = 1;
	this.preref = true;
	
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
	
	on: function (names, listener) {
		names.split(" ").forEach(function (name) {
			this.emitter.on(name, listener);
		}.bind(this));
	},
	
	trigger: function () {
		this.emitter.emit.apply(this.emitter, Array.prototype.slice.call(arguments));
	},
	
	lintName: function (name) {
		if (!state.option.proto && name === "__proto__") {
			this.trigger("warning", { code: "W103", line: line, character: from, data: [ name ] });
			return;
		}

		if (!state.option.iterator && name === "__iterator__") {
			this.trigger("warning", { code: "W104", line: line, character: from, data: [ name ] });
			return;
		}

		// Check for dangling underscores unless we're in Node
		// environment and this identifier represents built-in
		// Node globals with underscores.

		var hasDangling = /^(_+.*|.*_+)$/.test(name);
		var isSpecial = /^(__dirname|__filename)$/.test(name);

		if (state.option.nomen && hasDangling && name !== "_") {
			if (state.option.node && state.tokens.curr.id !== "." && isSpecial) {
				return;
			}

			this.trigger("warning", {
				code: "W105",
				line: line,
				character: from,
				data: [ "dangling '_'", name ]
			});

			return;
		}

		// Check for non-camelcase names. Names like MY_VAR and
		// _myVar are okay though.

		if (state.option.camelcase) {
			if (name.replace(/^_+/, "").indexOf("_") > -1 && !name.match(/^[A-Z0-9_]*$/)) {
				this.trigger("warning", {
					code: "W106",
					line: line,
					character: from,
					data: [ value ]
				});
			}
		}
	},
	
	nextLine: function () {
		if (this.line >= this.lines.length) {
			return false;
		}
		
		this.character = 1;
		this.input = state.lines[line];
		this.line += 1;

		// If smartstate.tabs option is used check for spaces followed by tabs only.
		// Otherwise check for any occurence of mixed tabs and spaces.
		// Tabs and one space followed by block comment is allowed.

		var at, match;
		if (state.option.smarttabs) {
			// Negative look-behind for "//"
			match = this.input.match(/(\/\/)? \t/);
			at = match && !match[1] ? 0 : -1;
		} else {
			at = this.input.search(/ \t|\t [^\*]/);
		}

		// Warn about mixed spaces and tabs.

		if (at >= 0) {
			this.trigger("warning", { code: "W099", line: this.line, character: at + 1 });
		}
		
		// Replace tabs with spaces.

		this.input = this.input.replace(/\t/g, state.tab);

		// Warn about unsafe characters that get silently deleted by one
		// or more browsers.

		at = this.input.search(reg.unsafeChars);
		if (at >= 0) {
			this.trigger("warning", { code: "W100", line: this.line, character: at });
		}

		// If there is a limit on line length, warn when lines get too
		// long.

		if (state.option.maxlen && state.option.maxlen < this.input.length) {
			this.trigger("warning", { code: "W101", line: this.line, character: this.input.length });
		}

		// Check for trailing whitespaces

		var tw = state.option.trailing && this.input.match(/^(.*?)\s+$/);
		if (tw && !/^\s+$/.test(this.input)) {
			this.trigger("warning", { code: "W102", line: this.line, character: tw[1].length + 1 });
		}

		return true;
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
				this.trigger("warning", { code: "W107", line: this.line, character: from });
			}
		}

		if (type === "(identifier)") {
			token.identifier = true;
			this.lintName(value);
		}

		token.value = value;
		token.line = this.line;
		token.character = this.character;
		token.from = this.from;

		var id = token.id;
		if (id !== "(endline)") {
			this.prereg = id && (("(,=:[!&|?{};".indexOf(id.charAt(id.length - 1)) >= 0) ||
				id === "return" || i === "case");
		}
		
		return token;
	},
	
	range: function (begin, end) {
		var chr, value = "";
		this.from = this.character;

		if (this.input.charAt(0) !== begin) {
			this.trigger("error", {
				code: "E004",
				line: line,
				character: character,
				data: [ begin, input.charAt(0) ]
			});
		}

		for (;;) {
			this.input = this.input.slice(1);
			this.character += 1;
			chr = this.input.charAt(0);

			switch (chr) {
			case "":
				this.trigger("error", { code: "E013", line: line, character: character, data: [ c ] });
				break;
			case end:
				this.input = this.input.slice(1);
				this.character += 1;
				return this.create("(range)", value);
			case "\\":
				this.trigger("warning", {
					code: "W052",
					line: line,
					character: character,
					data: [ c ]
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
		var b, c, captures, d, depth, high, i, l, low, q, t, isLiteral, isInRange, n;

		function match(x) {
			var r = x.exec(input), r1;

			if (r) {
				l = r[0].length;
				r1 = r[1];
				c = r1.charAt(0);
				input = input.substr(l);
				from = character + l - r1.length;
				character += l;
				return r1;
			}
		}

		function string(x) {
			var c, j, r = "", allowNewLine = false;

			// In JSON mode all strings must use double-quote.

			if (state.jsonMode && x !== "\"") {
				warningAt("W108", line, character);
			}

			// Option 'quotmark' helps you to enforce one particular
			// style of quoting.

			var code;
			if (state.option.quotmark) {
				switch (true) {
				case state.option.quotmark === "single" && x !== "'":
					code = "W109";
					break;
				case state.option.quotmark === "double" && x !== "\"":
					code = "W108";
					break;
				case state.option.quotmark === true:
					// If quotmark is set to true, we remember the very first
					// quotation style and then use it as a reference.
					state.quotmark = state.quotmark || x;

					// Warn about mixed double and single quotes.
					if (state.quotmark !== x) {
						code = "W110";
					}
				}

				if (code) {
					warningAt(code, line, character);
				}
			}

			function esc(n) {
				var i = parseInt(input.substr(j + 1, n), 16);
				j += n;

				// Warn about unnecessary escapements.
				if (i >= 32 && i <= 126 && i !== 34 && i !== 92 && i !== 39) {
					warningAt("W111", line, character);
				}

				character += n;
				c = String.fromCharCode(i);
			}

			j = 0;

			for (;;) {
				while (j >= input.length) { // What is this? j >= input.length?
					j = 0;

					var cl = line;
					var cf = from;

					if (!nextLine()) {
						// Display an error about an unclosed string.
						errorAt("E044", cl, cf);
						return;
					}

					if (allowNewLine) {
						allowNewLine = false;
					} else {
						warningAt("W112", cl, cf); // Warn about an unclosed string.
					}
				}

				c = input.charAt(j);
				if (c === x) {
					character += 1;
					input = input.substr(j + 1);
					return this.create("(string)", r, x);
				}

				if (c < " ") {
					if (c === "\n" || c === "\r") {
						break;
					}

					// Warn about a control character in a string.
					warningAt("W113", line, character + j, input.slice(0, j));
				} else if (c === "\\") {
					j += 1;
					character += 1;
					c = input.charAt(j);
					n = input.charAt(j + 1);

					switch (c) {
					case "\\":
					case "\"":
					case "/":
						break;
					case "\'":
						if (state.jsonMode) {
							warningAt("W114", line, character, "\\'");
						}
						break;
					case "b":
						c = "\b";
						break;
					case "f":
						c = "\f";
						break;
					case "n":
						c = "\n";
						break;
					case "r":
						c = "\r";
						break;
					case "t":
						c = "\t";
						break;
					case "0":
						c = "\0";

						// Octal literals fail in strict mode
						// check if the number is between 00 and 07
						// where 'n' is the token next to 'c'

						if (n >= 0 && n <= 7 && state.directive["use strict"]) {
							warningAt("W115", line, character);
						}

						break;
					case "u":
						esc(4);
						break;
					case "v":
						if (state.jsonMode) {
							warningAt("W114", line, character, "\\v");
						}

						c = "\v";
						break;
					case "x":
						if (state.jsonMode) {
							warningAt("W114", line, character, "\\x-");
						}

						esc(2);
						break;
					case "":
						// last character is escape character
						// always allow new line if escaped, but show
						// warning if option is not set
						allowNewLine = true;
						if (state.option.multistr) {
							if (state.jsonMode) {
								warningAt("W116", line, character);
							}

							c = "";
							character -= 1;
							break;
						}

						warningAt("W117", line, character);
						break;
					case "!":
						if (input.charAt(j - 2) === "<")
							break;

						/*falls through*/
					default:
						// Weird escapement, warn about that.
						warningAt("W118", line, character);
					}
				}

				r += c;
				character += 1;
				j += 1;
			}
		}

		for (;;) {
			if (!input) {
				return this.create(nextLine() ? "(endline)" : "(end)", "");
			}

			t = match(reg.token);

			if (!t) {
				t = "";
				c = "";

				// Reducing input for?
				while (input && input < "!") {
					input = input.substr(1);
				}

				if (input) {
					// Unexpected character.
					errorAt("E014", line, character, input.substr(0, 1));
					input = "";
				}
			} else {

				// Identifier

				if (isAlpha(c) || c === "_" || c === "$") {
					return this.create("(identifier)", t);
				}

				// Number

				if (isDigit(c)) {

					// Check if this number is invalid.

					if (!isFinite(Number(t))) {
						warningAt("W119", line, character, t);
					}

					if (isAlpha(input.substr(0, 1))) {
						warningAt("W013", line, character, t);
					}

					if (c === "0") {
						d = t.substr(1, 1);
						if (isDigit(d)) {
							// Check for leading zeroes.
							if (state.tokens.curr.id !== ".") {
								warningAt("W120", line, character, t);
							}
						} else if (state.jsonMode && (d === "x" || d === "X")) {
							warningAt("W114", line, character, "0x-");
						}
					}

					if (t.substr(t.length - 1) === ".") {
						// Warn about a trailing decimal point.
						warningAt("W121", line, character, t);
					}

					return this.create("(number)", t);
				}

				switch (t) {

				// String

				case "\"":
				case "'":
					return string(t);

				// Single line comment

				case "//":
					input = "";
					state.tokens.curr.comment = true;
					break;

				// Block comment

				case "/*":
					for (;;) {
						i = input.search(reg.starSlash);
						if (i >= 0) {
							break;
						}

						// Is this comment unclosed?
						if (!nextLine()) {
							errorAt("E015", line, character);
						}
					}

					input = input.substr(i + 2);
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
						line: line,
						character: character,
						from: from
					};

				case "":
					break;

				//		/

				case "/":
					// Warn about '/=' (it can be confused with /= operator.
					if (input.charAt(0) === "=") {
						errorAt("E016", line, from);
					}

					if (prereg) {
						depth = 0;
						captures = 0;
						l = 0;
						for (;;) {
							b = true;
							c = input.charAt(l);
							l += 1;
							switch (c) {
							case "":
								// Fatal: unclosed regular expression.
								errorAt("E017", line, from);
								return quit("Stopping.", line, from);
							case "/":
								// Check that all regexp groups were terminated.
								if (depth > 0) {
									warningAt("W122", line, from + l, depth);
								}

								c = input.substr(0, l - 1);

								q = {
									g: true,
									i: true,
									m: true
								};

								while (q[input.charAt(l)] === true) {
									q[input.charAt(l)] = false;
									l += 1;
								}

								character += l;
								input = input.substr(l);
								q = input.charAt(0);

								if (q === "/" || q === "*") {
									errorAt("E018", line, from);
								}

								return this.create("(regexp)", c);
							case "\\":
								c = input.charAt(l);

								if (c < " ") {
									// Unexpected control character.
									warningAt("W123", line, from + l);
								} else if (c === "<") {
									// Unexpected escaped character.
									warningAt("W124", line, from + l, c);
								}

								l += 1;
								break;
							case "(":
								depth += 1;
								b = false;
								if (input.charAt(l) === "?") {
									l += 1;
									switch (input.charAt(l)) {
									case ":":
									case "=":
									case "!":
										l += 1;
										break;
									default:
										warningAt("W132", line, from + l, ":", input.charAt(l));
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
									warningAt("W125", line, from + l, ")");
								} else {
									depth -= 1;
								}
								break;
							case " ":
								q = 1;
								while (input.charAt(l) === " ") {
									l += 1;
									q += 1;
								}
								if (q > 1) {
									warningAt("W126", line, from + l, q);
								}
								break;
							case "[":
								c = input.charAt(l);
								if (c === "^") {
									l += 1;
									if (input.charAt(l) === "]") {
										errorAt("E019", line, from + l, "^");
									}
								}
								if (c === "]") {
									warningAt("W127", line, from + l - 1);
								}
								isLiteral = false;
								isInRange = false;
klass:
								do {
									c = input.charAt(l);
									l += 1;
									switch (c) {
									case "[":
									case "^":
										warningAt("W125", line, from + l, c);

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
										} else if (input.charAt(l) === "]") {
											isInRange = true;
										} else {
											if (state.option.regexdash !== (l === 2 || (l === 3 &&
												input.charAt(1) === "^"))) {
												warningAt("W125", line, from + l - 1, "-");
											}
											isLiteral = true;
										}
										break;
									case "]":
										if (isInRange && !state.option.regexdash) {
											warningAt("W125", line, from + l - 1, "-");
										}
										break klass;
									case "\\":
										c = input.charAt(l);

										if (c < " ") {
											warningAt("W123", line, from + l);
										} else if (c === "<") {
											warningAt("W124", line, from + l, c);
										}

										l += 1;

										// \w, \s and \d are never part of a character range
										if (/[wsd]/i.test(c)) {
											if (isInRange) {
												warningAt("W125", line, from + l, "-");
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
										warningAt("W128", line, from + l - 1, "/");

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
									warningAt("W129", line, from + l, c);
								}
								break;
							case "]":
							case "?":
							case "{":
							case "}":
							case "+":
							case "*":
								warningAt("W125", line, from + l, c);
							}

							if (b) {
								switch (input.charAt(l)) {
								case "?":
								case "+":
								case "*":
									l += 1;
									if (input.charAt(l) === "?") {
										l += 1;
									}
									break;
								case "{":
									l += 1;
									c = input.charAt(l);
									if (c < "0" || c > "9") {
										warningAt("W130", line, from + l, c);
										break; // No reason to continue checking numbers.
									}
									l += 1;
									low = +c;
									for (;;) {
										c = input.charAt(l);
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
										c = input.charAt(l);
										if (c >= "0" && c <= "9") {
											l += 1;
											high = +c;
											for (;;) {
												c = input.charAt(l);
												if (c < "0" || c > "9") {
													break;
												}
												l += 1;
												high = +c + (high * 10);
											}
										}
									}
									if (input.charAt(l) !== "}") {
										warningAt("W132", line, from + l, "}", c);
									} else {
										l += 1;
									}
									if (input.charAt(l) === "?") {
										l += 1;
									}
									if (low > high) {
										warningAt("W131", line, from + l, low, high);
									}
								}
							}
						}
						c = input.substr(0, l - 1);
						character += l;
						input = input.substr(l);
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