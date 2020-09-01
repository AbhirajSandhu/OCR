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
mongoose.connect("mongodb://localhost/ocr", {   
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
/////////////////////

app.get('/home', function(req, res){
  res.render('index');
});

// app.get('/show', function(req, res){
//   res.render('show');
// });

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
					var newData = {text : result.text}
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

app.listen(3000, function(){
	console.log("Server ON");
})
