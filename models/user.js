var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

//Create a Schema
var User = new Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: [true, 'Email must be unique']
    },
    username: {
        type: String,
        required: [true, 'Please enter an username'],
        unique: [true, 'Username must be unique']
    },
    first_name: String,
    last_name: String,
    admin: {
        type: Boolean,
        default: false
    },
    created:{
        type: Date,
        default: Date.now
    },
    modified:{
        type: Date,
        default: Date.now
    }
});
User.pre('save', function(next){
    this.modified = new Date().toISOString();
    next();
});

User.plugin(uniqueValidator);

module.exports = mongoose.model('User', User);

