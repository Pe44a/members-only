var express = require('express');
var router = express.Router();
const passport = require("passport")


const userController = require("../controllers/userController")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// GET sign-up form 
router.get('/signup', userController.user_sign_up_get);

// POST sign-up form 
router.post('/signup', userController.user_sign_up_post);


// GET sign-in form 
router.get('/signin', userController.user_sign_in_get);

// POST sign-in form 
router.post('/signin', userController.user_sign_in_post);


// GET create post form 
router.get('/create-post', userController.user_create_post_get);

// POST create post form 
router.post('/create-post', userController.user_create_post_post);


module.exports = router;
