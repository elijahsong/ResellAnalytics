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
    
    var sql = `INSERT INTO Shoe(SKU, name) VALUES (${connection.escape(SKU)}, ${connection.escape(name)}) ON DUPLICATE KEY UPDATE name = ${connection.escape(name)}`;
    var sql1 = `INSERT INTO Purchases(date, price, method, payment_type) VALUES(${connection.escape(purchase_date)}, ${connection.escape(price)},${connection.escape(method)},${connection.escape(payment_type)})`;
  
    console.log(sql1);
    connection.query(sql, function(err, result) {
      if (err) {
        throw err;
      } else {
        console.log('SKU ' + SKU + ' registered');
      }
    });
  
    connection.query(sql1, function(err, result) {
      if (err) {
        throw err;
      } else {
        console.log('record inserted into Purchases');
    
        var last_id;
    
        connection.query(`SELECT LAST_INSERT_ID() AS lastid`, function(err, rows) {
        if (err) { throw err; }
        else {
            setValue(rows);
        }
  
        var sql2 = `INSERT INTO Inventory(inventory_id) VALUES(${connection.escape(last_id)})`;
        console.log(sql2);
        connection.query(sql2, function(err, result) {
          if (err) {
            throw err;
          } else {
            console.log('record id inserted into Inventory');
            
            var sql3 = `UPDATE Inventory SET SKU=${connection.escape(SKU)}, size=${connection.escape(size)}, status=${connection.escape(shoe_status)} WHERE inventory_id = ${connection.escape(last_id)}`;
           
            connection.query(sql3, function(err, result) {
              if (err) throw err;
              console.log('full record inserted into Inventory');
            });
  
            var sql4 = `INSERT INTO Sales(sales_id) VALUES(${connection.escape(last_id)})`;
            
            connection.query(sql4, function(err, result) {
              if (err) throw err;
              console.log('record id inserted into Sales');
              req.flash('success', 'Data added successfully!');
              res.redirect('/insert');
            });
  
          }
      });
    });
  
      function setValue(value) {
        last_id = value[0].lastid;
        console.log(last_id);
      }
      }
    
      
  });
});

module.exports = router;
