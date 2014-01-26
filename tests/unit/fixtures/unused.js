var a = 1;
var b = 2;

b += 1;

function main(e, f) {
    var c = 3;
    var d = 4;

    return d - e;
}

main(b);

function foo(err, cb) {
    main();
    cb();
}

function bar(g, h) {
  //jshint unused:true, es3:false
  var i = 1;
  var char;
  char = 1;
  return h;
}

function baz(a, b, c) {
  return 1;
}

baz();

const aa = 1;
const bb = aa + 1;
const cc = 2;

function bazbaz() {
  const dd = 1;
  baz(bb);
}

bazbaz();
