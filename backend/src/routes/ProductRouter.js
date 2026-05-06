//this file is for the product routes

const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/ProductController');
const { productValidation } = require('../middlewares/ProductValidation');

const router = require('express').Router();

router.post('/', productValidation, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);




module.exports = router;
