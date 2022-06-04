var fs = require('fs');
var qs = require('querystring');

var express = require('express');
var app = express();

var myIp = require('ip').address();

var sessionOb = require('node-session');
var session = new sessionOb({secret: "Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD"});

var dbutils = new require('./mods/mysqlutils.js').Util(fs);
var vali = require('./mods/vali.js');
var str = require('./mods/strMan.js');

var mailer = require('nodemailer');
var client = mailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'stachu3478@gmail.com',
		pass: fs.readFileSync('ePassword.txt').toString(),
	},
	secure: true,
	tls: {
		rejectUnauthorized: false,
	},
});

var cfg = {
	pwdFresh: 9999,
};

String.prototype.replaceSync = function(...reps){
	var str = this;
	var tab = [];
	var indexes = [];
	for(var i = 0; i < reps.length; i += 2){
		var pos = 0;
		while(pos < str.length){
			var idx = str.indexOf(reps[i],pos);
			if(idx > -1){
				indexes.push({i: idx,s: reps[i + 1], f: reps[i]});
				pos = idx + reps[i].length;
			}else{
				break;
			};
		};
	};
	indexes = indexes.sort((a,b) => (a.i > b.i));
	if(indexes.length > 0){
		tab.push(str.slice(0, indexes[0].i) + indexes[0].s);
	};
	for(var i = 1; i < indexes.length; i++){
		var rc = indexes[i];
		tab.push(str.slice(indexes[i - 1].i + indexes[i - 1].f.length, rc.i) + rc.s);
	};
	if(indexes.length > 0){tab.push(str.slice(indexes[indexes.length - 1].i + indexes[indexes.length - 1].f.length))};
	return tab.join("");
};

var activatorHTML = fs.readFileSync('activatorMail.html').toString();
function activatorMail(to, link, username, callback = () => {}){
	var options = {
		from: 'articlesystem3000services@gmail.com',
		to: to,
		subject: 'System kont z bazą danych i ze wszystkim itd.',
		html: activatorHTML.replaceSync('##username', username, '##link', myIp + ':' + (process.env.PORT || 8080) + '/activate?a=' + qs.stringify(link), '##code', link),
	};
	client.sendMail(options, (err, info) => {
		if(err)throw err;
		callback(err, info);
		console.log('E-mail wysłany: ' + info.response);
	});
};

function resetPwdMail(to, link, username, callback = () => {}){
	var options = {
		from: 'articlesystem3000services@gmail.com',
		to: to,
		subject: 'System kont z bazą danych i ze wszystkim itd.',
		html: fs.readFileSync('resetPwdMail.html').toString().replaceSync('##username', username, '##link', myIp + ':' + (process.env.PORT || 8080) + '/resetPassword?a=' + qs.stringify(link), '##code', link),
	};
	client.sendMail(options, (err, info) => {
		if(err)throw err;
		callback(err, info);
		console.log('E-mail wysłany: ' + info.response);
	});
};

function resendEmailForm(userId){
	return fs.readFileSync('resendEmailForm.html').toString().replace('##_id', userId);
};

function loadArticle(file){
	var sContent = fs.readFileSync("articleContent.html");
	var aContent = fs.readFileSync(file);
	var qb1 = aContent.indexOf("["), qb2 = aContent.indexOf("]"), cb1 = aContent.indexOf("("), cb2 = aContent.indexOf(")");
	var title = aContent.slice(qb1 + 1, qb2);
	var strDate = aContent.slice(cb1 + 1, cb2);
	var strText = aContent.slice(Math.max(qb1, qb2, cb1, cb2) + 1);
	return sContent.toString().replaceSync("##title", title, "##main", strText, "##date", strDate);
};

function getArticles(){
	var list = fs.readdirSync("articles");
	var arts = [];
	for(var i = 0; i < list.length; i++){
		arts.push(loadArticle("articles/" + list[i]));
	};
	return arts;
};

function redirect(res,url){
	res.writeHead(301,{'Content-Type': 'text/html'});
	res.write("<script> location.assign('" + url + "')</script>");
	res.end();
};

