//jshint esversion:6
require('dotenv').config(); // dotenv package (must be a the top)

const express = require("express"); // node framework
const bodyParser = require("body-parser"); //read user's input with req.body (middlewear)
const ejs = require("ejs"); // for templating
const mongoose = require("mongoose"); // for mongoDB database
const encrypt = require("mongoose-encryption"); // for password encryption

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

// create a secret unguessable long string, encrypt only the password field
// process.env.SECRET = from .env file
// (this part must be before we create a collection below)
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

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
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
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

// this will check if the entered username/password is in our database,
app.post("/login", function(req, res) {
    const username = req.body.username; //grab user input from login page's username
    const password = req.body.password; //grab user input from login page's password

// find email input from the User DB, if can't find then throw an error, else if it finds the user in the DB
// and the found user's password in the DB matches the input password, then render secrets page.
    User.findOne({email: username}, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        }
        })
});


app.listen(3000, function() {
    console.log("Server is listening on port 3000.")
});