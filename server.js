var express = require("express");
var bodyParser = require('body-parser');
const passport = require('passport')  
const session = require('express-session')  
const RedisStore = require('connect-redis')(session)
var cookieParser = require('cookie-parser');
var flash    = require('connect-flash');

var app = express();
var router = express.Router();
var path = __dirname + '/views/';

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); 


app.set('view engine', 'ejs'); // set up ejs for templating

//thanks to: https://blog.risingstack.com/node-hero-node-js-authentication-passport-js/
// app.use(session({  
//   store: new RedisStore({
//     url: config.redisStore.url
//   }),
//   secret: config.redisStore.secret,
//   resave: false,
//   saveUninitialized: false
// }))

// required for passport
app.use(cookieParser()); // read cookies (needed for auth)

//app.use(express.session({ secret: 'sind' })); // session secret
app.use(passport.initialize())  
app.use(passport.session())  
app.use(flash()); // use connect-flash for flash messages stored in session

require('./config/passport')(passport); // pass passport for configuration


//middle layer
router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});


app.use("/",router);

// app.get("/", function (req, res) {
//     console.log('root path');
//     //res.sendFile(path + "index.ejs");
//     res.render(path + "index.ejs");
// });


app.post('/create_dialog', function(req, res){
  var username = req.body.username
  var password = req.body.password
  //var remember = req.body.remember-me // 'on' (checked) or undefined (off)

 // With a veiw-engine - render the 'chat' view, with the username
 res.render('chat', {username: username})

})

 // =====================================
// LOGIN ===============================
// =====================================
// show the login form
app.get('/login', function(req, res) {

    // render the page and pass in any flash data if it exists
    //res.render('login.ejs', { message: req.flash('loginMessage') }); 
    res.render('login.ejs'); 
});

// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
app.get('/profile', isLoggedIn, function(req, res) {
    res.render('index.ejs', {
        user : req.user // get the user out of session and pass to template
    });
});


// process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    //todo: verify why this not work
    /*
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
    */
    return next();
}


//if I can't find route I'll show 404 page. This must be after all managed routes
app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});


app.listen(3000, function () {
    console.log("Listening on port 3000!");
});