function showProfile(req, res, outStr = '', naglowek = 0, callback = () => {}){
	var file1, file2, file3;
	var panelHTML = '';
	var userId = req.session.get('userId');
	var data = fs.readFileSync('htdocs/profil.html').toString().replaceSync('##naglowek', naglowek,'##out', outStr);
	if(req.session && req.session.has('userId') && !req.session.has('deprived')){
		var mainHTML = fs.readFileSync('htdocs/profileForm.html').toString();
		var table = '';
		var theList = '';
		var op = req.session.has('op');
		if(op){
			file2 = 'manageTools/adminPanel.html';
			file3 = fs.readFileSync('manageTools/editAccountPattern.html');
			table = 'accounts';
		}else{
			file2 = 'manageTools/authorPanel.html';
			file3 = fs.readFileSync('manageTools/editArticlePattern.html');
			table = 'articles';
		};
		file3 = file3.toString();
		panelHTML = fs.readFileSync(file2).toString();
		dbutils.getTable(table, function(result){
			for(var i = 0; i < result.length; i++){
				var ob = result[i];
				if(op){
					theList += file3.replaceSync('##_id', ob._id, '##username', ob.username, '##email', ob.email, '##op', (ob.permLevel >= 3) ? 'checked' : '', '##pwdMustChange', ob.pwdMustChange ? 'checked' : '');
				}else if(ob.authorId.toString() == userId.toString()){
					theList += file3.replaceSync('##_id', ob._id, '##title', ob.title, '##text', ob.text, '##date', ob.publishDate)
				};
			};
			res.write(data.replace('##main', mainHTML.replace('##panel', panelHTML.replace('##list',theList))));
			callback();
			res.end();
		});
	}else{
		var mainHTML = fs.readFileSync('htdocs/loginForm.html').toString().replace('##naglowek', naglowek);;
		res.write(data.replace('##main', mainHTML));
		callback();
		res.end();
	};
};

function isSuppUser(req){
	return req.session.has('userId') && !req.session.has('deprived');
};

function numDate(date){
	return date.getFullYear() * 366 + date.getMonth() * 31 + date.getDay();
};

app.use(function(req, res, next){
	if(req.url == "/"){
        req.url += "index.html";
    };
	next();
});

app.use(express.static('htdocs/static'));

app.get('/index.html', function(req, res){
	var data = fs.readFileSync('htdocs/index.html')
	var replaces = fs.readFileSync("replaceItems.txt").toString().split("\n");
	replaces = replaces.map(function(a){return eval(a)});
	var toReplace;
	if(data.toString().indexOf("##articles") != -1){
		toReplace = data.toString().replace("##articles", getArticles().join(""));
	}else
		toReplace = data.toString();
	for(var i = 0; i < toReplace.length; i += 2){
		toReplace = toReplace.replace(replaces[i], replaces[i + 1]);
	};
	res.write(toReplace);
	res.end();
});

app.get('/dataGet', function(req, res){
	if(fs.existsSync("userdata.txt")){
		var data = fs.readFileSync("userdata.txt");
		res.writeHead(200, {'Content-Type': 'text/JSON'})
		res.write(data);
	}else{
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write("Data not found.");
	};
	res.end();
});

app.get('/nowy_system.html', function(req, res){
	var std = fs.readFileSync("htdocs/index.html");
	dbutils.getNewArticles(function(list){
		res.write(std.toString().replace('##articles', list));
		res.end();
	});
});

app.use(function(req, res, next){
	session.startSession(req, res, (err) => {
		if(err)throw err;
		
		next();
	})
});

app.get('/profil.html', function(req, res){
	showProfile(req, res);
});

app.use('/logout', function(req, res){
	var _id = req.session.has('userId');
	req.session.flush();
	if(_id)
		showProfile(req, res, str.LOGGED_OUT);
	else
		showProfile(req, res, str.NOT_LOGGED_IN);
	res.end();
});

