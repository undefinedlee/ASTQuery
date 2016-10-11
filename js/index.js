var babel = require("babel-core");
var parse = require("./parse");
var stringify = require("./stringify");
var compare = require("./compare");

function transMatchs(matchs){
	if(typeof matchs === "string"){
		matchs = [matchs];
	}

	if(matchs instanceof Array){
		return matchs.map(function(match){
			return parse(match);
		});
	}

	console.error("matchs错误");
	console.log(matchs);

	return [];
}

function cloneNode(node){
	if(node instanceof Array){
		return node.map(function(item){
			return babel.types.cloneDeep(item);
		});
	}else{
		return babel.types.cloneDeep(node);
	}
}

function Seed(seed, options){
	this.seed = seed;
	this.options = options;
}
Seed.prototype = {
	parent: function(match){
		this.seed = this.seed.map(function(path){
			return path.parentPath;
		});
		return this;
	},
	replace: function(result){
		result = transMatchs(result);
		this.seed.forEach(function(path){
			path.replaceWithMultiple(cloneNode(result));
		});
		return this;
	},
	insertBefore: function(result){
		result = transMatchs(result);
		this.seed.forEach(function(path){
			result.forEach(function(result){
				path.insertBefore(cloneNode(result));
			});
		});
		return this;
	},
	insertAfter: function(result){
		result = transMatchs(result);
		this.seed.forEach(function(path){
			result.reverse().forEach(function(result){
				path.insertAfter(cloneNode(result));
			});
		});
		return this;
	},
	package: function(result){
		return this;
	},
	remove: function(){
		this.seed.forEach(function(path){
			path.remove();
		});
		return this;
	},
	each: function(fn){
		this.seed.forEach(fn.bind(this));
		return this;
	},
	map: function(fn){
		this.seed.map(fn.bind(this));
		return this;
	},
	eq: function(index){
		return this.seed[index];
	},
	getAST: function(){
		return this.options.ast;
	},
	code: function(){
		return babel.transformFromAst(this.options.ast).code;
	}
};

function ASTQuery(code){
	var ast = babel.transform(code).ast;

	return {
		has: function(matchs){
			matchs = transMatchs(matchs);

			return matchs.some(function(match){
				var isMatch = false;
				babel.transformFromAst(ast, null, {
					plugins: [
						function (_ref) {
							var t = _ref.types;
							return {
								visitor: {
									[match.type]: {
										enter: function(path){
											isMatch = isMatch || compare(path.node, match);
										}
									}
								}
							}
						}
					]
				});
				return isMatch;
			});
		},
		find: function(matchs){
			matchs = transMatchs(matchs);

			var items = [];

			matchs.forEach(function(match){
				babel.transformFromAst(ast, null, {
					plugins: [
						function (_ref) {
							var t = _ref.types;
							return {
								visitor: {
									[match.type]: {
										enter: function(path){
											if(compare(path.node, match) && items.indexOf(path) === -1){
												items.push(path);
											}
										}
									}
								}
							}
						}
					]
				});
			});

			return new Seed(items, {
				ast: ast,
				code: code
			});
		}
	};
};

// 将代码字符串解析成astNode
ASTQuery.parse = parse;
// 将一个AST节点序列化成字符串
ASTQuery.stringify = stringify;
// 比较两个astNode是否一样
ASTQuery.compare = compare;

ASTQuery.Seed = Seed;

// 对象操作
ASTQuery.Object = function(path){
	return {
		find: function(prototypeName){}
	};
};
// 标签操作
ASTQuery.Element = function(path){
	return {
		find: function(attributeName){}
	};
};
// 标签操作
ASTQuery.Function = function(path){
	return {
	};
};
// 标签操作
ASTQuery.Call = function(path){
	return {
		arguments: {
			push: function(){}
		}
	};
};

module.exports = ASTQuery;