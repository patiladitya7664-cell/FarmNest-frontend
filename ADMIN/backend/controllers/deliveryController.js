/* =====================================================
   FARMNEST DELIVERY CONTROLLER
   ADMIN + DELIVERY BOY
===================================================== */

const mongoose = require("mongoose");
const crypto = require("crypto");

const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const getCustomerData = (order) => {
  return {
    id: order.customerId?._id || null,

    name:
      order.customerId?.name ||
      order.shippingAddress?.name ||
      "N/A",

    email:
      order.customerId?.email ||
      "N/A",

    phone:
      order.customerId?.phone ||
      order.shippingAddress?.phone ||
      "N/A",

    address: [
      order.shippingAddress?.address,
      order.shippingAddress?.city,
      order.shippingAddress?.state,
      order.shippingAddress?.pincode,
    ]
      .filter(Boolean)
      .join(", "),
  };
};

const getDeliveryBoyData = (order) => {
  if (!order.deliveryBoyId) {
    return null;
  }

  return {
    id: order.deliveryBoyId._id,
    name: order.deliveryBoyId.name || "N/A",
    email: order.deliveryBoyId.email || "N/A",
    phone: order.deliveryBoyId.phone || "N/A",
  };
};

// =====================================================
// FORMAT ORDER FOR DELIVERY
// =====================================================

const formatDelivery = (order) => {
  const customer = getCustomerData(order);

  const products = (order.products || []).map(
    (item) => {
      const product = item.productId;

      const farmer = product?.farmerId;

      return {
        productId: product?._id || item.productId,

        name:
          product?.name ||
          "Unknown Product",

        category:
          product?.category ||
          "N/A",

        quantity:
          Number(item.quantity) || 0,

        price:
          Number(item.price) || 0,

        unit:
          product?.unit ||
          "kg",

        weightPerUnit:
          Number(product?.weightPerUnit) || 0,

        farmer: farmer
          ? {
              id: farmer._id,
              name: farmer.name || "N/A",
              email: farmer.email || "N/A",
              phone: farmer.phone || "N/A",
            }
          : null,
      };
    },
  );

  // Unique farmers
  const farmerMap = new Map();

  products.forEach((product) => {
    if (product.farmer) {
      farmerMap.set(
        String(product.farmer.id),
        product.farmer,
      );
    }
  });

  return {
    _id: order._id,

    orderId: String(order._id),

    customer,

    farmer:
      farmerMap.size > 0
        ? Array.from(farmerMap.values())[0]
        : null,

    farmers:
      Array.from(farmerMap.values()),

    deliveryBoy:
      getDeliveryBoyData(order),

    products,

    pickup: "FarmNest",

    destination: customer.address,

    city:
      order.shippingAddress?.city ||
      "N/A",

    amount:
      Number(order.totalAmount) || 0,

    deliveryCharge:
      Number(order.deliveryCharge) || 0,

    distance:
      Number(order.distance) || 0,

    totalWeight:
      Number(order.totalWeight) || 0,

    vehicleType:
      order.vehicleType || "N/A",

    paymentMethod:
      order.paymentMethod || "COD",

    paymentStatus:
      order.paymentStatus || "Pending",

    status:
      order.status || "Pending",

    deliveryOtpVerified:
      Boolean(order.deliveryOtpVerified),

    deliveryStartedAt:
      order.deliveryStartedAt || null,

    deliveredAt:
      order.deliveredAt || null,

    createdAt:
      order.createdAt,

    updatedAt:
      order.updatedAt,
  };
};

// =====================================================
// ADMIN
// GET DELIVERY STATISTICS
// =====================================================

const getDeliveryStats = async (
  req,
  res,
) => {
  try {
    const [
      totalDeliveries,
      pendingDeliveries,
      outForDelivery,
      completedDeliveries,
    ] = await Promise.all([
      Order.countDocuments(),

      Order.countDocuments({
        status: "Pending",
      }),

      Order.countDocuments({
        status: "Out for Delivery",
      }),

      Order.countDocuments({
        status: "Delivered",
      }),
    ]);

    res.status(200).json({
      success: true,

      stats: {
        totalDeliveries,
        pendingDeliveries,
        outForDelivery,
        completedDeliveries,
      },
    });
  } catch (error) {
    console.error(
      "❌ Delivery Stats Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch delivery statistics",
    });
  }
};

