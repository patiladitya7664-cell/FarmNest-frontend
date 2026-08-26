const express = require("express");

const router = express.Router();

const {
  getFarmerProfile,
  updateFarmerProfile,
  uploadFarmerProfileImage,
} = require("../controllers/farmerProfileController");

const authMiddleware = require("../middleware/authMiddleware");

const uploadProfileImage = require("../middleware/uploadMiddleware");

// =====================================================
// GET FARMER PROFILE
// =====================================================

router.get("/profile", authMiddleware, getFarmerProfile);

// =====================================================
// UPDATE FARMER PROFILE
// =====================================================

router.put("/profile", authMiddleware, updateFarmerProfile);

// =====================================================
// UPLOAD FARMER PROFILE IMAGE
// =====================================================

router.post(
  "/profile/image",
  authMiddleware,
  uploadProfileImage.single("profileImage"),
  uploadFarmerProfileImage,
);

module.exports = router;
