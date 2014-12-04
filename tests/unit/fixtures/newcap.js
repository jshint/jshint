var dog = new animal();
var cat = new Animal();

dog = animal();
cat = Animal();

/*global iAnimal*/

var rat = new iAnimal();
var bat = new myAnimal();

rat = iAnimal();
bat = myAnimal();

// Make sure we don't warn on Error, Number, etc.
Error();
Number();
String();
Boolean();
Symbol();
