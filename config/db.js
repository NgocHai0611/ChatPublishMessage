const { MongoClient } = require("mongodb");
require("dotenv").config();

let db;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_DB_CONNECT_LOCAL; // URI từ file .env
  if (!mongoURI) {
    throw new Error("MongoDB URI is not defined in environment variables");
  }

  try {
    const client = await MongoClient.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    db = client.db("chatApp"); // Thay "chatApp" bằng tên database của bạn
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Dừng ứng dụng nếu kết nối thất bại
  }
};

// Hàm để lấy instance của `db`
const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};

module.exports = { connectDB, getDB };
