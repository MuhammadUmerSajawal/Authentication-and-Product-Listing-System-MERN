//this file routes requests to the specific controller, but only after validation

const { signup, login } = require('../controllers/AuthController');
const { signupValidation, loginValidation } = require('../middlewares/AuthValidation');

const router = require('express').Router();

router.post('/login', loginValidation, login);     //if login is valid then it will go to login controller where there is login logic 
router.post('/signup', signupValidation, signup);  //if signup is valid then it will go to signup controller where there is signup logic

module.exports = router;
