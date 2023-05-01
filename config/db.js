const mongoose = require('mongoose');
const dbConfig = require("./config.js");
require('dotenv').config();
const mongoURI = process.env.MONGO_URI;
//  MONGO_URI: "mongodb://localhost/user"
const connectDB = async () => {
    try {
      await mongoose.connect(
        mongoURI,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );
      console.log('MongoDB is Connected...');
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  };
  
  module.exports = connectDB;