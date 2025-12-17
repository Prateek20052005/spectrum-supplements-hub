// Script to create an admin user
// Run with: node scripts/createAdmin.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Admin user details
    const adminEmail = process.env.ADMIN_EMAIL || "admin@supplements.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Admin User";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      if (existingAdmin.role === "admin") {
        console.log(`⚠️  Admin user with email ${adminEmail} already exists and is an admin.`);
        console.log("   You can log in with this account.");
      } else {
        // Update existing user to admin
        existingAdmin.role = "admin";
        const salt = await bcrypt.genSalt(10);
        existingAdmin.password = await bcrypt.hash(adminPassword, salt);
        await existingAdmin.save();
        console.log(`✅ Updated existing user to admin: ${adminEmail}`);
      }
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const admin = await User.create({
        fullName: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });

      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role: ${admin.role}`);
    }

    console.log("\n📝 You can now log in to the admin panel with these credentials.");
    console.log("   Make sure to change the password after first login!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();

