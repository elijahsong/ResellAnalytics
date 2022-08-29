var express = require('express');
var router = express.Router();
var connection = require('../../private/raconnection');
connection.connect;

router
  .route('/')
  .get(function(req, res, next) {
    res.render('update', { title: 'Update a Shoe' });
  })
  .post(function(req, res, next) {
  var id = req.body.id;
  res.cookie("pass id", id, {httpOnly: true});
  res.redirect('/update/results');
  });

router.get('/results', function(req, res,next) {
  console.log("here");
  var id = req.cookies["pass id"];
  console.log(id);
  var sql=`SELECT DISTINCT p.id AS dataid, sh.name AS name, i.SKU AS SKU, i.size AS size, i.status AS status, 
  p.date AS date, p.price AS price, p.method AS method, p.payment_type AS payment, 
  s.date AS sale_date, s.price AS sale_price, s.extra_fees AS extra_fees, s.method AS sale_method, s.payment_type AS sale_payment 
  FROM Purchases p JOIN Inventory i ON (p.id = i.inventory_id) LEFT JOIN Sales s ON (p.id = s.sales_id) LEFT JOIN Shoe sh ON (i.SKU = sh.SKU) 
  WHERE p.id = ${id} LIMIT 20`;
  connection.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('updateresults', { title: 'Update a Shoe', userData: data, action: 'Load'})});
});

module.exports = router;
