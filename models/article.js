var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');

//Create a Schema
var Article = new Schema({
    title: {
        type: String,
        required: [true, 'Please enter a title'],
        unique: [true, 'Title is already in use']
        },
    slug: {
        type: String,
        required: [true, 'Please enter a slug'],
        unique: [true, 'Slug is already in use']
        },
    keywords: String,
       description: String,
       body: String,
       created: {
       type: Date,
       default: Date.now
      },
    description: {
        type: String,
    },
    body: {
        type: String,
    },
    published: {
        type: Date,
        required: [true, 'Please enter a pub date'],
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified:{
        type: Date,
        default: Date.now
    }
});
//Auto set the modified date on save
Article.pre('save', function(next){
    this.modified = new Date().toISOString();
    next();
});

Article.plugin(uniqueValidator);

module.exports = mongoose.model('Article', Article);