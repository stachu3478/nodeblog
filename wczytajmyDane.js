var mongodb = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/blogmaster";

var done = 0;

mongodb.connect(url, function(err, db){
	if(err)throw err;
	dbo = db.db("blogmaster");
	dbo.collection("accounts").find({}).toArray(function(err, res){
		if(err)throw err;
		done++;
		console.log(res);
		if(done == 2)db.close();
	});
	dbo.collection("articles").find({}).toArray(function(err, res){
		if(err)throw err;
		done++;
		console.log(res);
		if(done == 2)db.close();
	});
});