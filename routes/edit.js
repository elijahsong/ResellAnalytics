var express = require('express');
var router = express.Router();
var connection = require('../private/connection');
router.use(express.json());

connection.connect;

router
  .route('/:id')
  .get(function(req, res, next) {
  var id = req.params.id;
  var retrieve = `SELECT DISTINCT p.id AS dataid, sh.name AS name, i.SKU AS SKU, i.size AS size, i.status AS status, 
  p.date AS date, p.price AS price, p.method AS method, p.payment_type AS payment, 
  s.date AS sale_date, s.price AS sale_price, s.extra_fees AS extra_fees, s.method AS sale_method, s.payment_type AS sale_payment 
  FROM Purchases p JOIN Inventory i ON (p.id = i.inventory_id) LEFT JOIN Sales s ON (p.id = s.sales_id) LEFT JOIN Shoe sh ON (i.SKU = sh.SKU) 
  WHERE p.id = ${connection.escape(id)} LIMIT 20`;
  connection.query(retrieve, function(err, data) {
    var rawData = JSON.stringify(data[0]).replace('g&s', 'g%26s');
    var userData = JSON.parse(rawData);
    console.log(userData);
    res.render('searchresults', {title: 'Edit Shoe Data', action: 'Edit', userData});
  });
  })
  .post(function(req, res, next){
  var id = req.params.id;
  var name = req.body.name; // does this need to be included on the views
  var SKU = req.body.SKU;
  var size = req.body.size;
  var status = req.body.status;

  var purchase_date = req.body.date;
  var purchase_price = req.body.price;
  var purchase_method = req.body.method;
  var payment_type = req.body.payment_type;
  
  var sale_date = req.body.sale_date;
  var sale_price = req.body.sale_price;
  var extra_fees = req.body.extra_fees;
  var sale_method = req.body.sale_method;
  var sale_payment_type = req.body.sale_payment_type;

  // Manual processing of numeric fields in sale query
  if (sale_payment_type === undefined) {
    sale_payment_type = '';
  }
  if (sale_price === '') {
    sale_price = null;
  }
  if (extra_fees === '') {
    extra_fees = null;
  }
  if (sale_date !== '') {
    sale_date =  "\"" + sale_date + "\"";
  } else {
    sale_date = null;
  }

  var purchase_update = `
    UPDATE Purchases
    SET date = ${connection.escape(purchase_date)},
    price = ${connection.escape(purchase_price)},
    method = ${connection.escape(purchase_method)},
    payment_type = ${connection.escape(payment_type)}
    WHERE id = ${connection.escape(id)}
  `;

  var inventory_update = `
    UPDATE Inventory
    SET SKU = ${connection.escape(SKU)},
    size = ${connection.escape(size)},
    status = ${connection.escape(status)}
    WHERE inventory_id = ${connection.escape(id)}
  `;

  var sales_update = `
    UPDATE Sales
    SET date = ${sale_date},
    price = ${sale_price},
    extra_fees = ${extra_fees},
    method = ${connection.escape(sale_method)},
    payment_type = ${connection.escape(sale_payment_type)}
    WHERE sales_id = ${connection.escape(id)}
  `;

  console.log(sales_update);
  
  function updatePurchases() {
    return new Promise((resolve, reject) => {
      console.log('Processing purchase update');
      connection.query(purchase_update, function (err, result) {
        if (err) { return reject(err); }
        resolve();
      }
    )}
  )};

  function updateInventory() {
    return new Promise((resolve, reject) => {
      console.log('Processing inventory update');
      connection.query(inventory_update, function (err, result) {
        if (err) { return reject(err); }
        resolve();
      }
    )}
  )};

  function updateSales() {
    return new Promise((resolve, reject) => {
      console.log('Processing sales update');
      connection.query(sales_update, function (err, result) {
        if (err) { return reject(err); }
        resolve();
      }
    )}
  )};

  async function queryHelper() {
    try {
      const purchaseQuery = await updatePurchases();
      const inventoryQuery = await updateInventory();
      const salesQuery = await updateSales();
      console.log('Sales table updated');
      req.flash('success', 'Shoe data updated succesfully!');
      res.redirect('/search');
    } catch (err) {
      throw err;
    }
  };
  queryHelper();
});

module.exports = router;
