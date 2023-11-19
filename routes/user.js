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
router.get('/', function(req, res, next) {
  productHelpers.getAllProduct().then((products)=>{
    let user=req.session.user
    console.log("user",user);
   // console.log('products:',products);//
    res.render('user/view-products',{products,user});
  })
})

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
      console.log("response",response);
      res.redirect('/login'); 
  }).catch((error) => {
      console.error(error); // Log and handle errors
      res.status(500).send('Error occurred during signup.'); // Handle errors
  });
})
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
  console.log(products);
  res.render('user/cart')
})

router.get('/add-to-cart/:id', verifyLogin, (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id)
    .then(() => {
      res.redirect('/');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error adding to cart');
    });
});



module.exports = router;
