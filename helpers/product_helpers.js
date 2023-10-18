var db = require('../config/connection');

module.exports = {
    addProducts: (product, callback) => {
        console.log(product);
        db.get().collection('products').insertOne(product).then((data) => {
                console.log('Data:', data);
                if (callback) {
                    callback( data.insertedId); // Get the _id of the inserted document
                }
            })
            .catch((error) => {
                console.error('Error inserting product:', error);
            });
    },

}
