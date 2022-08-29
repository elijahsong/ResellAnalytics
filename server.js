var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var session = require('express-session');
var mysql = require('mysql2');
var cookieParser = require("cookie-parser");

const update = require("./routes/update");
const edit = require("./routes/edit");
const connection = require('../private/raconnection');

connection.connect;

var app = express();
 
// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '../public'));

app.use(session({ 
    secret: '123456catr',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

app.use(flash());
app.use(cookieParser());
 
app.use('/update', update);
// use the update.js to handle endpoints starting with /update

app.use('/edit', edit);

/* GET home page, respond by rendering index.ejs */
app.get('/', function(req, res, next) {
  res.render('insert', { title: 'Insert a Shoe' });
});

app.get('/insert', function(req, res, next) {
  res.render('insert', { title: 'Insert a Shoe' });
});

/*
app.get('/update', function(req, res, next) {
  res.render('update', { title: 'Update a Shoe' });
});

app.post('/update', function(req, res, next) {
  var id = req.body.id;
  res.cookie("pass id", id, {httpOnly: true});
  res.redirect('/updateresults.html');
});

app.get('/update/results', function(req, res,next) {
  var id = req.cookies["pass id"];
  console.log(id);
  var sql=`SELECT DISTINCT p.id AS dataid, sh.name AS name, i.SKU AS SKU, i.size AS size, i.status AS status, 
  p.date AS date, p.price AS price, p.method AS method, p.payment_type AS payment, 
  s.date AS sale_date, s.price AS sale_price, s.extra_fees AS extra_fees, s.method AS sale_method, s.payment_type AS sale_payment 
  FROM Purchases p JOIN Inventory i ON (p.id = i.inventory_id) JOIN Sales s ON (p.id = s.sales_id) LEFT JOIN Shoe sh ON (i.SKU = sh.SKU) 
  WHERE p.id = ${id} LIMIT 20`;
  connection.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('updateresults', { title: 'Update a Shoe', userData: data, action: 'Load'})});
});
*/

app.get('/delete/:id', function(req, res, next){
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
    res.render('updateresults', {title: 'Edit Shoe Data', action: 'Delete', userData});
  });
});

app.post('/delete/:id', function(req, res, next){
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
           res.redirect('/update.html');
        });
      }
    });
    }
  });

});

app.post('/search.html', function(req, res, next) {
  var keyword = req.body.keyword;
  res.cookie("keyword", keyword, {httpOnly: true});
  res.redirect('/searchresults.html');
});

app.get('/searchresults.html', function(req, res,next) {
  var keyword = req.cookies["keyword"];
  console.log(keyword);
  var sql=`SELECT DISTINCT p.id AS dataid, sh.name AS name, i.SKU AS SKU, i.size AS size, i.status AS status, 
  p.date AS date, p.price AS price, p.method AS method, p.payment_type AS payment, 
  s.date AS sale_date, s.price AS sale_price, s.extra_fees AS extra_fees, s.method AS sale_method, s.payment_type AS sale_payment 
  FROM Purchases p JOIN Inventory i ON (p.id = i.inventory_id) LEFT JOIN Sales s ON (p.id = s.sales_id) LEFT JOIN Shoe sh ON (i.SKU = sh.SKU) 
  WHERE p.id LIKE '%${keyword}%' OR sh.name LIKE '%${keyword}%' OR i.SKU LIKE '%${keyword}%' OR i.size LIKE '%${keyword}%' OR i.status LIKE '%${keyword}%'
  OR p.date LIKE '%${keyword}%' OR p.price LIKE '%${keyword}%' OR p.method LIKE '%${keyword}%' OR p.payment_type LIKE '%${keyword}%' OR s.date LIKE '%${keyword}%'
  OR s.price LIKE '%${keyword}%' OR s.extra_fees LIKE '%${keyword}%' OR s.method LIKE '%${keyword}%' OR s.payment_type LIKE '%${keyword}%'
  `;
  connection.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('searchresults', { title: 'Search Results', userData: data})});
});

app.get('/delete.html',function(req, res, next) {
  res.render('delete', { title: 'Delete a Shoe' });
});

app.get('/search.html', function(req, res, next) {
  res.render('search', { title: 'Search for a Shoe' });
});

app.get('/login.html', function(req, res, next) {
  res.render('login', { title: 'Login' });
});


// this code is executed when a user clicks the form submit button
app.post('/insert.html', function(req, res, next) {
  var purchase_date = req.body.date;
  var name = req.body.name;
  var price = req.body.price;
  var method = req.body.method;
  var payment_type = req.body.payment_type;
  var SKU = req.body.SKU;
  var size = req.body.size;
  var shoe_status = req.body.status;
  
  var sql = `INSERT INTO Shoe(SKU, name) VALUES ('${SKU}', '${name}')`;
  var sql1 = `INSERT INTO Purchases(date, price, method, payment_type) VALUES('${purchase_date}', ${price},'${method}','${payment_type}')`;

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

      var sql2 = `INSERT INTO Inventory(inventory_id) VALUES(${last_id})`;
      console.log(sql2);
      connection.query(sql2, function(err, result) {
        if (err) {
          throw err;
        } else {
          console.log('record id inserted into Inventory');
          
          var sql3 = `UPDATE Inventory SET SKU='${SKU}', size='${size}', status='${shoe_status}' WHERE inventory_id = ${last_id}`;
         
          connection.query(sql3, function(err, result) {
            if (err) throw err;
            console.log('full record inserted into Inventory');
          });

          var sql4 = `INSERT INTO Sales(sales_id) VALUES(${last_id})`;
          
          connection.query(sql4, function(err, result) {
            if (err) throw err;
            console.log('record id inserted into Sales');
            req.flash('success', 'Data added successfully!');
            res.redirect('/');
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

/** app.post('/delete.html', function(req, res, next) {
  var id = req.body.id;
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
           res.redirect('/delete.html');
        });
      }
    });
    }
  });

});

app.get('/test', function(request, response){
    connection.query('select * from employees limit 5', function(error, results){
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    });
});
**/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
 
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
 
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
 
// port must be set to 3000 because incoming http requests are routed from port 80 to port 8$
app.listen(80, function () {
    console.log('Node app is running on port 80');
});

module.exports = app;