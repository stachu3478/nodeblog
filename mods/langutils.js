var langSortedDir = 'htdocs/'; // directory for use of docs sorted by language-folder

var langs = [ // languages-dirs to make from
	//'pl',
	'en',
];

var nativeLang = 'pl'; // primary folder, from every doc will be copied from

var fs = require('fs');

var pattDir = langSortedDir + 'patternsLock/'; // patterns that will be compared with user-defined ones
var pattModDir = langSortedDir + 'patterns/'; // user-defined patterns

var nativeDir = langSortedDir + nativeLang + '/';

function createPattern(doc){
	
	var arrDoc = fs.readFileSync(doc).toString().split('<').map((v) => v.split('>')); // split file into HTML + plain text pairs;
	
};

function replaceHTML(doc, dest){ // will try to replace html, scripts and styles in the docs if there are differences
	
	var pattern = fs.readFileSync('patterns/' + doc);
	var patternLock = fs.readFileSync('patternsLock/' + doc);
	
	if(pattern == patternLock){// checks if user pattern has changed
		
	}else{
		var str1 = fs.readFileSync(nativeDir + doc).toString();
		var str2 = fs.readFileSync(dest).toString();
	}
};

function copyDocs(){ // will copy the docs;
	
	fs.readdir(langSortedDir + nativeLang, function(err, docs){
		if(err)throw err;
		
		for(var i = 0; i < langs.length; i++){
			
			for(var j = 0; j < docs.length; j++){
				
				if(!fs.existsSync(pattDir + docs[i])){
					createPattern(docs[i]);
				};
				
				var path = langSortedDir + langs[i] + '/' + docs[i])
				if(!fs.existsSync(path){
					fs.copyFile(nativeDir + docs[i], path);
				}else{
					reaplaceHTML(docs[i], path);
				}
			};
		};
	});
};

exports.getDoc = function(file, lang = nativeLang){ // will read requested doc in a requested language
	return fs.readFileSync(lang + file);
};

