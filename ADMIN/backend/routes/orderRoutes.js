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
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Create Order
router.post("/", authMiddleware, createOrder);

// Get logged-in customer's orders
router.get("/my-orders", authMiddleware, getMyOrders);

// Farmer - Get orders containing my products
router.get(
  "/farmer",
  authMiddleware,
  getFarmerOrders
);

// Admin - Get All Orders
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllOrders
);

// Get single order
router.get("/:id", authMiddleware, getOrderById);

// Update order status
router.put("/:id/status", authMiddleware, updateOrderStatus);

// Cancel order
router.put("/:id/cancel", authMiddleware, cancelOrder);

// Update Payment Status
router.put(
  "/:id/payment",
  authMiddleware,
  updatePaymentStatus
);

module.exports = router;