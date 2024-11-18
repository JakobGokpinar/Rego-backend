var express = require('express');

var authenticationRouter = require('./authentication.js');

var router = express.Router();

router.use('/', authenticationRouter);

module.exports = router;