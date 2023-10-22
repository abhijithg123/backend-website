var express = require('express');
var router = express.Router();
var productHelpers=require("../helpers/product_helpers")

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProduct().then((products)=>{
    console.log(products);
    res.render('admin/view-products',{admin:true,products});
  })
 
});
router.get('/add-products',function(req, res, next) {
  res.render('admin/add-products');
});
 router.post('/add-products',(req,res)=>{
 // console.log(req.body);//
 // console.log(req.files.images);
  productHelpers.addProducts(req.body,(insertedId)=>{
    let image = req.files.images;
      console.log(insertedId);
  
      // Construct the destination path for the image
      const imagePath = `./public/images/${insertedId}.jpg`;
  
      image.mv(imagePath, (err, done) => {
        if (!err) {
          // Render a success page or redirect as needed
          res.render('admin/add-products');
        } else {
          console.log(err);
          // Handle the error
        }
      });
    });
  });
  

 
module.exports = router;
