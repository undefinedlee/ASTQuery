var babel = require("babel-core");

function isSimple(node){
	var type = node.type;
	return /(Expression|Literal)$/.test(type) || /^JSX/.test(type) || ["Identifier"].indexOf(type) !== -1;
}

module.exports = function(astNode){
	var t = babel.types;
	
	if(!(astNode instanceof Array)){
		astNode = [astNode];
	}

	astNode = astNode.map(function(node){
		if(isSimple(node)){
			return t.ExpressionStatement(node);
		}
		return node;
	});

	astNode = t.File(t.Program(
		astNode,
		[]
	), [], []);
	return babel.transformFromAst(astNode).code;
};