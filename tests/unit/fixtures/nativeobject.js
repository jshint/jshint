// Test that a warning will occur when modifying a native object's prototype.

Array.prototype.count = function (value) {
  var count = 0, i;
  for (i = 0; i < this.length; ++i) {
    if (this[i] === value) {
      ++count;
    }
  }
  return count;
};

Boolean.prototype = {
  sup: function () {}
};

NonArray.prototype.random = function () {
  return 4;
};