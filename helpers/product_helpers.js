var db = require('../config/connection');
var collection=require('../config/collection')
const { ObjectId } = require('mongodb');
module.exports = {
    addProducts: (product, callback) => {
        console.log(product);
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                console.log('Data:', data);
                 callback( data.insertedId); // Get the _id of the inserted document
            
            })
            .catch((error) => {
                console.error('Error inserting product:', error);
            });
    },
    getAllProduct:()=>{
        return new Promise(async(resolve, reject) => {
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: new ObjectId(prodId) }).then((response) => {
                console.log(response);
                resolve(response);
            }).catch((error) => {
                console.error(error);
                reject(error); // Reject when an error occurs
            });
        });
    }
}    


