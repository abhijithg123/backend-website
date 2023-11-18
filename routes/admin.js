var express = require('express');
var router = express.Router();
var productHelpers=require("../helpers/product_helpers")


/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProduct().then((products)=>{
    console.log('products:',products);
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
  router.get('/delete-product/:id', (req, res) => {
    const prodId = req.params.id; // Get the product ID from the URL parameter
    productHelpers.deleteProduct(prodId)
        .then((response) => {
            // Handle successful deletion
            console.log('Product deleted:', response);
            res.redirect('/admin'); // Redirect to the admin page after deletion
        })
        .catch((error) => {
            // Handle the rejection, which may be "Document not found" or other errors
            console.error('Error deleting product:', error);
            res.status(500).send('Error occurred during deletion.');
        });
});

   router.get('/edit-products/:id',async(req,res)=>{
     let product=await productHelpers.getProductDetails(req.params.id)
     console.log(product);
     res.render('admin/edit-products',{product})
  }) 
  router.post('/edit-products/:id', (req, res) => {
    const productId = req.params.id;
    const productDetails = req.body;

    // Check if a new image file was uploaded
    if (req.files && req.files.images) {
        const image = req.files.images;
        const imagePath = `./public/images/${productId}.jpg`;

        // Move the new image to the product's image path
        image.mv(imagePath, (err) => {
            if (err) {
                console.error('Error uploading image:', err);
                // Handle the error, possibly redirect or render an error page
            }
        });
    }

    // Update the product details (excluding the image)
    productHelpers.updateProducts(productId, productDetails)
        .then(() => {
            res.redirect('/admin');
        })
        .catch((error) => {
            console.error('Error updating product:', error);
            // Handle the error, possibly redirect or render an error page
        });
});

 
module.exports = router;
