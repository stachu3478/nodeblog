var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var BSON = require('bson');

var sessionOb = require('node-session');
var session = new sessionOb({secret: "Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD"});

var mongo = require('mongodb');
var mongodb = mongo.MongoClient;
var dbURL = "mongodb://localhost:27017/blogmaster";


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

function getNewArticles(callback){
	var sContent = fs.readFileSync("newArticleContent.html");
	var total = '';
	mongodb.connect(dbURL, function(err, db){
		if(err) throw err;
		var dbo = db.db('blogmaster');
		dbo.collection('accounts').find({}).toArray(function(err, result){
			var users = result;
			var usersId = {};
			for(var i = 0; i < users.length; i++){
				usersId[users[i]._id.toString()] = users[i];
			};
			dbo.collection('articles').find({}).toArray(function(err, result){
				if(err)throw err;
				db.close();
				
				var theList = '';
				for(var i = 0; i < result.length; i++){
					var ob = result[i];
					
					theList += sContent.toString().replaceSync('##title', ob.title, '##main', ob.text, '##date', ob.publishDate, '##author', usersId[ob.authorId.toString()].username);
				};
				callback(theList);
			});
		});
	});
};

function valiData(data){
	if(data.name.length == 0)return "Wpisz ksywkę";
	if(data.lProg < 0 || data.lProg > 4)return "Za bardzo lubisz programować";
	if(data.slider < 0 || data.slider > 100)return "Urwany uchwyt od ślizgacza!";
	var strs = "mgck";
	for(var i = 0; i < strs.length; i++){
		if(typeof data.z[strs[i]] != "boolean")return "Musisz powiedzieć jakie masz zainteresowania";
	};
	var edus = "ptsn";
	if(edus.indexOf(data.edu) == -1 || data.edu.length != 1)return "Niewłaściwy etap edukacji";
	var color = parseInt("0x" + data.color.slice(1));
	if(data.color[0] != "#" || color < 0 && color > 16777215)return "Twój ulubiony kolor rozwala nasz serwer, wybierz inny";
	if(typeof parseInt(data.num) != "number")return "Twoja ulubiona liczba powinna być wymierna.";
	
	return true;
};

function getPost(req, callback){
	var body = '';
	req.on('data', chunk => {
		body += chunk.toString(); // convert Buffer to string
	});
	req.on('end', () => {
		callback(body);
	});
};

function showProfile(req, res, callback = () => {}){
	var file1, file2, file3;
	var panelHTML = '';
	var userId = req.session.get('userId');
	var data = fs.readFileSync('htdocs/profil.html');
	if(req.session && req.session.has('userId')){
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
		mongodb.connect(dbURL, function(err, db){
			if(err) throw err;
			var dbo = db.db('blogmaster');
			dbo.collection(table).find({}).toArray(function(err, result){
				db.close();
				
				for(var i = 0; i < result.length; i++){
					var ob = result[i];
					if(err)throw err;
					if(op){
						theList += file3.replaceSync('##_id', ob._id, '##username', ob.username, '##password', ob.password, '##op', (ob.permLevel >= 3) ? 'checked' : '');
					}else if(ob.authorId.toString() == userId.toString()){
						theList += file3.replaceSync('##_id', ob._id, '##title', ob.title, '##text', ob.text, '##date', ob.publishDate)
					};
				};
				res.write(data.toString().replace('##main', mainHTML.replace('##panel', panelHTML.replace('##list',theList))));
				callback();
				res.end();
			});
		});
	}else{
		var mainHTML = fs.readFileSync('htdocs/loginForm.html').toString();
		res.write(data.toString().replace('##main', mainHTML));
		callback();
		res.end();
	};
};

