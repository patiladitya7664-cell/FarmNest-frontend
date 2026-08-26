const express = require("express");

const router = express.Router();

const {
  getFarmerEarnings,
  getFarmerAnalytics,
} = require("../controllers/farmerAnalyticsController");

const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// FARMER EARNINGS
// =====================================================

router.get(
  "/earnings",
  authMiddleware,
  getFarmerEarnings
);

// =====================================================
// FARMER ANALYTICS
// =====================================================

router.get(
  "/analytics",
  authMiddleware,
  getFarmerAnalytics
);

module.exports = router;