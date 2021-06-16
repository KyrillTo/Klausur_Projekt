//Includes of all used libraries
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const https = require("https");

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


var existingUsers;
User.find({}, function(err, data){ 
    existingUsers = data;
    if(existingUsers.length > 0){
         
    } else {
    
        User.register({username: "admin@email.com", role: "admin"}, "Admin1234",  function(err, user){
            
            if(err){
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, function(){
                })
            }
        }) 
    }
});





var weatherData;
var secondDayIndex;

var authenticated;


//All get routes this Website uses
app.get("/", function(req, res){


    if(req.isAuthenticated()){
        authenticated = true;
        res.render("home", {
            authenticated: authenticated,
            role: req.user.role
        });
    }else {
        authenticated = false;
        res.render("home", {
            authenticated: authenticated,
            role: ""
        });
    }

    
})

app.get("/admin", function(req,res){
    if(req.isAuthenticated()){
        authenticated = true;
        if(req.user.role == "admin"){
            User.find({}, function(err, data){

                res.render("admin", {
                    authenticated: authenticated,
                    role: req.user.role,
                    users: data
                })
            });
            
        } else {
            res.redirect("/");
        }
    } else {
        res.redirect("/");
    }

})

app.get("/weatherApp_query", function(req, res){

    if(req.isAuthenticated()){
        authenticated = true;
            res.render("weatherApp_query", {
                authenticated: authenticated,
                role: req.user.role
            });
    }else {
        authenticated = false;
        res.redirect("/");
    }

})

app.get("/weatherApp_result_today", function(req,res){

    for(i = 0; i <= 40; i++){
        if(weatherData.list[0].dt_txt.substring(0,11) !== weatherData.list[i].dt_txt.substring(0,11)){
            secondDayIndex = i;
            break;
        }
    }

    if(req.isAuthenticated()){
        authenticated = true;
            res.render("weatherApp_result_today", {
                weatherData: weatherData,
                secondDayIndex: secondDayIndex,
                authenticated: authenticated,
                role: req.user.role
            })
    }else {
        authenticated = false;
        res.redirect("/");
    }


    
})

app.get("/weatherApp_result_2", function(req,res){

    if(req.isAuthenticated()){
        authenticated = true;
            res.render("weatherApp_result_2", {
                weatherData: weatherData,
                secondDayIndex: secondDayIndex,
                authenticated: authenticated,
                role: req.user.role
            })
    }else {
        authenticated = false;
        res.redirect("/");
    }  
})

app.get("/weatherApp_result_3", function(req,res){

    if(req.isAuthenticated()){
        authenticated = true;
            res.render("weatherApp_result_3", {
                weatherData: weatherData,
                secondDayIndex: secondDayIndex + 8,
                authenticated: authenticated,
                role: req.user.role
            })
    }else {
        authenticated = false;
        res.redirect("/");
    }
})

app.get("/weatherApp_result_4", function(req,res){
    if(req.isAuthenticated()){
        authenticated = true;
            res.render("weatherApp_result_4", {
                weatherData: weatherData,
                secondDayIndex: secondDayIndex + 16,
                authenticated: authenticated,
                role: req.user.role
            })
    }else {
        authenticated = false;
        res.redirect("/");
    }

   
})

app.get("/weatherApp_result_5", function(req,res){

    if(req.isAuthenticated()){
        authenticated = true;
            res.render("weatherApp_result_5", {
                weatherData: weatherData,
                secondDayIndex: secondDayIndex + 24,
                authenticated: authenticated,
                role: req.user.role
            })
    }else {
        authenticated = false;
        res.redirect("/");
    }

    
})

app.get("/register", function(req, res){
    res.render("register", {});
})

app.get("/login", function(req, res){
    res.render("login", {});
})

app.get("/logout", function(req,res){ 
    req.logout();
    res.redirect("/");
});

app.get("/error", function(req,res){ 
    res.render("error");
});

app.get("/loginFailure", function(req,res){ 
    res.render("loginFailure");
});

//All Post routes this Website uses
app.post("/register", function(req, res){
    User.register({username: req.body.username, role: "basicUser"}, req.body.password,  function(err, user){
        
        if(err){
            console.log(err);
            res.redirect("/register");
            alert("Failed to Register. Please try again");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/");
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
            res.redirect("/loginFailure")
        }else {
            passport.authenticate("local")(req,res, function(){
                res.redirect("/");
            })
        }
    })
});


app.post("/weatherApp_query", function(req, res){
    const apiKey = process.env.WEATHER_KEY;
    const query = req.body.cityName;
    const units = "metric";

    const url = "https://api.openweathermap.org/data/2.5/forecast?q=" + query + "&appid=" + apiKey + "&units="+ units;


    https.get(url, function(response){
        console.log(response.statusCode);
        if(response.statusCode == 200){
            response.on("data", function(data){
            
                weatherData = JSON.parse(data);
                city = weatherData.city.name;
                res.redirect("/weatherApp_result_today");
            })
        } else  {
            res.redirect("/error");
        }
        
    })
})


app.post("/upgradeUser", function(req,res){
    const username = {username: req.body.upgrade_Username};


    User.findOneAndUpdate(username, {role: "richUser"}, function(){
        res.redirect("/admin");
    })
})

app.post("/downgradeUser", function(req,res){
    const username = {username: req.body.downgrade_Username};


    User.findOneAndUpdate(username, {role: "basicUser"}, function(){
        res.redirect("/admin");
    })
})




app.listen(3000, function(){
    console.log("Server started on port 3000!");
})