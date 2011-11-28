rhino:
	@mkdir -p build && cat "jshint.js" > "jshint-rhino.js" && cat "env/jshint-rhino.js" >> "build/jshint-rhino.js"

test:
	@expresso tests/*.js
