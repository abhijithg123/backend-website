var express = require('express');
var router = express.Router();
var productHelpers=require("../helpers/product_helpers")
var userHelpers=require("../helpers/user_helpers")
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  productHelpers.getAllProduct().then((products) => {
      res.render('user/view-products', { products, user, cartCount });
  });
});


router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    const loginErr = req.session.loginErr || false;
    console.log("loginErr in GET /login:", loginErr); // Add this line for debugging
    res.render('user/login', { loginErr });
    req.session.loginErr = false;
  }
});

router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
      console.log("response", response);
      req.session.loggedIn = true;
      req.session.user = {
          _id: response.userId,
          name: response.userName,
      };
      res.redirect('/');
  }).catch((error) => {
      console.error(error);
      res.status(500).send('Error occurred during signup.');
  });
});

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status === 'success') {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/');
    } else {
      console.log("loginErr in POST /login:", req.session.loginErr); // Add this line for debugging
      res.render('user/login', { loginErr: "Invalid user or password" });
    }
  }).catch((error) => {
    console.error(error);
    res.status(401).send('Login failed');
  });
});

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id) 
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id);
  console.log(products);
  res.render('user/cart',{products,user:req.session.user,totalValue})
})

router.get('/add-to-cart/:id',  (req, res) => {
  console.log('api calling');
  userHelpers.addToCart(req.params.id, req.session.user._id)
      .then(() => {
          console.log('Cart updated successfully'); // Add this line for debugging
          res.json({status:true})
      })
      .catch((error) => {
          console.error(error);
          res.status(500).send('Error adding to cart');
      });
});
router.post('/change-quantity-of-product/', (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user);
    res.json(response)
  })
})
router.post('/remove-product-items/',(req,res,next)=>{
  userHelpers.removeProductItems(req.body).then((response)=>{
    res.json(response)
  })
})
router.get('/place-order/',verifyLogin,async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id);
  res.render('user/placeorder',{total,user:req.session.user})
})

router.post('/place-order/',async(req,res)=>{
  let cart=await userHelpers.getCartProductsList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId) 
  userHelpers.placeOrder(req.body,cart,totalPrice).then((response)=>{
    res.json({status:true})
  })
router.get('/order-success/',(req,res)=>{
  console.log(req.session.user);
  res.render('user/order-success',{user:req.session.user})
})

router.get('/orders/',verifyLogin,async(req,res)=>{
let orders=await userHelpers.getUserOrderItems(req.session.user._id)
res.render('user/orders',{user:req.session.user,orders})
})

router.get("/view-order-products/:id", async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id);
  console.log('products ',products);
  res.render('user/view-order-products', { user: req.session.user, products });
});

})

module.exports = router;
