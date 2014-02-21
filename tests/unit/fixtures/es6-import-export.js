/* jshint undef:true */

import $ from "jquery";
import { get as emGet, set } from "ember";
import { one } from "foo";
import { default as _ } from "underscore";
import {} from "ember";
import "ember";

$.ajax();
emGet("foo");
set("bar");
_.map();

var foo = "foo";
var bar = "bar";
function foobar() {}

export default foobar;

// at some point doing a double export default should error, but for now,
// makes testing a hell of a lot easier
export default function() {
  return "foobar";
}

export { foo };
export { foo, bar };

// gettin' fancy

export function a() {
  return "a";
}

export var b = function() {
  return "b";
};

export var c = "c";

export class Foo {}
export class List extends Array {}
export default class Bar {}