app.use(function(req, res, next){
	var body = '';
	req.on('data', chunk => {
		body += chunk.toString(); // convert Buffer to string
	});
	req.on('end', () => {
		req.post = qs.parse(body);
		req.postRaw = body;
		next();
	});
});

app.post('/register', function(req, res){
	var data = req.post;
	var err;
	if(!vali.username(data.login))err = str.INVALID_USERNAME;
	if(!vali.password(data.pwd))err = str.WEAK_PWD;
	if(data.pwd != data.pwd2)err = str.PWD_NOT_IDENTICAL;
	if(!vali.email(data.email))err = str.INVALID_EMAIL;
	if(!err)
		dbutils.findUsernameOrEmail(data.login, data.email, function(result, whatExists){
			if(!result){
				dbutils.addUser(data.login, data.pwd, false, data.email, function(result, activationCode){
					activatorMail(data.email, activationCode, data.username);
					showProfile(req, res, str.VER_EMAIL_SENT + fs.readFileSync('activationForm.html'), 0);
				});
			}else{
				showProfile(req, res, whatExists == 1 ? str.USERNAME_EXISTS : str.EMAIL_EXISTS, 1);
			};
		});
	else{
		showProfile(req, res, err, 1);
	};
});

app.post('/login', function(req, res){
	var data = req.post;
	dbutils.getUser(data.login, data.pwd, function(result){
		if(result && !result.resetPwdSent){
			req.session.flush();
			if(result.verified || result.permLevel >= 3){
				req.session.put('username', result.username);
				if(result.pwdMustChange){
					req.session.flash('userId', result._id);//keep only for next request
					req.session.flash('deprived', true);
					showProfile(req, res, str.PWD_MUST_CHANGE + '\n' + fs.readFileSync('resetPwdForm.html'), 0)
				}else{
					req.session.put('userId', result._id);//having key userId in the session object means logged user
					if(result.permLevel >= 3)req.session.put('op', true);
					showProfile(req, res, str.LOGGED_ID + req.session.get('userId'));//start session for a logged user
				};
			}else{
				showProfile(req, res, str.ACC_NOT_VERIFIED + fs.readFileSync('resendEmailForm.html').toString().replace('##_id', result._id));
			};
		}else{
			showProfile(req, res, str.INV_CREDENTIALS);
		};
	});
});

app.post('/changePassword', function(req, res){
	if(isSuppUser(req)){
		var data = req.post;
		var err;
		if(!vali.password(data.new1))err = str.WEAK_PWD;
		if(!err){
			dbutils.setUserPassword(req.session.get('userId'), data.current, data.new1, function(result){
				if(result){
					showProfile(req, res, str.PWD_CHNG_DONE, 2);
				}else{
					showProfile(req, res, str.WRONG_PWD, 2);
				};
			});
		}else{
			showProfile(req, res, err, 2);
		};
	}else next();
});

app.route('/resendEmail')
	.post(function(req, res){
		var data = req.post;
		var err;
		if(!vali.email(data.email))err = 'Niepoprawny e-mail';
		if(!err)
			dbutils.getUserById(data._id, function(result){
				if(result){
					if(!result.verified){
						if(!result.activationLinkSent){
							if(result.activationCode){
								if(!result.email || result.email != data.email){
									dbutils.findUsernameOrEmail(0, data.email, (found) => {
										if(!found){
											dbutils.setUserMeta(result._id, {email: data.email});
											activatorMail(data.email, result.activationCode, result.username, function(err, info){
												dbutils.setUserMeta(result._id,{activationLinkSent: true});
											});
											showProfile(req, res, str.VER_EMAIL_SENT + fs.readFileSync('activationForm.html'), 0);
										}else{
											showProfile(req, res, str.EMAIL_EXISTS + resendEmailForm(result._id), 0);
										};
									});
								}else{
									activatorMail(data.email, result.activationCode, result.username, function(err, info){
										dbutils.setUserMeta(result._id,{activationLinkSent: true});
									});
									showProfile(req, res, str.VER_EMAIL_SENT + fs.readFileSync('activationForm.html'), 0);
								};
							}else{
								dbutils.addUserTail(result._id);
								showProfile(req, res, str.ERR_TRY_AGAIN + resendEmailForm(result._id), 0);
							};
						}else{
							showProfile(req, res, str.VER_EMAIL_QUOTA_EXCEEDED, 0);
						};
					}else{
						showProfile(req, res, str.ACC_ALREADY_VERIFIED, 0);
					};
				}else{
					showProfile(req, res, str.ACC_NOT_EXISTS, 0);
				};
			});
		else{
			showProfile(req, res, err, 0);
		};
	})
	.get(function(req, res){
		showProfile(req, res, fs.readFileSync('activationForm.html'), 0);
	});

