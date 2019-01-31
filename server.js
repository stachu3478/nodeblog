var fs = require('fs'); //file system api
var qs = require('querystring'); // for parsing post requests

var express = require('express');
var app = express(); // express

var myIp = require('ip').address(); // getting address for making activation and reset password links

var sessionOb = require('node-session');
var session = new sessionOb({secret: "Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD"}); // session system

var tArgs = process.argv.slice(2); // environment values

var dbutils = new require('./mods/mysqlutils.js').Util(fs, tArgs[tArgs.indexOf('-leftsalt') + 1] || '', tArgs[tArgs.indexOf('-rightsalt') + 1] || ''); // database querries
// use -leftsalt <leftsalt> -rightsalt <rightsalt> as arguments
var vali = require('./mods/vali.js'); // validation methods
var strConsts = require('./mods/strMan.js'); // const strings

var mailer = require('nodemailer'); // load mailing service for account verification
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

var cfg = JSON.parse(fs.readFileSync('mods/config.json')); // load server configuration

String.prototype.replaceSync = function(...reps){ //replaces string without replacing strings that are already replaced 
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
function activatorMail(to, link, username, callback = () => {}){ //sends email with an activation link
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

function resetPwdMail(to, link, username, callback = () => {}){ //sends email with an reset password link
	var options = {
		from: 'articlesystem3000services@gmail.com',
		to: to,
		subject: 'System kont z bazą danych i ze wszystkim itd.',
		html: fs.readFileSync('resetPwdMail.html').toString().replaceSync('##username', username, '##link', 'http://' + myIp + ':' + (process.env.PORT || 8080) + '/resetPassword?a=' + qs.stringify(link), '##code', link),
	};
	client.sendMail(options, (err, info) => {
		if(err)throw err;
		callback(err, info);
		console.log('E-mail wysłany: ' + info.response);
	});
};

function dateFormat(date){//formats valid date string to y-mm-dd
	var date = new Date(date);
	if(date){
		var m = (date.getMonth() + 1).toString();
		var d = date.getDate().toString();
		return date.getFullYear() + '-' + (m.length == 1 ? 0 + m : m) + '-' + (d.length == 1 ? 0 + d : d);
	};
};

function isDecayed(date){ //checks if the password change time is longer than it should be
	var then = new Date(date).getTime();
	var now = Date.now();
	return now - then > cfg.pwdFresh;
};

function resendEmailForm(userId){ //returns a form that allows you to resend activation email
	return fs.readFileSync('resendEmailForm.html').toString().replace('##_id', userId);
};

function resetPasswordForm(){ //returns a form that allows you to reset password through email
	return fs.readFileSync('activationForm.html').toString().replace('activate', 'resetPassword');
};

function loadArticle(file){ //loads an article packet from a file
	var sContent = fs.readFileSync("articleContent.html");
	var aContent = fs.readFileSync(file);
	var qb1 = aContent.indexOf("["), qb2 = aContent.indexOf("]"), cb1 = aContent.indexOf("("), cb2 = aContent.indexOf(")");
	var title = aContent.slice(qb1 + 1, qb2);
	var strDate = aContent.slice(cb1 + 1, cb2);
	var strText = aContent.slice(Math.max(qb1, qb2, cb1, cb2) + 1);
	return sContent.toString().replaceSync("##title", title, "##main", strText, "##date", strDate);
};

function getArticles(){ //returns all articles in an array
	var list = fs.readdirSync("articles");
	var arts = [];
	for(var i = 0; i < list.length; i++){
		arts.push(loadArticle("articles/" + list[i]));
	};
	return arts;
};

function appendFile(name, data, callback = () => {}){
	var fd = fs.openSync(name, "w");//write data to the file if good
	fs.write(fd, data, (err, bytes, buff) => {
		if(err)throw err;
		fs.close(fd, (err) => {
			if(err)throw err;
			callback();
		});
	});
};

function showProfile(req, res, outStr = '', naglowek = 0, callback = () => {}){ //shows different panels and forms depending on user data (op, deprived)
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
		panelHTML = fs.readFileSync(file2).toString().replace('##pwdFresh', cfg.pwdFresh / 3600000);
		dbutils.getTable(table, function(result){
			for(var i = 0; i < result.length; i++){
				var ob = result[i];
				if(op){
					theList += file3.replaceSync('##_id', ob._id, '##username', ob.username, '##email', ob.email, '##op', (ob.permLevel >= 3) ? 'checked' : '', '##pwdMustChange', ob.pwdMustChange ? 'checked' : '');
				}else if(ob.authorId.toString() == userId.toString()){
					theList += file3.replaceSync('##_id', ob._id, '##title', ob.title, '##text', ob.text, '##date', dateFormat(ob.publishDate))
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

function isSuppUser(req){ //checks if an user is allowed to do stuff
	return req.session.has('userId') && !req.session.has('deprived');
};

app.use(function(req, res, next){ //redirects '/' to '/index.html'
	if(req.url == "/"){
        req.url += "index.html";
    };
	var lang = req.headers['accept-language'];
	if(lang && (lang.indexOf('pl-PL;') || 127) < (lang.indexOf('en-US;') || 127)){ //handle preferred language
		req.s = strConsts.pl;
		req.lang = 'pl';
	}else{
		req.s = strConsts.en;
		req.lang = 'en';
	};
	next();
});

app.use(express.static('htdocs/static')); //use this folder for styles images etc.

app.get('/index.html', function(req, res){ //site with old version articles
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

app.get('/dataGet', function(req, res){ //JSON service - get
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

app.get('/nowy_system.html', function(req, res){ //site with new version articles
	var std = fs.readFileSync("htdocs/index.html");
	dbutils.getNewArticles(function(list){
		res.write(std.toString().replace('##articles', list));
		res.end();
	});
});

app.use(function(req, res, next){ //variables stored in the session are stored below
	session.startSession(req, res, (err) => {
		if(err)throw err;
		
		next();
	})
});

app.get('/profil.html', function(req, res){ //profile linking
	showProfile(req, res);
});

app.use('/logout', function(req, res){ //destroys user session
	var _id = req.session.has('userId');
	req.session.flush();
	if(_id)
		showProfile(req, res, req.s.LOGGED_OUT);
	else
		showProfile(req, res, req.s.NOT_LOGGED_IN);
	res.end();
});

app.use(function(req, res, next){ //collects data from POST and stores in req.post
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

app.post('/register', function(req, res){ //handle registration data
	var data = req.post;
	var err;
	if(!vali.username(data.login))err = req.s.INVALID_USERNAME;
	if(!vali.password(data.pwd))err = req.s.WEAK_PWD;
	if(data.pwd != data.pwd2)err = req.s.PWD_NOT_IDENTICAL;
	if(!vali.email(data.email))err = req.s.INVALID_EMAIL;
	if(err)
		showProfile(req, res, err, 1);
	else dbutils.findUsernameOrEmail(data.login, data.email, function(result, whatExists){
		if(result){
			showProfile(req, res, whatExists == 1 ? req.s.USERNAME_EXISTS : req.s.EMAIL_EXISTS, 1);
		}else dbutils.addUser(data.login, data.pwd, false, data.email, function(result, activationCode){
			activatorMail(data.email, activationCode, data.username);
			showProfile(req, res, req.s.VER_EMAIL_SENT + fs.readFileSync('activationForm.html'), 0);
		});
	});
});

app.post('/login', function(req, res){ //handle login form
	var data = req.post;
	dbutils.getUser(data.login, data.pwd, function(result){
		if(result && !result.resetPwdSent){
			req.session.flush();
			if(result.verified || result.permLevel >= 3){
				req.session.put('username', result.username);
				req.session.put('accountCreation', result.accountCreation);
				if(result.permLevel >= 3)req.session.put('op', true);
				if((result.pwdMustChange || isDecayed(result.pwdChange)) && result.permLevel < 3){
					req.session.flash('userId', result._id);//keep only for next request
					req.session.flash('deprived', true);
					showProfile(req, res, req.s.PWD_MUST_CHANGE + '\n' + fs.readFileSync('resetPwdForm.html'), 0)
				}else{
					req.session.put('userId', result._id);//having key userId in the session object means logged user
					showProfile(req, res, req.s.LOGGED_ID + req.session.get('userId'));//start session for a logged user
				};
			}else{
				showProfile(req, res, req.s.ACC_NOT_VERIFIED + fs.readFileSync('resendEmailForm.html').toString().replace('##_id', result._id));
			};
		}else{
			showProfile(req, res, req.s.INV_CREDENTIALS);
		};
	});
});

app.post('/changePassword', function(req, res){ //handle changing password form
	if(isSuppUser(req)){
		var data = req.post;
		var err;
		if(!vali.password(data.new1))err = req.s.WEAK_PWD;
		if(err){
			showProfile(req, res, err, 2);
		}else dbutils.setUserPassword(req.session.get('userId'), data.current, data.new1, function(result){
			if(result){
				showProfile(req, res, req.s.PWD_CHNG_DONE, 2);
			}else{
				showProfile(req, res, req.s.WRONG_PWD, 2);
			};
		});
	}else next();
});

app.route('/resendEmail') //handle form providing resending emails
	.post(function(req, res){
		var data = req.post;
		var err;
		if(!vali.email(data.email))err = 'Niepoprawny e-mail';
		if(err){
			showProfile(req, res, err, 0);
		}else dbutils.getUserById(data._id, function(result){
			if(!result){
				showProfile(req, res, req.s.ACC_NOT_EXISTS, 0);
			}else if(result.verified){
				showProfile(req, res, req.s.ACC_ALREADY_VERIFIED, 0);
			}else if(result.activationLinkSent){
				showProfile(req, res, req.s.VER_EMAIL_QUOTA_EXCEEDED, 0);
			}else if(!result.activationCode){
				dbutils.addUserTail(result._id);
				showProfile(req, res, req.s.ERR_TRY_AGAIN + resendEmailForm(result._id), 0);
			}else if(result.email || result.email == data.email){
				activatorMail(data.email, result.activationCode, result.username, function(err, info){
					dbutils.setUserMeta(result._id,{activationLinkSent: true});
				});
				showProfile(req, res, req.s.VER_EMAIL_SENT + fs.readFileSync('activationForm.html'), 0);
			}else dbutils.findUsernameOrEmail(0, data.email, (found) => {
				if(!found){
					dbutils.setUserMeta(result._id, {email: data.email});
					activatorMail(data.email, result.activationCode, result.username, function(err, info){
						dbutils.setUserMeta(result._id,{activationLinkSent: true});
					});
					showProfile(req, res, req.s.VER_EMAIL_SENT + fs.readFileSync('activationForm.html'), 0);
				}else{
					showProfile(req, res, req.s.EMAIL_EXISTS + resendEmailForm(result._id), 0);
				};
			});
		});
	})
	.get(function(req, res){ //if an user got the activation code
		showProfile(req, res, fs.readFileSync('activationForm.html'), 0);
	});

app.get('/activate', function(req, res){ //handle activation code
	var data = qs.parse(req.url.slice(req.url.indexOf('?') + 1));
	dbutils.getUserActivatable(data.a || '', function(result){
		if(result){
			dbutils.setUserMeta(result._id,{verified: true});
			dbutils.flushUserCodes(result._id);
			showProfile(req, res, req.s.ACC_VER_DONE, 0);
		}else{
			showProfile(req, res, req.s.WRONG_VER_CODE + fs.readFileSync('activationForm.html'), 0);
		};
	});
});

app.route('/forgotPassword') 
	.post(function(req, res){ //handle email data to send to
		var data = req.post;
		if(!(data.login && data.email)){
			showProfile(req, res, req.s.ACC_NOT_EXISTS, 2);
		}else dbutils.getUserByMeta({username: data.login, email: data.email}, function(result){
			if(!result){
				showProfile(req, res, req.s.ACC_NOT_EXISTS, 2);
			}else if(result.resetPwdCode){
				resetPwdMail(data.email, result.resetPwdCode, data.login, function(err, info){
					dbutils.setUserMeta(result._id, {resetPwdSent: true});
				});
				showProfile(req, res, req.s.VER_EMAIL_SENT + resetPasswordForm(), 2);
			}else{
				dbutils.addUserTail(result._id);
				showProfile(req, res, req.s.ERR_TRY_AGAIN, 2);
			};
		})
	})
	.get(function(req, res){ //clicks on 'Forgot Password'
		showProfile(req, res, resetPasswordForm(), 2);
	})
	
app.route('/resetPassword')
	.post(function(req, res){ // handle new password that has to be set
		var data = req.post;
		var uid = req.session.get('userId');
		var err;
		if(!vali.password(data.pwd1))err = req.s.WEAK_PWD;
		if(data.pwd1 != data.pwd2)err = req.s.PWD_NOT_IDENTICAL;
		if(err){
			req.session.reflash();
			showProfile(req, res, err + '\n' + fs.readFileSync('resetPwdForm.html'), 2);
		}else if(!uid){
			showProfile(req, res, req.s.ACC_NOT_EXISTS, 0);
		}else dbutils.getUserById(uid, function(result){
			if(!result){
				showProfile(req, res, req.s.ACC_NOT_EXISTS, 0);
			}else if(dbutils.verify(data.pwd1, result.password)){
				req.session.reflash();
				showProfile(req, res, req.s.PWD_IDENTICAL + '\n' + fs.readFileSync('resetPwdForm.html'), 0);
			}else{
				req.session.forget('deprived');
				req.session.put('userId', result._id);
				dbutils.setUserMeta(result._id, {resetPwdSent: false, pwdMustChange: false});
				dbutils.setUserPasswordNosec(result._id, data.pwd1);
				dbutils.flushUserCodes(result._id);
				showProfile(req, res, req.s.PWD_CHNG_DONE, 0);
			};
		});
	})
	.get(function(req, res){ // handle code that resets password
		var data = qs.parse(req.url.slice(req.url.indexOf('?') + 1));
		dbutils.getUserByMeta({resetPwdCode: data.a, resetPwdSent: true},function(result){
			if(result){
				req.session.flash('userId', result._id);
				req.session.flash('deprived', true);
				showProfile(req, res, req.s.SET_PWD + fs.readFileSync('resetPwdForm.html'), 2);
			}else{
				showProfile(req, res, req.s.INV_VER_CODE + resetPasswordForm(), 2);
			};
		});
	})
	
app.post('/newAccount', function(req, res, next){ // adding account from admin side - no emails sent
	if(req.session.has('op')){
		var data = req.post;
		var err;
		if(!vali.username(data.username))err = req.s.INV_USERNAME;
		if(!vali.password(data.password))err = req.s.INV_PWD;
		if(!vali.email(data.email))err = req.s.INV_EMAIL + data.email;
		if(!err)
			dbutils.addUser(data.username, data.password, data.op, data.email, function(result){
				showProfile(req, res, req.s.ACC_ADDED, 1);
			});
		else showProfile(req, res, err, 1);
	}else next();
});

app.post('/setAccount', function(req, res, next){ // setting account by admin
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

app.post('/removeAccount', function(req, res, next){ // removing account by admin
	if(!req.session.has('op'))
		next();
	else dbutils.delUser(req.post._id, function(r1, r2){
		showProfile(req, res, req.s.DEL_ACC_ART.replace('##n', r1.affectedRows), 1);
	});
});

app.post('/query', function(req, res, next){ // execute an sql code sent by admin
	if(!req.session.has('op'))
		next()
	else dbutils.rawQuery(req.post.query, function(err, result, cols){
		if(err)
			showProfile(req, res, req.s.ERR + ":\n<br>" + req.post.query + '<br>\n==========\n<br>' + err, 1);
		else
			showProfile(req, res, req.s.SQL_OK + "\n<br>" + req.post.query + '<br>\n==========\n<br>' + JSON.stringify(result || '') + '<br>\n==========\n<br>' + JSON.stringify(cols || ''), 1);
	});
});

app.post('/setConfig', function(req, res, next){ // sets server configuration - currently only time of password decay
	if(!req.session.has('op'))
		next()
	else if(req.post.pwdChange){
		cfg.pwdFresh = {d: 86400000, h: 3600000, m: 60000}[req.post.type] * req.post.pwdChange;
		appendFile('mods/config.json', JSON.stringify(cfg), function(){
			showProfile(req, res, req.s.CFG_OK);
		});
	}else{
		showProfile(req, res, req.s.INV_VAL);
	};
});

app.post('/newArticle', function(req, res, next){ // posting article by client
	if(isSuppUser(req)){
		var data = req.post;
		var err;
		console.log(new Date(req.session.get('accountCreation')));
		console.log(new Date(data.date));
		if(!vali.title(data.title))err = req.s.INV_TITLE;
		else if(!vali.date(data.date))err = req.s.INV_DATE;
		else if(new Date(req.session.get('accountCreation')).getTime() > new Date(data.date).getTime())err = req.s.DATE_OUT;
		if(!err)
			dbutils.addArticle(data.title, data.text, data.date, req.session.get('userId'), function(result){
				showProfile(req, res, req.s.ART_ADDED, 1);
			});
		else showProfile(req, res, err, 1);
	}else next();
});

app.post('/setArticle', function(req, res, next){ // setting article by client
	if(isSuppUser(req)){
		var data = req.post;
		var err;
		if(!vali.title(data.title))err = req.s.INV_TITLE;
		else if(!vali.date(data.date))err = req.s.INV_DATE;
		else if(new Date(req.session.get('accountCreation')).getTime() > new Date(data.date).getTime())err = req.s.DATE_OUT;
		if(!err)
			dbutils.setArticle(data._id, data.title, data.text, data.date, req.session.get('userId'), function(result){
				showProfile(req, res, result ? req.s.SAVED : req.s.ERR, 1);
			});
		else showProfile(req, res, err, 1);
	}else next();
});

app.post('/removeArticle', function(req, res, next){ // removing article by client
	if(isSuppUser(req)){
		var data = req.post;
		dbutils.delArticle(data._id, req.session.get('userId'), function(result){
			showProfile(req, res, result ? req.s.DELETED : req.s.ERR, 1);
		});
	}else next();
});
	
app.post('/dataModify', function(req, res){ // JSON service - validate and set data
	try{
		var data = JSON.parse(req.postRaw);
		var out = dbutils.valiData(data);
		if(out == true){
			appendFile('userdata.txt', req.post.body, function(){
				res.writeHead(200, {'Content-Type': 'text/JSON'});
				res.end(req.post.body);
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

app.use(function (req, res) { // handle 404 errors
	res.status(404).sendFile(__dirname + '/htdocs/static/err404.html');
});

app.listen(8088, function(){ // listening
	console.log('Listening on *:8088');
});

console.log(cfg);
