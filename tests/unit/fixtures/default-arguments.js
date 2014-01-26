function Doit() {
}

Doit.prototype = {
  _someProperty: null,

  test: function(num, num2=1, num3=2) {
    return num === num2;
  },

  testBadDefault: function(num, num2=1, num3) {
    return num === num2;
  },

  get someProperty() {
    return this._someProperty;
  },
};