app.get('/activate', function(req, res){
	var data = qs.parse(req.url.slice(req.url.indexOf('?') + 1));
	dbutils.getUserActivatable(data.a || '', function(result){
		if(result){
			dbutils.setUserMeta(result._id,{verified: true});
			dbutils.flushUserCodes(result._id);
			showProfile(req, res, str.ACC_VER_DONE, 0);
		}else{
			showProfile(req, res, str.WRONG_VER_CODE + fs.readFileSync('activationForm.html'), 0);
		};
	});
});

app.route('/forgotPassword')
	.post(function(req, res){
		var data = req.post;
		if(data.login && data.email){
			dbutils.getUserByMeta({username: data.login, email: data.email}, function(result){
				if(result){
					if(result.resetPwdCode){
						resetPwdMail(data.email, result.resetPwdCode, data.login, function(err, info){
							dbutils.setUserMeta(result._id, {resetPwdSent: true});
						});
						showProfile(req, res, str.VER_EMAIL_SENT + fs.readFileSync('activationForm.html').toString().replace('activate', 'resetPassword'), 2);
					}else{
						dbutils.addUserTail(result._id);
						showProfile(req, res, str.ERR_TRY_AGAIN, 2);
					};
				}else{
					showProfile(req, res, str.ACC_NOT_EXISTS, 2);
				};
			})
		}else
			showProfile(req, res, str.ACC_NOT_EXISTS, 2);
	})
	.get(function(req, res){
		showProfile(req, res, fs.readFileSync('activationForm.html').toString().replace('activate', 'resetPassword'), 2);
	})
	
app.route('/resetPassword')
	.post(function(req, res){
		var data = req.post;
		var err;
		if(!vali.password(data.pwd1))err = str.WEAK_PWD;
		if(data.pwd1 != data.pwd2)err = str.PWD_NOT_IDENTICAL;
		if(!err){
			dbutils.getUserById(req.session.get('userId'), function(result){
				if(result){
					if(dbutils.verify(data.pwd1, result.password)){
						req.session.reflash();
						showProfile(req, res, str.PWD_IDENTICAL + '\n' + fs.readFileSync('resetPwdForm.html'), 0);
					}else{
						req.session.forget('deprived');
						dbutils.setUserMeta(result._id, {resetPwdSent: false, pwdMustChange: false});
						dbutils.setUserPasswordNosec(result._id, data.pwd1);
						dbutils.flushUserCodes(result._id);
						showProfile(req, res, str.PWD_CHNG_DONE, 0);
					};
				}else{
					showProfile(req, res, str.ACC_NOT_EXISTS + '\n' + fs.readFileSync('resetPwdForm.html'), 2);
				};
			});
		}else{
			req.session.reflash();
			showProfile(req, res, err + '\n' + fs.readFileSync('resetPwdForm.html'), 2);
		};
	})
	.get(function(req, res){
		var data = qs.parse(req.url.slice(req.url.indexOf('?') + 1));
		dbutils.getUserByMeta({resetPwdCode: data.a, resetPwdSent: true},function(result){
			if(result){
				req.session.flash('userId', result._id);
				req.session.flash('deprived', true);
				showProfile(req, res, str.SET_PWD + fs.readFileSync('resetPwdForm.html'), 2);
			}else{
				showProfile(req, res, str.INV_VER_CODE + fs.readFileSync('activationForm.html').toString().replace('activate', 'resetPassword'), 2);
			};
		});
	})
	
