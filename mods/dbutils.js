var mongo = require('mongodb');
var mongodb = mongo.MongoClient;
var dbURL = "mongodb://localhost:27017/blogmaster";
var hash = require('password-hash');
var rSalt = '874f7661';
var lSalt = 'dac6008f';
var crypto = require('crypto');

function hashPwd(pwd){
	return hash.generate(rSalt + pwd + lSalt);
};

function verify(pwd, hpwd){
	return hash.verify(rSalt + pwd + lSalt, hpwd);
};

var abcs = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';

exports.Util = function(fs){

	this.fs = fs;
	this.hashPwd = hashPwd;
	this.verify = verify;

	this.getNewArticles = function(callback){
		var sContent = this.fs.readFileSync("newArticleContent.html");
		var total = '';
		mongodb.connect(dbURL, function(err, db){
			if(err) throw err;
			var dbo = db.db('blogmaster');
			dbo.collection('articles').aggregate([
				{$lookup:
					{
						from: 'accounts',
						localField: 'authorId',
						foreignField: '_id',
						as: 'author',
					}
				}
			]).sort({publishDate: -1}).toArray(function(err, result){
				if(err)throw err;
				db.close();
				
				var theList = '';
				for(var i = 0; i < result.length; i++){
					var ob = result[i];
					
					theList += sContent.toString().replaceSync('##title', ob.title, '##main', ob.text, '##date', ob.publishDate, '##author', ob.author[0].username);
				};
				callback(theList);
			})
		});
	};
		
	this.getTable = function(name, callback){
		mongodb.connect(dbURL, function(err, db){
			if(err) throw err;
			var dbo = db.db('blogmaster');
			dbo.collection(name).find({}).toArray(function(err, result){
				if(err)throw err;
				db.close();
				
				callback(result)
			});
		});
	};
		
	this.getUser = function(username, password, callback){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").findOne({username: username}, function(err, result){
				if(err)throw err;
				
				var acc = result;
				if(result){
					if(hash.isHashed(acc.password)){
						callback(verify(password, acc.password) ? acc : undefined)
					}else{
						dbo.collection("accounts").updateOne({username: username}, {$set:{password: hashPwd(acc.password)}}, function(err, result){
							if(err || !result)throw err;
							db.close()
						});
						callback(password = acc.password ? acc : undefined)
					};
				}else{
					db.close();
					
					callback();
				};
			});
		});
	};
		
	this.getUserById = function(_id, callback){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").findOne({_id: new mongo.ObjectID(_id)}, function(err, result){
				if(err)throw err;
				
				callback(result);
			});
		});
	};
	
	this.getUserByMeta = function(meta, callback){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").findOne(meta, function(err, result){
				if(err)throw err;
				
				callback(result);
			});
		});
	};
		
	this.findUsernameOrEmail = function(username, email, callback){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").findOne({$or: [{username: username}, {email: email}]}, function(err, result){
				if(err)throw err;
				db.close()
				
				if(result)
					callback(result, username == (result.username) ? 1 : 2);
				else
					callback(false);
			});
		});
	};
		
	this.addUser = function(username, password, op, email, callback){
		var actCode = this.kodek(32);
		var resetCode = this.kodek(32);
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").insertOne({username: username, password: hashPwd(password), permLevel: (op ? 3 : 1), email: email, verified: false, activationLinkSent: false, activationCode: actCode, resetPwdCode: resetCode, resetPwdSent: false, pwdMustChange: false}, function(err, result){
				if(err)throw err;
				db.close();
				
				callback(result, actCode);
			});
		});
	};
		
	this.setUser = function(_id, username, email, op, callback){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").updateOne({_id: new mongo.ObjectID(_id)}, {$set: {username: username, email: email, permLevel: (op ? 3 : 1)}}, function(err, result){
				if(err)throw err;
				db.close();
				
				callback(result);
			});
		});
	};
		
	this.setUserPassword = function(_id, oldPassword, newPassword, callback){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").findOne({_id: new mongo.ObjectID(_id)}, function(err, result){
				if(err)throw err;
				
				if(result && verify(oldPassword, result.password))
					dbo.collection("accounts").updateOne({_id: new mongo.ObjectID(_id)}, {$set: {password: hashPwd(newPassword)}}, function(err, result){
					if(err)throw err;
						db.close();
						
						callback(result);
					});
				else
					callback();
			});
		});
	};
	
	this.setUserPasswordNosec = function(_id, newPassword, callback = () => {}){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").findOne({_id: new mongo.ObjectID(_id)}, function(err, result){
				if(err)throw err;
				
				if(result)
					dbo.collection("accounts").updateOne({_id: new mongo.ObjectID(_id)}, {$set: {password: hashPwd(newPassword)}}, function(err, result){
						if(err)throw err;
						db.close();
						
						callback(result);
					});
				else
					callback();
			});
		});
	};
		
	this.delUser = function(_id, callback){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			var done = 0;
			var r1, r2;

			dbo.collection("articles").deleteMany({authorId: new mongo.ObjectID(_id)}, function(err, result){
				if(err)throw err;
				
				r1 = result;
				if(++done == 2){callback(r1, r2); db.close()};
			});
			dbo.collection("accounts").deleteOne({_id: new mongo.ObjectID(_id)}, function(err, result){
				if(err)throw err;
				
				r2 = result;
				if(++done == 2){callback(r1, r2); db.close()};
			});
		});
	};
		
	this.setUserMeta = function(_id, meta, callback = () => {}){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").updateOne({_id: new mongo.ObjectID(_id)}, {$set: meta}, function(err, result){
				if(err)throw err;
				db.close();
				
				callback(result);
			});
		});
	};
		
	this.getUserActivatable = function(code, callback = () => {}){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").findOne({activationCode: code, verified: false}, function(err, result){
				if(err)throw err;
				db.close();
				
				callback(result);
			});
		});
	};
		
	this.addUserTail = function(_id, callback = () => {}){
		var actCode = this.kodek(32);
		var resetCode = this.kodek(32);
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").updateOne({_id: new mongo.ObjectID(_id)}, {$set: {verified: false, activationLinkSent: false, activationCode: actCode, resetPwdCode: resetCode, resetPwdSent: false, pwdMustChange: false}}, function(err, result){
				if(err)throw err;
				db.close();
				
				callback(result);
			});
		});
	};
	
	this.flushUserCodes = function(_id, callback = () => {}){
		var actCode = this.kodek(32);
		var resetCode = this.kodek(32);
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("accounts").updateOne({_id: new mongo.ObjectID(_id)}, {$set: {activationCode: actCode, resetPwdCode: resetCode}}, function(err, result){
				if(err)throw err;
				db.close();
				
				callback(result);
			});
		});
	};
		
	this.addArticle = function(title, text, date, authorId, callback){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("articles").insertOne({title: title, text: text, publishDate: date, authorId: new mongo.ObjectId(authorId)}, function(err, result){
				if(err)throw err;
				db.close();
				
				callback(result);
			});
		});
	};
		
	this.setArticle = function(_id, title, text, date, authorId, callback){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("articles").updateOne({_id: new mongo.ObjectID(_id), authorId: new mongo.ObjectID(authorId)}, {$set: {title: title, text: text, publishDate: date}}, function(err, result){
				if(err)throw err;
				db.close();
				
				callback(result);
			});
		});
	};
		
	this.delArticle = function(_id, authorId, callback){
		mongodb.connect(dbURL, function(err, db){
			if(err)throw err;
			dbo = db.db("blogmaster");
			dbo.collection("articles").deleteOne({_id: new mongo.ObjectID(_id), authorId: new mongo.ObjectID(authorId)}, function(err, result){
				if(err)throw err;
				db.close();
				
				callback(result);
			});
		});
	};

	this.kodek = function(bytes){
		var rand = crypto.randomBytes(bytes).toString('utf-8');
		var readable = '';
		for(var i = 0; i < rand.length; i++){
			readable += abcs[rand.charCodeAt(i) % abcs.length];
		};
		return readable;
	};

	return this;
};