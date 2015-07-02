if (e = 1)
    doSomething();

while (obj = arr.next())
    doSomething();

for (var b; b = arr.next();)
    doSomething();

do {
    doSomething();
} while (b = arr.next());

if (e /= 1)
  doSomething();

while (obj /= arr.next())
    doSomething();

for (var f; f /= arr.next();)
    doSomething();

do {
    doSomething();
} while (b /= arr.next());

function foo(a) {
  return a = 1;
}

function bar(a) {
  return b.a = 1;
}

// these fixtures should never trigger warnings
if ((e = 1))
    doSomething();

while ((obj = arr.next()))
    doSomething();

for (var c; (c = arr.next());)
    doSomething();

do {
    doSomething();
} while ((b = arr.next()));

if ((e /= 1))
  doSomething();

while ((obj /= arr.next()))
    doSomething();

for (var d; (d /= arr.next());)
    doSomething();

do {
    doSomething();
} while ((b /= arr.next()));

function foo2(a) {
  return (a = 1);
}

function bar2(a) {
  return (b.a = 1);
}
