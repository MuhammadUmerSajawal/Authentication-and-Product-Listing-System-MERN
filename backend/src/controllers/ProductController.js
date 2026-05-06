// const jwt = require('jsonwebtoken');             //used for authentication and authorization
const mongoose = require("mongoose");
const ProductModel = require("../models/Product");

const slugify = (value) => value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

//logic for creating a product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, createdBy } = req.body;
        const productModel = new ProductModel({ name, description, price, createdBy });
        await productModel.save();                                             //saving the product in database
        res.status(201)
            .json({
                message: "Product created successfully",
                success: true
            })
    } catch (error) {
        // Handle Mongoose validation errors or unique constraint errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: messages.join(', '),
                success: false
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Product with this name already exists",
                success: false
            });
        }
        res.status(500)
            .json({
                message: "Internal Server Error",
                success: false
            })
    }
}


const getProducts = async (req, res) => {
    try {
        const products = await ProductModel.find();
        res.status(200)
            .json({
                message: "Products fetched successfully",
                success: true,
                data: products
            })
    } catch (error) {
        res.status(500)
            .json({
                message: "Internal Server Error",
                success: false
            })
    }
}

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        let product = null;

        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await ProductModel.findById(id);
        }

        if (!product) {
            const products = await ProductModel.find();
            product = products.find((item) => slugify(item.name) === id || item.name === id);
        }

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false
            });
        }

        res.status(200).json({
            message: "Product fetched successfully",
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { requester } = req.query; // Get requester name from query params
        const product = await ProductModel.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        // Simple check: compare the requester name with the creator name
        if (product.createdBy !== requester) {
            return res.status(403).json({ message: "You are not authorized to delete this product", success: false });
        }

        await ProductModel.findByIdAndDelete(id);
        res.status(200)
            .json({
                message: "Product deleted successfully",
                success: true
            })
    } catch (error) {

        res.status(500)
            .json({
                message: "Internal Server Error",
                success: false
            })
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { requester } = req.query;
        const { name, price, description } = req.body;

        if (!name || !price) {
            return res.status(400).json({
                message: "Name and price are required",
                success: false
            });
        }

        const product = await ProductModel.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        if (product.createdBy !== requester) {
            return res.status(403).json({ message: "You are not authorized to edit this product", success: false });
        }

        product.name = name;
        product.price = price;
        product.description = description;

        await product.save();

        res.status(200).json({
            message: "Product updated successfully",
            success: true,
            data: product
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: messages.join(', '),
                success: false
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Product with this name already exists",
                success: false
            });
        }
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
}

