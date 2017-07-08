var babel = require("babel-core");

// 判断是否是简单的表达式
function isSimple(node){
	var type = node.type;
	return /(Expression|Literal)$/.test(type) || /^JSX/.test(type) || ["Identifier"].indexOf(type) !== -1;
}

module.exports = function(astNode){
	var t = babel.types;
	var isExpression = false;
	var isModule = false;
	
	if(!(astNode instanceof Array)){
		isExpression = isSimple(astNode);
		astNode = [astNode];
	}

	astNode = astNode.map(function(node){
		if(isSimple(node)){
			return t.ExpressionStatement(node);
		}
		// 判断是否是模块模式
		if(/^(Import|Export)/.test(node.type)){
			isModule = true;
		}
		return node;
	});

	// 如果不是模块模式，则在外部包装function ___(){}，防止箭头函数提取到顶部的_this
	if(!isModule){
		astNode = [
			t.FunctionDeclaration(
				t.Identifier("____"),
				[],
				t.BlockStatement(
					astNode
				)
			)
		];
	}

	astNode = t.File(t.Program(
		astNode,
		[]
	), [], []);

	var code = babel.transformFromAst(astNode).code;

	// 移除外部的函数包装代码
	if(!isModule){
		code = code.replace(/^[\s\n]*function\s+_{4}\(\s*\)[\s\n]*\{[\s\n]*/, "").replace(/[\s\n]*\}[\s\n]*$/, "");
	}

	// 移除末尾的封号
	if(isExpression){
		code = code.replace(/;+$/, "");
	}
	
	return code;
};