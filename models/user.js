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
    }
});