// =====================================================
// ADMIN
// GET ALL DELIVERIES
// =====================================================

const getAllDeliveries = async (
  req,
  res,
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
    } = req.query;

    const currentPage = Math.max(
      Number(page) || 1,
      1,
    );

    const pageLimit = Math.max(
      Number(limit) || 10,
      1,
    );

    const query = {};

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (
      status !== "all" &&
      allowedStatuses.includes(status)
    ) {
      query.status = status;
    }

    let orders =
      await Order.find(query)
        .populate(
          "customerId",
          "name email phone",
        )
        .populate(
          "deliveryBoyId",
          "name email phone",
        )
        .populate({
          path: "products.productId",
          select:
            "name category unit weightPerUnit farmerId",
          populate: {
            path: "farmerId",
            select: "name email phone",
          },
        })
        .sort({
          createdAt: -1,
        })
        .lean();

    // SEARCH

    if (search.trim()) {
      const value =
        search
          .trim()
          .toLowerCase();

      orders = orders.filter(
        (order) => {
          const orderId =
            String(
              order._id,
            ).toLowerCase();

          const customer =
            order.customerId?.name?.toLowerCase() ||
            "";

          const phone =
            order.shippingAddress?.phone?.toLowerCase() ||
            "";

          const city =
            order.shippingAddress?.city?.toLowerCase() ||
            "";

          const farmer =
            order.products
              ?.map(
                (p) =>
                  p.productId?.farmerId?.name ||
                  "",
              )
              .join(" ")
              .toLowerCase() || "";

          return (
            orderId.includes(value) ||
            customer.includes(value) ||
            phone.includes(value) ||
            city.includes(value) ||
            farmer.includes(value)
          );
        },
      );
    }

    const total = orders.length;

    const skip =
      (currentPage - 1) *
      pageLimit;

    const paginated =
      orders.slice(
        skip,
        skip + pageLimit,
      );

    const deliveries =
      paginated.map(
        formatDelivery,
      );

    res.status(200).json({
      success: true,

      deliveries,

      pagination: {
        total,

        currentPage,

        totalPages:
          Math.ceil(
            total / pageLimit,
          ) || 1,

        limit: pageLimit,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get Deliveries Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch deliveries",
    });
  }
};

// =====================================================
// ADMIN
// GET SINGLE DELIVERY
// =====================================================

const getDeliveryById = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });
    }

    const order =
      await Order.findById(id)
        .populate(
          "customerId",
          "name email phone",
        )
        .populate(
          "deliveryBoyId",
          "name email phone",
        )
        .populate({
          path: "products.productId",
          select:
            "name category unit weightPerUnit farmerId",
          populate: {
            path: "farmerId",
            select:
              "name email phone",
          },
        })
        .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Delivery order not found",
      });
    }

    res.status(200).json({
      success: true,

      delivery:
        formatDelivery(order),
    });
  } catch (error) {
    console.error(
      "❌ Get Delivery Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch delivery",
    });
  }
};

// =====================================================
// ADMIN
// UPDATE DELIVERY STATUS
// =====================================================

const updateDeliveryStatus =
  async (req, res) => {
    try {
      const { id } = req.params;

      const { status } =
        req.body;

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
          message:
            "Status is required",
        });
      }

      if (
        !allowedStatuses.includes(
          status,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery status",
        });
      }

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      const order =
        await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery order not found",
        });
      }

      order.status = status;

      if (
        status ===
        "Out for Delivery"
      ) {
        order.deliveryStartedAt =
          new Date();
      }

      if (
        status ===
        "Delivered"
      ) {
        order.deliveredAt =
          new Date();

        order.deliveryOtpVerified =
          true;
      }

      await order.save();

      res.status(200).json({
        success: true,

        message:
          "Delivery status updated successfully",

        delivery: {
          _id: order._id,

          orderId:
            String(order._id),

          status:
            order.status,
        },
      });
    } catch (error) {
      console.error(
        "❌ Update Delivery Status Error:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update delivery status",
      });
    }
  };

