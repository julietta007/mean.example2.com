var express = require('express');
var router = express.Router();
var Article = require('../../models/article');
var bodyParser = require('body-parser');

/* GET articles listing. */
router.get('/', function(req, res, next) {

  Article.find({}, function(err, articles){
    if(err){
      return res.json({'success':false, 'error':err});
    }

    return res.json({'success':true, 'articles':articles});
  });
});

/* Get a single article */
router.get('/:slug', function(req, res, next){
  var slug = req.params.slug;

  Article.findOne({'slug':slug}, function(err, article){
    if(err){
      return res.json({'success':false, 'error':err});
    }

    return res.json({'success':true, 'article':article});

  });
});

/* CREATE/POST Articles */
router.post('/', function(req, res, next) {

  //On create we will only save a title. Model lifecycle hooks and the update
  //Method will be used for completing the article

  Article.create(new Article({
    title: req.body.title
  }), function(err, article){

    if(err){
      return res.json({
        'success':false, 
        'article':req.body,
        'error':err
      });
    }

    return res.json({'success':true, 'article':article});
  });
});
//Update an Article
router.put('/', function(req,res){

//Find the record of the article to be updated
Article.findOne(
  {'_id': req.body._id}, 
  function(err, article){

    //Return false if the article is not found
    if(err){
      return res.json({success:false, error:err});
    }

    //If the article is found, update the record
    if(article){
        //Only update values that were passed
        //to the endpoint
        let data = req.body;
        //how many fields did the user ask to update
        let size = Object.keys(data).length;
        //start a counter
        let i = 0;
        //for the sake of readability, create a save function call this after
        //processing all input
        function save(article){
          article.save(function(err){
            if(err){
              return res.json({success: false, error: err});
            }else{
              return res.json({success: true, article: article});
            }
          });
        }

      //Process a single field
      function processItem(data, key, i){
      //If the item is not a function add it to the data object
      if(typeof data[key] !== 'function'){
        article[key] = data[key];
        //Once the last item has been patch in, execute a save
        if( (size -1) ===i) {
          save(article);
        }
      } 
    }
      //Use a loop to patch in changes from the user
      for(var key in data){
        processItem(data, key, i++);
      }
    }
  });
});
      //Delete a single article
      router.delete('/:articleId', function(req, res, next){
        var articleId = req.params.articleId;

        Article.remove({'_id':articleId}, function(err,removed){
          if(err){
            return res.json({success: false, error: err});
          }
          return res.json({success: true, status: removed});
          });
      });
module.exports = router;