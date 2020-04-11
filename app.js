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

const itemsSchema ={
  name:String
};
const listSchema={
  name:String,
  items:[String]
};
const Userlikes= new mongoose.model("Userlikes",listSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var header="" ;
var header1="";
//home route please put all get routes at a placeapp.get("/",function(req,res,next){
   app.get("/",function(req,res) {
    if (req.isAuthenticated()) {
      console.log(req.user.username);
      res.redirect("/user/"+req.user.username);
    } else {
      title = "MD-Home";
Saree.find({},function(err,sarees) {
  if (err) {
    console.log(err);
  } else {
    // console.log(saree.img.data);
    // res.contentType(saree.img.contentType);
    // const base64=saree.img.data.toString('base64');
    header='header'
        res.render("index",{header:header,  sarees: sarees,titleOf:title});
    
    
  }
})
    }


   })


    app.get("/user/:query",function(req,res){
if (req.isAuthenticated()) {
    
     const userid=req.params.query;
  User.findOne({username:userid},function(err,user) {
    if (!err) {
      if (user) {
        var foundid=user.username;
        header1='headerdummy';
        title = "MD-Home";
Saree.find({},function(err,sarees) {
  if (err) {
    console.log(err);
  } else {
    // console.log(saree.img.data);
    // res.contentType(saree.img.contentType);
    // const base64=saree.img.data.toString('base64');
    if (header1=='headerdummy') {
      // var foundid= req.params.query;
       res.render("index",{header:header1,foundid:foundid,  sarees: sarees,titleOf:title});
    } else {
        res.render("index",{header:header1,  sarees: sarees,titleOf:title});
    }
    
  }
})
      } else {
        res.redirect("/login");
      }
    } else {
      console.log(err);
    }
  })
  } else {
    res.redirect("/login");
  }
 


      // res.render("index");
})


app.get("/compose",function(req,res){
  title = "MD-Add Products";
      res.render("compose",{titleOf:title});
})


app.get("/contact",function(req,res){
  if (req.isAuthenticated()) {
     header1='headerdummy';
     foundid=req.user.username;
     title='MD-about'
    res.render("about",{header:header1,foundid:foundid,titleOf:title} );
  } else {
    header1='header';
    title='MD-about'
    res.render("about",{header:header1,titleOf:title} );
  }


})

// route for signup

app.get("/register",function(req,res){

if (req.isAuthenticated()) {
    res.redirect("/user/"+req.user.username);
  } else {
     title = "Sign Up"
  res.render("register",{titleOf:title});
  }

  
});

app.get("/login",function(req,res){
  if (req.isAuthenticated()) {
    res.redirect("/user/"+req.user.username);
  } else {
     title = "MD-Sign In"
  res.render("login",{titleOf:title});
  }
 
})

app.get("/sarees/:sareeid",function(req,res) {

    var sareeimg;
    var productName;
    var productDescription;
    var category;
    var prize;
    var pieces;
  Saree.findById(req.params.sareeid,function(err,saree) {

      sareeimg=saree.img.data.toString('base64');
      productName=saree.productName;
      productDescription=saree.productDescription;
      category=saree.category;
      prize=saree.prize;
      pieces=saree.pieces;
      // console.log(productDescription);

      if (req.isAuthenticated()) {
     header1='headerdummy';
     foundid=req.user.username;
     title='MD-productDes';

    res.render("productDes",{
      header:header1,
      foundid:foundid,
      titleOf:title,
      sareeimg:sareeimg,
      productName:productName,
      productDescription:productDescription,
      category:category,
      prize:prize,
      pieces:pieces
    });
  } else {
    // console.log(productDescription);
    header1='header';
    title='MD-productDes'
    res.render("productDes",{
      header:header1,
      titleOf:title,
      sareeimg:sareeimg,
      productName:productName,
      productDescription:productDescription,
      category:category,
      prize:prize,
      pieces:pieces
    });
  }
  })


});

app.get("/userlike/:sareeid",function(req,res) {
  if (req.isAuthenticated()) {
    const user=req.user.username;
    const sareeid=req.params.sareeid;
    
    Userlikes.findOne({name:user},function(err,foundList) {
      if (!err) {
        if (!foundList) {
          const userlike = new Userlikes({
            name:user,
            items:[sareeid]
          });
          userlike.save();
          res.redirect("/");
        } else {
          foundList.items.push(sareeid);
          foundList.save();
          res.redirect("/");
        }
      } else {
        console.log(err);
      }
   
    })    

  } else {
    res.redirect("/register");
  }
})

app.get("/cart",function(req,res) {
    if (req.isAuthenticated()) {
      const user=req.user.username;
    Userlikes.findOne({name:user},function(err,foundList) {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        try{
        if (foundList.items) {
          
          console.log(foundList.items);
          Saree.find().where('_id').in(foundList.items).exec((err, records) => {
            console.log(records);
            res.render("sessionindex",{
              titleOf:'MD-cart',
              foundid:foundList.name,
              sarees:records
            });
          });
        } 
      }catch(error){
        res.redirect("/");
      }

        
          
          
        
      }
      
    })

  } else {
    res.redirect("/login");
  }

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
        res.redirect("/user/"+req.body.username);
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
  // req.login(user,function(err) {
  //   if(err){
  //     console.log(err);
  //   }else{
      passport.authenticate("local")(req,res,function() {
        res.redirect("/user/"+req.body.username);
      });
    // }
  // })
});

app.get("/logout",function(req,res) {
  req.logout();
  req.session.destroy(function(err) {
    res.redirect("/login");
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
