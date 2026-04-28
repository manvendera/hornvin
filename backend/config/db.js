// ─────────────────────────────────────────────────────────
//  config/db.js — MongoDB Connection
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes("Could not connect to any servers") || error.code === 'ETIMEDOUT') {
      console.log("\n💡 TIP: This usually means your IP address is not whitelisted in MongoDB Atlas.");
      console.log("   1. Log in to MongoDB Atlas.");
      console.log("   2. Go to 'Network Access'.");
      console.log("   3. Add your current IP address (122.183.41.64) to the list.\n");
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
