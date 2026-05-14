//product schema

const mongoose = require('mongoose');
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
    images: {
        type: [String],
        required: true,
        validate: {
            validator: (images) => images.length > 0,
            message: 'At least one product image is required',
        },
    },
    sizes: [
        {
            size: {
                type: String,
                required: true,
                trim: true,
            },
            stock: {
                type: Number,
                required: true,
                min: 0,
                default: 0,
            },
        }
    ],
    category: {
        type: String,
        required: true,
        trim: true,
    },
    subCategory: {
        type: String,
        trim: true,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    totalReviews: {
        type: Number,
        default: 0,
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