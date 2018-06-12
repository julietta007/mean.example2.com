var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var compression = require('compression')
var mongoose = require('mongoose');
var helmet = require('helmet');

//Models
var User = require('./models/user');

//Router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articlesRouter = require('./routes/articles');
var apiUsersRouter = require('./routes/api/users');
var apiArticlesRouter = require('./routes/api/articles');

var app = express();
app.use(compression());
app.use(helmet());

//Call the config file
if(process.env.NODE_ENV==='production'){
  var config = require('../config.prod');
}else{
  //var config = require('./config.dev');
  var config = require('../config.prod');
}

var passport = require('passport');
var LocalStrategy = require('passport-local').strategy;

//connect to MongoDB
mongoose.connect(config.mongodb);

var MongoStore = require('connect-mongo')(session);

app.use(require('express-session')({
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  secret: config.secret,
  resave: false,
  saveUninitialized: false/*,
  cookie: {
    path: '/', 
    domain: config.cookie.domain,
    //httpOnly: true,
    //secure: true,
    maxAge: 60 * 60 * 24 //24 hours
  }*/

}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(function(user, done){
  done(null,{
    id: user._id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name
  });
});

passport.deserializeUser(function(user, done){
  done(null, user);
});
//set up the variables
app.use(function(req, res, next){

var userSession={};

  if(req.isAuthenticated()){
  userSession = req.session.passport.user;
}

req.app.locals={
  session:{
    user:userSession
  }
}

next();
});

//Session based access control
app.use(function(req,res,next){
  return next();

var whitelist = [
  '/',
  '/resume',
  '/favicon.ico',
  '/public',
  '/users/login',
  '/users/register',
  '/api/users/register',
  '/auth/github',
  '/aldi',
  '/ace',
  '/bank_one',
  '/chicago_public_schools',
  '/contact',
  '/design',
  '/develop',
  '/hallmark',
  '/index',
  '/jhalcomb',
  '/kohls',
  '/l_m',
  '/virginia_slims'
  
  ];

  if(whitelist.indexOf(req.url) !== -1){
    return next();
  }

  //Allow access to dynamic end points
  var subs = [
    '/stylesheets/',
    '/src/'
  ];
  
  for(var sub of subs){
    if(req.url.substring(0, sub.length)===sub){
      return next();
    }
  }
  
  if(req.isAuthenticated()){
    return next();
  }

  return res.redirect('/users/login');
});

//SETUP CORS
app.use(function(req,res,next){
res.header('Access-Control-Allow-Credentials', true);
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  if('OPTIONS' == req.method){
    res.send(200);
  }else{
      next();
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/articles', articlesRouter);
app.use('/api/articles', apiArticlesRouter);
app.use('/api/users', apiUsersRouter);

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

module.exports = app;