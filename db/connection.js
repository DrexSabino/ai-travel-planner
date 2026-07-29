const { MongoClient } = require('mongodb');

let client;
let database;

async function connectToDatabase() {
  if (database) {
    return database;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI was not found in the .env file.');
  }

  client = new MongoClient(mongoUri);

  await client.connect();

  database = client.db('ai_travel_planner');

  console.log('Connected to MongoDB.');

  return database;
}

function getDatabase() {
  if (!database) {
    throw new Error('Database has not been connected.');
  }

  return database;
}

module.exports = {
  connectToDatabase,
  getDatabase
};