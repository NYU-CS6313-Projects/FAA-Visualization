var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('jade/dashboard', {title: 'Mayday - FAA Accident Visualization', csv_path: '../data/part_91_csv/data_2000_04.csv', years: [2000, 2004]});
});

module.exports = router;
