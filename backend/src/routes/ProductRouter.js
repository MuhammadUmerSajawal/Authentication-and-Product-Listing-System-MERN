const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getRelatedProducts, checkoutProducts } = require('../controllers/ProductController');
const { productValidation } = require('../middlewares/ProductValidation');
const upload = require('../middlewares/upload');

const router = require('express').Router();

router.post('/', upload.array('images', 5), productValidation, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/related/:id', getRelatedProducts);
router.put('/:id', upload.array('images', 5), updateProduct);
router.delete('/:id', deleteProduct);
router.post('/checkout', checkoutProducts);

module.exports = router;
