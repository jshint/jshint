#!/bin/bash

DIR="$( cd "$( dirname "$0" )" && pwd )"

java -jar $DIR/js.jar $DIR/jshint-rhino.js $DIR $*
