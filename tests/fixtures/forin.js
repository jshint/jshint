for (var key in objects) {
    hey();
}

for (key in objects) {
    if (objects.hasOwnProperty(key)) {
        hey();
    }
}