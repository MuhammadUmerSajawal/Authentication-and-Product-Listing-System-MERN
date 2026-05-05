//this file is for the product routes

const { createProduct, getProducts, getProductById, deleteProduct } = require('../Controllers/ProductController');
const { productValidation } = require('../Middlewares/ProductValidation');

const router = require('express').Router();

router.post('/', productValidation, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.delete('/:id', deleteProduct);




module.exports = router;
