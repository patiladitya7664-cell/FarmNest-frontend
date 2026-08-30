const express = require("express");

const router = express.Router();

const {
  getReviewStats,
  getAllReviews,
  getReviewById,
  deleteReview,
  replyToReview,
  createReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// =====================================================
// ADMIN
// =====================================================

router.get(
  "/admin/stats",
  authMiddleware,
  adminMiddleware,
  getReviewStats
);

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllReviews
);

router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  getReviewById
);

router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  deleteReview
);

router.put(
  "/admin/:id/reply",
  authMiddleware,
  adminMiddleware,
  replyToReview
);

// =====================================================
// CUSTOMER
// =====================================================

router.post(
  "/",
  authMiddleware,
  createReview
);

module.exports = router;