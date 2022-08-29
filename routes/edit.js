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
    res.render('updateresults', {title: 'Edit Shoe Data', action: 'Edit', userData});
  });
  })
  .post(function(req, res, next){
  var id = req.params.id;
  var name = req.body.name;
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

  var sql1 = `
    UPDATE Purchases
    SET date = '${purchase_date}',
    price = ${purchase_price},
    method = '${purchase_method}',
    payment_type = '${payment_type}'
    WHERE id = ${id}
  `;

  var sql2 = `
    UPDATE Inventory
    SET SKU = '${SKU}',
    size = '${size}',
    status = '${status}'
    WHERE inventory_id = ${id}
  `;

  var sql3 = `
    UPDATE Sales
    SET date = ${sale_date},
    price = ${sale_price},
    extra_fees = ${extra_fees},
    method = '${sale_method}',
    payment_type = '${sale_payment_type}'
    WHERE sales_id = ${id}
  `;
  
  connection.query(sql1, function(err, result) {
    if (err) {
      throw err;
    } else {
      console.log('Purchases table updated');

      connection.query(sql2, function(err, result) {
        if (err) {
          throw err;
        } else {
          console.log('Inventory table updated');

          connection.query(sql3, function(err, result){
            if (err) {
              throw err;
            } else {
              console.log('Sales table updated');
              req.flash('success', 'Data updated succesfully!');
              res.redirect('/update');
            }
          });
        }
      });
    }
  });
});

module.exports = router;
