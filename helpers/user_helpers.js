var db = require('../config/connection');
var collection=require('../config/collection')
const bcrypt=require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('express');
module.exports={
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
        userData.password = await bcrypt.hash(userData.password, 10);
        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
            // Resolve with both user ID and name
            resolve({ userId: data.insertedId, userName: userData.name });
        }).catch((err) => {
            reject(err);
        });
    });
},

       
        doLogin: (userData) => {
                return new Promise(async (resolve, reject) => {
                  try {
                    const user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email });
              
                    if (user) {
                      const passwordMatch = await bcrypt.compare(userData.password, user.password);
              
                      if (passwordMatch) {
                        console.log("Login success");
                        resolve({ status: "success", message: "Login success", user: user });

                      } else {
                        console.log("Login failed");
                        resolve({ status: "fail", message: "Login failed", user: user});
                      }
                    } else {
                      console.log("Login failed -user not found");
                      resolve({ status: "fail", message: "Login failed" });
                    }
                  } catch (error) {
                    console.error("Error during login:", error);
                    reject({ status: "error", message: "An error occurred during login" });
                  }
                });
              },
              addToCart: (prodId, userId) => {
                let proObj = {
                    item: new ObjectId(prodId),
                    quantity: 1
                };
                return new Promise(async (resolve, reject) => {
                    try {
                        let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
            
                        if (userCart) {
                            let proExist = userCart.products.findIndex(product => product.item.toString() === prodId);
                            console.log(proExist);
             
                            if (proExist !== -1) {
                                await db.get().collection(collection.CART_COLLECTION).updateOne(
                                    {
                                        'user': new ObjectId(userId),
                                        'products.item': new ObjectId(prodId)
                                    },
                                    {
                                        $inc: { 'products.$.quantity': 1 }
                                    }
                                ).then(() => {
                                    resolve();
                                }).catch((error) => {
                                    reject(error);
                                });
                            } else {
                                console.log('Updating existing cart:', userCart);
                                await db.get().collection(collection.CART_COLLECTION).updateOne(
                                    {
                                        user: new ObjectId(userId)
                                    },
                                    {
                                        $push: { 'products': proObj }
                                    }
                                ).then(() => {
                                    resolve();
                                }).catch((error) => {
                                    reject(error);
                                });
                            }
                        } else {
                            console.log('Creating a new cart.');
                            let cartObj = {
                                user: new ObjectId(userId),
                                products: [proObj]
                            };
                            await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj);
                            resolve();
                        }
                    } catch (error) {
                        console.error('Error in addToCart:', error);
                        reject(error);
                    }
                });
            
            },//agrregst for combining 2 trables using lookup
            getCartProducts: (userId) => {
              return new Promise(async (resolve, reject) => {
                try {
                  let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
            
                  if (cart && cart.products && cart.products.length > 0) {
                    let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                      {
                        $match: { user: new ObjectId(userId) }
                      },
                      /*{
                        $lookup: {
                          from: collection.PRODUCT_COLLECTION,   look up sending only id products array
                          let: { prolist: '$products' },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $in: ['$_id', '$$prolist']
                                }
                              }
                            }
                          ],
                          as: 'cartItems'
                        }
                      }*/
                      {
                        $unwind:'$products'
                      },
                      {
                        $project:{                       //structure for lookup // 
                          items:'$products.item',
                          quantity: '$products.quantity'
                        }
                      },
                      {
                        $lookup:{
                          from:collection.PRODUCT_COLLECTION,
                          localField:'items',
                          foreignField:'_id',
                          as:'product'
                        }
                      },
                      {
                        $project:{
                          item:1,quantity:1,product:{$arrayElemAt:['$product',0]}//convert array to object
                        }
                        
                      }
                    ]).toArray();
                  //  console.log(cartItems[0].product);//

                    if (cartItems.length > 0 && cartItems) {
                     
                      resolve(cartItems);
                    } else {
                      resolve([]); // Return an empty array if cartItems is empty
                    }
                  } else {
                    resolve([]); // Return an empty array if the cart or products array is empty
                  }
                } catch (error) {
                  console.error('Error in getCartProducts:', error);
                  reject(error);
                }
              });
            },
            
            getCartCount: (userId) => {
              return new Promise(async(resolve, reject) => {
                try {
                  let count = 0;
                  let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
            
                  console.log('Cart in getCartCount:', cart); // Log the cart to see its structure
            
                  if (cart && cart.products) {
                    count = cart.products.length;
                    console.log('Product count:', count); // Log the product count
                  }
            
                  resolve(count);
                } catch (error) {
                  console.error('Error in getCartCount:', error);
                  reject(error);
                }
              });
            },
            
            changeProductQuantity: (details) => {
            return new Promise((resolve, reject) => {
              details.count = parseInt(details.count);
              details.quantity = parseInt(details.quantity);

              console.log('Details:', details); // Add this line to log details

              if (details.count == -1 && details.quantity === 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne(
                { _id: new ObjectId(details.cart) },
                  {
                    $pull: { products: { item: new ObjectId(details.product) } }
                  }
                ).then((response) => {
                  console.log('Remove product response:', response); // Log the response
                  resolve({ removeProduct: true });
                }).catch((error) => {
                  console.error('Error in remove product operation:', error);
                  reject(error);
                });
              } else {
                db.get().collection(collection.CART_COLLECTION)
                  .updateOne(
                    { _id: new ObjectId(details.cart), 'products.item': new ObjectId(details.product) },
                    { $inc: { 'products.$.quantity': details.count } }
                  )
                  .then((response) => {
                    console.log('Update quantity response:', response); // Log the response
                    resolve({status:true});
                  })
                  .catch((error) => {
                    console.error('Error in update quantity operation:', error);
                    reject(error);
                  });
              }
            });
          },
          removeProductItems:(details)=>{
            return new Promise((resolve, reject) => {
              db.get().collection(collection.CART_COLLECTION).updateOne(
                { _id: new ObjectId(details.cart) },
                  {
                    $pull: { products: { item: new ObjectId(details.product) } }
                  }
                ).then((response) => {
                  console.log('Remove product response:', response); // Log the response
                  resolve({ removeProduct: true });
                }).catch((error) => {
                  console.error('Error in remove product operation:', error);
                  reject(error);
                })
            })
          },
          getTotalAmount:(userId)=>{
              return new Promise(async (resolve, reject) => {
                try {
                    let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                      {
                        $match: { user: new ObjectId(userId) }
                      },
                      
                      {
                        $unwind:'$products'
                      },
                      {
                        $project:{                       //projected product item & quantity// 
                          items:'$products.item',
                          quantity: '$products.quantity'
                        }
                      },
                      {
                        $lookup:{
                          from:collection.PRODUCT_COLLECTION,   // bringing product details //
                          localField:'items',
                          foreignField:'_id',
                          as:'product'
                        }
                      },
                      {
                        $project:{
                          item:1,quantity:1,product:{$arrayElemAt:['$product',0]}//convert array to object
                        }
                        
                      },
                      {
                      $group: {
                        _id: null,
                        total: {
                          $sum: {
                            $multiply: [
                              { $toInt: '$quantity' },
                              { $toDouble: '$product.price' } // Use $toDouble in case 'product.price' is a decimal
                            ]
                          }
                        }
                      }
                    }
                    ]).toArray();
                  console.log(total);
                  if (total && total.length > 0) {
                    resolve(total[0].total);
                  } else {
                    resolve(0); // or handle the case when total is not defined
                  }
                } catch (error) {
                  console.error('Error in getCartProducts:', error);
                  reject(error);
                }
              });
            },
            placeOrder:(order,products,total)=>{  
              return new Promise((resolve, reject) => {
                console.log(order,products,total);
                let status=order['payment-method']==='COD'?'placed':'pending'
                let orderObj={
                  deliveryDetails:{
                    address:order.address,
                    pincode:order.pincode,
                    mobile:order.mobile,

                  },
                  userId:new ObjectId(order.userId),
                  paymentMethod:order['payment-method'],
                  total:total,
                  products:products,
                  status:status,
                  Date:new Date()
                }
                db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{ 
                  db.get().collection(collection.CART_COLLECTION).deleteOne({user:new ObjectId(order.userId)})
                  resolve()
                })
              })
              

            },
            getCartProductsList:(userId)=>{
              return new Promise (async(resolve,reject)=>{
                let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})
                resolve(cart.products)
              })
            }
          
        
           
}            