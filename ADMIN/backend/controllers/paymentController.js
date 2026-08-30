const Order = require("../models/Order");

// =====================================================
// ADMIN - GET ALL PAYMENTS
// =====================================================

const getAllPayments = async (req, res) => {
  try {
    // -------------------------------------------------
    // ADMIN ONLY
    // -------------------------------------------------

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can access payments",
      });
    }

    // -------------------------------------------------
    // FETCH ORDERS
    // -------------------------------------------------

    const orders = await Order.find()
      .populate("customerId", "name email")
      .populate({
        path: "products.productId",
        populate: {
          path: "farmerId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    // -------------------------------------------------
    // CONVERT ORDERS → PAYMENT DATA
    // -------------------------------------------------

    const payments = orders.map((order) => {
      let farmerNames = [];

      order.products.forEach((item) => {
        if (
          item.productId &&
          item.productId.farmerId
        ) {
          const farmer =
            item.productId.farmerId;

          if (
            farmer.name &&
            !farmerNames.includes(farmer.name)
          ) {
            farmerNames.push(farmer.name);
          }
        }
      });

      return {
        _id: order._id,

        transactionId:
          `TXN-${order._id
            .toString()
            .slice(-8)
            .toUpperCase()}`,

        orderId: order._id,

        customer: order.customerId
          ? {
              id: order.customerId._id,
              name: order.customerId.name,
              email: order.customerId.email,
            }
          : null,

        farmer:
          farmerNames.length > 0
            ? farmerNames.join(", ")
            : "N/A",

        paymentMethod:
          order.paymentMethod || "COD",

        paymentStatus:
          order.paymentStatus || "Pending",

        amount:
          Number(order.totalAmount) || 0,

        orderStatus:
          order.status || "Pending",

        date: order.createdAt,

        createdAt: order.createdAt,

        updatedAt: order.updatedAt,
      };
    });

    // -------------------------------------------------
    // STATISTICS
    // -------------------------------------------------

    const totalRevenue = payments
      .filter(
        (payment) =>
          payment.paymentStatus === "Paid"
      )
      .reduce(
        (total, payment) =>
          total + payment.amount,
        0
      );

    const pendingPayments =
      payments.filter(
        (payment) =>
          payment.paymentStatus === "Pending"
      ).length;

    const successfulTransactions =
      payments.filter(
        (payment) =>
          payment.paymentStatus === "Paid"
      ).length;

    const failedTransactions =
      payments.filter(
        (payment) =>
          payment.paymentStatus === "Failed"
      ).length;

    // -------------------------------------------------
    // TODAY'S PAYMENTS
    // -------------------------------------------------

    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const todayPayments = payments
      .filter((payment) => {
        const paymentDate =
          new Date(payment.createdAt);

        return (
          paymentDate >= startOfDay &&
          paymentDate < endOfDay &&
          payment.paymentStatus === "Paid"
        );
      })
      .reduce(
        (total, payment) =>
          total + payment.amount,
        0
      );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      message:
        "Payments fetched successfully",

      count: payments.length,

      statistics: {
        totalRevenue,
        todayPayments,
        pendingPayments,
        successfulTransactions,
        failedTransactions,
      },

      payments,
    });
  } catch (error) {
    console.error(
      "❌ Get All Payments Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch payments",

      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - GET SINGLE PAYMENT
// =====================================================

const getPaymentById = async (req, res) => {
  try {
    // -------------------------------------------------
    // ADMIN ONLY
    // -------------------------------------------------

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "Only admin can access payment details",
      });
    }

    // -------------------------------------------------
    // FIND ORDER
    // -------------------------------------------------

    const order = await Order.findById(
      req.params.id
    )
      .populate(
        "customerId",
        "name email phone"
      )
      .populate({
        path: "products.productId",
        populate: {
          path: "farmerId",
          select: "name email",
        },
      });

    if (!order) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // -------------------------------------------------
    // FARMER NAMES
    // -------------------------------------------------

    const farmerNames = [];

    order.products.forEach((item) => {
      if (
        item.productId &&
        item.productId.farmerId
      ) {
        const farmer =
          item.productId.farmerId;

        if (
          farmer.name &&
          !farmerNames.includes(farmer.name)
        ) {
          farmerNames.push(farmer.name);
        }
      }
    });

    // -------------------------------------------------
    // PAYMENT RESPONSE
    // -------------------------------------------------

    const payment = {
      _id: order._id,

      transactionId:
        `TXN-${order._id
          .toString()
          .slice(-8)
          .toUpperCase()}`,

      orderId: order._id,

      customer: order.customerId,

      farmer:
        farmerNames.length > 0
          ? farmerNames.join(", ")
          : "N/A",

      paymentMethod:
        order.paymentMethod || "COD",

      paymentStatus:
        order.paymentStatus || "Pending",

      amount:
        Number(order.totalAmount) || 0,

      orderStatus:
        order.status || "Pending",

      products: order.products,

      shippingAddress:
        order.shippingAddress,

      distance:
        order.distance,

      totalWeight:
        order.totalWeight,

      vehicleType:
        order.vehicleType,

      deliveryCharge:
        order.deliveryCharge,

      createdAt:
        order.createdAt,

      updatedAt:
        order.updatedAt,
    };

    return res.status(200).json({
      message:
        "Payment fetched successfully",

      payment,
    });
  } catch (error) {
    console.error(
      "❌ Get Payment Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch payment",

      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - PAYMENT SUMMARY
// =====================================================

const getPaymentSummary = async (req, res) => {
  try {
    // -------------------------------------------------
    // ADMIN ONLY
    // -------------------------------------------------

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "Only admin can access payment summary",
      });
    }

    const orders = await Order.find();

    let totalRevenue = 0;
    let todayPayments = 0;
    let pendingPayments = 0;
    let successfulTransactions = 0;
    let failedTransactions = 0;

    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    orders.forEach((order) => {
      const amount =
        Number(order.totalAmount) || 0;

      const paymentStatus =
        order.paymentStatus || "Pending";

      // Paid
      if (paymentStatus === "Paid") {
        totalRevenue += amount;
        successfulTransactions++;

        const createdAt =
          new Date(order.createdAt);

        if (
          createdAt >= startOfDay &&
          createdAt < endOfDay
        ) {
          todayPayments += amount;
        }
      }

      // Pending
      if (paymentStatus === "Pending") {
        pendingPayments++;
      }

      // Failed
      if (paymentStatus === "Failed") {
        failedTransactions++;
      }
    });

    return res.status(200).json({
      message:
        "Payment summary fetched successfully",

      statistics: {
        totalRevenue,
        todayPayments,
        pendingPayments,
        successfulTransactions,
        failedTransactions,
      },
    });
  } catch (error) {
    console.error(
      "❌ Payment Summary Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch payment summary",

      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentSummary,
};