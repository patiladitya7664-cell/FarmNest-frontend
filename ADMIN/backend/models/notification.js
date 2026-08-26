const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "New Order",
        "Order Status",
        "Payment",
        "System",
      ],
      default: "System",
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);