var ASTQuery = require("../index").JS;
var fs = require("fs");
var path = require("path");

fs.readFile(path.join(__dirname, "test.js"), {
	encoding: "utf8"
}, function (err, code) {
	//console.log(ASTQuery(code).has("Page(__object__)"));
	//var result = ASTQuery(code).find("this._tapLetter").replace("a.b").code();
	//console.log(result);
	console.log(ASTQuery.stringify(ASTQuery(code).find("Page(__object__)").eq(0).node));
});