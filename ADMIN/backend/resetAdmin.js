require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully! 🌱");

    const newPassword = "Admin@123";

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const admin = await User.findOneAndUpdate(
      { email: "admin@farmnest.com" },
      {
        password: hashedPassword,
        role: "admin",
      },
      { new: true }
    );

    if (!admin) {
      console.log("Admin user not found ❌");
      process.exit(1);
    }

    console.log("=================================");
    console.log("Admin password reset successfully!");
    console.log("Email: admin@farmnest.com");
    console.log("Password: Admin@123");
    console.log("Role:", admin.role);
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("Password reset failed:", error.message);
    process.exit(1);
  }
};

resetAdminPassword();