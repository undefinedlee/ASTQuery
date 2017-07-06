var babel = require("babel-core");

module.exports = function(code){
	return babel.transform(
		"function ______(){return " + code + "}",
		{
			plugins: [
				function () {
					return {
						manipulateOptions: function manipulateOptions(opts, parserOpts) {
							parserOpts.plugins.push("*");
						}
					};
				}
			]
		}
	).ast.program.body[0].body.body[0].argument;
};