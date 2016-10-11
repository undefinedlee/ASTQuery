var ASTQuery = require("../index").JS;
var fs = require("fs");
var path = require("path");

fs.readFile(path.join(__dirname, "test.js"), {
	encoding: "utf8"
}, function (err, code) {
	//console.log(ASTQuery(code).has("Page(__object__)"));
	var result = ASTQuery(code).find("this._tapLetter").replace("a.b").getCode();
	console.log(result);
});