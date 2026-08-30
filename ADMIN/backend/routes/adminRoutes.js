const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLERS
// =====================================================

const {
  addFarmer,
  getAllFarmers,
  getPendingFarmers,
  approveFarmer,
  rejectFarmer,
  getDashboardStats,
  getAdminAnalytics,

  addCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer,

  getPendingProducts,
  approveProduct,
  rejectProduct,

  // Admin Settings
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} = require("../controllers/adminController");
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
// ADMIN ANALYTICS
// =====================================================
// =====================================================
// ADMIN SETTINGS
// =====================================================

// GET ADMIN PROFILE
router.get(
  "/profile",
  authMiddleware,
  adminMiddleware,
  getAdminProfile
);

// UPDATE ADMIN PROFILE
router.put(
  "/profile",
  authMiddleware,
  adminMiddleware,
  updateAdminProfile
);

// CHANGE ADMIN PASSWORD
router.put(
  "/change-password",
  authMiddleware,
  adminMiddleware,
  changeAdminPassword
);
router.get("/analytics", authMiddleware, adminMiddleware, getAdminAnalytics);
// =====================================================
// FARMER MANAGEMENT
// =====================================================

// ADD FARMER
router.post("/farmers", authMiddleware, adminMiddleware, addFarmer);

// GET ALL FARMERS
router.get("/farmers", authMiddleware, adminMiddleware, getAllFarmers);

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

// ADD CUSTOMER
router.post("/customers", authMiddleware, adminMiddleware, addCustomer);

// GET ALL CUSTOMERS
// Search + Filter + Pagination + Order Count
router.get("/customers", authMiddleware, adminMiddleware, getAllCustomers);

// GET CUSTOMER BY ID
// Includes Order Count
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

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
