const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // CUSTOMER
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // DELIVERY BOY
    deliveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // DELIVERY OTP
    deliveryOtp: {
      type: String,
      default: null,
    },

    deliveryOtpVerified: {
      type: Boolean,
      default: false,
    },

    deliveryStartedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    // PRODUCTS
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    // AMOUNT
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // DELIVERY
    distance: {
      type: Number,
      required: true,
      min: 0,
    },

    totalWeight: {
      type: Number,
      required: true,
      min: 0,
    },

    vehicleType: {
      type: String,
      enum: [
        "Bike",
        "Auto",
        "Small Truck",
        "Larger Vehicle",
      ],
      required: true,
    },

    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
    },

    // SHIPPING ADDRESS
    shippingAddress: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // PAYMENT
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
      ],
      default: "Pending",
    },

    // STATUS
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// INDEXES

orderSchema.index({
  customerId: 1,
  createdAt: -1,
});

orderSchema.index({
  deliveryBoyId: 1,
  createdAt: -1,
});

orderSchema.index({
  status: 1,
  createdAt: -1,
});

// MODEL

module.exports = mongoose.model(
  "Order",
  orderSchema
);