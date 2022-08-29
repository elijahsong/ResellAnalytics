var express = require('express');
var router = express.Router();
var connection = require('../../private/raconnection');
router.use(express.json());

connection.connect;

router
  .route('/:id')
  .get(function(req, res, next) {
  var id = req.params.id;
  var sql = `SELECT DISTINCT p.id AS dataid, sh.name AS name, i.SKU AS SKU, i.size AS size, i.status AS status, 
  p.date AS date, p.price AS price, p.method AS method, p.payment_type AS payment, 
  s.date AS sale_date, s.price AS sale_price, s.extra_fees AS extra_fees, s.method AS sale_method, s.payment_type AS sale_payment 
  FROM Purchases p JOIN Inventory i ON (p.id = i.inventory_id) LEFT JOIN Sales s ON (p.id = s.sales_id) LEFT JOIN Shoe sh ON (i.SKU = sh.SKU) 
  WHERE p.id = ${id} LIMIT 20`;
  connection.query(sql, function(err, data) {
    var rawData = JSON.stringify(data[0]).replace('g&s', 'g%26s');
    var userData = JSON.parse(rawData);
    console.log(userData);
    res.render('searchresults', {title: 'Edit Shoe Data', action: 'Delete', userData});
  });
  })
  .post(function(req, res, next){
  var id = req.params.id;
  var sql1 = `DELETE FROM Inventory WHERE inventory_id = ${id}`;
  var sql2 = `DELETE FROM Sales WHERE sales_id = ${id}`;
  var sql3 = `DELETE FROM Purchases WHERE id = ${id}`

  connection.query(sql1, function(err, result) {
    if (err) {
      throw err;
    } else {
    console.log('SHOE with id ' + id + ' deleted from Inventory');
    
    connection.query(sql2, function(err,result) {
      if (err) {
        throw err;
      } else {
        console.log('Shoe with id ' + id + ' deleted from Sales');

        connection.query(sql3, function(err,result) {
           console.log('Shoe with id ' + id + ' deleted from Purchases');
           req.flash('success', 'Data deleted successfully!');
           res.redirect('/search');
        });
      }
    });
    }
  });
});

module.exports = router;
