function hello () {
    return true ;
}

var bye = function() {
    if(hey){
        // Next line has a trailing whitespace
        return;  
    }  
};

try {
    var other = {
        a: true ,
        b :false
    };
}    catch    ( ex )    { // no errors thrown
    if ( ex ) {           // errors
    }
}

function test2(a, b, c, d) {
  /*jshint indent: 2, white: true, curly: false*/
  if (a) {
    return;
  }
  if (a)
    return;
  if (b) return;
  if (c) return;
  if (d)
    return;
  for (;;)
    return;
  for (;;) return;
  while (a) return;
  while (a)
    return;
}

/*fix for indentation on single-line blocks*/
var name1 = (function () { var x = 2; return 'Anton'; }());

/*unfortunately (as a side effect), this is also allowed*/
var name2 = (function () { var x = 2;
                            return 'Anton';
                        }());