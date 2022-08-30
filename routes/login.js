var express = require('express');
var router = express.Router();
var connection = require('../private/connection');
connection.connect;

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

module.exports = router;
