build_dir:
	@mkdir -p "build"

rhino: build_dir
	@echo "Building JSHint for Rhino"
	@cat "jshint.js" > "build/jshint-rhino.js" && \
		cat "env/rhino.js" >> "build/jshint-rhino.js" && \
		echo "Done"

test:
	@echo "Running all tests"
	@expresso tests/*.js

clean:
	@echo "Cleaning"
	@rm -f build/*.js && echo "Done"
