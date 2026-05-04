//product schema

const mongoose = require('mongoose');
const { create } = require('./User');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        // minlength: 3,
    },
    price: {
        type: Number,
        required: true,
        min: 0,                //price cannot be negative
    },
    description: {
        type: String,
        required: false,
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

//model created using the schema
const ProductModel = mongoose.model('products', ProductSchema);
module.exports = ProductModel;