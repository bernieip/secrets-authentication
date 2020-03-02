require('dotenv').config(); // dotenv package (must be a the top)

const express = require("express"); // node framework
const bodyParser = require("body-parser"); //read user's input with req.body (middlewear)
const ejs = require("ejs"); // for templating
const mongoose = require("mongoose"); // for mongoDB database
const session = require("express-session"); // using express-session for passport.js
const passport = require("passport"); // for authentication
const passportLocalMongoose = require("passport-local-mongoose"); // for passport auth


const app = express();

app.use(express.static("public")); //uses public folder for resources, aka css files
app.set('view engine', 'ejs'); //uses views folder for templates
app.use(bodyParser.urlencoded({ //use bodyparser to read user input
    extended: true
}));

// express-session methods (must use before mongoose connect db, and after app.set)
app.use(session({
    secret: process.env.SECRET, //encrypted SECRET key in .env file
    resave: false,
    saveUninitialized: false
}));

// initial passport and session
app.use(passport.initialize());
app.use(passport.session());

// connect to local mongoDB server, and create new database called userDB
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true); //remove mongoose deprecated warning when using passport

// create schema with a email and password section
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// add passport local mongoose plugin to our schema
// (must be coded after the mongoose connect but before creating the collection)
userSchema.plugin(passportLocalMongoose);

// create new collection called User and uses the userSchema schema
const User = new mongoose.model("User", userSchema);

// passport setting to create cookie
// (must use this after DB collection is created)
passport.use(User.createStrategy());

// serialize to create cookie session, deserialize to delete cookie session
// (must use this after passport.use create strategy is created)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// create home route
app.get("/", function(req, res) {
    res.render("home");
});

// create login route
app.get("/login", function(req, res) { // "/login" action from the login page form to grab input with body parser
    res.render("login");
});

// create register route
app.get("/register", function(req, res) { // "/register" action from the register page form to grab input with body parser
    res.render("register");
});

// create secrets route
app.get("/secrets", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets"); // render secrets page if logged in through cookies
    } else {
        res.redirect("/login") // if not logged in, redirects to login page
    }
});

// create logout route
app.get("/logout", function(req, res) { // "/logout" from logout button on secrets page
    req.logout(); // passport function to logout and delete cookie
    res.redirect("/") //redirect to home route
});

// create a post request to grab the data from the register page, and save it to our User collection.
app.post("/register", function(req, res) {
    User.register({username: req.body.username}, req.body.password, function (err, user) { // input from register page
        if (err) {
            console.log(err);
            res.redirect("/register"); // redirect back to register page if any error
        } else {
            passport.authenticate("local")(req, res, function() { // if auth correct, redirect to secrets page
                res.redirect("/secrets");
            })
        }
    })
});

// this will check if the entered username/password is in our database,
app.post("/login", function(req, res) {
    const user = new User({ // create a user from input fields below
        username: req.body.username, // input from username field
        password: req.body.password // input from password field
    });
    req.login(user, function (err) { //passport function to check for login credentials
        if (err) {
            console.log(err); // if no match, this will show an error
        } else {
            passport.authenticate("local")(req, res, function () { // if auth correct, redirect to secrets page
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(3000, function() {
    console.log("Server is listening on port 3000.")
});