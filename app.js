//please put routes at their place like all get routes at a place
//and comment out things so that everyone can easily understand code and edit it.
// requiring all the packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require('fs');
const multer  = require('multer');


//multer for file upload
const upload = multer({ dest: 'uploads/' })
// creating app constant
const app = express();

//view engine set ejs
app.set('view engine', 'ejs');


//body parser use
app.use(bodyParser.urlencoded({
  extended: true
}));
//using static css and image files which are in public folder
app.use(express.static("public"));

//database connection
mongoose.connect("mongodb://localhost:27017/mangaldeepDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});




const composeSchema = new mongoose.Schema({
	productName:String,
	productDescription:String,
	category:String,
	prize:String,
	pieces:String,
	img:{data:Buffer,contentType:String }
});
const Saree = mongoose.model("Saree", composeSchema);





//home route please put all get routes at a place
app.get("/",function(req,res,next){
  
Saree.findOne({productName:'1'},function(err,saree) {
  if (err) {
    console.log(err)
  } else {
    // console.log(saree.img.data);
    // res.contentType(saree.img.contentType);
    const base64=saree.img.data.toString('base64');
    res.render("index",{image1: base64});
  }
})
      // res.render("index");
})


app.get("/compose",function(req,res){
      res.render("compose");
})


app.get("/contact",function(req,res){

})




//post route for any form  all post routes here
app.post("/",function(req,res){

})

app.post("/compose",upload.single('img'),function(req,res) {
	if (req.file == null) {
		console.log(req.file.path);
   // If Submit was accidentally clicked with no file selected...
  console.log("no img selected");
  res.render("compose");
}else{ 
	// read the img file from tmp in-memory location
   const newImg = fs.readFileSync(req.file.path);
   console.log(newImg);

     const saree = new Saree({
     		productName:req.body.productName,
     		productDescription:req.body.productDescription,
     		category:req.body.category,
     		prize:req.body.prize,
     		pieces:req.body.pieces
     		
     });
     	saree.img.data=newImg,
     	saree.img.contentType='image/*'

     saree.save(function(err) {
     	if(!err){

        fs.unlinkSync(req.file.path,function(err) {
          if(err){ console.log(err) };
        })
     		res.redirect("/");

        
     	}else{
     		console.log(err);
     	}
     });
 }

});


//listen port
app.listen(3000, function() {
  console.log("server is up and running on port 3000");
});