// =====================================================
// ADMIN
// GET DELIVERY BOYS
// =====================================================

const getDeliveryBoys =
  async (req, res) => {
    try {
      const deliveryBoys =
        await User.find({
          role: "deliveryBoy",
        })
          .select(
            "name email phone",
          )
          .sort({
            name: 1,
          })
          .lean();

      res.status(200).json({
        success: true,
        deliveryBoys,
      });
    } catch (error) {
      console.error(
        "❌ Delivery Boys Error:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch delivery boys",
      });
    }
  };

// =====================================================
// ADMIN
// ASSIGN DELIVERY BOY
// =====================================================

const assignDeliveryBoy =
  async (req, res) => {
    try {
      const { id } = req.params;

      const { deliveryBoyId } =
        req.body;

      if (!deliveryBoyId) {
        return res.status(400).json({
          success: false,
          message:
            "Delivery boy ID is required",
        });
      }

      if (
        !isValidObjectId(id) ||
        !isValidObjectId(
          deliveryBoyId,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid ID",
        });
      }

      const deliveryBoy =
        await User.findOne({
          _id: deliveryBoyId,
          role: "deliveryBoy",
        });

      if (!deliveryBoy) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery boy not found",
        });
      }

      const order =
        await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery order not found",
        });
      }

      order.deliveryBoyId =
        deliveryBoy._id;

      await order.save();

      res.status(200).json({
        success: true,

        message:
          "Delivery boy assigned successfully",

        deliveryBoy: {
          _id:
            deliveryBoy._id,

          name:
            deliveryBoy.name,

          email:
            deliveryBoy.email,

          phone:
            deliveryBoy.phone,
        },
      });
    } catch (error) {
      console.error(
        "❌ Assign Delivery Boy Error:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to assign delivery boy",
      });
    }
  };

// =====================================================
// DELIVERY BOY
// GET MY ORDERS
// GET /api/deliveries/my-orders
// =====================================================

const getMyOrders =
  async (req, res) => {
    try {
      const deliveryBoyId =
        req.user.id;

      const orders =
        await Order.find({
          deliveryBoyId,
          status: {
            $ne: "Cancelled",
          },
        })
          .populate(
            "customerId",
            "name email phone",
          )
          .populate({
            path: "products.productId",
            select:
              "name category price unit weightPerUnit farmerId",
            populate: {
              path: "farmerId",
              select:
                "name email phone",
            },
          })
          .sort({
            createdAt: -1,
          })
          .lean();

      const deliveries =
        orders.map(
          formatDelivery,
        );

      res.status(200).json({
        success: true,

        orders:
          deliveries,

        deliveries:
          deliveries,

        total:
          deliveries.length,
      });
    } catch (error) {
      console.error(
        "❌ My Orders Error:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch assigned orders",
      });
    }
  };

// =====================================================
// DELIVERY BOY
// GET MY SINGLE ORDER
// =====================================================

const getMyOrderById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const deliveryBoyId =
        req.user.id;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      const order =
        await Order.findOne({
          _id: id,
          deliveryBoyId,
        })
          .populate(
            "customerId",
            "name email phone",
          )
          .populate({
            path: "products.productId",
            select:
              "name category price unit weightPerUnit farmerId",
            populate: {
              path: "farmerId",
              select:
                "name email phone",
            },
          })
          .lean();

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Assigned order not found",
        });
      }

      res.status(200).json({
        success: true,

        order:
          formatDelivery(order),

        delivery:
          formatDelivery(order),
      });
    } catch (error) {
      console.error(
        "❌ My Order Error:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch order",
      });
    }
  };

