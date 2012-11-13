/*
 * Lexical analysis and token construction.
 */

"use strict";

var _      = require("underscore");
var events = require("events");
var reg    = require("./reg.js");
var state  = require("./state.js").state;

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
	this.from = 1;
	this.prereg = true;

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

	start: function () {
		this.nextLine();
	},

	lintName: function (name) {
		if (!state.option.proto && name === "__proto__") {
			this.trigger("warning", {
				code: "W103",
				line: this.line,
				character: this.from,
				data: [ name ]
			});
			return;
		}

		if (!state.option.iterator && name === "__iterator__") {
			this.trigger("warning", {
				code: "W104",
				line: this.line,
				character: this.from,
				data: [ name ]
			});
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
				line: this.line,
				character: this.from,
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
					line: this.line,
					character: this.from,
					data: [ name ]
				});
			}
		}
	},

	nextLine: function () {
		if (this.line >= this.lines.length) {
			return false;
		}

		this.character = 1;
		this.input = this.lines[this.line];
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
				this.trigger("warning", { code: "W107", line: this.line, character: this.from });
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
				id === "return" || id === "case");
		}

		return token;
	},

	range: function (begin, end) {
		var chr, value = "";
		this.from = this.character;

		if (this.input.charAt(0) !== begin) {
			this.trigger("error", {
				code: "E004",
				line: this.line,
				character: this.character,
				data: [ begin, this.input.charAt(0) ]
			});
		}

		for (;;) {
			this.input = this.input.slice(1);
			this.character += 1;
			chr = this.input.charAt(0);

			switch (chr) {
			case "":
				this.trigger("error", {
					code: "E013",
					line: this.line,
					character: this.character,
					data: [ chr ]
				});
				break;
			case end:
				this.input = this.input.slice(1);
				this.character += 1;
				return this.create("(range)", value);
			case "\\":
				this.trigger("warning", {
					code: "W052",
					line: this.line,
					character: this.character,
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
		var b, c, captures, d, depth, high, i, l, low, q, t, isLiteral, isInRange, n;

		// This function must be bound to 'this'.
		var match = function (x) {
			var r = x.exec(this.input), r1;

			if (r) {
				l = r[0].length;
				r1 = r[1];
				c = r1.charAt(0);
				this.input = this.input.substr(l);
				this.from = this.character + l - r1.length;
				this.character += l;
				return r1;
			}
		}.bind(this);

		// This function must be bound to 'this'.
		var string = function (x) { /*jshint validthis:true */
			var c, j, r = "", allowNewLine = false;

			// In JSON mode all strings must use double-quote.

			if (state.jsonMode && x !== "\"") {
				this.trigger("warning", {
					code: "W108",
					line: this.line,
					character: this.character
				});
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
					this.trigger("warning", {
						code: code,
						line: this.line,
						character: this.character
					});
				}
			}

			// This function must be bound to 'this'.
			var esc = function (n) {
				var i = parseInt(this.input.substr(j + 1, n), 16);
				j += n;

				// Warn about unnecessary escapements.
				if (i >= 32 && i <= 126 && i !== 34 && i !== 92 && i !== 39) {
					this.trigger("warning", {
						code: "W111",
						line: this.line,
						character: this.character
					});
				}

				this.character += n;
				c = String.fromCharCode(i);
			}.bind(this);

			j = 0;

			for (;;) {
				while (j >= this.input.length) { // What is this? j >= this.input.length?
					j = 0;

					var cl = this.line;
					var cf = this.from;

					if (!this.nextLine()) {
						// Display an error about an unclosed string.
						this.trigger("error", {
							code: "E044",
							line: cl,
							character: cf
						});
						return;
					}

					if (allowNewLine) {
						allowNewLine = false;
					} else {
						// Warn about an unclosed string.
						this.trigger("warning", {
							code: "W112",
							line: cl,
							character: cf
						});
					}
				}

				c = this.input.charAt(j);
				if (c === x) {
					this.character += 1;
					this.input = this.input.substr(j + 1);
					return this.create("(string)", r, x);
				}

				if (c < " ") {
					if (c === "\n" || c === "\r") {
						break;
					}

					// Warn about a control character in a string.
					this.trigger("warning", {
						code: "W113",
						line: this.line,
						character: this.character + j,
						data: [ this.input.slice(0, j) ]
					});
				} else if (c === "\\") {
					j += 1;
					this.character += 1;
					c = this.input.charAt(j);
					n = this.input.charAt(j + 1);

					switch (c) {
					case "\\":
					case "\"":
					case "/":
						break;
					case "\'":
						if (state.jsonMode) {
							this.trigger("warning", {
								code: "W114",
								line: this.line,
								character: this.character,
								data: [ "\\'" ]
							});
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
							this.trigger("warning", {
								code: "W115",
								line: this.line,
								character: this.character
							});
						}

						break;
					case "u":
						esc(4);
						break;
					case "v":
						if (state.jsonMode) {
							this.trigger("warning", {
								code: "W114",
								line: this.line,
								character: this.character,
								data: [ "\\v" ]
							});
						}

						c = "\v";
						break;
					case "x":
						if (state.jsonMode) {
							this.trigger("warning", {
								code: "W114",
								line: this.line,
								character: this.character,
								data: [ "\\x-" ]
							});
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
								this.trigger("warning", {
									code: "W116",
									line: this.line,
									character: this.character
								});
							}

							c = "";
							this.character -= 1;
							break;
						}

						this.trigger("warning", {
							code: "W117",
							line: this.line,
							character: this.character
						});
						break;
					case "!":
						if (this.input.charAt(j - 2) === "<")
							break;

						/*falls through*/
					default:
						// Weird escapement, warn about that.
						this.trigger("warning", {
							code: "W118",
							line: this.line,
							character: this.character
						});
					}
				}

				r += c;
				this.character += 1;
				j += 1;
			}
		}.bind(this);

		for (;;) {
			if (!this.input) {
				return this.create(this.nextLine() ? "(endline)" : "(end)", "");
			}

			t = match(reg.token);

			if (!t) {
				t = "";
				c = "";

				// Reducing input for?
				while (this.input && this.input < "!") {
					this.input = this.input.substr(1);
				}

				if (this.input) {
					// Unexpected character.
					this.trigger("error", {
						code: "E014",
						line: this.line,
						character: this.character,
						data: [ this.input.substr(0, 1) ]
					});
					this.input = "";
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
						this.trigger("warning", {
							code: "W119",
							line: this.line,
							character: this.character,
							data: [ t ]
						});
					}

					if (isAlpha(this.input.substr(0, 1))) {
						this.trigger("warning", {
							code: "W013",
							line: this.line,
							character: this.character,
							data: [ t ]
						});
					}

					if (c === "0") {
						d = t.substr(1, 1);
						if (isDigit(d)) {
							// Check for leading zeroes.
							if (state.tokens.curr.id !== ".") {
								this.trigger("warning", {
									code: "W120",
									line: this.line,
									character: this.character,
									data: [ t ]
								});
							}
						} else if (state.jsonMode && (d === "x" || d === "X")) {
							this.trigger("warning", {
								code: "W114",
								line: this.line,
								character: this.character,
								data: [ "0x-" ]
							});
						}
					}

					if (t.substr(t.length - 1) === ".") {
						// Warn about a trailing decimal point.
						this.trigger("warning", {
							code: "W121",
							line: this.line,
							character: this.character,
							data: [ t ]
						});
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
								character: this.character
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
						character: this.character,
						from: this.from
					};

				case "":
					break;

				//		/

				case "/":
					// Warn about '/=' (it can be confused with /= operator.
					if (this.input.charAt(0) === "=") {
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
							c = this.input.charAt(l);
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

								while (q[this.input.charAt(l)] === true) {
									q[this.input.charAt(l)] = false;
									l += 1;
								}

								this.character += l;
								this.input = this.input.substr(l);
								q = this.input.charAt(0);

								if (q === "/" || q === "*") {
									this.trigger("error", {
										code: "E018",
										line: this.line,
										character: this.from
									});
								}

								return this.create("(regexp)", c);
							case "\\":
								c = this.input.charAt(l);

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
								if (this.input.charAt(l) === "?") {
									l += 1;
									switch (this.input.charAt(l)) {
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
											data: [ ":", this.input.charAt(l) ]
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
								while (this.input.charAt(l) === " ") {
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
								c = this.input.charAt(l);
								if (c === "^") {
									l += 1;
									if (this.input.charAt(l) === "]") {
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
									c = this.input.charAt(l);
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
										} else if (this.input.charAt(l) === "]") {
											isInRange = true;
										} else {
											if (state.option.regexdash !== (l === 2 || (l === 3 &&
												this.input.charAt(1) === "^"))) {
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
										c = this.input.charAt(l);

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
								switch (this.input.charAt(l)) {
								case "?":
								case "+":
								case "*":
									l += 1;
									if (this.input.charAt(l) === "?") {
										l += 1;
									}
									break;
								case "{":
									l += 1;
									c = this.input.charAt(l);
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
										c = this.input.charAt(l);
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
										c = this.input.charAt(l);
										if (c >= "0" && c <= "9") {
											l += 1;
											high = +c;
											for (;;) {
												c = this.input.charAt(l);
												if (c < "0" || c > "9") {
													break;
												}
												l += 1;
												high = +c + (high * 10);
											}
										}
									}
									if (this.input.charAt(l) !== "}") {
										this.trigger("warning", {
											code: "W132",
											line: this.line,
											character: this.from + l,
											data: [ "}", c ]
										});
									} else {
										l += 1;
									}
									if (this.input.charAt(l) === "?") {
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
						this.character += l;
						this.input = this.input.substr(l);
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