#!/bin/bash

# USAGE: rhino.sh [jshint options] [filenames]

# Example: rhino.sh forin=true,noarg=true,noempty=true,eqeqeq=true,bitwise=true,undef=true,curly=true,browser=true,indent=4,maxerr=50 myFile.js

DIR="$( cd "$( dirname "$0" )" && pwd )"

java -jar $DIR/js.jar $DIR/jshint-rhino.js $DIR $*
