const express = require("express");
const router = express.Router();

const {
    createWarehouse,
    getMyWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse,
    getSmartStorage
} = require("../controllers/warehouseController");

const authMiddleware = require("../middleware/authMiddleware");

// ===============================
// GET MY WAREHOUSES
// ===============================
router.get("/", authMiddleware, getMyWarehouses);

// ===============================
// SMART STORAGE
// ===============================
router.get(
    "/:id/smart-storage",
    authMiddleware,
    getSmartStorage
);

// ===============================
// GET SINGLE WAREHOUSE
// ===============================
router.get("/:id", authMiddleware, getWarehouseById);

// ===============================
// CREATE WAREHOUSE
// ===============================
router.post("/", authMiddleware, createWarehouse);

// ===============================
// UPDATE WAREHOUSE
// ===============================
router.put("/:id", authMiddleware, updateWarehouse);

// ===============================
// DELETE WAREHOUSE
// ===============================


router.delete("/:id", authMiddleware, deleteWarehouse);

module.exports = router;