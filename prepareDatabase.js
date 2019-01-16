var mongodb = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/blogmaster";

var adminObj = {
	_id: 1,
	
	username: "admin",
	password: "admin",
	
	permLevel: 3,
};

var article = {
	_id: 1,
	
	title: "Przykładowy artykuł",
	authorId: 1,
	text: "Artykuł, jaki powinien wyglądać żywcem wyciągnięty z bazy danych",
	publishDate: "2019-01-01",
};

var done = 0;
var dbo;

mongodb.connect(url, function(err, db){
	if(err)throw err;
	dbo = db.db("blogmaster");
	dbo.createCollection("accounts", function(err, res){
		if(err)throw err;
		dbo.collection("accounts").insertOne(adminObj, function(err, res){
			if(err)throw err;
			done++;
			if(done == 2)db.close();
		});
	});
	dbo.createCollection("articles", function(err, res){
		if(err)throw err;
		dbo.collection("articles").insertOne(article, function(err, res){
			if(err)throw err;
			done++;
			if(done == 2)db.close();
		});
	});
});