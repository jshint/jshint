var foo;

; (foo)
? foo.bar = {}
: (function () {
      foo = {};
      foo.bar = {};
} ())
;


;(function () {
    var bar = 1;
}());

;function boo() {
};
