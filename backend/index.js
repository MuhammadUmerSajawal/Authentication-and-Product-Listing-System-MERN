//server code

const express = require('express');                            // importing express module
const app = express();                                         //express app initialized
const bodyParser = require('body-parser');                     //to get data body from frontend
const cors = require('cors');                                  // to allow requests from other origins/ports
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');

require('dotenv').config();                                    // loading environment variables from .env file
require('./Models/db');                                        // importing the database connection module

const PORT = process.env.PORT || 8080;                         // setting the port from environment variable or default to 8080

app.get('/ping', (req,res) => {
    res.send('PONG');
})

app.use(bodyParser.json());
app.use(cors());
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);


app.listen(PORT, () => (
    console.log(`Server is running on port ${PORT}`)
))
