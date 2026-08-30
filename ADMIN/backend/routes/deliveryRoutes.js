/* =====================================================
   FARMNEST ADMIN - DELIVERY ROUTES
===================================================== */

const express = require("express");

const router = express.Router();

const {
  getDeliveryStats,
  getAllDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  getDeliveryBoys,
  assignDeliveryBoy,
} = require("../controllers/deliveryController");

const authMiddleware = require("../middleware/authMiddleware");

const adminMiddleware = require("../middleware/adminMiddleware");

// =====================================================
// ADMIN PROTECTION
// =====================================================

router.use(authMiddleware, adminMiddleware);

// =====================================================
// DELIVERY STATISTICS
// GET /api/deliveries/stats
// =====================================================

router.get("/stats", getDeliveryStats);

// =====================================================
// DELIVERY BOYS
// GET /api/deliveries/delivery-boys
// =====================================================

router.get("/delivery-boys", getDeliveryBoys);

// =====================================================
// ALL DELIVERIES
// GET /api/deliveries
// =====================================================

router.get("/", getAllDeliveries);

// =====================================================
// SINGLE DELIVERY
// GET /api/deliveries/:id
// =====================================================

router.get("/:id", getDeliveryById);

// =====================================================
// UPDATE DELIVERY STATUS
// PUT /api/deliveries/:id/status
// =====================================================

router.put("/:id/status", updateDeliveryStatus);

// =====================================================
// ASSIGN DELIVERY BOY
// PUT /api/deliveries/:id/assign
// =====================================================

router.put("/:id/assign", assignDeliveryBoy);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;
