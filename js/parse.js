var babel = require("babel-core");

module.exports = function(code){
	return babel.transform("function ______(){return " + code + "}").ast.program.body[0].body.body[0].argument;
};