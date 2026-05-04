//this file validates the requests coming from the frontend and if validation is failed it sends an error message

const Joi = require('joi');

const signupValidation = (req,res,next)=>{
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(100).required(),
    });
    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400)
            .json({message: "Bad Request", error})
    }
    next();
}
const loginValidation = (req,res,next)=>{
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(100).required(),
    });
    const {error} = schema.validate(req.body);
    if(error){
        return res.status(403)
            .json({message: "Auth Failed, User or Password is wrong", success: false})
    }
    next();
}

module.exports = {
    signupValidation,
    loginValidation
}