var mysql = require('mysql');
var fs = require('fs');

var con1 = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: 'blogmaster',
});

con1.connect(function(err){
	if(err)throw err;
	console.log("Connected!");
	con1.query(fs.readFileSync('./manageTools/sql/update.sql').toString(), function (err, result) {
		con1.end();
		
		if (err) throw err;
	});
});