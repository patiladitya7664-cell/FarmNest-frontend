const express = require("express");

const router = express.Router();

// ==========================================
// CONTROLLERS
// ==========================================

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

// ==========================================
// MIDDLEWARE
// ==========================================

const authMiddleware = require("../middleware/authMiddleware");

// Product image upload middleware
const upload = require("../middleware/productUpload");

// ==========================================
// GET ALL APPROVED PRODUCTS - PUBLIC
// ==========================================

router.get("/", getAllProducts);

// ==========================================
// GET MY PRODUCTS - FARMER
// ==========================================

router.get("/my", authMiddleware, getMyProducts);

// ==========================================
// GET PENDING PRODUCTS - ADMIN
// ==========================================

router.get("/pending", authMiddleware, getPendingProducts);

// ==========================================
// ADD PRODUCT - FARMER
// IMAGE REQUIRED
// ==========================================

router.post("/", authMiddleware, upload.single("image"), addProduct);

// ==========================================
// UPDATE PRODUCT - FARMER
// IMAGE OPTIONAL
// ==========================================

router.put("/:id", authMiddleware, upload.single("image"), updateProduct);

// ==========================================
// DELETE PRODUCT - FARMER
// ==========================================

router.delete("/:id", authMiddleware, deleteProduct);

// ==========================================
// APPROVE PRODUCT - ADMIN
// ==========================================

router.put("/:id/approve", authMiddleware, approveProduct);

// ==========================================
// REJECT PRODUCT - ADMIN
// ==========================================

router.put("/:id/reject", authMiddleware, rejectProduct);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
