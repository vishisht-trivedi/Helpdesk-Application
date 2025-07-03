require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('MONGO_URI not set in environment variables. Please add it to your .env file.');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
      console.log(`Dropped collection: ${collection.collectionName}`);
    }
    console.log('Database cleaned successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning database:', err);
    process.exit(1);
  }
})(); 