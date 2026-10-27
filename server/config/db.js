const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env.");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB Atlas");
}

module.exports = connectDB;
