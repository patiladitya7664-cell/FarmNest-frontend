const express = require("express");

const router = express.Router();

const {
  getAllPayments,
  getPaymentById,
  getPaymentSummary,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// ADMIN - GET ALL PAYMENTS
// GET /api/payments
// =====================================================

router.get(
  "/",
  authMiddleware,
  getAllPayments
);

// =====================================================
// ADMIN - GET PAYMENT SUMMARY
// GET /api/payments/summary
// =====================================================

router.get(
  "/summary",
  authMiddleware,
  getPaymentSummary
);

// =====================================================
// ADMIN - GET SINGLE PAYMENT
// GET /api/payments/:id
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  getPaymentById
);

module.exports = router;