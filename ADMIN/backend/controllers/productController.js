const Product = require("../models/Product");

// ==========================================
// ADD PRODUCT - FARMER
// ==========================================
const addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      quantity,
      weightPerUnit,
      unit,
      image,
    } = req.body;

    // Required fields
    if (
      !name ||
      !category ||
      price === undefined ||
      quantity === undefined ||
      weightPerUnit === undefined ||
      Number(weightPerUnit) <= 0
    ) {
      return res.status(400).json({
        message:
          "Name, category, price, quantity and valid weight are required",
      });
    }
    // Only farmer can add products
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can add products",
      });
    }

    const product = await Product.create({
      farmerId: req.user.id,
      name,
      category,
      description,
      price,
      quantity,
      weightPerUnit,
      unit,
      image,
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Add Product Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET MY PRODUCTS - FARMER
// ==========================================
const getMyProducts = async (req, res) => {
  try {
    // Only farmer
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can access their products",
      });
    }

    const products = await Product.find({
      farmerId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get My Products Error:", error);

    res.status(500).json({
      message: "Server error",
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
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// UPDATE PRODUCT - FARMER
// ==========================================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Only farmer
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can update products",
      });
    }

    const product = await Product.findOne({
      _id: id,
      farmerId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or access denied",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "description",
      "price",
      "quantity",
      "weightPerUnit",
      "unit",
      "image",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// DELETE PRODUCT - FARMER
// ==========================================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Only farmer
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can delete products",
      });
    }

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

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET PENDING PRODUCTS - ADMIN
// ==========================================
const getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "pending",
    })
      .populate("farmerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Pending products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Pending Products Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// APPROVE PRODUCT - ADMIN
// ==========================================
const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.status = "approved";
    product.isAvailable = true;

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product approved successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Approve Product Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// REJECT PRODUCT - ADMIN
// ==========================================
const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.status = "rejected";
    product.isAvailable = false;

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product rejected successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Reject Product Error:", error);

    res.status(500).json({
      message: "Server error",
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
