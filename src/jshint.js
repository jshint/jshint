"use strict";

var _      = require("underscore");
var parser = require("./parser.js");
var style  = require("./style.js");
var types  = require("./types.js");

// Split a list of variables into two categories:
//
//  * Those that start with '-' go into the 'blacklist' category.
//  * Everything else goes into the 'variable' category.
//
// Returns a { blacklist, variables } object.

function groupvars(acc, val, key, list) {
	var name = _.isArray(list) ? val : key;

	if (name[0] === "-")
		acc.blacklist[name.slice(1)] = true;
	else
		acc.variables[name] = _.isArray(list) ? false : val;

	return acc;
}

// Split options into categories and normalize their values:
//
//  * Options like '-W001' go the 'ignored' category with value true.
//  * List 'exported' is converted into an object with items as keys and true as value.
//  * List 'predef' is converted into an object with two categories (see groupvars).
//  * Everything else goes into the 'passed' category.
//
// Returns an { ignored, exported, blacklist, variables, passed } object.

function groupopts(acc, val, name) {
	if (/^-W\d{3}$/g.test(name)) { // -WXXX syntax to ignore warnings
		acc.ignored[name.slice(1)] = true;
		return acc;
	}

	switch (name) {
	case "exported":
		acc.exported = _.object(val, _.times(val.length, function () { return true }));
		break;
	case "predef":
		acc = _.reduce(val, groupvars, acc);
		break;
	default:
		acc.passed[name] = val;
	}

	return acc;
}

// Convert completed parser state into something consumable by the client.

function normalize(state) {
	var fu, f, i, j, n, globals;
	var data = { functions: [], options: _.clone(state.option) };
	var implieds = [];

	if (state.errors.length) {
		data.errors = state.errors;
	}

	for (n in state.implied) {
		if (_.has(state.implied, n)) {
			implieds.push({
				name: n,
				line: state.implied[n]
			});
		}
	}

	if (implieds.length > 0) {
		data.implieds = implieds;
	}

	globals = Object.keys(state.env);
	if (globals.length > 0) {
		data.globals = globals;
	}

	var functionicity = [ "closure", "exception", "global", "label", "outer", "unused", "var" ];

	for (i = 1; i < state.functions.length; i += 1) {
		f = state.functions[i];
		fu = {};

		for (j = 0; j < functionicity.length; j += 1) {
			fu[functionicity[j]] = [];
		}

		for (j = 0; j < functionicity.length; j += 1) {
			if (fu[functionicity[j]].length === 0) {
				delete fu[functionicity[j]];
			}
		}

		fu.name = f["(name)"];
		fu.param = f["(params)"];
		fu.line = f["(line)"];
		fu.character = f["(character)"];
		fu.last = f["(last)"];
		fu.lastcharacter = f["(lastcharacter)"];

		fu.metrics = {
			complexity: f["(metrics)"].complexity,
			parameters: (f["(params)"] || []).length,
			statements: f["(metrics)"].statements
		};

		data.functions.push(fu);
	}

	if (state.unused.length > 0) {
		data.unused = state.unused;
	}

	return data;
}

function run(src, opts, vars) {
	var options = { passed: {}, ignored: {}, exported: {}, variables: {}, blacklist: {} };
	var state;

	if (!src || !src.length)
		return null;

	_.reduce(opts || {}, groupopts, options);
	_.reduce(vars || {}, groupvars, options);

	try {
		parser.reset();
		parser.extend(style.register);
		parser.extend(types.register);
		state = parser.parse(src, options);
	} catch (err) {
		if (err.name !== "ParseError") throw err;
		state = err.state;
	}

	return { success: state.errors.length === 0, data: normalize(state) };
}

exports.run = run;