var db = require('../config/connection');
var collection=require('../config/collection')
const bcrypt=require('bcrypt');

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
              }
            }         