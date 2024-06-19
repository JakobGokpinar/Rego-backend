const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = async (mongoUrl) => {
    try {
      mongoose.connect(
        mongoUrl,
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
  
  module.exports = connectToDatabase;