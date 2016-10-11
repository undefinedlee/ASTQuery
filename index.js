var babel = require("babel-core");

/*
	通配类型：
	__any__
	__object__
	__array__
	__string__
	__id__
	__number__
 */

function ASTQuery(code){
	var prototype = {
		/*
			babelTools("...").has("require(__any__)")
		 */
		has: function(matchs){},
		find: function(matchs){
			return new Seed();
		},
		filter: function(matchs){},
		replace: function(matchs, result){
			return this;
		},
		insertBefore: function(matchs, result){
			return this;
		},
		insertAfter: function(matchs, result){
			return this;
		},
		package: function(matchs, result){
			return this;
		},
		remove: function(matchs){
			return this;
		}
	};

	function Seed(seed){
		this.seed = seed;
	}
	Seed.prototype = prototype;

	return prototype;
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