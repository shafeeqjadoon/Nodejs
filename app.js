const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
mongoose.connect(config.database);
let db = mongoose.connection;

//Check connection
db.once('open',function(){
    console.log('Connected to MongoDB');
});

//Check for DB errors
db.on('error',function(err){
    console.log(err);
});


//Init app
const app = express();

//Body parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
//Bring in Models
app.use(express.static(path.join(__dirname,'public')));
let Article = require('./models/article');
//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  }));

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg , value){
        var namespace = param.split('.')
        , root = namespace.shift()
        ,formParam = root;
        while(namespace.lenght){
            formParam += '[' + namespace.shift() +']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.engine('pug', require('pug').__express);

app.get('*',function(req, res,next){
    res.locals.user = req.user || null;
    next();
});
//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');

// Home Route
app.get('/',function(req, res){
        Article.find({}, function(err,articles){
            if(err){
                console.log(err);
            }
            else{
            res.render('index',{
                title:'Articles',
                articles: articles
            });
}
    });

    // let articles = [
    //     {
    //         id: 1,
    //         title:'Article One',
    //         author: "Shafeeq Jadoon",
    //         body: "This is article one"
    //     },
    //     {
    //         id: 2,
    //         title:'Article Two',
    //         author: "Shafeeq Jadoon",
    //         body: "This is article two"
    //     },
    //     {
    //         id: 3,
    //         title:'Article Three',
    //         author: "Shafeeq Jadoon",
    //         body: "This is article three"
    //     }
    // ]

});




let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles',articles);
app.use('/articles',articles);
app.use('/users',users);
//start server
app.listen(3000,  function(){
    console.log("Server started on port 3000....");
});