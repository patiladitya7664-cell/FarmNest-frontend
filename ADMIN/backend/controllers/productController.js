const mongoose = require("mongoose");
const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");

// ==========================================
// HELPER - VALIDATE MONGODB ID
// ==========================================
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ==========================================
// HELPER - VALIDATE FARMER WAREHOUSE
// ==========================================
const validateFarmerWarehouse = async (warehouseId, farmerId) => {
  if (!isValidObjectId(warehouseId)) {
    return null;
  }

  return await Warehouse.findOne({
    _id: warehouseId,
    farmerId: farmerId,
  });
};

// ==========================================
// ADD PRODUCT - FARMER
// ==========================================
const addProduct = async (req, res) => {
  try {
    // ONLY FARMER
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can add products",
      });
    }

    const {
      name,
      category,
      description,
      price,
      quantity,
      weightPerUnit,
      unit,
      warehouseId,
      productType,
      harvestDate,
      farmLocation,
    } = req.body;

    // ==========================================
    // REQUIRED FIELD VALIDATION
    // ==========================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        message: "Product category is required",
      });
    }

    if (price === undefined || price === "") {
      return res.status(400).json({
        message: "Product price is required",
      });
    }

    if (quantity === undefined || quantity === "") {
      return res.status(400).json({
        message: "Product quantity is required",
      });
    }

    if (weightPerUnit === undefined || weightPerUnit === "") {
      return res.status(400).json({
        message: "Weight per unit is required",
      });
    }

    if (!unit || !unit.trim()) {
      return res.status(400).json({
        message: "Product unit is required",
      });
    }

    if (!warehouseId) {
      return res.status(400).json({
        message: "Warehouse is required",
      });
    }

    // ==========================================
    // NUMBER VALIDATION
    // ==========================================

    const productPrice = Number(price);
    const productQuantity = Number(quantity);
    const productWeight = Number(weightPerUnit);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return res.status(400).json({
        message: "Price must be a valid positive number",
      });
    }

    if (!Number.isFinite(productQuantity) || productQuantity < 0) {
      return res.status(400).json({
        message: "Quantity cannot be negative",
      });
    }

    if (!Number.isFinite(productWeight) || productWeight <= 0) {
      return res.status(400).json({
        message: "Weight per unit must be greater than 0",
      });
    }

    // ==========================================
    // PRODUCT TYPE
    // ==========================================

    const finalProductType = productType || "Regular";

    if (!["Organic", "Regular"].includes(finalProductType)) {
      return res.status(400).json({
        message: "Product type must be Organic or Regular",
      });
    }

    // ==========================================
    // IMAGE REQUIRED
    // ==========================================

    if (!req.file) {
      return res.status(400).json({
        message: "Product image is required",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Only image files are allowed",
      });
    }

    // ==========================================
    // VALIDATE FARMER WAREHOUSE
    // ==========================================

    const warehouse = await validateFarmerWarehouse(warehouseId, req.user.id);

    if (!warehouse) {
      return res.status(400).json({
        message: "Invalid warehouse or warehouse does not belong to you",
      });
    }

    // ==========================================
    // CREATE PRODUCT
    // ==========================================

    const product = await Product.create({
      farmerId: req.user.id,

      warehouseId,

      name: name.trim(),
      category: category.trim(),
      description: description ? description.trim() : "",

      price: productPrice,
      quantity: productQuantity,

      weightPerUnit: productWeight,
      unit: unit.trim(),

      productType: finalProductType,

      harvestDate,
      farmLocation: farmLocation ? farmLocation.trim() : "",

      image: `/uploads/products/${req.file.filename}`,

      // Admin approval required
      status: "pending",
      isAvailable: false,
    });

    return res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Add Product Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Product validation failed",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Server error while adding product",
    });
  }
};

// ==========================================
// GET MY PRODUCTS - FARMER
// ==========================================
const getMyProducts = async (req, res) => {
  try {
    // ONLY FARMER
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can access their products",
      });
    }

    const products = await Product.find({
      farmerId: req.user.id,
    })
      .populate(
        "warehouseId",
        "warehouseName location address city state pincode totalStorage storageUnit",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Get My Products Error:", error);

    return res.status(500).json({
      message: "Server error while fetching products",
    });
  }
};

// ==========================================
// GET ALL APPROVED PRODUCTS - PUBLIC
// ==========================================
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "approved",
      isAvailable: true,
      quantity: { $gt: 0 },
    })
      .populate("farmerId", "name email")
      .populate("warehouseId", "warehouseName location city state")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Get All Products Error:", error);

    return res.status(500).json({
      message: "Server error while fetching products",
    });
  }
};

