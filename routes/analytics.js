var express = require('express');
var router = express.Router();
var connection = require('../private/connection');
connection.connect;

router
  .route('/')
  .get(function(req, res, next) {
    res.render('analytics', { title: 'Resell Analytics' });
  })
  .post(function(req, res, next) {
    var from = req.body.from;
    res.cookie("from", from, {httpOnly: true});
    res.redirect('/analytics/results');
  });

router.get('/results', function(req, res,next) {
  var keyword = req.cookies["from"];
  console.log(from);
  var keywordLike = `%${keyword}%`

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
