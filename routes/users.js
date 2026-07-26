var express = require('express');
var router = express.Router();

let users = []; //temporaty way to store users 

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
