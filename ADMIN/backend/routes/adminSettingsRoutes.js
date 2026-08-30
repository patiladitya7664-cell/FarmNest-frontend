const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLERS
// =====================================================

const {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  updateAdminPreferences,
} = require("../controllers/adminSettingsController");

// =====================================================
// MIDDLEWARE
// =====================================================

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// =====================================================
// GET ADMIN PROFILE
// GET /api/admin/settings/profile
// =====================================================

router.get(
  "/profile",
  authMiddleware,
  adminMiddleware,
  getAdminProfile
);

// =====================================================
// UPDATE ADMIN PROFILE
// PUT /api/admin/settings/profile
// =====================================================

router.put(
  "/profile",
  authMiddleware,
  adminMiddleware,
  updateAdminProfile
);

// =====================================================
// CHANGE ADMIN PASSWORD
// PUT /api/admin/settings/password
// =====================================================

router.put(
  "/password",
  authMiddleware,
  adminMiddleware,
  changeAdminPassword
);

// =====================================================
// UPDATE ADMIN PREFERENCES
// PUT /api/admin/settings/preferences
// =====================================================

router.put(
  "/preferences",
  authMiddleware,
  adminMiddleware,
  updateAdminPreferences
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;
