const Warehouse = require("../models/Warehouse");

// ===============================
// CREATE WAREHOUSE
// ===============================
const createWarehouse = async (req, res) => {
  try {
    const {
      warehouseName,
      location,
      address,
      city,
      state,
      pincode,
      totalStorage,
      storageUnit,
    } = req.body;

    if (
      !warehouseName ||
      !location ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !totalStorage
    ) {
      return res.status(400).json({
        message: "All required warehouse fields are required",
      });
    }

    const warehouse = new Warehouse({
      farmerId: req.user.id,
      warehouseName,
      location,
      address,
      city,
      state,
      pincode,
      totalStorage,
      usedStorage: 0,
      availableStorage: totalStorage,
      storageUnit: storageUnit || "kg",
    });

    const savedWarehouse = await warehouse.save();

    res.status(201).json({
      message: "Warehouse created successfully",
      warehouse: savedWarehouse,
    });
  } catch (error) {
    console.error("Create Warehouse Error:", error);

    res.status(500).json({
      message: "Failed to create warehouse",
      error: error.message,
    });
  }
};

// ===============================
// GET MY WAREHOUSES
// ===============================
const getMyWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({
      farmerId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Warehouses fetched successfully",
      warehouses,
    });
  } catch (error) {
    console.error("Get Warehouses Error:", error);

    res.status(500).json({
      message: "Failed to fetch warehouses",
      error: error.message,
    });
  }
};

// ===============================
// GET SINGLE WAREHOUSE
// ===============================
const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        message: "Warehouse not found",
      });
    }

    if (warehouse.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to view this warehouse",
      });
    }

    res.status(200).json({
      message: "Warehouse fetched successfully",
      warehouse,
    });
  } catch (error) {
    console.error("Get Warehouse Error:", error);

    res.status(500).json({
      message: "Failed to fetch warehouse",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE WAREHOUSE
// ===============================
const updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        message: "Warehouse not found",
      });
    }

    if (warehouse.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to update this warehouse",
      });
    }

    const {
      warehouseName,
      location,
      address,
      city,
      state,
      pincode,
      totalStorage,
      usedStorage,
      storageUnit,
    } = req.body;

    warehouse.warehouseName = warehouseName || warehouse.warehouseName;

    warehouse.location = location || warehouse.location;

    warehouse.address = address || warehouse.address;

    warehouse.city = city || warehouse.city;

    warehouse.state = state || warehouse.state;

    warehouse.pincode = pincode || warehouse.pincode;

    if (totalStorage !== undefined) {
      warehouse.totalStorage = totalStorage;
    }

    if (storageUnit !== undefined) {
      warehouse.storageUnit = storageUnit;
    }

    const updatedWarehouse = await warehouse.save();

    res.status(200).json({
      message: "Warehouse updated successfully",
      warehouse: updatedWarehouse,
    });
  } catch (error) {
    console.error("Update Warehouse Error:", error);

    res.status(500).json({
      message: "Failed to update warehouse",
      error: error.message,
    });
  }
};

// ===============================
// DELETE WAREHOUSE
// ===============================
const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        message: "Warehouse not found",
      });
    }

    if (warehouse.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this warehouse",
      });
    }

    await Warehouse.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    console.error("Delete Warehouse Error:", error);

    res.status(500).json({
      message: "Failed to delete warehouse",
      error: error.message,
    });
  }
};

// ===============================
// FARMER - SMART STORAGE
// ===============================
const getSmartStorage = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can access smart storage",
      });
    }

    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        message: "Warehouse not found",
      });
    }

    // Check ownership
    if (warehouse.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to access this warehouse",
      });
    }

    // Import Product
    const Product = require("../models/Product");

    // Get products belonging to THIS warehouse
    const products = await Product.find({
      farmerId: req.user.id,
      warehouseId: warehouse._id,
    });

    console.log("🏭 Warehouse:", warehouse.warehouseName);
    console.log("🆔 Warehouse ID:", warehouse._id.toString());

    console.log(
      "📦 Products:",
      products.map((product) => ({
        name: product.name,
        warehouseId: product.warehouseId?.toString(),
        quantity: product.quantity,
        weightPerUnit: product.weightPerUnit,
      })),
    );

    // ===============================
    // CALCULATE STORAGE
    // ===============================

    let usedStorage = 0;
    let storageValue = 0;
    let totalProducts = products.length;

    products.forEach((product) => {
      const quantity = Number(product.quantity) || 0;
      const weightPerUnit = Number(product.weightPerUnit) || 0;
      const price = Number(product.price) || 0;

      // Actual storage occupied
      usedStorage += quantity * weightPerUnit;

      // Total product value
      storageValue += quantity * price;
    });

    const availableStorage = Math.max(
      Number(warehouse.totalStorage) - usedStorage,
      0,
    );
    // ===============================
    // ALERTS
    // ===============================

    const lowStockProducts = products.filter(
      (product) => product.quantity > 0 && product.quantity <= 10,
    );

    const outOfStockProducts = products.filter(
      (product) => product.quantity === 0,
    );

    const lowStockAlert = lowStockProducts.length > 0;

    const outOfStockAlert = outOfStockProducts.length > 0;

    // ===============================
    // RESPONSE
    // ===============================

    res.status(200).json({
      message: "Smart storage fetched successfully",

      smartStorage: {
        warehouseId: warehouse._id,
        warehouseName: warehouse.warehouseName,

        totalStorage: warehouse.totalStorage,
        usedStorage,
        availableStorage,
        storageUnit: warehouse.storageUnit,

        storageValue,
        totalProducts,

        lowStockAlert,
        outOfStockAlert,

        lowStockProducts: lowStockProducts.map((product) => ({
          productId: product._id,
          name: product.name,
          quantity: product.quantity,
          unit: product.unit,
        })),

        outOfStockProducts: outOfStockProducts.map((product) => ({
          productId: product._id,
          name: product.name,
          quantity: product.quantity,
          unit: product.unit,
        })),
      },
    });
  } catch (error) {
    console.error("Smart Storage Error:", error);

    res.status(500).json({
      message: "Failed to fetch smart storage",
      error: error.message,
    });
  }
};

// ===============================
// EXPORT
// ===============================
module.exports = {
  createWarehouse,
  getMyWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  getSmartStorage,
};
