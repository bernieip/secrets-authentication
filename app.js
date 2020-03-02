//jshint esversion:6
require('dotenv').config(); // dotenv package for .env file (must be a the top)

const express = require("express"); // node framework
const bodyParser = require("body-parser"); //read user's input with req.body (middlewear)
const ejs = require("ejs"); // for templating
const mongoose = require("mongoose"); // for mongoDB database
const bcrypt = require("bcrypt"); // hash with salt rounds
const saltRounds = 10; // number of salt rounds for bcrypt

const app = express();

app.use(express.static("public")); //uses public folder for resources, aka css files
app.set('view engine', 'ejs'); //uses views folder for templates
app.use(bodyParser.urlencoded({ //use bodyparser to read user input
    extended: true
}));

// connect to local mongoDB server, and create new database called userDB
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

// create schema with a email and password section
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// create new collection called User and uses the userSchema schema
const User = new mongoose.model("User", userSchema);

// create home route
app.get("/", function(req, res) {
    res.render("home");
});

// create login route
app.get("/login", function(req, res) {
    res.render("login");
});

// create register route
app.get("/register", function(req, res) {
    res.render("register");
});

// create a post request to grab the data from the register page, and save it to our User collection.
// req.body.username is got from input on line14, and password is grab from input on line18
app.post("/register", function(req, res) {

    bcrypt.hash(req.body.password, saltRounds, function (err, hash) { // bcrypt function, takes input field pw
        const newUser = new User({
            email: req.body.username,
            password: hash // hashed password with bcrypt after salt rounds
        });

// save new user and see if there is an error. if not, then render the secrets page.
        newUser.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                res.render("secrets");
            }
        })
    });
});

// this will check if the entered username/password is in our database,
app.post("/login", function(req, res) {
    const username = req.body.username; //grab user input from login page's username
    const password = req.body.password; // grab user input from login page's password

// find email input from the User DB, if can't find then throw an error, else if it finds the user in the DB
// and the found user's password in the DB matches the input password, then render secrets page.
// find One user that matches the input username, and the takes the foundUser and uses bcrypt compare to find pw
    User.findOne({email: username}, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function (err, result) { //bcrypt compare method
                    if (result === true ) {
                        res.render("secrets") // if pw matches, then render secrets page
                    }
                });
                }
            }
        })
});

app.listen(3000, function() {
    console.log("Server is listening on port 3000.")
});