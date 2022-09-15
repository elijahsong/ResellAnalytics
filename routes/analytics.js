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
  // 1. Average price bought
  // 2. Average price sold
  // 3. Average profit per shoe
  // 4. Net (total) profit
  // 4. Total Revenue
  // 5. Profit margin
  // 7. Average time to sale

  var from = req.cookies["from"];
  var to = req.cookies["to"];
  console.log(from);
  console.log(to);

  var avg_bought = `SELECT ROUND(AVG(price), 2) FROM Purchases WHERE date BETWEEN ${from} AND ${to};`
  var avg_sold = `SELECT ROUND(AVG(price), 2) FROM Sales WHERE date BETWEEN ${from} AND ${to};`
  var avg_profit = `SELECT ROUND(AVG(s.price - p.price - COALESCE(s.extra_fees, 0.00)), 2)
  FROM Purchases p JOIN Sales s ON p.id = s.sales_id
  WHERE (p.date BETWEEN ${from} AND ${to})
  AND (s.date BETWEEN ${from} AND ${to})`

  var net_profit = `SELECT ROUND(SUM(s.price - p.price - COALESCE(s.extra_fees, 0.00)), 2)
  FROM Purchases p JOIN Sales s ON p.id = s.sales_id
  WHERE (p.date BETWEEN ${from} AND ${to})
  AND (s.date BETWEEN ${from} AND ${to})`

  var revenue = `SELECT ROUND(SUM(price), 2)
  FROM Purchases
  WHERE date BETWEEN ${from} AND ${to}`

  var margin = `` // value of net_profit query divided by revenue times 100
  var cycle = `SELECT ROUND(AVG(DATEDIFF(${to}, ${from})), 2)
  FROM Purchases p JOIN Sales s ON p.id = s.sales_id`

  res.render('analyticsresults', { title: 'Analytics Results' });
});

module.exports = router;
