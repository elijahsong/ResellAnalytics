var express = require('express');
var router = express.Router();
var connection = require('../private/connection');
var { DateTime } = require("luxon");
connection.connect;

router
  .route('/')
  .get(function(req, res, next) {
    res.render('analytics', { title: 'Resell Analytics' });
  })
  .post(function(req, res, next) {
    var from = req.body.from;
    var to = req.body.to;
    // Input sanitization
    if (from === '') { from = "1970-01-01"; }
    if (to === '') { to = DateTime.now().toFormat('yyyy-MM-dd'); }
    res.cookie("from", from, {httpOnly: true});
    res.cookie("to", to, {httpOnly: true});
    res.redirect('/analytics/results');
  });

router.get('/results', function(req, res,next) {
  // These will require more involved subqueries and aggregation
  // Queries to get results BETWEEN two dates
  // Add up net profit, coalescing null values
  // Add up revenue, coalescing necessary or not?
  // Find average profit margin = profit / revenue
  // Average time to sale: 

  var from = req.cookies["from"];
  var to = req.cookies["to"];
  console.log(from);
  console.log(to);
  res.render('analyticsresults', { title: 'Analytics Results' });
});

module.exports = router;
