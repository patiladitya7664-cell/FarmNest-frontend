/* =====================================================
   FARMNEST DELIVERY BOY CONTROLLER
   Assigned Orders + Delivery OTP Management
===================================================== */

const mongoose = require("mongoose");
const crypto = require("crypto");

const Order = require("../models/Order");
const Notification = require("../models/notification");

// =====================================================
// HELPER - CREATE NOTIFICATION
// =====================================================

const createNotification = async (data) => {
  try {
    await Notification.create(data);
    return true;
  } catch (error) {
    console.error("❌ Delivery Notification Error:", error.message);

    return false;
  }
};

// =====================================================
// GET MY ASSIGNED ORDERS
// GET /api/delivery-boy/orders
// =====================================================

const getMyAssignedOrders = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id || req.user._id;

    if (!deliveryBoyId) {
      return res.status(401).json({
        success: false,
        message: "Delivery boy identity not found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    const { status = "all" } = req.query;

    const query = {
      deliveryBoyId,
    };

    if (status !== "all") {
      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter",
        });
      }

      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("customerId", "name email phone")
      .populate("products.productId", "name image unit")
      .sort({
        createdAt: -1,
      })
      .lean();

    const formattedOrders = orders.map((order) => ({
      _id: order._id,

      orderId: String(order._id),

      customer: {
        id: order.customerId?._id || null,

        name: order.customerId?.name || order.shippingAddress?.name || "N/A",

        email: order.customerId?.email || "N/A",

        phone: order.customerId?.phone || order.shippingAddress?.phone || "N/A",
      },

      products: (order.products || []).map((item) => ({
        productId: item.productId?._id || item.productId || null,

        name: item.productId?.name || "Product",

        image: item.productId?.image || "",

        quantity: Number(item.quantity) || 0,

        price: Number(item.price) || 0,

        unit: item.productId?.unit || "kg",
      })),

      shippingAddress: {
        name: order.shippingAddress?.name || "N/A",

        phone: order.shippingAddress?.phone || "N/A",

        address: order.shippingAddress?.address || "N/A",

        city: order.shippingAddress?.city || "N/A",

        state: order.shippingAddress?.state || "N/A",

        pincode: order.shippingAddress?.pincode || "N/A",
      },

      totalAmount: Number(order.totalAmount) || 0,

      deliveryCharge: Number(order.deliveryCharge) || 0,

      totalWeight: Number(order.totalWeight) || 0,

      distance: Number(order.distance) || 0,

      vehicleType: order.vehicleType || "N/A",

      paymentMethod: order.paymentMethod || "COD",

      paymentStatus: order.paymentStatus || "Pending",

      status: order.status || "Pending",

      deliveryStartedAt: order.deliveryStartedAt || null,

      deliveredAt: order.deliveredAt || null,

      deliveryOtpVerified: order.deliveryOtpVerified || false,

      createdAt: order.createdAt,

      updatedAt: order.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("❌ Get Assigned Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned orders",
    });
  }
};

// =====================================================
// GET SINGLE ASSIGNED ORDER
// GET /api/delivery-boy/orders/:id
// =====================================================

const getMyAssignedOrderById = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id || req.user._id;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      deliveryBoyId,
    })
      .populate("customerId", "name email phone")
      .populate("products.productId", "name image unit")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Assigned order not found",
      });
    }

    return res.status(200).json({
      success: true,

      order: {
        ...order,

        deliveryOtp: undefined,

        deliveryOtpVerified: order.deliveryOtpVerified || false,

        deliveryStartedAt: order.deliveryStartedAt || null,

        deliveredAt: order.deliveredAt || null,
      },
    });
  } catch (error) {
    console.error("❌ Get Assigned Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

// =====================================================
// UPDATE MY ORDER STATUS
// PUT /api/delivery-boy/orders/:id/status
// =====================================================

const updateMyOrderStatus = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id || req.user._id;

    const { id } = req.params;

    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      deliveryBoyId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Assigned order not found",
      });
    }

    if (order.status === "Delivered" || order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be updated",
      });
    }

    // -------------------------------------------------
    // DELIVERED REQUIRES OTP
    // -------------------------------------------------

    if (status === "Delivered") {
      if (!order.deliveryOtpVerified) {
        return res.status(400).json({
          success: false,
          message:
            "Delivery OTP must be verified before marking order as delivered",
        });
      }

      order.deliveredAt = new Date();

      if (order.paymentMethod === "COD") {
        order.paymentStatus = "Paid";
      }
    }

    order.status = status;

    await order.save();

    // -------------------------------------------------
    // ADMIN NOTIFICATION
    // -------------------------------------------------

    await createNotification({
      recipientRole: "admin",

      orderId: order._id,

      type: "Order Status",

      title: "Delivery Order Status Updated",

      message: `Order #${order._id
        .toString()
        .slice(-6)
        .toUpperCase()} status changed to ${status}.`,
    });

    return res.status(200).json({
      success: true,

      message: "Order status updated successfully",

      order: {
        _id: order._id,

        orderId: String(order._id),

        status: order.status,

        paymentStatus: order.paymentStatus,

        deliveredAt: order.deliveredAt,
      },
    });
  } catch (error) {
    console.error("❌ Update Delivery Boy Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

// =====================================================
// START DELIVERY
// PUT /api/delivery-boy/orders/:id/start
// =====================================================

const startDelivery = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id || req.user._id;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      deliveryBoyId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Assigned order not found",
      });
    }

    // -------------------------------------------------
    // ORDER VALIDATION
    // -------------------------------------------------

    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Order has already been delivered",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be delivered",
      });
    }

    if (order.deliveryStartedAt) {
      return res.status(400).json({
        success: false,
        message: "Delivery has already been started",
      });
    }

    // -------------------------------------------------
    // GENERATE 6 DIGIT OTP
    // -------------------------------------------------

    const deliveryOtp = crypto.randomInt(100000, 1000000).toString();

    order.deliveryOtp = deliveryOtp;

    order.deliveryOtpVerified = false;

    order.deliveryStartedAt = new Date();

    order.status = "Out for Delivery";

    await order.save();

    console.log(`🚚 Delivery Started: ${order._id}`);

    // -------------------------------------------------
    // ADMIN NOTIFICATION
    // -------------------------------------------------

    await createNotification({
      recipientRole: "admin",

      orderId: order._id,

      type: "Order Status",

      title: "Delivery Started",

      message: `Order #${order._id
        .toString()
        .slice(-6)
        .toUpperCase()} is now out for delivery.`,
    });

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message: "Delivery started successfully",

      order: {
        _id: order._id,

        orderId: String(order._id),

        status: order.status,

        deliveryStartedAt: order.deliveryStartedAt,

        deliveryOtp: deliveryOtp,
      },
    });
  } catch (error) {
    console.error("❌ Start Delivery Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start delivery",
    });
  }
};

