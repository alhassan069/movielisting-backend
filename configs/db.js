const mongoose = require("mongoose");
require('dotenv').config();

const mongoDBURL = process.env.DB_URL;

mongoose.set('strictQuery', false);

module.exports = () => {
    return mongoose.connect(mongoDBURL);
}