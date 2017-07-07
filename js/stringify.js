var babel = require("babel-core");

module.exports = function(astNode){
	var t = babel.types;
	if(/(Expression|Literal)$/.test(astNode.type) || /^JSX/.test(astNode.type) || ["Identifier"].indexOf(astNode.type) !== -1){
		// 转换表达式
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
	}else{
		astNode = t.File(t.Program(
			[astNode],
			[]
		), [], []);
		return babel.transformFromAst(astNode).code;
	}
};