var express = require('express');
var router = express.Router();
var connection = require('../private/connection');
var { DateTime } = require("luxon");
const { resolveInclude } = require('ejs');
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
  // 5. Total Revenue
  // 6. Profit margin
  // 7. Average time to sale

  var from = req.cookies["from"];
  var to = req.cookies["to"];
  console.log(from);
  console.log(to);

  var avg_bought = `SELECT ROUND(AVG(price), 2) AS avg_bought FROM Purchases WHERE date 
  BETWEEN ${connection.escape(from)} AND ${connection.escape(to)};`

  var avg_sold = `SELECT ROUND(AVG(price), 2) AS avg_sold 
  FROM Sales WHERE date 
  BETWEEN ${connection.escape(from)} 
  AND ${connection.escape(to)};`

  var avg_profit = `SELECT ROUND(AVG(s.price - p.price - COALESCE(s.extra_fees, 0.00)), 2) AS avg_profit
  FROM Purchases p JOIN Sales s ON p.id = s.sales_id
  WHERE (p.date BETWEEN ${connection.escape(from)} AND ${connection.escape(to)})
  AND (s.date BETWEEN ${connection.escape(from)} AND ${connection.escape(to)})`

  var net_profit = `SELECT ROUND(SUM(s.price - p.price - COALESCE(s.extra_fees, 0.00)), 2) AS net_profit
  FROM Purchases p JOIN Sales s ON p.id = s.sales_id
  WHERE (p.date BETWEEN ${connection.escape(from)} AND ${connection.escape(to)})
  AND (s.date BETWEEN ${connection.escape(from)} AND ${connection.escape(to)})`

  var revenue = `SELECT ROUND(SUM(price), 2) AS revenue
  FROM Purchases
  WHERE date BETWEEN ${connection.escape(from)} AND ${connection.escape(to)}`

  var cycle = `SELECT ROUND(AVG(DATEDIFF(${connection.escape(to)}, ${connection.escape(from)})), 2) AS cycle
  FROM Purchases p JOIN Sales s ON p.id = s.sales_id
  WHERE (p.date BETWEEN ${connection.escape(from)} AND ${connection.escape(to)})
  AND (s.date BETWEEN ${connection.escape(from)} AND ${connection.escape(to)})`

  function avg_price_bought_query() {
    return new Promise((resolve, reject) => {
      connection.query(avg_bought, (err, data) => {
        if (err) { return reject(err); }
        resolve(data[0].avg_bought);
      });
    });
  }

  function avg_price_sold_query() {
    return new Promise((resolve, reject) => {
      connection.query(avg_sold, (err, data) => {
        if (err) { return reject(err); }
        resolve(data[0].avg_sold);
      });
    });
  }

  function average_profit_query() {
    return new Promise((resolve, reject) => {
      connection.query(avg_profit, (err, data) => {
        if (err) { return reject(err); }
        resolve(data[0].avg_profit);
      });
    });
  }

  function net_profit_query() {
    return new Promise((resolve, reject) => {
      connection.query(net_profit, (err, data) => {
        if (err) { return reject(err); }
        resolve(data[0].net_profit);
      });
    });
  }

  function rev_query() {
    return new Promise((resolve, reject) => {
      connection.query(revenue, (err, data) => {
        if (err) { return reject(err); }
        resolve(data[0].revenue);
      });
    });
  }

  function sales_cycle_query() {
    return new Promise((resolve, reject) => {
      connection.query(cycle, (err, data) => {
        if (err) { return reject(err); }
        console.log(data);
        resolve(data[0].cycle);
      });
    });
  }

  async function render() {
    const array = await Promise.all(
      [avg_price_bought_query(), avg_price_sold_query(), average_profit_query(), net_profit_query(), rev_query(), sales_cycle_query()]);
    var margin = Math.round(array[3] / array[4] * 100); // value of net_profit query divided by revenue times 100
    res.render('analyticsresults', { title: 'Analytics Results', data: array, margin: margin});
  }
  render();
});

module.exports = router;
