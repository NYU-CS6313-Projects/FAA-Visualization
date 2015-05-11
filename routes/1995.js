var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('jade/dashboard', {title: 'Mayday - FAA Accident Visualization', csv_path: '../data/part_91_csv/data_1995_99.csv', years: [1995, 1999]});
});

module.exports = router;
