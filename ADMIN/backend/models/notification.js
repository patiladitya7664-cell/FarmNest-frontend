const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // =====================================================
    // RECIPIENT ROLE
    // =====================================================

    recipientRole: {
      type: String,

      enum: [
        "admin",
        "farmer",
        "customer",
        "deliveryBoy",
      ],

      required: true,

      index: true,
    },

    // =====================================================
    // FARMER ID
    // =====================================================

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      default: null,

      index: true,
    },

    // =====================================================
    // CUSTOMER ID
    // =====================================================

    customerId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      default: null,

      index: true,
    },

    // =====================================================
    // DELIVERY BOY ID
    // =====================================================

    deliveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      default: null,

      index: true,
    },

    // =====================================================
    // ORDER ID
    // =====================================================

    orderId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Order",

      default: null,

      index: true,
    },

    // =====================================================
    // NOTIFICATION TYPE
    // =====================================================

    type: {
      type: String,

      enum: [
        "New Order",
        "Order Status",
        "Payment",
        "Delivery",
        "System",
      ],

      default: "System",

      required: true,
    },

    // =====================================================
    // TITLE
    // =====================================================

    title: {
      type: String,

      required: true,

      trim: true,

      maxlength: 150,
    },

    // =====================================================
    // MESSAGE
    // =====================================================

    message: {
      type: String,

      required: true,

      trim: true,

      maxlength: 500,
    },

    // =====================================================
    // READ STATUS
    // =====================================================

    isRead: {
      type: Boolean,

      default: false,

      index: true,
    },
  },

  {
    timestamps: true,
  }
);

// =====================================================
// ADMIN NOTIFICATION INDEX
// =====================================================

notificationSchema.index({
  recipientRole: 1,

  createdAt: -1,
});

// =====================================================
// FARMER NOTIFICATION INDEX
// =====================================================

notificationSchema.index({
  recipientRole: 1,

  farmerId: 1,

  createdAt: -1,
});

// =====================================================
// CUSTOMER NOTIFICATION INDEX
// =====================================================

notificationSchema.index({
  recipientRole: 1,

  customerId: 1,

  createdAt: -1,
});

// =====================================================
// DELIVERY BOY NOTIFICATION INDEX
// =====================================================

notificationSchema.index({
  recipientRole: 1,

  deliveryBoyId: 1,

  createdAt: -1,
});

// =====================================================
// ORDER NOTIFICATION INDEX
// =====================================================

notificationSchema.index({
  orderId: 1,

  createdAt: -1,
});

// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);
