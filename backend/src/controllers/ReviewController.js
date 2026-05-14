const ReviewModel = require("../models/Review");
const ProductModel = require("../models/Product");

const addReview = async (req, res) => {
    try {
        const { productId, userName, rating, comment } = req.body;

        if (!productId || !userName || !rating || !comment) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        const review = new ReviewModel({ productId, userName, rating, comment });
        await review.save();

        // Update product rating and review count
        const product = await ProductModel.findById(productId);
        if (product) {
            const reviews = await ReviewModel.find({ productId });
            product.totalReviews = reviews.length;
            const sumRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            product.averageRating = (sumRating / reviews.length).toFixed(1);
            await product.save();
        }

        res.status(201).json({
            message: "Review added successfully",
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await ReviewModel.find({ productId }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Reviews fetched successfully",
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

module.exports = {
    addReview,
    getReviewsByProduct
};
