var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var index = require('./routes/index');
var apiUsers = require('./routes/api/users');
var apiArticles = require('./routes/api/articles');

var mongoose = require('mongoose');

var User = require('./models/user');
var indexRouter = require('./routes/index');
var apiUsersRouter = require('./routes/api/users');
var usersRouter = require('./routes/users');

var app = express();

//Call the config file
var config = require('./config.dev');

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
/*
passport.use(new LocalStrategy(
  function(username, password, done){
    User.findOne({username:username}, function(err, user){
      if(err) {
        return done(err)
      }
      if(!user){
        return done(null, false)
      }
      if(!user.verifyPassword(password)){
        return done(null, false);
      }
      return done(null, user);
    });
  }
));
*/

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
    '/favicon.ico',
    '/users/register',
    '/users/login'
  ];

  if(whitelist.indexOf(req.url) !== -1){
    return next();
  }

  //Allow access to dynamic end points
  var subs = [
    '/stylesheets/',
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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.user('/api/users', apiUsers);
app.user('/api/users', apiArticles);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/users', apiUsersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
