build_dir:
	@mkdir -p "build"

rhino: build_dir
	@echo "Building JSHint for Rhino"
	@cat "jshint.js" > "build/jshint-rhino.js" && \
		cat "env/rhino.js" >> "build/jshint-rhino.js" && \
		echo "Done"

test:
	@echo "Running unit tests"
	@expresso tests/unit/*.js
	@echo "Running regression tests"
	@expresso tests/regression/*.js

cover:
	@echo "Start coverage"
	@tests/helpers/coveraje.js

clean:
	@echo "Cleaning"
	@rm -f build/*.js && echo "Done"
