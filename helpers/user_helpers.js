var db = require('../config/connection');
var collection=require('../config/collection')
const bcrypt=require('bcrypt');
const { ObjectId } = require('mongodb');
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
                return new Promise(async (resolve, reject) => {
                    try {
                        let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
            
                        if (userCart) {
                            console.log('Updating existing cart:', userCart);
                            await db.get().collection(collection.CART_COLLECTION).updateOne(
                                { user: new ObjectId(userId) },
                                { $push: { products: new ObjectId(prodId) } }
                            );
                            resolve();
                        } else {
                            console.log('Creating a new cart.');
                            let cartObj = {
                                user: new ObjectId(userId),
                                products: [new ObjectId(prodId)]
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
                      {
                        $lookup: {
                          from: collection.PRODUCT_COLLECTION,
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
                      }
                    ]).toArray();
            
                    if (cartItems.length > 0 && cartItems[0].cartItems) {
                      resolve(cartItems[0].cartItems);
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
                let count = 0;
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
            
                if (cart && cart.products) {
                  count = cart.products.length;
                  console.log(cart.products.length);
                }
            
                resolve(count);
              });
            }
                  
          }            