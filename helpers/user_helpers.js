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
        }
    }
    