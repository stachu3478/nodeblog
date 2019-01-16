var http = require('http');
var fs = require('fs');

http.createServer(function(req, res){
    var url = req.url;
    if(url == "/"){
        url += "main.html";
    };
    var sciezka = "htdocs" + url;
    if(fs.existsSync(sciezka)){
        if(fs.lstatSync(sciezka).isDirectory()){
            fs.readdir(sciezka, function(err, items) {
                console.log(items);
                var code = '\
                        url = "' + url.slice(1) + "/" + '";\
                ';
                for(var i = 0; i < items.length;i++){
                    code += "setInterval(function(){window.open(url + '" + items[i] + "')},"+ (50 + i * 25) +");";
                };
                res.write("<script>" + code + "</script>");
                /*for (var i=0; i<items.length; i++) {
                    console.log(items[i]);
                    if(fs.lstatSync(sciezka + "/" + items[i]).isFile()){
                       //fs.readFile(sciezka + "/" + items[i],function(err, data){
                            //res.write(data);
                        //});
                        setTimeout(function(){
                            res.write("<script>
                                      window.open('"+ (url.slice(1) + "/" + items[i]) +"')</script>");
                        },i * 1000);
                    //res.write(fs.readFileSync(sciezka + "/" + items[0]));
                    };
               };*/
                    res.end();
            });
        }else{
             console.log(sciezka + "\n");

             fs.readFile(sciezka,function(err, data){
                           res.write(data); 
                res.end();
            });
        };
    }else{
         res.write("Plik nie istnieje 404 :>");
        res.end();
     };
    //res.write(req.url);
    //res.sendFile("htdocs/abc.txt");
    
}).listen(8080);

console.log("hello world!");