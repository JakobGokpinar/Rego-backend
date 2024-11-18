const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;

const ProductSchema = mongoose.Schema({
  title: {
    type: String
  },
  price: {
    type: Number
  },
  description: {
    type: String
  },
  category: {
    type: String
  },
  subCategory: {
    type: String
  },
  specialProperties: {
    type: Array
  },
  images: {
    type: Array
  },
  postNum: {
    type: String
  },
  sellerId: {
    type: ObjectId
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = ProductModel;
