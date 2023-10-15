const { MongoClient } = require('mongodb');

const state = {
  db: null
};

const url = 'mongodb://localhost:27017'; // Corrected the URL format
const dbname = 'shopping_cart';
const client = new MongoClient(url);

const connect = async (done) => {
  try {
    await client.connect();
    const db = client.db(dbname);
    state.db = db;
    return done();
  } catch (err) {
    return done(err);
  }
};

const get = () => state.db;

module.exports = {
  connect,
  get
};
