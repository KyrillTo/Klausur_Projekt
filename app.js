//Includes of all used libraries
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//MongoDB conncection using Mongoose

mongoose.connect("mongodb://localhost:27017/Klausur_userDB", {useNewUrlParser: true, useUnifiedTopology: true});

//Schema for a mongo db input etc
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String
});

//configuration for passport

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//All get routes this Website uses
app.get("/", function(req, res){
    res.render("home", {});
})

app.get("/weatherApp", function(req, res){
    if(req.isAuthenticated()){
        if(req.user.role == "basicUser"){
            res.render("weatherApp", {});
        } else {
            res.redirect("/");
        }
    } else {
        res.redirect("/");
    }
})

app.get("/spotifyApp", function(req, res){
    if(req.isAuthenticated()){
        if(req.user.role === "Admin"){
            res.render("spotifyApp", {});
        } else {
            res.redirect("/");
        }
    } else {
        res.redirect("/");
    }
    
})

app.get("/register", function(req, res){
    res.render("register", {});
})

app.get("/login", function(req, res){
    res.render("login", {});
})

app.get("/loggedIn", function(req, res){
    if(req.isAuthenticated()){
        res.render("loggedIn", {});
    } else {
        res.render("/login");
    }
})

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});

//All Post routes this Website uses
app.post("/register", function(req, res){
    User.register({username: req.body.username, role: "basicUser"}, req.body.password,  function(err, user){
        
        if(err){
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/loggedIn");
            })
        }
    }) 
});

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else {
            passport.authenticate("local")(req,res, function(){
                res.redirect("/loggedIn");
            })
        }
    })
});


app.post("/weatherApp", function(req, res){
    const query = req.body.cityName;
    const units = "metric";

    const url = ""
})


app.listen(3000, function(){
    console.log("Server started on port 3000!");
})