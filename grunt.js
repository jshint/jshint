module.exports = function (grunt) {
	grunt.initConfig({
		test: {
			all: [
				"tests/stable/unit/*.js",
				"tests/stable/regression/thirdparty.js",
			]
		}
	});

	grunt.registerTask("default", "test");
};
