var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { 
    title: 'Home' 
  });
});

router.get('/plan-trip', function(req, res) {
  res.render('plan-trip', { 
    title: 'Plan a Trip' 
  });
});

router.post('/plan-trip',)


router.get('/saved-trips', function(req, res) {
  res.render('saved-trips', { 
    title: 'Saved Trips' 
  });
});

router.get('/profile', function(req, res) {
  res.render('profile', { 
    title: 'Profile' 
  });
});

module.exports = router;
