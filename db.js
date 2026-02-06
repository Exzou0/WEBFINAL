const { MongoClient } = require('mongodb');

let productsCollection;
let usersCollection;

async function connectDB() {
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

  const DB_NAME = 'electronics_store';         // ← просто имя БД

  if (!MONGO_URI) throw new Error('MONGODB_URI is not set');

  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);

  productsCollection = db.collection('products');
  usersCollection = db.collection('users');

  console.log('MongoDB connected');
}

function getProductsCollection() {
  if (!productsCollection) throw new Error('DB not initialized');
  return productsCollection;
}

function getUsersCollection() {
  if (!usersCollection) throw new Error('DB not initialized');
  return usersCollection;
}

module.exports = {
  connectDB,
  getProductsCollection,
  getUsersCollection
};
