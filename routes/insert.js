var express = require('express');
var router = express.Router();
var connection = require('../private/connection');
connection.connect;

router
  .route('/')
  .get(function(req, res, next) {
    res.render('insert', { title: 'Insert a Shoe' });
  })
  .post(function(req, res, next) {
    var purchase_date = req.body.date;
    var name = req.body.name;
    var price = req.body.price;
    var method = req.body.method;
    var payment_type = req.body.payment_type;
    var SKU = req.body.SKU;
    var size = req.body.size;
    var shoe_status = req.body.status;
    
    var shoe_insert = `INSERT INTO Shoe(SKU, name) VALUES (${connection.escape(SKU)}, ${connection.escape(name)}) ON DUPLICATE KEY UPDATE name = ${connection.escape(name)}`;
    var purchases_insert = `INSERT INTO Purchases(date, price, method, payment_type) VALUES(${connection.escape(purchase_date)}, ${connection.escape(price)},
    ${connection.escape(method)},${connection.escape(payment_type)})`;
    var last_id;

    function insertPurchase() {
      return new Promise((resolve, reject) => {
        connection.query(purchases_insert, (err, result) => {
          if (err) { return reject(err); }
          console.log('Purchase inserted');
          resolve();
        }
      )}
    )};
    function insertShoe() {
      return new Promise((resolve, reject) => {
        connection.query(shoe_insert, (err, result) => {
          if (err) { return reject(err); }
          console.log(`SKU ${SKU} inserted`);
          resolve();
        }
      )}
    )};

    function retrieveLastId() {
      return new Promise((resolve, reject) => {
        connection.query(`SELECT LAST_INSERT_ID() AS lastid`, (err, data) => {
          if (err) { return reject(err); }
          console.log(`SKU ${SKU} inserted`);
          last_id = data[0].lastid;
          resolve(data[0].lastid);
        }
      )}
    )};

    function insertInventory() {
      return new Promise((resolve, reject) => {
        var inventory_insert = `INSERT INTO Inventory(inventory_id, SKU, size, status) VALUES(${connection.escape(last_id)}, ${connection.escape(SKU)}, 
        ${connection.escape(size)}, ${connection.escape(shoe_status)})`;
        connection.query(inventory_insert, (err, result) => {
          if (err) { return reject(err); }
          if (typeof last_id === 'undefined') {
            req.flash('failure', 'Error retrieving shoe data. Please try again.')
            res.redirect('/insert');
          }
          console.log(last_id);
          console.log('Inventory inserted');
          resolve();
        }
      )}
    )};
    function insertSale() {
      return new Promise((resolve, reject) => {
        var sales_insert = `INSERT INTO Sales(sales_id) VALUES(${connection.escape(last_id)})`;
        connection.query(sales_insert, (err, result) => {
          if (err) { return reject(err); }
          console.log(`SKU ${SKU} inserted`);
          resolve();
        }
      )}
    )};

    async function query() {
      try {
        const [purchaseResult, shoeResult] = await Promise.all([insertPurchase(), insertShoe()]);
        const last_id = await retrieveLastId();
        const [inventoryResult, salesResult] = await Promise.all([insertInventory(), insertSale()]);
        req.flash('success', 'Shoe inserted successfully!');
        res.redirect('/insert');
      } catch (err) {
        throw err;
      }
    }
    query();
});

module.exports = router;
