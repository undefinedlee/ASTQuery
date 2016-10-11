var babel = require("babel-core");

module.exports = function(astNode){
	var t = babel.types;
	astNode = t.File(t.Program(
		[
			t.FunctionDeclaration(
				t.Identifier("______"),
				[],
				t.BlockStatement([
					t.ReturnStatement(astNode)
				])
			)
		],
		[]
	), [], []);

	return babel.transformFromAst(astNode).code
				.replace(/^\s*function\s+_{6}\(\)\s*{/, "")
				.replace(/}\s*$/, "")
				.trim()
				.replace(/^return\s+/, "")
				.replace(/;$/, "")
				.trim();
};