var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('jade/1980-view', { title: 'Mayday - FAA Accident Visualization' });
});

module.exports = router;
