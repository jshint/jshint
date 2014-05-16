for (var key in objects) {
    if (objects.hasOwnProperty(key)) {
        hey();
    }
}

for (var key in objects) {
    if (! objects.hasOwnProperty(key)) {
        continue;
    }
    hey();
    
    for (var key2 in objects2) {
      if (objects2.hasOwnProperty(key)) { // Wrong key
          hey();
      }
    }
    
    for (key2 in objects2) {
      if (objects.hasOwnProperty(key2)) { // Wrong collection
          hey();
      }
      
      for (var key3 in objects3) {
        if (! objects3.hasOwnProperty(key)) { // Wrong key
          continue;
        }
        hey();
      }
      
      for (key3 in objects3) {
        if (! objects.hasOwnProperty(key3)) { // Wrong collection
          continue;
        }
        hey();
      }
      
      for (key3 in objects3) {
        if (! objects3.hasOwnProperty(key3)) {
          hey(); // Should be continue
          continue;
        }
        
        for (var key4 in objects4.map) {
          if (objects4.map.hasOwnProperty(key4)) {
              hey();
          }
        }
      }
    }
}

// Empty for in block like the one found in jQuery
// JSHINT would crash upon finding this and wouldn't continue
// GH-336
for ( key in objects ) { }

// Let's make sure we continue scanning the rest of the file.
for (key in objects) {
    hey();
}
