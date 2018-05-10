var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/articles');

router.get('/', function(req, res, next){  
  res.render('articles/index', {title: 'Blog'});
});

router.get('/register', function(req, res, next){
  res.render('articles/register', {
     title: 'Create an Account'
    });
});

router.get('/login', function(req, res, next){
  res.render('articles/login', {title: 'Create an Articles Account'});
});

router.post('/login',
  passport.authenticate('local'),
  function(req, res, next){
    res.redirect('/articles');
});

router.get('/logout', function(req, res,next){
  req.logout();
  res.redirect('/articles/login');
});

module.exports = router;