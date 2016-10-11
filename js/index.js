var babel = require("babel-core");
var parseMatch = require("./parse-match");
var compare = require("./compare");

function transMatchs(matchs){
	if(typeof matchs === "string"){
		matchs = [matchs];
	}

	if(matchs instanceof Array){
		return matchs.map(function(match){
			return parseMatch(match);
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
	getCode: function(){
		return babel.transformFromAst(this.options.ast).code;
	},
	getAST: function(){
		return this.options.ast;
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
// 对象操作
ASTQuery.Object = function(object){
	return {
		find: function(prototypeName){}
	};
};
// 标签操作
ASTQuery.Element = function(element){
	return {
		find: function(attributeName){}
	};
};

module.exports = ASTQuery;