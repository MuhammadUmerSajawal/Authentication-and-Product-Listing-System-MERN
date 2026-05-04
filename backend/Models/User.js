//user schema using mongoose, which will be connected to the mongodb database

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
})

//model created using the schema
const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;

//now we will create routing 