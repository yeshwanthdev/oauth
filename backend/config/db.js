const rm = require("@root/rm");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(rm.config.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const getConnectionString = (db) => {
  let URL = `${db.scheme}://${db.username}:${db.password}@${db.host}`;
  return URL;
};

module.exports = {
  connectDB,
};
