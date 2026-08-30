const express = require("express");

const {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// REGISTER
// =====================================================

router.post(
  "/register",
  registerUser
);

// =====================================================
// LOGIN
// =====================================================

router.post(
  "/login",
  loginUser
);

// =====================================================
// GET MY PROFILE
// =====================================================

router.get(
  "/profile",
  authMiddleware,
  getMyProfile
);

// =====================================================
// UPDATE MY PROFILE
// =====================================================

router.put(
  "/profile",
  authMiddleware,
  updateMyProfile
);

module.exports = router;
