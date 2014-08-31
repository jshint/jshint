for (var key in objects) {
  if (objects.hasOwnProperty(key)) {
    hey();
  }
}

var hasOwn = Object.prototype.hasOwnProperty;

for (var p in o) {
  if (hasOwn.call(o, p)) {
    hey();
  }
}

for (var p in o) {
  if (Reflect.has(o, p)) {
    hey();
  }
}

// Empty for in block like the one found in jQuery
// JSHINT would crash upon finding this and wouldn't continue
// GH-336
for ( key in objects ) { }

// Let's make sure we continue scanning the rest of the file.
for (key in objects) {
    hey();
}

