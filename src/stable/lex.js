/*
 * Lexical analysis and token construction.
 */

"use strict";

var reg = require("./reg.js");
var state = require("./state.js").state;

var character, from, line, input, prereg;

// Globals from jshint.js
var warningAt;
var errorAt;
var quit;

function is_own(object, name) {
	// The object.hasOwnProperty method fails when the property under consideration
	// is named 'hasOwnProperty'. So we have to use this more convoluted form.
	return Object.prototype.hasOwnProperty.call(object, name);
}

function isAlpha(str) {
	return (str >= "a" && str <= "z\uffff") ||
		(str >= "A" && str <= "Z\uffff");
}

function isDigit(str) {
	return (str >= "0" && str <= "9");
}

function nextLine() {
	var at, match;

	if (line >= state.lines.length) {
		return false;
	}

	character = 1;
	input = state.lines[line];
	line += 1;

	// If smartstate.tabs option is used check for spaces followed by tabs only.
	// Otherwise check for any occurence of mixed tabs and spaces.
	// Tabs and one space followed by block comment is allowed.

	if (state.option.smarttabs) {
		// negative look-behind for "//"
		match = input.match(/(\/\/)? \t/);
		at = match && !match[1] ? 0 : -1;
	} else {
		at = input.search(/ \t|\t [^\*]/);
	}

	// Warn about mixed spaces and tabs.

	if (at >= 0) {
		warningAt("W099", line, at + 1);
	}

	input = input.replace(/\t/g, state.tab);

	// Warn about unsafe characters that get silently deleted by one
	// or more browsers.

	at = input.search(reg.unsafeChars);
	if (at >= 0) {
		warningAt("W100", line, at);
	}

	// If there is a limit on line length, warn when lines get too
	// long.

	if (state.option.maxlen && state.option.maxlen < input.length) {
		warningAt("W101", line, input.length);
	}

	// Check for trailing whitespaces

	var tw = state.option.trailing && input.match(/^(.*?)\s+$/);
	if (tw && !/^\s+$/.test(input)) {
		warningAt("W102", line, tw[1].length + 1);
	}

	return true;
}

/*
 * Produce a token object. The token inherits from a syntax symbol.
 */
function it(type, value) {
	var i, t;

	function checkName(name) {
		if (!state.option.proto && name === "__proto__") {
			warningAt("W103", line, from, name);
			return;
		}

		if (!state.option.iterator && name === "__iterator__") {
			warningAt("W104", line, from, name);
			return;
		}

		// Check for dangling underscores unless we're in Node
		// environment and this identifier represents built-in
		// Node globals with underscores.

		var hasDangling = /^(_+.*|.*_+)$/.test(name);

		if (state.option.nomen && hasDangling && name !== "_") {
			if (state.option.node && state.tokens.curr.id !== "." &&
				/^(__dirname|__filename)$/.test(name)) {
				return;
			}

			warningAt("W105", line, from, "dangling '_'", name);
			return;
		}

		// Check for non-camelcase names. Names like MY_VAR and
		// _myVar are okay though.

		if (state.option.camelcase) {
			if (name.replace(/^_+/, "").indexOf("_") > -1 && !name.match(/^[A-Z0-9_]*$/)) {
				warningAt("W106", line, from, value);
			}
		}
	}

	if (type === "(range)") {
		t = {type: type};
	} else if (type === "(punctuator)" ||
			(type === "(identifier)" && is_own(state.syntax, value))) {
		t = state.syntax[value] || state.syntax["(error)"];
	} else {
		t = state.syntax[type];
	}

	t = Object.create(t);

	if (type === "(string)" || type === "(range)") {
		if (!state.option.scripturl && reg.javascriptURL.test(value)) {
			warningAt("W107", line, from);
		}
	}

	if (type === "(identifier)") {
		t.identifier = true;
		checkName(value);
	}

	t.value = value;
	t.line = line;
	t.character = character;
	t.from = from;
	i = t.id;
	if (i !== "(endline)") {
		prereg = i &&
			(("(,=:[!&|?{};".indexOf(i.charAt(i.length - 1)) >= 0) ||
			i === "return" ||
			i === "case");
	}
	return t;
}

// Public lex methods
// FIXME: Better architecture for sharing options and other stuff.

exports.lex = {
	init: function (source, funcs) {
		warningAt = funcs.warningAt;
		errorAt = funcs.errorAt;
		quit = funcs.quit;

		if (typeof source === "string") {
			state.lines = source
				.replace(/\r\n/g, "\n")
				.replace(/\r/g, "\n")
				.split("\n");
		} else {
			state.lines = source;
		}

		// If the first line is a shebang (#!), make it a blank and move on.
		// Shebangs are used by Node scripts.
		if (state.lines[0] && state.lines[0].substr(0, 2) === "#!")
			state.lines[0] = "";

		line = 0;
		nextLine();
		from = 1;
		prereg = true;

		for (var i = 0; i < state.option.indent; i += 1) {
			state.tab += " ";
		}

		return state.lines;
	},

	range: function (begin, end) {
		var c, value = "";
		from = character;

		if (input.charAt(0) !== begin) {
			errorAt("E004", line, character, begin, input.charAt(0));
		}

		for (;;) {
			input = input.slice(1);
			character += 1;
			c = input.charAt(0);

			switch (c) {
			case "":
				errorAt("E013", line, character, c);
				break;
			case end:
				input = input.slice(1);
				character += 1;
				return it("(range)", value);
			case "\\":
				warningAt("W052", line, character, c);
			}

			value += c;
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

				// Warn about unnecessary escapings.
				if (i >= 32 && i <= 126 && i !== 34 && i !== 92 && i !== 39) {
					warningAt("W111", line, character);
				}

				character += n;
				c = String.fromCharCode(i);
			}

			j = 0;

unclosedString:
			for (;;) {
				while (j >= input.length) {
					j = 0;

					var cl = line;
					var cf = from;

					if (!nextLine()) {
						// Display an error about an unclosed string.
						errorAt("E044", cl, cf);
						break unclosedString;
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
					return it("(string)", r, x);
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
						// Weird escaping, warn about that.
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
				return it(nextLine() ? "(endline)" : "(end)", "");
			}

			t = match(reg.token);

			if (!t) {
				t = "";
				c = "";

				while (input && input < "!") {
					input = input.substr(1);
				}

				if (input) {
					errorAt("E014", line, character, input.substr(0, 1));
					input = "";
				}
			} else {

				// Identifier

				if (isAlpha(c) || c === "_" || c === "$") {
					return it("(identifier)", t);
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

					return it("(number)", t);
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

								return it("(regexp)", c);
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
						return it("(regexp)", c);
					}
					return it("(punctuator)", t);

				// punctuator

				case "#":
					return it("(punctuator)", t);
				default:
					return it("(punctuator)", t);
				}
			}
		}
	}
};