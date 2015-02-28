class Section {
  constructor() {

  }
}

export default class Header extends Section {
  someMethod() {
    // ...
  }
}

Object.defineProperty(Header, "CONST", {
  value: 1
});
