function functionWithCyclomaticComplexity_1() {
}

function functionWithCyclomaticComplexity_1_2() {
    var placeHolder = 1;
}

function functionWithCyclomaticComplexity_2() {
    var placeHolder = 10;
    if (placeHolder < 20) {
        placeHolder = 2;
    }
}

function functionWithCyclomaticComplexity_2() {
    var placeHolder = 10;
    if (placeHolder < 20) {
        placeHolder = 2;
    } else {
        // else does not count for cyclomatic complexity
        placeHolder = 2;
    }
}

function functionWithCyclomaticComplexity_2_try_catch() {
    var placeHolder = 0;
    try {
        placeHolder = placeHolder / 0;
    } catch (exception) {
        placeHolder = 10;
    } finally {
        // finally does no count
        placeHolder = 10;
    }
}

function functionWithCyclomaticComplexity_1_try_finally() {
    var placeHolder = 0;
    try {
        placeHolder = placeHolder / 0;
    } finally {
        // finally does no count
        placeHolder = 10;
    }
}

function functionWithCyclomaticComplexity_8() {
    var placeHolder = 10;
    if (placeHolder < 20) {
        while (placeHolder > 0) {
            placeHolder -= 1;
        }
        for (placeHolder = 1; placeHolder < 10; placeHolder++) {
            placeHolder += 1;
        }
    } else if (placeHolder<100) {
        placeHolder = 2;
    } else {
        // else does not count for cyclomatic complexity
        placeHolder = 2;
    }

    do {
        placeHolder++;
    } while (placeHolder < 1000);

    switch (placeHolder) {
        case 1:
            break;
        case 2: break;
        // default does not count
        default :
    }
}

function functionWithCyclomaticComplexityDueToTernaryStatements_2(a) {
  var b = a ? true : false;
}

function functionWithCyclomaticComplexityDueToOrOperators_2(a) {
  var b = a || {};
}

function functionWithCyclomaticComplexityDueToAndOperators_2(a) {
    var b = a && {};
}

function functionWithCyclomaticComplexityDueToAndOperatorsWithNot_2(a) {
    var b = !(!a && {});
}
