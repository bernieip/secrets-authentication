//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.use(express.static("public")); //uses public folder for resources, aka css files
app.set('view engine', 'ejs'); //uses views folder for templates
app.use(bodyParser.urlencoded({
    extended: true
}));


app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});





app.listen(3000, function() {
    console.log("Server is listening on port 3000.")
});