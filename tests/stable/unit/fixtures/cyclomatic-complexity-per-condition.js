function complexity_2(someVal) {
  switch (someVal) {
    case 1:
    case 2:
    case 3:
      doSomething();
      break;
    default:
      doSomethingElse();
      break;
  }
}

function same_Complexity_2(someVal) {
  if (someVal === 1 || someVal === 2 || someVal === 3) {
    doSomething();
  } else {
    doSomethingElse();
  }
}

function complexity_3(someVal) {
  switch (someVal) {
    case 1:
    case 2:
      break;
    case 3:
      doSomething();
      break;
    default:
      doSomethingElse();
      break;
  }
}

function same_Complexity_3(someVal) {
  if (someVal === 1 || someVal === 2) {
    doSomething();
  } else if(someVal === 3) {
    doSomethingElse();
  } else {
    doSomethingElse();
  }
}

function complexity_3(someVal) {
  if (someVal === 1 && someVal === 2) {
    doSomething();
  } else if(someVal != 3) {
    doSomethingElse();
  } else {
    doSomethingElse();
  }
}

function complexity_4(someVal) {
  switch (someVal) {
    case 1:
      something();
      break;
    case 2:
      doSomething();
      break;
    case 3:
      doSomethingElse();
  }
}
