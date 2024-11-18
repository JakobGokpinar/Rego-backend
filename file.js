const express = require('express')

var router = express.Router();

var productRouter = require('./product.js')

router.use('/product', productRouter);

module.exports = router;