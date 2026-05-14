//this file validates the requests coming from the frontend and if validation is failed it sends an error message

const Joi = require('joi');

const sizeSchema = Joi.object({
    size: Joi.string().trim().required(),
    stock: Joi.number().integer().min(0).required(),
});

const parseSizes = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    try {
        return JSON.parse(value);
    } catch (error) {
        return null;
    }
};

const productValidation = (req, res, next) => {
    const sizes = parseSizes(req.body.sizes);

    if (sizes === null) {
        return res.status(400).json({ message: "Invalid sizes format" });
    }

    req.body.sizes = sizes;

    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().max(500).optional().allow(''),
        createdBy: Joi.string().required(),
        sizes: Joi.array().items(sizeSchema).optional(),
        category: Joi.string().required(),
        subCategory: Joi.string().optional().allow(''),
    })
    const { error } = schema.validate(req.body);
    if (!req.body.name) {
        return res.status(400).json({ message: "Name is required", error })
    } if (!req.body.price) {
        return res.status(400).json({ message: "Price is required", error })
    } if (error) {
        return res.status(400).json({ message: "Bad Request", error })
    }
    next();
}

module.exports = {
    productValidation
}
