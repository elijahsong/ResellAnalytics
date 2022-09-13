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
  var from = req.cookies["from"];
  console.log(from);

  var count = `SELECT * WHERE ${date}`;

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
