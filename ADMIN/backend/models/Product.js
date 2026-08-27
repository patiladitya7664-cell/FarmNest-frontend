const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // WAREHOUSE
    // ==========================================

    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    // ==========================================
    // PRODUCT INFORMATION
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    harvestDate: {
      type: Date,
    },

    farmLocation: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    weightPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      default: "kg",
      trim: true,
    },

    // ==========================================
    // PRODUCT IMAGE
    // ==========================================

    image: {
      type: String,
      default: "",
    },

    // ==========================================
    // PRODUCT STATUS
    // ==========================================

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    productType: {
      type: String,
      enum: ["Organic", "Regular"],
      default: "Regular",
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
