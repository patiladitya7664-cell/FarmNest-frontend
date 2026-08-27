const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLERS
// =====================================================

const {
  getPendingFarmers,
  approveFarmer,
  rejectFarmer,
  getDashboardStats,
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
} = require("../controllers/adminController");

const {
  getPendingProducts,
  approveProduct,
  rejectProduct,
} = require("../controllers/productController");

// =====================================================
// MIDDLEWARE
// =====================================================

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get("/dashboard", authMiddleware, adminMiddleware, getDashboardStats);

// =====================================================
// FARMER VERIFICATION
// =====================================================

// GET PENDING FARMERS
router.get(
  "/farmers/pending",
  authMiddleware,
  adminMiddleware,
  getPendingFarmers,
);

// APPROVE FARMER
router.put(
  "/farmers/:id/approve",
  authMiddleware,
  adminMiddleware,
  approveFarmer,
);

// REJECT FARMER
router.put(
  "/farmers/:id/reject",
  authMiddleware,
  adminMiddleware,
  rejectFarmer,
);

// =====================================================
// CUSTOMER MANAGEMENT
// =====================================================

// GET ALL CUSTOMERS
router.get("/customers", authMiddleware, adminMiddleware, getAllCustomers);

// GET CUSTOMER BY ID
router.get("/customers/:id", authMiddleware, adminMiddleware, getCustomerById);

// DELETE CUSTOMER
router.delete(
  "/customers/:id",
  authMiddleware,
  adminMiddleware,
  deleteCustomer,
);

// =====================================================
// PRODUCT MANAGEMENT
// =====================================================

// GET PENDING PRODUCTS
router.get(
  "/products/pending",
  authMiddleware,
  adminMiddleware,
  getPendingProducts,
);

// APPROVE PRODUCT
router.put(
  "/products/:id/approve",
  authMiddleware,
  adminMiddleware,
  approveProduct,
);

// REJECT PRODUCT
router.put(
  "/products/:id/reject",
  authMiddleware,
  adminMiddleware,
  rejectProduct,
);

module.exports = router;
