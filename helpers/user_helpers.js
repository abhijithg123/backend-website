var db = require('../config/connection');
var collection=require('../config/collection')
const bcrypt=require('bcrypt');
const { resolve } = require('path/win32');

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
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email }); // Search by email
                if (user) {
                    bcrypt.compare(userData.password, user.password, (err, result) => {
                        if (result) {
                            console.log('login success');
                            resolve(user); // You may want to resolve with the user data
                        } else {
                            console.log('login failed');
                            reject('Invalid password'); // Reject with an error message
                        }
                    });
                } else {
                    console.log('login failed - user not found');
                    reject('User not found'); // Reject with an error message
                }
            });
        }
        
    }
    