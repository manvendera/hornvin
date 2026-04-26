const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const seedAdmin = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    const adminEmail = "admin@hornvin.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists. Updating password...");
      existingAdmin.password = "password123";
      existingAdmin.role = "admin";
      existingAdmin.approvalStatus = "approved";
      existingAdmin.isEmailVerified = true;
      await existingAdmin.save();
      console.log("Admin updated!");
    } else {
      console.log("Creating new Admin...");
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: "password123",
        role: "admin",
        approvalStatus: "approved",
        isEmailVerified: true,
      });
      console.log("Admin created successfully!");
    }

    console.log("-----------------------------------------");
    console.log("Credentials:");
    console.log(`Email: ${adminEmail}`);
    console.log("Password: password123");
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedAdmin();
