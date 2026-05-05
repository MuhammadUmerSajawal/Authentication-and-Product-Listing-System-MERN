//this file contains the logic for signup and login

const bcrypt = require('bcrypt');                //used for encryption-decryption of password
const UserModel = require("../models/User");
const jwt = require('jsonwebtoken');             //used for authentication and authorization

//logic for signup
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409)
                .json({ message: "user already exists, you can login", success: false });
        }
        const userModel = new UserModel({ name, email, password });
        userModel.password = await bcrypt.hash(password, 10);              //encrypting password before saving it in database; salt=10
        await userModel.save();                                             //saving the user in database 
        res.status(201)
            .json({
                message: "Signup successful",
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

//logic for login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(403)
                .json({ message: "Auth Failed, User or Password is wrong", success: false });
        }
        const isPasswordEqual = await bcrypt.compare(password, user.password);  //comparing the entered password with database
        if(!isPasswordEqual){
            return res.status(403)
                .json({ message: "Auth Failed, User or Password is wrong", success: false });
        }
        const jwtToken = jwt.sign(                             //creating jwt token for the logged in user
            {email: user.email, _id: user._id, name: user.name},
            process.env.JWT_SECRET,                            //signing the token with jwt secret
            {expiresIn:"12h"}                                  
        );
        res.status(200)                                       //sending the response to the frontend
            .json({
                message: "Login successful",                    
                success: true,                                  
                jwtToken,                                       
                email,                                          
                name: user.name,                                
            })
    } catch (error) {
        res.status(500)
            .json({
                message: "Internal Server Error",
                success: false
            })
    }
}

module.exports = {
    signup,
    login,
}

//server side validation will be written in Middleware