http.createServer(function(req, res){
    var url = req.url;
    if(url == "/"){
        url += "index.html";
    };
    var sciezka = "htdocs" + url;
	switch(url){
		case '/dataModify': {
			if(req.method == "POST"){
				let body = '';
				req.on('data', chunk => {
					body += chunk.toString(); // convert Buffer to string
				});
				req.on('end', () => {
					console.log(body);
					try{
						var data = JSON.parse(body);
						var out = valiData(data);
						if(out == true){
							var fd = fs.openSync("userdata.txt","w");//write data to the file if good
							fs.write(fd, body, (err, bytes, buff) => {
								if(err)throw err;
								fs.close(fd, (err) => {
									if(err)throw err;
									res.writeHead(200);
									res.write(body);
									res.end();
								});
							});
						}else{
							console.log("Bad data");
							res.writeHead(506);
							res.end("Invalid JSON variant: " + out);
						};
					}catch(err){
						console.log(err);
						res.writeHead(500);
						res.end("Internal server error");
					};
				});
			};
		};break;
		case "/dataGet": {
			if(req.method == "GET"){
				if(fs.existsSync("userdata.txt")){
					var data = fs.readFileSync("userdata.txt");
					res.write(data);
					res.end();
				}else{
					res.writeHead(404);
					res.write("Data not found.");
					res.end();
				};
			};break;
		};
		case "/profil.html":{
			session.startSession(req, res, (err) => {
				showProfile(req, res);
			});
		};break;
		case "/login": {
			if(req.method == "POST"){
				var body = '';
				req.on('data', chunk => {
					body += chunk;
				});
				req.on('end', () => {
					console.log(body);
					var data = qs.parse(body);
					mongodb.connect(dbURL, function(err, db){
						if(err)throw err;
						dbo = db.db("blogmaster");
						dbo.collection("accounts").findOne({username: data.login, password: data.pwd}, function(err, result){
							if(result){
								session.startSession(req, res, (err) => {
									if(err)throw err;
									req.session.put('userId', result._id);//having key userId in the session object means logged user
									if(result.permLevel >= 3)req.session.put('op', true);
									db.close();
									
									showProfile(req, res, function(){
										res.write("Zalogovano. Identyfikator: " + req.session.get('userId'));
									});
								})//start session for a logged user
							}else{
								db.close();
								
								session.startSession(req, res, (err) => {
									showProfile(req, res, function(){
										res.write("Błędne hasło lub login.");
									});
								});
							};
						});
					});
				});
			};
		};break;
		case "/newAccount":{
			session.startSession(req, res, (err) => {
				if(req.method == "POST" && req.session.has('op')){
					getPost(req, function(str){
						var data = qs.parse(str);
							mongodb.connect(dbURL, function(err, db){
							if(err)throw err;
							dbo = db.db("blogmaster");
							dbo.collection("accounts").insertOne({username: data.username, password: data.password, permLevel: (data.op ? 3 : 1)}, function(err, result){
								if(err)throw err;
								db.close();
								showProfile(req, res, function(){
									res.write("Dodano nowe konto.");
								});
							});
						});
					});
				}else{
					res.writeHead(501);
					res.write('null');
				};
			});
		};break;
		case "/setAccount":{
			session.startSession(req, res, (err) => {
				if(req.method == "POST" && req.session.has('op')){
					getPost(req, function(str){
						var data = qs.parse(str);
							mongodb.connect(dbURL, function(err, db){
							if(err)throw err;
							dbo = db.db("blogmaster");
							dbo.collection("accounts").updateOne({_id: new mongo.ObjectID(data._id)}, {$set: {username: data.username, password: data.password, permLevel: (data.op ? 3 : 1)}}, function(err, result){
								if(err)throw err;
								db.close();
								showProfile(req, res, function(){
									res.write("Zapisano.");
								});
							});
						});
					});
				};
			});
		};break;
		case "/removeAccount":{
			session.startSession(req, res, (err) => {
				if(req.method == "POST" && req.session.has('op')){
					getPost(req, function(str){
						var data = qs.parse(str);
							mongodb.connect(dbURL, function(err, db){
							if(err)throw err;
							dbo = db.db("blogmaster");
							dbo.collection("accounts").deleteOne({_id: new mongo.ObjectID(data._id)}, function(err, result){
								if(err)throw err;
								db.close();
								showProfile(req, res, function(){
									res.write("Usunięto.");
								});
							});
						});
					});
				};
			});
		};break;
		case "/newArticle":{
			session.startSession(req, res, (err) => {
				if(req.method == "POST" && req.session.has('userId')){
					getPost(req, function(str){
						var data = qs.parse(str);
							mongodb.connect(dbURL, function(err, db){
							if(err)throw err;
							dbo = db.db("blogmaster");
							dbo.collection("articles").insertOne({title: data.title, text: data.text, publishDate: data.date, authorId: req.session.get('userId')}, function(err, result){
								if(err)throw err;
								db.close();
								showProfile(req, res, function(){
									res.write("Dodano nowy artykuł.");
								});
							});
						});
					});
				};
			});
		};break;
		case "/setArticle":{
			session.startSession(req, res, (err) => {
				if(req.method == "POST" && req.session.has('userId')){
					getPost(req, function(str){
						var data = qs.parse(str);
							mongodb.connect(dbURL, function(err, db){
							if(err)throw err;
							dbo = db.db("blogmaster");
							dbo.collection("articles").updateOne({_id: new mongo.ObjectID(data._id), authorId: req.session.get('userId')}, {$set: {title: data.title, text: data.text, publishDate: data.date}}, function(err, result){
								if(err)throw err;
								db.close();
								showProfile(req, res, function(){
									res.write("Zapisano.");
								});
							});
						});
					});
				};
			});
		};break;
		case "/removeArticle":{
			session.startSession(req, res, (err) => {
				if(req.method == "POST" && req.session.has('userId')){
					getPost(req, function(str){
						var data = qs.parse(str);
							mongodb.connect(dbURL, function(err, db){
							if(err)throw err;
							dbo = db.db("blogmaster");
							dbo.collection("articles").deleteOne({_id: new mongo.ObjectID(data._id), authorId: req.session.get('userId')}, function(err, result){
								if(err)throw err;
								db.close();
								showProfile(req, res, function(){
									res.write("Usunieto.");
								});
							});
						});
					});
				};
			});
		};break;
		case "/logout":{
			session.startSession(req, res, (err) => {
				if(err)throw err;
				req.session.forget('userId');
				req.session.forget('op');
				
				showProfile(req, res, function(){
					res.write("Wylogowano pomyślnie");
				});
			});
		};break;
		case "/nowy_system.html":{
			var std = fs.readFileSync("htdocs/index.html");
			getNewArticles(function(list){
				res.write(std.toString().replace('##articles', list));
				res.end();
			});
		};break;
		default: {
			if(fs.existsSync(sciezka)){
				if(fs.lstatSync(sciezka).isDirectory()){
					var defaultFile = sciezka + "index.html";
					if(fs.existsSync(defaultFile)){
						console.log("Default file " + sciezka);
						fs.readFile(defaultFile, function(err,data){
							res.write(data);
							res.end();
						});
					}else{
						console.log("Unknown default file " + sciezka);
						res.write("Plik nie istnieje 404 :<");
						res.end();
					};
				}else{//system kont z baza danych, kazdy artykul przypisany do autora, ktory moze go edytowac, admin z zarzadzaniem kont,
					console.log(sciezka + "\n");
					if(req.method == "GET"){
						console.log("other one");
						fs.readFile(sciezka,function(err, data){
							var replaces = fs.readFileSync("replaceItems.txt").toString().split("\n");
							replaces = replaces.map(function(a){return eval(a)});
							//res.write(replaces.join("\n"));
							//console.log(replaces.length);
							//res.end();
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
					}else{
						console.log("Unknown request");
						res.writeHead(501);
						res.write("Unknown request");
					};
				};
			}else{
				console.log("Unknown file " + sciezka);
				res.write("Plik nie istnieje 404 :>");
				res.end();
			};
		};break;
	};
}).listen(8080);