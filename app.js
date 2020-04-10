//please put routes at their place like all get routes at a place
//and comment out things so that everyone can easily understand code and edit it.
// requiring all the packages
const express = require("express");
const bodyParser = require("body-parser");
const ejs=require('ejs');
const mongoose = require("mongoose");
const session=require('express-session');
const passport=require('passport');
const passportLocalMongoose=require('passport-local-mongoose');
const nodemailer=require('nodemailer');
const fs = require('fs');
const multer  = require('multer');
const Swal=require('sweetalert2');

var title;
//multer for file upload
const upload = multer({ dest: 'uploads/' })
// creating app constant
const app = express();
//using static css and image files which are in public folder
app.use(express.static("public"));
//view engine set ejs
app.set('view engine', 'ejs');


//body parser use
app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(session({
  secret: 'ourcompanysarsecret.',
  resave: false,
  saveUninitialized: false
}))

 app.use(passport.initialize());
 app.use(passport.session());

//database connection
mongoose.connect("mongodb://localhost:27017/mangaldeepDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex:true
});


const userSchema=new mongoose.Schema({
  username:String,
  password:String
});
userSchema.plugin(passportLocalMongoose);
const User=new mongoose.model('User',userSchema);

const composeSchema = new mongoose.Schema({
  _id:String,
	productName:String,
	productDescription:String,
	category:String,
	prize:String,
	pieces:String,
	img:{data:Buffer,contentType:String }
});
const Saree = new mongoose.model("Saree", composeSchema);




passport.use(User.createStrategy());
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//home route please put all get routes at a placeapp.get("/",function(req,res,next){
    app.get("/",function(req,res){

title = "Home";
Saree.find({},function(err,sarees) {
  if (err) {
    console.log(err);
  } else {
    // console.log(saree.img.data);
    // res.contentType(saree.img.contentType);
    // const base64=saree.img.data.toString('base64');
    res.render("index",{sarees: sarees,titleOf:title});
  }
})
      // res.render("index");
})


app.get("/compose",function(req,res){
  title = "Add Products";
      res.render("compose",{titleOf:title});
})


app.get("/contact",function(req,res){


})

// route for signup

app.get("/register",function(req,res){
  title = "Sign Up"
  res.render("register",{titleOf:title});
});

app.get("/login",function(req,res){
  title = "Sign In"
  res.render("login",{titleOf:title});
})





//post route for any form  all post routes here
app.post("/register",function(req,res){
  User.findOne({username:req.body.username},function(err,user) {
    if (!err) {
      if (user) {

        res.redirect("/login");
      } else {

        User.register({username:req.body.username},req.body.password,function(err,user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req,res,function() {
        res.redirect("/");
      })
    }
   })

      }
    } else if(err){
      console.log(err);
    }
  })
   
});

app.post("/login",function(req,res) {
  const user =new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user,function(err) {
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function() {
        res.redirect("/");
      });
    }
  })
});

app.get("/logout",function(req,res) {
  req.logout();
  req.session.destroy(function(err) {
    res.redirect("/");
  })
  
});

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
        _id:req.body.productId,
     		productName:req.body.productName,
     		productDescription:req.body.productDescription,
     		category:req.body.category,
     		prize:req.body.prize,
     		pieces:req.body.pieces

     });
     	saree.img.data=newImg,
     	saree.img.contentType='image/*'
  Saree.findById(req.body.productId,function(err,sareefound) {
    if (sareefound) {
     
      res.redirect("/");
    } else {

      saree.save(function(err) {
      if(!err){

        // fs.unlinkSync(req.file.path,function(err) {
        //   if(err){ console.log(err) };
        // })
        res.redirect("/compose");


      }else{
        console.log(err);
      }
     });
    }
  })

 fs.unlinkSync(req.file.path,function(err) {
    if (err) { console.log(err)};
  })
 }


});




//listen port
app.listen(4000, function() {
  console.log("server is up and running on port 4000");
});
