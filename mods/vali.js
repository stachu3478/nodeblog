exports.valiData = function(data){
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

exports.email = function(email){
	if(typeof email != 'string')return false;
	var match = email.match(/([\w\d\!#\$%&'\*\+-/=?\^_`\{|\}~]{1,64}|(\"[\w\d\!#\$%&'\*\+-/=?\^_`\.\{|\}~(\\\")\s\(\),:;<>@\[(\\\\)\]]{1,62}\"))@(((\w|\d)(\w|\d|-)+(\w|\d)|(\w|\d)+)\.(\w)+|\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|IPv6:\d{0,4}:\d{0,4}:\d{0,4}:\d{0,4})\])/);
	var domain = email.slice(email.lastIndexOf('@') + 1).length <= 255;
	return match && (match[0].length == email.length);
};

exports.testerEmail = function(){
	let valid = [
		'simple@example.com',
		'very.common@example.com',
		'disposable.style.email.with+symbol@example.com',
		'other.email-with-hyphen@example.com',
		'fully-qualified-domain@example.com',
		'user.name+tag+sorting@example.com', //(may go to user.name@example.com inbox depending on mail server)
		'x@example.com', //(one-letter local-part)
		'example-indeed@strange-example.com',
		//'admin@mailserver1', //(local domain name with no TLD, although ICANN highly discourages dotless email addresses)
		'example@s.example', //(see the List of Internet top-level domains)
		'" "@example.org', //(space between the quotes)
		'"john..doe"@example.org', //(quoted double dot)
	];
	let invalid = [
		'Abc.example.com', //(no @ character)
		'A@b@c@example.com', //(only one @ is allowed outside quotation marks)
		'a"b(c)d,e:f;g<h>i[j\k]l@example.com', //(none of the special characters in this local-part are allowed outside quotation marks)
		'just"not"right@example.com', //(quoted strings must be dot separated or the only element making up the local-part)
		'this is"not\allowed@example.com', //(spaces, quotes, and backslashes may only exist when within quoted strings and preceded by a backslash)
		'this\ still\"not\\allowed@example.com', //(even if escaped (preceded by a backslash), spaces, quotes, and backslashes must still be contained by quotes)
		'1234567890123456789012345678901234567890123456789012345678901234+x@example.com', //(local part is longer than 64 characters)
	];
	for(var i = 0; i < valid.length; i++){
		if(!this.email(valid[i]))throw new Error('Invalid email validator: ' + valid[i] + ' is valid email address');
	};
	for(var i = 0; i < invalid.length; i++){
		if(this.email(invalid[i]))throw new Error('Invalid email validator: ' + invalid[i] + ' is invalid email address');
	};
};

exports.testerEmail();

exports.date = function(date){//yyyy-mm-dd
	if(typeof date != 'string')return false;
	var match = date.match(/\d{4}-\d{2}-\d{2}/);
	if(!match || match.length != date.length)return -1;
	var tab = date.split('-');
	var y = parseInt(tab[0]);
	var m = parseInt(tab[1]);
	var d = parseInt(tab[2]);
	var months = [
		31,
		(((y % 4 == 0) && ((y % 100 != 0) || (y % 400 == 0))) ? 29 : 28),
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31,
	];
	return m <= 12 && d <= months[m];
};

exports.username = function(name){
	if(typeof name != 'string')return false;
	var match = name.match(/(\d|\w){3,24}/);
	return (match && (match[0].length == name.length)) || false;
};

exports.title = function(str){
	if(typeof str != 'string')return false;
	var match = str.match(/(\d|\w|ą|ć|ę|ó|ń|ł|ś|ż|ź|-|\+|=|'|"|\/|:|;|,|\.|\s){3,}/);
	return match && (match[0].length == str.length);
};

exports.password = function(pwd){
	if(typeof pwd != 'string' || pwd.length < 8)return false;
	return /\w/.test(pwd) + /\d/.test(pwd) + /[^(\w|\d)]/.test(pwd) + (pwd.toUpperCase() != pwd && pwd.toLowerCase() != pwd) > 2; 
};