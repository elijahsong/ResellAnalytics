var express = require('express');
var router = express.Router();
var connection = require('../private/connection');
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
  var inventory_delete = `DELETE FROM Inventory WHERE inventory_id = ${connection.escape(id)}`;
  var sales_delete = `DELETE FROM Sales WHERE sales_id = ${connection.escape(id)}`;
  var purchases_delete = `DELETE FROM Purchases WHERE id = ${connection.escape(id)}`


  function deleteInventory() {
    return new Promise((resolve, reject) => {
      connection.query(inventory_delete, (err, result) => {
        if (err) { return reject(err); }
        console.log('Deleting inventory');
        resolve();
      }
    )}
  )};

  function deleteSales() {
    return new Promise((resolve, reject) => {
      connection.query(sales_delete, (err, result) => {
        if (err) { return reject(err); }
        console.log('Deleting sales');
        resolve();
      }
    )}
  )};

  function deletePurchases() {
    return new Promise((resolve, reject) => {
      connection.query(purchases_delete, (err, result) => {
        if (err) { return reject(err); }
        console.log('Deleting purchases');
        resolve();
      }
    )}
  )};

  async function query() {
    try {
      const inventoryQuery = await deleteInventory();
      const salesQuery = await deleteSales();
      const purchasesQuery = await deletePurchases();
      req.flash('success', 'Shoe deleted succesfully!');
      res.redirect('/search');
    } catch (err) {
      console.log(err);
    }
  };
  query();
});

module.exports = router;
