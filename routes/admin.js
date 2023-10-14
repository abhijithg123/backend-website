var express = require('express');
var router = express.Router();
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

module.exports = router;
