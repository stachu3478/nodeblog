function save(){
	
	var data = {
		
		name: $("#name")[0].value,
		
		lProg: 0,
		desc: $("#desc")[0].value,
		slider: $("#age")[0].value,
		z: {
			m: $("#zm")[0].checked,
			g: $("#zg")[0].checked,
			c: $("#zc")[0].checked,
			k: $("#zk")[0].checked,
		},
		edu: "p",
		date: $("#ur")[0].value,
		color: $("#col")[0].value,
		num: $("#num")[0].value,
	};
	
	for(var i = 0; i < 5; i++){
		if($("#l" + i)[0].selected)
			data.lProg = i;
	};
	
	var edus = "ptsn";
	
	for(var i = 0; i < edus.length; i++){
		if($("#e" + edus[i])[0].checked){
			data.edu = edus[i];
			break;
		};
	};
	
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200) {
		   $("#state")[0].innerText = req.responseText;
		};
	};
	req.open("POST", "dataModify", true);
	req.send(JSON.stringify(data));
};

function load(){
	
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200) {
		   data = JSON.parse(req.responseText);
		   
		   $("#age")[0].value = data.slider;
		   $("#name")[0].value = data.name;
		   $("#desc")[0].value = data.desc;
		   $("#ur")[0].value = data.date;
		   $("#col")[0].value = data.color;
		   $("#num")[0].value = data.num;
		   $("#e" + data.edu)[0].checked = true;
		   $("#l" + data.lProg)[0].selected = true;
		   
		   var ints = "mgck";
		   for(var i in ints){
				$("#z" + ints[i])[0].checked = data.z[ints[i]];
		   };
		};
	};
	req.open("GET", "dataGet", true);
	req.send();
};

function logout(){
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200) {
		   $("#state")[0].innerText = req.responseText;
		   location.reload();
		};
	};
	req.open("GET", "logout", true);
	req.send();
};

function testInput(){
	var par = $('#f')[0];
	var equal = par.children[4].value.length > 0 && par.children[4].value == par.children[2].value;
	if(equal && !ok){
		el = document.createElement('input');
		el.type = 'submit';
		par.appendChild(el);
		ok = true;
	}else if(!equal && ok){
		$('#f')[0].removeChild(el);
		ok = false;
	};
};

function charType(c){
	try{
		if(/\w/.test(c)){
			if(c.toUpperCase() == c){
				return 'u';
			}else{
				return 'l'
			};
		};
		if(/\d/.test(c))
			return 'd';
		else
			return 's';
	}catch{
		return 'n';
	};
};

var kbMatrix = [
	'1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=',//12x4
	'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']',
	'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';','\'','\\',
	'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '\n','`',
	
	'!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+',
	'Q', 'w', 'E', 'r', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}',
	'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"','\\',
	'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', '\n','~',
];

function dist(x12, y12){
	return Math.sqrt(x12 * x12 + y12 * y12);
};

function kbPos(c){
	var p = kbMatrix.indexOf(c);
	if(p == -1)return -1;
	var p = p % 48;
	return dist(p % 12, Math.floor(p / 12));
};

function calcStrength(pwd = $('input[name="pwd"]')[1].value){
	var val = Math.pow(1.2,pwd.length);
	val *= (/\w/.test(pwd) + /\d/.test(pwd) + 2 * (/[^(\w|\d)]/.test(pwd)) + (pwd.toUpperCase() != pwd && pwd.toLowerCase() != pwd));
	var ent1 = 0;
	var ent2 = 0;
	var currentC = pwd[0];
	var currentTp = charType(pwd[0]);
	var totalChars = {[currentC]: 1};
	var totalCharCodesDiffs = {};
	var kbDiffs = [];
	for(var i = 0; i < pwd.length; i++){
		var ch = pwd[i];
		var tp = charType(pwd[i]);
		if(ch != currentC){
			ent1++;
			currentC = ch;
			totalChars[ch] = 1;
			totalCharCodesDiffs[Math.abs(currentC.charCodeAt(0) - ch.charCodeAt(0))] = 1;
			if(tp != currentTp){
				ent2++;
				currentTp = tp;
			};
		};
		var p = kbPos(ch);
		if(p != -1){
			if(kbDiffs.indexOf(p) == -1)
				kbDiffs.push(p);
		}else
			kbDiffs.push(Math.round(Math.random()*65535));
	};
	val *= ent1 * ent2;
	val *= Object.keys(totalChars).length;
	val *= Object.keys(totalCharCodesDiffs).length;
	val *= kbDiffs.length;
	
	var perc = Math.cbrt(val) / 2;
	perc = perc < 100 ? Math.round(perc) : 100;
	var colorX = perc * 2.55;
	var colorY = 255 - colorX;
	var color = 'rgb(' + colorY + ',' + colorX + ',' + (colorX / 2) + ')';
	var strength = 'Za któtkie';
	if(pwd.length > 3){
		if(perc < 2)
			strength = 'Bardzo słabe';
		else if(perc < 8)
			strength = 'Słabe';
		else if(perc < 20)
			strength = 'Średnio słabe';
		else if(perc < 40)
			strength = 'Średnie';
		else if(perc < 60)
			strength = 'Średnio silne';
		else if(perc < 80)
			strength = 'Silne';
		else strength = 'Bardzo silne';
	};
	$('#str')[0].innerText = strength;
	$('#power')[0].style.width = perc + 'px';
	$('#power')[0].style.backgroundColor = color;
	
	return [perc < 100 ? perc : 100, color, strength, kbDiffs, ent1, ent2];
};