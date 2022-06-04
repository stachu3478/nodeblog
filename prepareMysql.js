var mysql = require('mysql');
var fs = require('fs');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
});

var con1 = mysql.createConnection({
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

var kodek = function(bytes){
	var rand = crypto.randomBytes(bytes).toString('utf-8');
	var readable = '';
	for(var i = 0; i < rand.length; i++){
		readable += abcs[rand.charCodeAt(i) % abcs.length];
	};
	return readable;
};

var queries = fs.readFileSync('./manageTools/sql/boot.sql').toString().split(';');
var done = 0;
var semi = ';';

con.connect(function(err){
	if(err)throw err;
	console.log("Connected!");
	con.query('CREATE DATABASE IF NOT EXISTS blogmaster', function (err, result) {
		con.end();
		
		if (err) throw err;
		console.log("Database created");
		con1.connect(function(err) {
			if (err) throw err;
			console.log("Connected to database!");
			con1.query(queries[0] + semi, function (err, result) {
				if (err) throw err;
				console.log("Table accounts created.");
				con1.query(queries[2] + semi, [hashPwd('admin'), kodek(32)], function (err, result) {
					if (err) throw err;
					console.log("Account inserted");
					done++;
					if(done==2)con1.end();
				});
			});
			con1.query(queries[1] + semi, function (err, result) {
				if (err) throw err;
				console.log("Table articles created.");
				con1.query(queries[3] + semi, function (err, result) {
					if (err) throw err;
					console.log("Article inserted");
					done++;
					if(done==2)con1.end();
				});
			});
		});
	});
});