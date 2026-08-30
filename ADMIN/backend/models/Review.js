const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // =====================================================
    // CUSTOMER
    // =====================================================

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================================
    // PRODUCT
    // =====================================================

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // =====================================================
    // ORDER
    // =====================================================

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    // =====================================================
    // RATING
    // =====================================================

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // =====================================================
    // REVIEW MESSAGE
    // =====================================================

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // =====================================================
    // ADMIN REPLY
    // =====================================================

    adminReply: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    adminReplyAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

reviewSchema.index({
  customerId: 1,
  createdAt: -1,
});

reviewSchema.index({
  productId: 1,
  createdAt: -1,
});

reviewSchema.index({
  rating: 1,
  createdAt: -1,
});

// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model(
  "Review",
  reviewSchema
);