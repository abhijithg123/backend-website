var express = require('express');
var router = express.Router();
var productHelpers=require("../helpers/product_helpers")

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProduct().then((products)=>{
    console.log('products:',products);
    res.render('user/view-products',{admin:false,products});
  })
})
module.exports = router;
