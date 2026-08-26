const User = require("../models/User");

// =====================================================
// HELPER: CHECK FARMER
// =====================================================

const checkFarmer = (req, res) => {
  if (!req.user || req.user.role !== "farmer") {
    res.status(403).json({
      message: "Only farmers can access this resource",
    });

    return false;
  }

  return true;
};

// =====================================================
// GET FARMER PROFILE
// =====================================================

const getFarmerProfile = async (req, res) => {
  try {
    if (!checkFarmer(req, res)) {
      return;
    }

    const farmer = await User.findById(req.user.id).select("-password");

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer profile not found",
      });
    }

    return res.status(200).json({
      message: "Farmer profile fetched successfully",

      profile: farmer,
    });
  } catch (error) {
    console.error("Get Farmer Profile Error:", error);

    return res.status(500).json({
      message: "Failed to fetch farmer profile",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE FARMER PROFILE
// =====================================================

const updateFarmerProfile = async (req, res) => {
  try {
    if (!checkFarmer(req, res)) {
      return;
    }

    const {
      name,
      email,
      phone,
      farmName,
      location,
      farmSize,
      address,
      bio,
      profileImage,
    } = req.body;

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Full name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email address is required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    // =================================================
    // CHECK EMAIL DUPLICATE
    // =================================================

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email address is already registered",
      });
    }

    // =================================================
    // UPDATE PROFILE
    // =================================================

    const farmer = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name.trim(),

        email: email.trim().toLowerCase(),

        phone: phone.trim(),

        farmName: farmName ? farmName.trim() : "",

        location: location ? location.trim() : "",

        farmSize: farmSize ? farmSize.trim() : "",

        address: address ? address.trim() : "",

        bio: bio ? bio.trim() : "",

        profileImage: profileImage || "",
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer profile not found",
      });
    }

    return res.status(200).json({
      message: "Farmer profile updated successfully",

      profile: farmer,
    });
  } catch (error) {
    console.error("Update Farmer Profile Error:", error);

    return res.status(500).json({
      message: "Failed to update farmer profile",
      error: error.message,
    });
  }
};
// =====================================================
// UPLOAD FARMER PROFILE IMAGE
// =====================================================

const uploadFarmerProfileImage = async (req, res) => {
  try {
    // Check image
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a profile image",
      });
    }

    // Image URL
    const imageUrl = `/uploads/profile/${req.file.filename}`;

    // Update farmer profile
    const farmer = await User.findByIdAndUpdate(
      req.user.id,
      {
        profileImage: imageUrl,
      },
      {
        new: true,
      },
    ).select("-password");

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    res.status(200).json({
      message: "Farmer profile image uploaded successfully",
      profileImage: imageUrl,
      profile: farmer,
    });
  } catch (error) {
    console.error("Profile Image Upload Error:", error);

    res.status(500).json({
      message: "Failed to upload profile image",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getFarmerProfile,
  updateFarmerProfile,
  uploadFarmerProfileImage,
};
