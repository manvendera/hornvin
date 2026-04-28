const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const unlockAdmin = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    const adminEmail = "admin@hornvin.com";
    const admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log(`Admin user with email ${adminEmail} not found.`);
      process.exit(1);
    }

    console.log("Unlocking Admin account...");
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.isActive = true; // Ensure the account is active
    admin.approvalStatus = "approved"; // Ensure it's approved
    admin.isEmailVerified = true; // Ensure it's verified
    
    await admin.save({ validateBeforeSave: false });
    
    console.log("-----------------------------------------");
    console.log("✅ Admin account has been UNLOCKED!");
    console.log(`Email: ${adminEmail}`);
    console.log("You can now log in with the correct password.");
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Unlock failed:", error);
    process.exit(1);
  }
};

unlockAdmin();
