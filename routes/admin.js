var express = require('express');
var router = express.Router();
var productHelpers=require("../helpers/product_helpers")
let products=[{
  name:'iphone 11',
  description:'nice ',
  category:'mobile',
  image:'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692846363993'

},
{
  name:'iphone 11',
  description:'nice ',
  category:'mobile',
  image:'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692846363993'
},
{
  name:'iphone 11',
  description:'nice ',
  category:'mobile',
  image:'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692846363993'
}
]


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/view-products',{admin:true,products});
});
router.get('/add-products',function(req, res, next) {
  res.render('admin/add-products');
});
 router.post('/add-products',(req,res)=>{
 // console.log(req.body);//
  console.log(req.files.images);
  productHelpers.addProducts(req.body,(insertedId)=>{
    let image = req.files.images;
      console.log(insertedId);
  
      // Construct the destination path for the image
      const imagePath = `./public/images/${insertedId}.jpeg`;
  
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
