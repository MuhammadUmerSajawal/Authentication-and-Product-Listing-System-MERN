const { addReview, getReviewsByProduct } = require('../controllers/ReviewController');
const router = require('express').Router();

router.post('/', addReview);
router.get('/:productId', getReviewsByProduct);

module.exports = router;
