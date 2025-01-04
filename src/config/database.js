const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURL = process.env.MONGO_URI;

const connectDB = async () => {
    await mongoose.connect(mongoURL);
}

module.exports = connectDB;