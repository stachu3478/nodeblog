var mysql = require('mysql');
var fs = require('fs');

var con1 = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: 'blogmaster',
});

var queries = fs.readFileSync('./manageTools/sql/allData.sql').toString().split(';');
var done = 0;
var semi = ';';

con1.connect(function(err) {
	if (err) throw err;
	console.log("Connected to database!");
	con1.query(queries[0] + semi, function (err, result) {
		if (err) throw err;
		console.log(result);
		done++;
		if(done==2)con1.end();
	});
	con1.query(queries[1] + semi, function (err, result) {
		if (err) throw err;
		console.log(result);
		done++;
		if(done==2)con1.end();
	});
});