// ==========================================
// UPDATE PRODUCT - FARMER
// ==========================================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // ONLY FARMER
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can update products",
      });
    }

    // VALIDATE ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    // FIND FARMER PRODUCT
    const product = await Product.findOne({
      _id: id,
      farmerId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or access denied",
      });
    }

    const {
      name,
      category,
      description,
      price,
      quantity,
      weightPerUnit,
      unit,
      warehouseId,
      productType,
      harvestDate,
      farmLocation,
    } = req.body;

    // ==========================================
    // NAME
    // ==========================================

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Product name cannot be empty",
        });
      }

      product.name = name.trim();
    }

    // ==========================================
    // CATEGORY
    // ==========================================

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({
          message: "Category cannot be empty",
        });
      }

      product.category = category.trim();
    }

    // ==========================================
    // DESCRIPTION
    // ==========================================

    if (description !== undefined) {
      product.description = description.trim();
    }

    // ==========================================
    // PRICE
    // ==========================================

    if (price !== undefined) {
      const productPrice = Number(price);

      if (!Number.isFinite(productPrice) || productPrice < 0) {
        return res.status(400).json({
          message: "Price must be a valid positive number",
        });
      }

      product.price = productPrice;
    }

    // ==========================================
    // QUANTITY
    // ==========================================

    if (quantity !== undefined) {
      const productQuantity = Number(quantity);

      if (!Number.isFinite(productQuantity) || productQuantity < 0) {
        return res.status(400).json({
          message: "Quantity cannot be negative",
        });
      }

      product.quantity = productQuantity;
    }

    // ==========================================
    // WEIGHT PER UNIT
    // ==========================================

    if (weightPerUnit !== undefined) {
      const productWeight = Number(weightPerUnit);

      if (!Number.isFinite(productWeight) || productWeight <= 0) {
        return res.status(400).json({
          message: "Weight per unit must be greater than 0",
        });
      }

      product.weightPerUnit = productWeight;
    }

    // ==========================================
    // UNIT
    // ==========================================

    if (unit !== undefined) {
      if (!unit.trim()) {
        return res.status(400).json({
          message: "Unit cannot be empty",
        });
      }

      product.unit = unit.trim();
    }

    // ==========================================
    // PRODUCT TYPE
    // ==========================================

    if (productType !== undefined) {
      if (!["Organic", "Regular"].includes(productType)) {
        return res.status(400).json({
          message: "Product type must be Organic or Regular",
        });
      }

      product.productType = productType;
    }

    // ==========================================
    // WAREHOUSE
    // ==========================================

    if (warehouseId !== undefined) {
      const warehouse = await validateFarmerWarehouse(warehouseId, req.user.id);

      if (!warehouse) {
        return res.status(400).json({
          message: "Invalid warehouse or warehouse does not belong to you",
        });
      }

      product.warehouseId = warehouseId;
    }

    // ==========================================
    // OPTIONAL FIELDS
    // ==========================================

    if (harvestDate !== undefined) {
      product.harvestDate = harvestDate;
    }

    if (farmLocation !== undefined) {
      product.farmLocation = farmLocation.trim();
    }

    // ==========================================
    // IMAGE UPDATE
    // ==========================================

    if (req.file) {
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          message: "Only image files are allowed",
        });
      }

      product.image = `/uploads/products/${req.file.filename}`;

      console.log("🖼️ New product image:", product.image);
    }

    // ==========================================
    // SAVE
    // ==========================================

    const updatedProduct = await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Update Product Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Product validation failed",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Server error while updating product",
    });
  }
};

// ==========================================
// DELETE PRODUCT - FARMER
// ==========================================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // ONLY FARMER
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can delete products",
      });
    }

    // VALIDATE ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    // FIND FARMER PRODUCT
    const product = await Product.findOne({
      _id: id,
      farmerId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or access denied",
      });
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Product Error:", error);

    return res.status(500).json({
      message: "Server error while deleting product",
    });
  }
};

// ==========================================
// GET PENDING PRODUCTS - ADMIN
// ==========================================
const getPendingProducts = async (req, res) => {
  try {
    // ADMIN CHECK
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can access pending products",
      });
    }

    const products = await Product.find({
      status: "pending",
    })
      .populate("farmerId", "name email")
      .populate("warehouseId", "warehouseName location city state pincode")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Pending products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Get Pending Products Error:", error);

    return res.status(500).json({
      message: "Server error while fetching pending products",
    });
  }
};

// ==========================================
// APPROVE PRODUCT - ADMIN
// ==========================================
const approveProduct = async (req, res) => {
  try {
    // ADMIN CHECK
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can approve products",
      });
    }

    const { id } = req.params;

    // VALIDATE ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    // FIND PRODUCT
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // ==========================================
    // APPROVE USING ATOMIC UPDATE
    // ==========================================

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "approved",
          isAvailable: product.quantity > 0,
        },
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      message: "Product approved successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Approve Product Error:", error);

    return res.status(500).json({
      message: "Server error while approving product",
      error: error.message,
    });
  }
};

// ==========================================
// REJECT PRODUCT - ADMIN
// ==========================================
const rejectProduct = async (req, res) => {
  try {
    // ADMIN CHECK
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can reject products",
      });
    }

    const { id } = req.params;

    // VALIDATE ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    // FIND PRODUCT
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // ==========================================
    // REJECT USING ATOMIC UPDATE
    // ==========================================

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "rejected",
          isAvailable: false,
        },
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      message: "Product rejected successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Reject Product Error:", error);

    return res.status(500).json({
      message: "Server error while rejecting product",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT ALL FUNCTIONS
// ==========================================
module.exports = {
  addProduct,
  getMyProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getPendingProducts,
  approveProduct,
  rejectProduct,
};
