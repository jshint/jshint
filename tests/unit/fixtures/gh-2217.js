export class Value {
  constructor() {
    this.a = 1;
  }
  method() {
    return this.a - 1;
  }
}


export function foo() {
  this.a = 1;
}

export default function() {
  this.a = 1;
}

class Value {
  constructor() {
    this.a = 1;
  }
  method() {
    return this.a - 1;
  }
}


function foo() {
  this.a = 1;
}
