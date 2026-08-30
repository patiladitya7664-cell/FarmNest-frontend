const bcrypt = require("bcryptjs");

const User = require("../models/User");

// =====================================================
// GET ADMIN PROFILE
// GET /api/admin/settings/profile
// =====================================================

const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findOne({
      _id: req.user.id,
      role: "admin",
    }).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin profile fetched successfully",
      admin,
    });
  } catch (error) {
    console.error("❌ Get Admin Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE ADMIN PROFILE
// PUT /api/admin/settings/profile
// =====================================================

const updateAdminProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      address,
    } = req.body;

    const admin = await User.findOne({
      _id: req.user.id,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }

    // =================================================
    // VALIDATION
    // =================================================

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).toLowerCase().trim();

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Name and email cannot be empty",
      });
    }

    // =================================================
    // CHECK EMAIL
    // =================================================

    const existingUser = await User.findOne({
      email: cleanEmail,
      _id: { $ne: admin._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered by another user",
      });
    }

    // =================================================
    // UPDATE
    // =================================================

    admin.name = cleanName;
    admin.email = cleanEmail;

    admin.phone = phone
      ? String(phone).trim()
      : "";

    admin.location = location
      ? String(location).trim()
      : "";

    admin.address = address
      ? String(address).trim()
      : "";

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        location: admin.location,
        address: admin.address,
        role: admin.role,
        accountStatus: admin.accountStatus,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Update Admin Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update admin profile",
      error: error.message,
    });
  }
};

// =====================================================
// CHANGE ADMIN PASSWORD
// PUT /api/admin/settings/password
// =====================================================

const changeAdminPassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password, new password and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    // =================================================
    // FIND ADMIN
    // =================================================

    const admin = await User.findOne({
      _id: req.user.id,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }

    // =================================================
    // CHECK CURRENT PASSWORD
    // =================================================

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // =================================================
    // HASH NEW PASSWORD
    // =================================================

    admin.password = await bcrypt.hash(
      newPassword,
      10
    );

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("❌ Change Admin Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE ADMIN PREFERENCES
// PUT /api/admin/settings/preferences
// =====================================================

const updateAdminPreferences = async (req, res) => {
  try {
    const {
      darkMode,
      emailNotify,
      smsNotify,
      language,
    } = req.body;

    const admin = await User.findOne({
      _id: req.user.id,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }

    // =================================================
    // PREFERENCES OBJECT
    // =================================================

    admin.preferences = {
      darkMode: Boolean(darkMode),
      emailNotify: Boolean(emailNotify),
      smsNotify: Boolean(smsNotify),
      language: language || "English",
    };

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin preferences updated successfully",
      preferences: admin.preferences,
    });
  } catch (error) {
    console.error(
      "❌ Update Admin Preferences Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update admin preferences",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  updateAdminPreferences,
};
