var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var session = require('express-session');
var mysql = require('mysql2');
var cookieParser = require("cookie-parser");

const insert = require("./routes/insert");
const edit = require("./routes/edit");
const deleteRouter = require("./routes/delete");
const search = require("./routes/search");
const login = require('./routes/login')
const connection = require('./private/connection');

connection.connect;

var app = express();
 
// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '../public'));

app.use(session({ 
    secret: '123456catr',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

app.use(flash());
app.use(cookieParser());
 
app.use('/insert', insert);
app.use('/edit', edit);
app.use('/delete', deleteRouter);
app.use('/search', search);
app.use('/login', login);

/* GET home page, respond by rendering index.ejs */
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
 
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
 
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
 
// port must be set to 3000 because incoming http requests are routed from port 80 to port 8$
app.listen(80, function () {
    console.log('Node app is running on port 80');
});

module.exports = app;