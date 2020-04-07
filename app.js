//please put routes at their place like all get routes at a place
//and comment out things so that everyone can easily understand code and edit it.
// requiring all the packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


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




const usersSchema = new mongoose.Schema({
name: String


});
const User = mongoose.model("User", usersSchema);
const user1 = new User({
  name: "welcome to your to do list!!"
});


const user2 = new User({
  name: " to your"
});


const user3 = new User({
  name: "welcome!!"
});

const defaultItems = [user1, user2, user3];



// User.insertMany(defaultItems, function(err)
//  {
//     if (err) {
//       console.log("error occoured");
//               }
//     else {
//     console.log("successfully added to database");
//          }
//
// });




//home route please put all get routes at a place
app.get("/",function(req,res){
  res.render("index");

})


app.get("/compose",function(req,res){
      res.render("compose");
})


app.get("/contact",function(req,res){

})




//post route for any form  all post routes here
app.post("/",function(req,res){

})


//listen port
app.listen(3000, function() {
  console.log("server is up and running on port 3000");
});
