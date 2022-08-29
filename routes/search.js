var express = require('express');
var router = express.Router();
var connection = require('../private/connection');
connection.connect;

router
  .route('/')
  .get(function(req, res, next) {
    res.render('search', { title: 'Search for a Shoe' });
  })
  .post(function(req, res, next) {
    var keyword = req.body.keyword;
    res.cookie("keyword", keyword, {httpOnly: true});
    res.redirect('/search/results');
  });

router.get('/results', function(req, res,next) {
  var keyword = req.cookies["keyword"];
  console.log(keyword);
  var sql=`SELECT DISTINCT p.id AS dataid, sh.name AS name, i.SKU AS SKU, i.size AS size, i.status AS status, 
  p.date AS date, p.price AS price, p.method AS method, p.payment_type AS payment, 
  s.date AS sale_date, s.price AS sale_price, s.extra_fees AS extra_fees, s.method AS sale_method, s.payment_type AS sale_payment 
  FROM Purchases p JOIN Inventory i ON (p.id = i.inventory_id) LEFT JOIN Sales s ON (p.id = s.sales_id) LEFT JOIN Shoe sh ON (i.SKU = sh.SKU) 
  WHERE p.id LIKE '%${keyword}%' OR sh.name LIKE '%${keyword}%' OR i.SKU LIKE '%${keyword}%' OR i.size LIKE '%${keyword}%' OR i.status LIKE '%${keyword}%'
  OR p.date LIKE '%${keyword}%' OR p.price LIKE '%${keyword}%' OR p.method LIKE '%${keyword}%' OR p.payment_type LIKE '%${keyword}%' OR s.date LIKE '%${keyword}%'
  OR s.price LIKE '%${keyword}%' OR s.extra_fees LIKE '%${keyword}%' OR s.method LIKE '%${keyword}%' OR s.payment_type LIKE '%${keyword}%'
  `;
  connection.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('searchresults', { title: 'Search Results', userData: data, action: 'Load'})
  });
});

module.exports = router;
