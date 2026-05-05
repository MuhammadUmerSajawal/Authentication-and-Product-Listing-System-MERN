//to get database connection

const mongoose = require('mongoose'); // importing mongoose module
const mongo_url = process.env.MONGO_URI; // getting the MongoDB connection URI from environment variables

mongoose.connect(mongo_url)
        .then(()=>{
            console.log('MongoDB Connected .....')
        }).catch((err)=>{
            console.log('MongoDB Connection Error: ', err)
        })