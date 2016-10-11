var Wildcard = require("./wildcard");

var compare = {
	//
	Identifier: function(target, match){
		return target.name === match.name;
	},
	// 简单类型
	Literal: function(target, match){
		return target.raw === match.raw;
	},
		// 字符串
		StringLiteral: function(target, match){
			return target.value === match.value;
		},
		// 数字
		NumericLiteral: function(target, match){
			return target.value === match.value;
		},
		// bool
		BooleanLiteral: function(target, match){
			return target.value === match.value;
		},
		// null
		NullLiteral: function(target, match){
			return true;
		},
		// 正则表达式
		RegexpLiteral: function(target, match){
			return target.raw === match.raw;
		},
	// 表达式块
	ExpressionStatement: function(target, match){
		return compareItem(target.expression, match.expression);
	},
		// this
		ThisExpression: function(target, match){
			return true;
		},
		// 成员
		MemberExpression: function(target, match){
			return compareItem(target.object, match.object) && compareItem(target.property, match.property);
		},
		// 调用
		CallExpression: function(target, match){
			return compareItem(target.callee, match.callee) && compareItem(target.arguments, match.arguments);
		},
		// 数组
		ArrayExpression: function(target, match){
			return compareItem(target.elements, match.elements);
		},
		// 对象
		ObjectExpression: function(target, match){
			return compareItem(target.properties, match.properties);
		},
			Property: function(target, match){
				return target.kind === match.kind &&
						target.computed === match.computed &&
						target.shorthand === match.shorthand &&
						compareItem(target.key, match.key) &&
						compareItem(target.value, match.value);
			},
		// 函数
		FunctionExpression: function(target, match){
			return (target.id === match.id || compareItem(target.id, match.id)) &&
					target.async === match.async &&
					target.generator === match.generator &&
					target.expression === match.expression &&
					compareItem(target.params, match.params) &&
					compareItem(target.body.body, match.body.body);
		},
		// 一元运算
		UnaryExpression: function(target, match){},
		// 二元运算
		BinaryExpression: function(target, match){},
		// 逻辑运算
		LogicalExpression: function(target, match){},
		// 条件表达式
		ConditionalExpression: function(target, match){}
};

function compareItem(target, match){
	// 如果比较的两个相等，如都是null，或者都是值类型，值相等，或者都是引用类型引用地址一样
	if(target === match){
		return true;
	}

	var checkWildcard;
	// 数组比较
	if(target instanceof Array && match instanceof Array){
		if(match.length === 1){
			checkWildcard = compareWildcard(target, match[0]);
			if(typeof checkWildcard === "boolean"){
				return checkWildcard;
			}
		}
		return compareList(target, match);
	}
	// 
	if(!target || !match || !target.type || !match.type){
		return false;
	}

	checkWildcard = compareWildcard(target, match);
	if(typeof checkWildcard === "boolean"){
		return checkWildcard;
	}

	if(target.type === match.type){
		return compare[target.type](target, match);
	}

	return false;
};
// 比较通配符
function compareWildcard(target, match){
	if(match.type === "Identifier"){
		// 解析通配符
		if(match.name === Wildcard.any){
			return true;
		}else{
			if(target instanceof Array){
				if(target.length !== 1){
					return false;
				}
				target = target[0];
			}

			switch(match.name){
				case Wildcard.object:
					return target.type === "ObjectExpression";
				case Wildcard.array:
					return target.type === "ArrayExpression";
				case Wildcard.string:
					return target.type === "StringLiteral";
				case Wildcard.id:
					return target.type === "Identifier";
				case Wildcard.number:
					return target.type === "NumericLiteral";
				case Wildcard.bool:
					return target.type === "BooleanLiteral";
				case Wildcard.regexp:
					return target.type === "RegexpLiteral";
			}
		}
	}

	return null;
}
// 比较数组
function compareList(target, match){
	return target.length === match.length && target.every(function(item, index){
		return compareItem(item, match[index]);
	});
}

module.exports = compareItem;