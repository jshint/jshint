"use strict";

var state = {
	syntax: {},

	reset: function () {
		this.tokens = {
			prev: null,
			next: null,
			curr: null
		},

		this.option = {};
		this.directive = {};
		this.jsonMode = false;
		this.lines = [];
		this.tab = "";
		this.quotmark = null;
	}
};

exports.state = state;