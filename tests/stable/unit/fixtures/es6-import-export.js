/* jshint undef:true */

import $ from "jquery";
import { get as emGet, set } from "ember";
import { default as _ } from "underscore";

$.ajax();
emGet("foo");
set("bar");
_.map();

var foo = "foo";
var bar = "bar";
function foobar() {};

export { foo, bar };
export default foobar;