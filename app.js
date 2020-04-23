const {
  check,
  validationResult
} = require('express-validator');

const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const fs = require('fs');
const multer = require('multer');
var title;
const upload = multer({
    dest: 'uploads/'
})
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
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
app.use(compression());
mongoose.connect("mongodb+srv://rjrishabh:rj7899Rishaabhjain@cluster0-ua7od.mongodb.net/mangaldeepDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model('User', userSchema);
const composeSchema = new mongoose.Schema({
    _id: String,
    productName: String,
    productDescription: String,
    category: String,
    prize: String,
    pieces: String,
    img: {
        data: Buffer,
        contentType: String
    }
});
const Saree = new mongoose.model("Saree", composeSchema);
const listSchema = {
    name: String,
    items: [String]
};
const Userlikes = new mongoose.model("Userlikes", listSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
var header = "";
var header1 = "";
app.get("/", function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/user/" + req.user.username);
    } else {
        title = "MD-Sarees";
        Saree.find({}, function(err, sarees) {
            if (err) {
                console.log(err);
            } else {
                header = 'header'
                res.render("index", {
                    header: header,
                    sarees: sarees,
                    titleOf: title
                });
            }
        })
    }
})
app.get("/user/:query", function(req, res) {
    if (req.isAuthenticated()) {
        const userid = req.params.query;
        User.findOne({
            username: userid
        }, function(err, user) {
            if (!err) {
                if (user) {
                    var foundid = user.username;
                    header1 = 'headerdummy';
                    title = "MD-Home";
                    Saree.find({}, function(err, sarees) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (header1 == 'headerdummy') {
                                res.render("index", {
                                    header: header1,
                                    foundid: foundid,
                                    sarees: sarees,
                                    titleOf: title
                                });
                            } else {
                                res.render("index", {
                                    header: header1,
                                    sarees: sarees,
                                    titleOf: title
                                });
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
})
app.get("/compose", function(req, res) {
    title = "MD-Add Products";
    res.render("compose", {
        titleOf: title
    });
})
app.get("/contact", function(req, res) {
    if (req.isAuthenticated()) {
        header1 = 'headerdummy';
        foundid = req.user.username;
        title = 'MD-about'
        res.render("about", {
            header: header1,
            foundid: foundid,
            titleOf: title
        });
    } else {
        header1 = 'header';
        title = 'MD-about'
        res.render("about", {
            header: header1,
            titleOf: title
        });
    }
})
app.get("/register", function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/user/" + req.user.username);
    } else {
        title = "Sign Up"
        res.render("register", {
            titleOf: title,
            errorMessage:null
        });
    }
});
app.get("/login", function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/user/" + req.user.username);
    } else {
        title = "MD-Sign In"
        res.render("login", {
            titleOf: title
        });
    }
})
app.get("/sarees/:sareeid", function(req, res) {
    var sareeimg;
    var productName;
    var productDescription;
    var category;
    var prize;
    var pieces;
    var sid;
    Saree.findById(req.params.sareeid, function(err, saree) {
        sid = saree._id;
        sareeimg = saree.img.data.toString('base64');
        productName = saree.productName;
        productDescription = saree.productDescription;
        category = saree.category;
        prize = saree.prize;
        pieces = saree.pieces;
        if (req.isAuthenticated()) {
            header1 = 'headerdummy';
            foundid = req.user.username;
            title = 'MD-productDes';
            res.render("productDes", {
                header: header1,
                foundid: foundid,
                titleOf: title,
                sareeimg: sareeimg,
                productName: productName,
                productDescription: productDescription,
                category: category,
                prize: prize,
                pieces: pieces,
                sid: sid
            });
        } else {
            header1 = 'header';
            title = 'MD-productDes'
            res.render("productDes", {
                header: header1,
                titleOf: title,
                sareeimg: sareeimg,
                productName: productName,
                productDescription: productDescription,
                category: category,
                prize: prize,
                pieces: pieces,
                sid: sid
            });
        }
    })
});
app.get("/userlike/:sareeid", function(req, res) {
    if (req.isAuthenticated()) {
        const user = req.user.username;
        const sareeid = req.params.sareeid;
        Userlikes.findOne({
            name: user
        }, function(err, foundList) {
            if (!err) {
                if (!foundList) {
                    const userlike = new Userlikes({
                        name: user,
                        items: [sareeid]
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
app.get("/cart", function(req, res) {
    if (req.isAuthenticated()) {
        const user = req.user.username;
        Userlikes.findOne({
            name: user
        }, function(err, foundList) {
            if (err) {
                console.log(err);
                res.redirect("/");
            } else {
                try {
                    if (foundList.items) {
                        Saree.find().where('_id').in(foundList.items).exec((err, records) => {
                            res.render("sessionindex", {
                                titleOf: 'MD-cart',
                                foundid: foundList.name,
                                sarees: records
                            });
                        });
                    }
                } catch (error) {
                    res.render("empty", {
                        titleOf: 'MD-emptyCart',
                        foundid: req.user.username
                    });
                }
            }
        })
    } else {
        res.redirect("/login");
    }
})
app.get("/delete/:deleteid", function(req, res) {
    Userlikes.findOneAndUpdate({
        name: req.user.username
    }, {
        $pull: {
            items: req.params.deleteid
        }
    }, function(err, foundList) {
        if (!err) {
            if (foundList.items && foundList.items.constructor === Array && foundList.items.length === 0) {
                res.render("empty", {
                    titleOf: 'MD-emptyCart',
                    foundid: req.user.username
                });
            } else {
                res.redirect("/cart");
            }
        }
    })
});
app.post("/register",[
      check('username').isEmail(),
      check('password').isLength({
        min: 5
      })
    ], function(req, res) {
    User.findOne({
        username: req.body.username
    }, function(err, user) {
        if (!err) {
            if (user) {
                res.redirect("/login");
            } else {
                User.register({
                    username: req.body.username
                }, req.body.password, function(err, user) {
                    if (err) {
                        console.log(err);
                        res.redirect("/register");
                    } else {
                        passport.authenticate("local")(req, res, function() {
                            res.redirect("/user/" + req.body.username);
                        })
                    }
                })
            }
        } else if (err) {
            console.log(err);
        }
    })
});
app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    passport.authenticate("local")(req, res, function() {
        res.redirect("/user/" + req.body.username);
    });
});
app.get("/logout", function(req, res) {
    req.logout();
    req.session.destroy(function(err) {
        res.redirect("/login");
    })
});
app.post("/compose", upload.single('img'), function(req, res) {
    if (req.file == null) {
        res.render("compose");
    } else {
        const newImg = fs.readFileSync(req.file.path);
        const saree = new Saree({
            _id: req.body.productId,
            productName: req.body.productName,
            productDescription: req.body.productDescription,
            category: req.body.category,
            prize: req.body.prize,
            pieces: req.body.pieces
        });
        saree.img.data = newImg, saree.img.contentType = 'image/*'
        Saree.findById(req.body.productId, function(err, sareefound) {
            if (sareefound) {
                res.redirect("/");
            } else {
                saree.save(function(err) {
                    if (!err) {
                        res.redirect("/compose");
                    } else {
                        console.log(err);
                    }
                });
            }
        })
        fs.unlinkSync(req.file.path, function(err) {
            if (err) {
                console.log(err)
            };
        })
    }
});
let port = process.env.PORT;
if (port == null || port == "") {
    port = 4000;
}
app.listen(port, function() {
    console.log("server is up and running successfully");
});
