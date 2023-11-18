var db = require('../config/connection');
var collection=require('../config/collection')
const bcrypt=require('bcrypt');
const { ObjectId } = require('mongodb');
module.exports={
        doSignup: (userData) => {
            return new Promise(async (resolve, reject) => { // Fixed the 'promise' typo
                userData.password = await bcrypt.hash(userData.password, 10);
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve('data:', data.insertedId);

                }).catch((err) => {
                    reject(err); // Handle errors properly
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
                    let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
                    if (userCart) {
                       {
                        db.get().collection(collection.USER_COLLECTION).updateOne({user:new ObjectId(userId) },
                        $push:product[new ObjectId(prodId)]
                        )
                        
                       }
                    } else {
                        let cartObj = {
                            user: new ObjectId(userId),
                            products: [new ObjectId(prodId)]
                        }
                        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                            resolve()
                        })
                    }
                })
            }
          }            