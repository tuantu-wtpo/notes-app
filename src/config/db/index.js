require('dotenv').config();
const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log(`Connect to ${process.env.MONGODB_URL}`);
  } catch {
    console.log('Error connecting to DB');
  }
}

module.exports = { connect };
