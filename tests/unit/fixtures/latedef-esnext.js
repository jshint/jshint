let a = 1;
let b = () => a;
let d = () => c;
let c = 1;
let f = () => e;
const e = 1;
function ag() {
    function ah() {
        ai = 2;
    }
    let ai;
    function aj() {
        function ak() {
            ai = 3;
        }
        let ai;
        ak();
    }
    ah();
    aj();
}
ag();
function bg() {
    function bh() {
        bi = 2;
    }
    let bi;
    function bj() {
        function bk() {
            bi = 3;
        }
        bk();
    }
    bh();
    bj();
}
bg();
function cg() {
    let ci;
    function cj() {
        function ck() {
            ci = 3;
        }
        let ci;
        ck();
    }
    ci = 2;
    ch();
    cj();
}
cg();
