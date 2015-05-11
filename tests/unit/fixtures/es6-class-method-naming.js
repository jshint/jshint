class eval {}
class arguments {}
class C {
  get constructor() {}
  set constructor(x) {}
  prototype() {}
  an extra identifier 'in' methodName() {}
  get foo extraIdent1() {}
  set foo extraIdent2() {}
  static some extraIdent3() {}
  static get an extraIdent4() {}
  static set an extraIdent5() {}
  get dupgetter() {}
  get dupgetter() {}
  set dupsetter() {}
  set dupsetter() {}
  static get dupgetter() {}
  static get dupgetter() {}
  static set dupsetter() {}
  static set dupsetter() {}
  dupmethod() {}
  dupmethod() {}
  static dupmethod() {}
  static dupmethod() {}
  ['computed method']() {}
  static ['computed static']() {}
  get ['computed getter']() {}
  set ['computed setter']() {}
  (typo() {}
  set lonely() {}
  set lonel2
            () {}
  *validGenerator() { yield; }
  static *validStaticGenerator() { yield; }
  *[1]() { yield; }
  static *[1]() { yield; }
  * ['*']() { yield; }
  static *['*']() { yield; }
  * [('*')]() { yield; }
  static *[('*')]() { yield; }
}

// (https://github.com/jshint/jshint/issues/2350)
// JSHint shouldn't throw a "Duplicate class method" warning with computed method names
const x = {};
class A {
  [x.property]() {}
  [x.property2]() {}
  [x.property2]() {} // x.property2 !== x.property2 can be true (if x.property2 is a getter)
  [Symbol()]() {}
  [Symbol()]() {}

  [x[0]]() {}
  [x[1]]() {}

  [`a`]() {}
  [`b`]() {}
}