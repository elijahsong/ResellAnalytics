var express = require('express');
var router = express.Router();
var connection = require('../private/connection');
const SneaksAPI = require('sneaks-api');
const sneaks = new SneaksAPI();

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

  function query() {
    return new Promise((resolve, reject) => {
      connection.query(retrieve, (err, data) => {
        if (err) throw err;
        console.log(data);
        var rawData = JSON.stringify(data[0]).replace('g&s', 'g%26s');
        resolve(JSON.parse(rawData));
      });
    });
  }

  function getSKU() {
    return new Promise((resolve, reject) => {
      connection.query(retrieve, (err, data) => {
        if (err) throw err;
        console.log(data);
        var rawData = JSON.stringify(data[0]).replace('g&s', 'g%26s');
        var parsedData = JSON.parse(rawData);
        resolve(parsedData.SKU);
      })
    })
  }

  function apiCall() {
    return new Promise(async(resolve, reject) => {
      try {
        sneaks.getProducts(await getSKU(), 1, (err, products) => {
          console.log("Arrived at sneak API");
          const jsonClean = JSON.parse(JSON.stringify(products));
          if (!jsonClean) {
            console.log(`SKU not found`);
            resolve({
              resellPrice_StockX: '',
              retailPrice: '',
              thumbnailURL: '',
              resellLink_StockX: ''
            });
            return;
          }
          console.log("Here after " + JSON.stringify(jsonClean[0]));
          const jsonObject = JSON.parse(JSON.stringify(jsonClean[0]));
          const resellPriceJSON = jsonObject.lowestResellPrice;
          const resellPrice_StockX = resellPriceJSON.stockX;

          const retailPrice = jsonObject.retailPrice;
          const thumbnailURL = jsonObject.thumbnail;
          const resellLinkJSON = jsonObject.resellLinks;
          const resellLink_StockX = `"${resellLinkJSON.stockX}"`;
          
          console.log(`StockX resell price is: ${resellPrice_StockX}`);
          console.log(`Current retail price is: ${retailPrice}`);
          console.log(`Resell link: ${resellLink_StockX}`);
          console.log(`Thumbnail URL: ${thumbnailURL}`);

          resolve({
            resellPrice_StockX: resellPrice_StockX,
            retailPrice: retailPrice,
            thumbnailURL: thumbnailURL,
            resellLink_StockX: resellLink_StockX
          });
        });
      } catch (err) {
        console.log(`SKU not found`);
        resolve({
          resellPrice_StockX: '',
          retailPrice: '',
          thumbnailURL: '',
          resellLink_StockX: ''
        });
      }
    });
  }

  async function render() {
    let queryData = await query();
    console.log(queryData);
    getSKU();
    let apiData = await apiCall();
    res.render('searchresults', {title: 'Edit Shoe Data', action: 'Edit', userData: queryData, apiData: apiData});
  }
  render();
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
      console.log('Purchase updated');
      connection.query(purchase_update, (err, result) => {
        if (err) { return reject(err); }
        resolve();
      }
    )}
  )};
  function updateInventory() {
    return new Promise((resolve, reject) => {
      connection.query(inventory_update, (err, result) => {
        if (err) { return reject(err); }
        console.log('Inventory updated');
        resolve();
      }
    )}
  )};
  function updateSales() {
    return new Promise((resolve, reject) => {
      connection.query(sales_update, (err, result) => {
        if (err) { return reject(err); }
        console.log('Sales updated');
        resolve();
      }
    )}
  )};

  async function query() {
    try {
      const [purchaseQuery, inventoryQuery, salesQuery] = await Promise.all([updatePurchases(), updateInventory(), updateSales()]);
      console.log('Sales table updated');
      req.flash('success', 'Shoe updated succesfully!');
      res.redirect('/search');
    } catch (err) {
      throw err;
    }
  };
  query();
});

module.exports = router;
