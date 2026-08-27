const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================================================
// REGISTER USER
// =====================================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // =====================================================
    // REQUIRED FIELDS
    // =====================================================
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // =====================================================
    // ALLOWED ROLES
    // =====================================================
    if (!["farmer", "customer", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // =====================================================
    // CHECK EXISTING USER
    // =====================================================
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // =====================================================
    // HASH PASSWORD
    // =====================================================
    const hashedPassword = await bcrypt.hash(password, 10);

    // =====================================================
    // CREATE USER
    // =====================================================
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    // =====================================================
    // REGISTRATION RESPONSE
    // =====================================================
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// LOGIN USER
// =====================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // =====================================================
    // REQUIRED FIELDS
    // =====================================================
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // =====================================================
    // FIND USER
    // =====================================================
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // =====================================================
    // COMPARE PASSWORD
    // =====================================================
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // =====================================================
    // FARMER VERIFICATION CHECK
    // =====================================================
    if (user.role === "farmer") {
      // -----------------------------------------------------
      // PENDING FARMER
      // -----------------------------------------------------
      if (user.verificationStatus === "pending") {
        return res.status(403).json({
          message: "Your farmer account is pending admin verification",
          verificationStatus: "pending",
        });
      }

      // -----------------------------------------------------
      // REJECTED FARMER
      // -----------------------------------------------------
      if (user.verificationStatus === "rejected") {
        return res.status(403).json({
          message: "Your farmer account has been rejected by admin",
          verificationStatus: "rejected",
        });
      }

      // -----------------------------------------------------
      // APPROVED FARMER
      // -----------------------------------------------------
      if (user.verificationStatus !== "approved") {
        return res.status(403).json({
          message: "Farmer account verification is incomplete",
          verificationStatus: user.verificationStatus,
        });
      }
    }

    // =====================================================
    // GENERATE JWT
    // =====================================================
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // =====================================================
    // LOGIN RESPONSE
    // =====================================================
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================
module.exports = {
  registerUser,
  loginUser,
};
