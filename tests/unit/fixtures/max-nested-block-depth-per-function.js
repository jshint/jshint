function functionWithNestedBlockDepth3() {
    var placeHolder = 10;
    if (placeHolder < 20) {
        // here we should get a warning for max depth 1
        while (placeHolder > 0) {
            placeHolder -= 1;
            // here we should get a warning for max depth 2
            // but not for max depth 1, as we already got one above
            if (placeHolder > 5) {
                placeHolder -= 1;
            }
        }
        // here we should get a warning for max depth 1
        if (placeHolder === 0) {
            placeHolder = 1;
        }
    }
}