// =====================================================
// DELIVERY BOY
// START DELIVERY
// =====================================================

const startDelivery =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const deliveryBoyId =
        req.user.id;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      const order =
        await Order.findOne({
          _id: id,
          deliveryBoyId,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Assigned order not found",
        });
      }

      if (
        order.status ===
        "Delivered"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order already delivered",
        });
      }

      if (
        order.status ===
        "Cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancelled order cannot be delivered",
        });
      }

      // Generate new OTP
      const otp =
        generateOtp();

      order.deliveryOtp =
        otp;

      order.deliveryOtpVerified =
        false;

      order.deliveryStartedAt =
        new Date();

      order.status =
        "Out for Delivery";

      await order.save();

      // DEVELOPMENT ONLY
      console.log(
        `🔐 Delivery OTP for ${order._id}: ${otp}`,
      );

      res.status(200).json({
        success: true,

        message:
          "Delivery started successfully",

        orderId:
          String(order._id),

        status:
          order.status,

        deliveryStartedAt:
          order.deliveryStartedAt,

        // Development/testing
        otp,
      });
    } catch (error) {
      console.error(
        "❌ Start Delivery Error:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to start delivery",
      });
    }
  };

// =====================================================
// DELIVERY BOY
// VERIFY OTP
// =====================================================

const verifyDeliveryOtp =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        otp,
      } = req.body;

      const deliveryBoyId =
        req.user.id;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      if (!otp) {
        return res.status(400).json({
          success: false,
          message:
            "OTP is required",
        });
      }

      const order =
        await Order.findOne({
          _id: id,
          deliveryBoyId,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Assigned order not found",
        });
      }

      if (
        order.status ===
        "Delivered"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order already delivered",
        });
      }

      if (!order.deliveryOtp) {
        return res.status(400).json({
          success: false,
          message:
            "Delivery has not been started",
        });
      }

      if (
        String(otp).trim() !==
        String(order.deliveryOtp)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery OTP",
        });
      }

      order.deliveryOtpVerified =
        true;

      order.status =
        "Delivered";

      order.deliveredAt =
        new Date();

      order.deliveryOtp =
        null;

      await order.save();

      res.status(200).json({
        success: true,

        message:
          "OTP verified. Order marked as delivered.",

        orderId:
          String(order._id),

        status:
          order.status,

        deliveredAt:
          order.deliveredAt,
      });
    } catch (error) {
      console.error(
        "❌ Verify OTP Error:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to verify delivery OTP",
      });
    }
  };

// =====================================================
// DELIVERY BOY
// UPDATE OWN ORDER STATUS
// =====================================================

const updateMyOrderStatus =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { status } =
        req.body;

      const deliveryBoyId =
        req.user.id;

      const allowedStatuses = [
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
      ];

      if (
        !allowedStatuses.includes(
          status,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery status",
        });
      }

      const order =
        await Order.findOne({
          _id: id,
          deliveryBoyId,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Assigned order not found",
        });
      }

      if (
        order.status ===
        "Delivered"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Delivered order cannot be changed",
        });
      }

      order.status =
        status;

      if (
        status ===
        "Out for Delivery"
      ) {
        order.deliveryStartedAt =
          new Date();

        if (!order.deliveryOtp) {
          order.deliveryOtp =
            generateOtp();

          order.deliveryOtpVerified =
            false;

          console.log(
            `🔐 Delivery OTP for ${order._id}: ${order.deliveryOtp}`,
          );
        }
      }

      await order.save();

      res.status(200).json({
        success: true,

        message:
          "Order status updated successfully",

        status:
          order.status,
      });
    } catch (error) {
      console.error(
        "❌ My Order Status Error:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update order status",
      });
    }
  };

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  // Admin
  getDeliveryStats,
  getAllDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  getDeliveryBoys,
  assignDeliveryBoy,

  // Delivery Boy
  getMyOrders,
  getMyOrderById,
  startDelivery,
  verifyDeliveryOtp,
  updateMyOrderStatus,
};