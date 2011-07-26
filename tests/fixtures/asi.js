function foo () {
    if (true) return
    var x = 1
}

for (var i = 0; i < 10; i++) {
    if (i === 0) continue
    if (i === 1) break
}

foo()