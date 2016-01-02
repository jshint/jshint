var h;
let j;
function test() {
  var a = b = 1;
  const c = d = 2;
  let e = f = 3;

  var g = h = 4;
  let i = j = 5;
  let k, l;
  {
    var m = g = 6;
    const n = k = 6;
    let o = l = 7;
  }

  var p;
  var q = p = 8;
  let r;
  let s = r = 9;
}

test();