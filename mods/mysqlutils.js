var mysql = require('mysql');
var fs = require('fs');
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "root",
	database: 'blogmaster',
});

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

con.connect(function(err){
	if(err)throw err;
});

exports.Util = function(fs){

	this.fs = fs;
	this.hashPwd = hashPwd;
	this.verify = verify;

	this.getNewArticles = function(callback){
		var sContent = fs.readFileSync("newArticleContent.html");
		var total = '';
		con.query(fs.readFileSync("manageTools/sql/newArticles.sql").toString(), function(err, result){
			
			if(err)throw err;
			
			var theList = '';
			for(var i = 0; i < result.length; i++){
				var ob = result[i];
				
				theList += sContent.toString().replaceSync('##title', ob.title, '##main', ob.text, '##date', ob.publishDate.toString().split(' ').slice(0, 4).join(' '), '##author', ob.username);
			};
			callback(theList);
		});
	};
		
	this.getTable = function(name, callback){
		con.query(fs.readFileSync("manageTools/sql/getTable.sql").toString().replace('?', name), function(err, result){
			if(err)throw err;
			
			callback(result)
		});
	};
		
	this.getUser = function(username, password, callback){
		con.query(fs.readFileSync("manageTools/sql/getUser.sql").toString(), [username], function(err, result){
			if(err)throw err;
			
			var acc = result[0];
			if(acc){
				if(hash.isHashed(acc.password)){
					callback(verify(password, acc.password) ? acc : undefined);
				}else{
					dbo.collection("accounts").updateOne({username: username}, {$set:{password: hashPwd(acc.password)}}, function(err, result){
						if(err || !result)throw err;
					});
					callback(password = acc.password ? acc : undefined)
				};
			}else{
				
				callback();
			};
		});
	};
		
	this.getUserById = function(_id, callback){
		con.query(fs.readFileSync("manageTools/sql/getUserById.sql").toString(),[parseInt(_id)], function(err, result){
			if(err)throw err;
			
			callback(result);
		});
	};
	
	this.getUserByMeta = function(meta, callback){
		var arrMeta = [];
		for(var k in meta){
			arrMeta.push(k + '=' + meta[k]);
		};
		con.query(fs.readFileSync("manageTools/sql/getUserByMeta.sql").toString().replace('?', arrMeta.join(' AND ')), function(err, result){
			if(err)throw err;
			
			callback(result);
		});
	};
		
	this.findUsernameOrEmail = function(username, email, callback){
		con.query(fs.readFileSync("manageTools/sql/findUsernameOrEmail.sql").toString(), [email, username], function(err, result){
			if(err)throw err;
			
			if(result)
				callback(result, username == (result.username) ? 1 : 2);
			else
				callback(false);
		});
	};
		
	this.addUser = function(username, password, op, email, callback){
		var actCode = this.kodek(32);
		var resetCode = this.kodek(32);
		con.query(fs.readFileSync("manageTools/sql/addUser.sql").toString(), [username, hashpwd(password), op ? 3 : 1, email, actCode, resetCode], function(err, result){
			if(err)throw err;
			
			callback(result, actCode);
		});
	};
		
	this.setUser = function(_id, username, email, op, callback){
		con.query(fs.readFileSync("manageTools/sql/setUser.sql").toString(), [username, email, op ? 3 : 1, _id], function(err, result){
			if(err)throw err;
			
			callback(result);
		});
	};
		
	this.setUserPassword = function(_id, oldPassword, newPassword, callback){
		con.query('SELECT * FROM accounts WHERE _id = ? LIMIT 1',[_id], function(err, result){
			if(err)throw err;
			
			if(result && verify(oldPassword, result[0].password))
				con.query('UPDATE accounts SET password = ? WHERE _id = ? LIMIT 1', [hashPwd(newPassword), _id], function(err, result){
				if(err)throw err;
					
					callback(result);
				});
			else
				callback();
		});
	};
	
	this.setUserPasswordNosec = function(_id, newPassword, callback = () => {}){
		con.query('UPDATE accounts SET password = ? WHERE _id = ? LIMIT 1',[hashPwd(newPassword), _id], function(err, result){
			if(err)throw err;
			
			callback(result);
		});
	};
		
	this.delUser = function(_id, callback){
		var done = 0;
		var r1, r2;
		
		con.query('DELETE FROM acrticles WHERE authorId = ? LIMIT 1',[_id], function(err, result){
			if(err)throw err;
			
			r1 = result;
			if(++done == 2){callback(r1, r2); db.close()};
		});
		con.query('DELETE FROM accounts WHERE _id = ? LIMIT 1',[_id], function(err, result){
			if(err)throw err;
			
			r2 = result;
			if(++done == 2){callback(r1, r2); db.close()};
		});
	};
		
	this.setUserMeta = function(_id, meta, callback = () => {}){
		var arrMeta = [];
		for(var k in meta){
			arrMeta.push(k + '=' + meta[k]);
		};
		con.query(fs.readFileSync("manageTools/sql/setUserMeta.sql").toString().replace('?', arrMeta.join(', ')), [arrMeta, _id], function(err, result){
			if(err)throw err;
			
			callback(result);
		});
	};
		
	this.getUserActivatable = function(code, callback = () => {}){
		con.query('SELECT * FROM accounts WHERE activationCode = ? AND verified = 0 LIMIT 1', [code], function(err, result){
			if(err)throw err;
			
			callback(result[0]);
		});
	};
		
	this.addUserTail = function(_id, callback = () => {}){
		var actCode = this.kodek(32);
		var resetCode = this.kodek(32);
		con.query('UPDATE accounts SET verified = 0, activationLinkSent = 1, activationCode = ?, resetPwdCode = ?, resetPwdSent = 0, pwdMustChange = 0 WHERE _id = ? LIMIT 1',[actCode, resetCode, _id], function(err, result){
			if(err)throw err;
			
			callback(result);
		});
	};
	
	this.flushUserCodes = function(_id, callback = () => {}){
		var actCode = this.kodek(32);
		var resetCode = this.kodek(32);
		con.query('UPDATE accounts SET activationCode = ?, resetPwdCode = ? WHERE _id = ? LIMIT 1', [actCode, resetCode, _id], function(err, result){
			if(err)throw err;
			
			callback(result);
		});
	};
		
	this.addArticle = function(title, text, date, authorId, callback){
		con.query('INSERT INTO articles (title, text, publishDate, authorId) VALUES (?, ?, ?, ?)', [title, text, date, authorId], function(err, result){
			if(err)throw err;
			
			callback(result);
		});
	};
		
	this.setArticle = function(_id, title, text, date, authorId, callback){
		con.query('UPDATE articles SET title = ?, text = ?, publishDate = ? WHERE _id = ? AND authorId = ? LIMIT 1', [title, text, date, _id, authorId], function(err, result){
			if(err)throw err;
			
			callback(result);
		});
	};
		
	this.delArticle = function(_id, authorId, callback){
		con.query('DELETE FROM articles WHERE _id = ? AND authorId = ? LIMIT 1', [_id, authorId], function(err, result){
			if(err)throw err;
			
			callback(result);
		});
	};
	
	this.rawQuery = function(query, callback){
		con.query(query, callback);
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