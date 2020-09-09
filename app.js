var express			 = require('express'),
	multer			 = require('multer'),
	app 			 = express(),
	fs 				 = require('fs'),
{TesseractWorker} 	 = require('tesseract.js'), //npm install tesseract.js@2.0.0-alpha.15
	worker			 = new TesseractWorker(),
	bodyParser 	   	 = require("body-parser"),
	mongoose		 = require("mongoose");
	

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/new_ocr", {  //new_ocr  
	useNewUrlParser: true,
	useUnifiedTopology: true,
  	useCreateIndex: true,
    useFindAndModify: false });
app.use(bodyParser.urlencoded({extended : true})); //yaad kro to use body parser
app.set("view engine","ejs");
app.use(express.urlencoded({ extended: true }));

//////Storage////////
var Storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./images");
  	},
 filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});

var upload = multer({storage: Storage}).single("avatar");
////////////////////

//MONGOOSE/MODEL CONFIG
var dataSchema = new mongoose.Schema({
	text: String
})

var Data = mongoose.model("Data", dataSchema);

var formSchema = new mongoose.Schema({
	name: String,
	rollno: String,
	dept: String
})

var Form = mongoose.model("Form", formSchema);
/////////////////////

app.get('/home', function(req, res){
  Data.find({},function(err, alldata){
		if(err){
			console.log(err);
		}else{
			res.render("index", { datas : alldata });
		}
	})
});

app.get('/ocr', function(req, res){
  res.render('form');
});

app.get("/sort/:id", function(req, res){
	//find the data with provided id
	Data.findById(req.params.id).exec(function(err,foundData){//.id can be .anything
		if(err){
			console.log(err);
		}else{
			console.log(foundData);
			var p = foundData.text;
			// sort(p);
			p = p.toString();
			p = p.replace(/[:]+/g, " ")
			p = p.replace(/[ ]+/g, "_")
			p = p.replace(/[A-Z]+/g, "$")
			p = p.replace(/[_]+/g, " ")
			sort(p);
			res.render("sort", {p : p});
		}
	})
});

app.post("/upload", function(req, res){
	upload(req, res, err => {
		fs.readFile(`./images/${req.file.originalname}`, function(err, data){
			if(err){
				console.log(err);
			}else {
				worker
					.recognize(data, "eng")
				//, {tessjs_create_pdf: '1'} to make pdf
					.progress(progress => {
						console.log(progress);
				})
					.then(result => {
					// res.redirect("/download");
					// res.send(result.text);
					console.log(result.text);
					// var p = result.text;
					// sort(p);
					var newData = {text : result.text};
					Data.create(newData,function(err, newtext){
						if(err){
							console.log(err);
						}else{
							res.render("show", {data: newtext})	
								}	
					})
				})
					.finally(() => worker.terminate());
			}
		})
	})
})

// app.get("/download", function(req, res){
// 	var file = `${__dirname}/tesseract.js-ocr-result.pdf`;
// 	res.download(file);
// })
// const p = "ACDdd";
// // const regex = /[A-H]/g;
// // console.log(p.replace(regex, ' '));
// console.log(p.replace(/[A-Z]/g, " "));
// function sort(p, req, res){
// 	p = p.toString();
	// console.log(p);
	// p = p.replace(/[A-Z]/g, " ")
	// return p;
	// const p = "ACDdd";
	// console.log(p.replace(/[A-Z]/g, " "));
	// var dataObject = data.toObject();
	// console.log(dataObject.text);
	// console.log(p.replace(/[A-Z]/g, " "));
	// for (var k in data) {
	// console.log(data[k]) };
		// eval('(' + data + ')').text;

// }

function sort(p){
	var s = p;
	var n = s.length;
	var l = 0; 
	var a1,a2,a3,a4,a5,a6;
	var a,b,c;
	for(var i = 0; i < n; i++) {
		if(s[i]=='$'&&l==0){
			var k = 2;
			a1 = k;
			while(s[k]!='$'){
				k++;
			} a2 = k-1; l++; k=k+2; // k+2 to skip $ and space
		var j = k;
			a3 = k;
			while(s[k]!='$'){
				k++;
			} a4 = k-1; k=k+2;
		j = k;
			a5 = k;
			while(k!=n){ // in end string this way
				k++;
			}
			a6 = k;
		}
	}
	function capitalize_Words(str)
	{
	 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}
	s = capitalize_Words(s);
	a = s.substring(a1,a2);
	b = s.substring(a3,a4);
	c = s.substring(a5,a6);
	console.log(a,b,c);
}

app.listen(3000, function(){
	console.log("Server ON");
})