// =====================================================
// VERIFY DELIVERY OTP
// PUT /api/delivery-boy/orders/:id/verify-otp
// =====================================================

const verifyDeliveryOtp = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id || req.user._id;

    const { id } = req.params;

    const { otp } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "Delivery OTP is required",
      });
    }

    const cleanOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be exactly 6 digits",
      });
    }

    const order = await Order.findOne({
      _id: id,
      deliveryBoyId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Assigned order not found",
      });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Order has already been delivered",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be delivered",
      });
    }

    if (!order.deliveryStartedAt) {
      return res.status(400).json({
        success: false,
        message: "Delivery has not been started yet",
      });
    }

    if (order.deliveryOtpVerified) {
      return res.status(400).json({
        success: false,
        message: "Delivery OTP has already been verified",
      });
    }

    // -------------------------------------------------
    // VERIFY OTP
    // -------------------------------------------------

    if (order.deliveryOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery OTP",
      });
    }

    // -------------------------------------------------
    // OTP VERIFIED
    // -------------------------------------------------

    order.deliveryOtpVerified = true;

    order.status = "Delivered";

    order.deliveredAt = new Date();

    // -------------------------------------------------
    // COD PAYMENT
    // -------------------------------------------------

    if (order.paymentMethod === "COD") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    console.log(`✅ Delivery OTP Verified: ${order._id}`);

    // -------------------------------------------------
    // ADMIN NOTIFICATION
    // -------------------------------------------------

    await createNotification({
      recipientRole: "admin",

      orderId: order._id,

      type: "Order Status",

      title: "Order Delivered",

      message: `Order #${order._id
        .toString()
        .slice(-6)
        .toUpperCase()} has been successfully delivered.`,
    });

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message: "Delivery OTP verified. Order delivered successfully.",

      order: {
        _id: order._id,

        orderId: String(order._id),

        status: order.status,

        paymentStatus: order.paymentStatus,

        deliveryOtpVerified: order.deliveryOtpVerified,

        deliveryStartedAt: order.deliveryStartedAt,

        deliveredAt: order.deliveredAt,
      },
    });
  } catch (error) {
    console.error("❌ Verify Delivery OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify delivery OTP",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getMyAssignedOrders,
  getMyAssignedOrderById,
  updateMyOrderStatus,
  startDelivery,
  verifyDeliveryOtp,
};
