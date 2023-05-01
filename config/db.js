const mongoose = require('mongoose');
const dbConfig = require("./config.js");
const mongoURI = dbConfig.db.mongoURI;

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