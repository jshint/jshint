function RangeIterator(range) {
  this.range = range;
  this.current = this.range.low;
}

RangeIterator.prototype.next = function next() {
  if (this.current > this.range.high) {
    throw new Error();
  } else {
    return this.current++;
  }
};

function Range(low, high) {
  this.low = low;
  this.high = high;
}

Range.prototype.__iterator__ = function __iterator__() {
  return new RangeIterator(this);
};

function hasKey(object, key) {
  var original = object.__proto__, result;
  object.__proto__ = null;
  result = key in object;
  object.__proto__ = original;
  return result;
}