"use strict";

var state = {
	reset: function () {
		this.tokens = {
			prev: null,
			next: null,
			curr: null
		};

		this.option = {};
		this.ignored = {};
		this.directive = {};
		this.ignoreLinterErrors = false;    // Blank out non-multi-line-commented
											// lines when ignoring linter errors
	}
};

exports.state = state;
