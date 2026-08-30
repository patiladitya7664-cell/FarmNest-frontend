/* =====================================================
   FARMNEST DELIVERY BOY ROUTES
===================================================== */

const express = require("express");

const router = express.Router();

const {
  getMyAssignedOrders,
  getMyAssignedOrderById,
  updateMyOrderStatus,
} = require("../controllers/deliveryBoyController");

const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// GET ALL ASSIGNED ORDERS
// GET /api/delivery-boy/orders
// =====================================================

router.get(
  "/orders",
  authMiddleware,
  getMyAssignedOrders
);

// =====================================================
// GET SINGLE ASSIGNED ORDER
// GET /api/delivery-boy/orders/:id
// =====================================================

router.get(
  "/orders/:id",
  authMiddleware,
  getMyAssignedOrderById
);

// =====================================================
// UPDATE ORDER STATUS
// PUT /api/delivery-boy/orders/:id/status
// =====================================================

router.put(
  "/orders/:id/status",
  authMiddleware,
  updateMyOrderStatus
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;
