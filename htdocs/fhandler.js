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