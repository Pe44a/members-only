var express = require('express');
var router = express.Router();

const userController = require("../controllers/userController")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// GET sign-up form 
router.get('/signup', userController.user_sign_up_get);

router.post('/signup', userController.user_sign_up_post);


module.exports = router;
