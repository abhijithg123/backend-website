var express = require('express');
var router = express.Router();
var productHelpers=require("../helpers/product_helpers")
var userHelpers=require("../helpers/user_helpers")

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProduct().then((products)=>{
    console.log('products:',products);
    res.render('user/view-products',{admin:false,products});
  })
})
router.get('/login',(req, res)=>{
  res.render('user/login')
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
      console.log(response);
      res.redirect('/'); // Redirect to the homepage or another page after signup
  }).catch((error) => {
      console.error(error); // Log and handle errors
      res.status(500).send('Error occurred during signup.'); // Handle errors
  });
});

module.exports = router;
