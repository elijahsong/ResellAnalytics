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
  var keywordLike = `%${keyword}%`
  var search = `SELECT DISTINCT p.id AS dataid, sh.name AS name, i.SKU AS SKU, i.size AS size, i.status AS status, (s.price - p.price + COALESCE(s.extra_fees, 0.00)) AS profit,
  p.date AS date, p.price AS price, p.method AS method, p.payment_type AS payment, 
  s.date AS sale_date, s.price AS sale_price, s.extra_fees AS extra_fees, s.method AS sale_method, s.payment_type AS sale_payment 
  FROM Purchases p JOIN Inventory i ON (p.id = i.inventory_id) LEFT JOIN Sales s ON (p.id = s.sales_id) LEFT JOIN Shoe sh ON (i.SKU = sh.SKU) 
  WHERE p.id LIKE ${connection.escape(keywordLike)} OR sh.name LIKE ${connection.escape(keywordLike)} OR i.SKU LIKE ${connection.escape(keywordLike)} OR i.size LIKE ${connection.escape(keywordLike)} 
  OR i.status LIKE ${connection.escape(keywordLike)} OR p.date LIKE ${connection.escape(keywordLike)} OR p.price LIKE ${connection.escape(keywordLike)} OR p.method LIKE ${connection.escape(keywordLike)} 
  OR p.payment_type LIKE ${connection.escape(keywordLike)} OR s.date LIKE ${connection.escape(keywordLike)} OR s.price LIKE ${connection.escape(keywordLike)} OR s.extra_fees LIKE ${connection.escape(keywordLike)} 
  OR s.method LIKE ${connection.escape(keywordLike)} OR s.payment_type LIKE ${connection.escape(keywordLike)}`;

  var count = `SELECT COUNT(DISTINCT p.id) AS counted FROM Purchases p JOIN Inventory i ON (p.id = i.inventory_id) LEFT JOIN Sales s ON (p.id = s.sales_id) LEFT JOIN Shoe sh ON (i.SKU = sh.SKU) 
  WHERE p.id LIKE ${connection.escape(keywordLike)} OR sh.name LIKE ${connection.escape(keywordLike)} OR i.SKU LIKE ${connection.escape(keywordLike)} OR i.size LIKE ${connection.escape(keywordLike)} 
  OR i.status LIKE ${connection.escape(keywordLike)} OR p.date LIKE ${connection.escape(keywordLike)} OR p.price LIKE ${connection.escape(keywordLike)} OR p.method LIKE ${connection.escape(keywordLike)} 
  OR p.payment_type LIKE ${connection.escape(keywordLike)} OR s.date LIKE ${connection.escape(keywordLike)} OR s.price LIKE ${connection.escape(keywordLike)} OR s.extra_fees LIKE ${connection.escape(keywordLike)} 
  OR s.method LIKE ${connection.escape(keywordLike)} OR s.payment_type LIKE ${connection.escape(keywordLike)}`;

  function retrieveCount() {
    return new Promise((resolve, reject) => {
      connection.query(count, (err, data) => {
        if (err) { return reject(err); }
        console.log('Counter set');
        resolve(data[0].counted);
      }
    )}
  )};

  function retrieveData() {
    return new Promise((resolve, reject) => {
      connection.query(search, (err, data) => {
        if (err) { return reject(err); }
        console.log('Search complete');
        resolve(data);
      }
    )}
  )};

  async function query() {
    try {
      const counter = await retrieveCount();
      const data = await retrieveData();
      req.flash('success', counter + ' results found');
      res.render('searchresults', { title: 'Search Results', userData: data, action: 'Load'});
    } catch (err) {
      console.log(err);
    }
  };
  query(); 
});

module.exports = router;
