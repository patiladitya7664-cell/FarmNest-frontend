const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getFarmerOrders,
  updatePaymentStatus,
  getDeliveryBoyOrders,
  assignDeliveryBoy,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Create Order
router.post("/", authMiddleware, createOrder);

// Customer Orders
router.get("/my-orders", authMiddleware, getMyOrders);

// Farmer Orders
router.get("/farmer", authMiddleware, getFarmerOrders);

// Delivery Boy - Assigned Orders
router.get("/delivery-boy", authMiddleware, getDeliveryBoyOrders);

// Admin - All Orders
router.get("/admin/all", authMiddleware, adminMiddleware, getAllOrders);

// Admin - Assign Delivery Boy
router.put(
  "/:id/assign-delivery",
  authMiddleware,
  assignDeliveryBoy
);

// Single Order
router.get("/:id", authMiddleware, getOrderById);

// Update Order Status
router.put("/:id/status", authMiddleware, updateOrderStatus);

// Cancel Order
router.put("/:id/cancel", authMiddleware, cancelOrder);

// Payment Status
router.put("/:id/payment", authMiddleware, updatePaymentStatus);

module.exports = router;