app.post('/newAccount', function(req, res, next){
	if(req.session.has('op')){
		var data = req.post;
		var err;
		if(!vali.username(data.username))err = str.INV_USERNAME;
		if(!vali.password(data.password))err = str.INV_PWD;
		if(!vali.email(data.email))err = str.INV_EMAIL + data.email;
		if(!err)
			dbutils.addUser(data.username, data.password, data.op, data.email, function(result){
				showProfile(req, res, str.ACC_ADDED, 1);
			});
		else showProfile(req, res, err, 1);
	}else next();
});

app.post('/setAccount', function(req, res, next){
	if(req.session.has('op')){
		var data = req.post;
		if(data.pwdMustChange)//value = 'on' if specified
			dbutils.setUserMeta(data._id, {pwdMustChange: true});
		else
			dbutils.setUserMeta(data._id, {pwdMustChange: false});
		dbutils.setUser(data._id, data.username, data.email, data.op, function(result){
			showProfile(req, res, "Zapisano.", 1);
		});
	}else next();
});

app.post('/removeAccount', function(req, res, next){
	if(req.session.has('op')){
		dbutils.delUser(req.post._id, function(r1, r2){
			showProfile(req, res, "Usunięto konto oraz " + r1.result.n + " artykułów przypisanych do konta.", 1);
		});
	}else next();
});

app.post('/query', function(req, res, next){
	if(req.session.has('op')){
		dbutils.rawQuery(req.post.query, function(err, result, cols){
			if(err)
				showProfile(req, res, "Wystąpił bląd:\n<br>" + req.post.query + '<br>\n==========\n<br>' + err, 1);
			else
				showProfile(req, res, "Zapytanie wykonano pomyslnie:\n<br>" + req.post.query + '<br>\n==========\n<br>' + JSON.stringify(result || '') + '<br>\n==========\n<br>' + JSON.stringify(cols || ''), 1);
		});
	}else next();
});

app.post('/newArticle', function(req, res, next){
	if(isSuppUser(req)){
		var data = req.post;
		var err;
		if(!vali.title(data.title))err = str.INV_TITLE;
		if(!vali.date(data.date))err = str.INV_DATE;
		if(!err)
			dbutils.addArticle(data.title, data.text, data.date, req.session.get('userId'), function(result){
				showProfile(req, res, str.ART_ADDED, 1);
			});
		else showProfile(req, res, err, 1);
	}else next();
});

app.post('/setArticle', function(req, res, next){
	if(isSuppUser(req)){
		var data = req.post;
		dbutils.setArticle(data._id, data.title, data.text, data.date, req.session.get('userId'), function(result){
			showProfile(req, res, result ? str.SAVED : str.ERR, 1);
		});
	}else next();
});

app.post('/removeArticle', function(req, res, next){
	if(isSuppUser(req)){
		var data = req.body;
		dbutils.delArticle(data._id, req.session.get('userId'), function(result){
			showProfile(req, res, result ? str.DELETED : str.ERR, 1);
		});
	}else next();
});
	
app.post('/dataModify', function(req, res){
	try{
		var data = JSON.parse(req.postRaw);
		var out = dbutils.valiData(data);
		if(out == true){
			var fd = fs.openSync("userdata.txt","w");//write data to the file if good
			fs.write(fd, body, (err, bytes, buff) => {
				if(err)throw err;
				fs.close(fd, (err) => {
					if(err)throw err;
					res.writeHead(200, {'Content-Type': 'text/JSON'});
					res.write(body);
				});
			});
		}else{
			console.log("Bad data");
			res.writeHead(400, {'Content-Type': 'text/plain'});
			res.end("Invalid JSON variant: " + out);
		};
	}catch(err){
		console.log(err);
		res.writeHead(500, {'Content-Type': 'text/plain'});
		res.end("Internal server error");
	};
});

app.use(function (req, res) {
	res.status(404).sendFile(__dirname + '/htdocs/static/err404.html');
});

app.listen(8080, function(){
	console.log('Listening on *:8080');
});

console.log(myIp);