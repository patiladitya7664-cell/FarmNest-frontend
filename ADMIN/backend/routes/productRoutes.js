const express = require("express");

const router = express.Router();

const {
  addProduct,
  getMyProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getPendingProducts,
  approveProduct,
  rejectProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


// ==========================================
// FARMER PRODUCT ROUTES
// ==========================================

// Add Product
router.post(
  "/",
  authMiddleware,
  addProduct
);

// Get Farmer's Own Products
router.get(
  "/my",
  authMiddleware,
  getMyProducts
);

// Update Product
router.put(
  "/:id",
  authMiddleware,
  updateProduct
);

// Delete Product
router.delete(
  "/:id",
  authMiddleware,
  deleteProduct
);


// ==========================================
// PUBLIC PRODUCT ROUTES
// ==========================================

// Get All Approved Products
router.get(
  "/",
  getAllProducts
);


// ==========================================
// ADMIN PRODUCT ROUTES
// ==========================================

// Get Pending Products
router.get(
  "/admin/pending",
  authMiddleware,
  adminMiddleware,
  getPendingProducts
);

// Approve Product
router.put(
  "/:id/approve",
  authMiddleware,
  adminMiddleware,
  approveProduct
);

// Reject Product
router.put(
  "/:id/reject",
  authMiddleware,
  adminMiddleware,
  rejectProduct
);


module.exports = router;