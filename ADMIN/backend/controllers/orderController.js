
const Order = require("../models/Order");
const Product = require("../models/Product");

const {
  calculateDeliveryCharge,
} = require("../utils/deliveryChargeCalculator");

// ===============================
// CREATE ORDER
// ===============================
const createOrder = async (req, res) => {
  try {
    // Only customers can create orders
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Only customers can place orders",
      });
    }

    const {
      products,
      shippingAddress,
      paymentMethod,
      distance,
    } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one product",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    const requiredAddressFields = [
      "name",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({
          message: `${field} is required in shipping address`,
        });
      }
    }

    // ===============================
    // VERIFY PRODUCTS
    // ===============================
    let calculatedTotal = 0;
    let totalWeight = 0;

    const orderProducts = [];

    for (const item of products) {
      if (
        !item.productId ||
        !item.quantity ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          message: "Valid Product ID and quantity are required",
        });
      }

      const product = await Product.findOne({
        _id: item.productId,
        status: "approved",
        isAvailable: true,
      });

      if (!product) {
        return res.status(400).json({
          message: `Product ${item.productId} is not available`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // ===============================
      // PRODUCT TOTAL
      // ===============================
      const itemTotal = product.price * item.quantity;

      calculatedTotal += itemTotal;

      // ===============================
      // PRODUCT WEIGHT
      // ===============================
      if (
        !Number.isFinite(product.weightPerUnit) ||
        product.weightPerUnit <= 0
      ) {
        return res.status(400).json({
          message: `Invalid weight for product ${product.name}`,
        });
      }

      const itemWeight =
        product.weightPerUnit * item.quantity;

      totalWeight += itemWeight;

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // ===============================
    // DELIVERY DISTANCE
    // ===============================
    const orderDistance = Number(distance);

    if (
      !Number.isFinite(orderDistance) ||
      orderDistance < 0
    ) {
      return res.status(400).json({
        message: "Valid delivery distance is required",
      });
    }

    // ===============================
    // DELIVERY CHARGE
    // ===============================
    const deliveryDetails =
      calculateDeliveryCharge(
        orderDistance,
        totalWeight
      );

    const deliveryCharge =
      deliveryDetails.deliveryCharge;

    const vehicleType =
      deliveryDetails.vehicleType;

    // ===============================
    // FINAL TOTAL
    // ===============================
    calculatedTotal += deliveryCharge;

    // ===============================
    // DEDUCT PRODUCT STOCK
    // ===============================
    for (const item of products) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item.productId,
            status: "approved",
            isAvailable: true,
            quantity: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              quantity: -item.quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedProduct) {
        return res.status(400).json({
          message:
            "Stock changed. Please try ordering again.",
        });
      }

      // If stock becomes zero
      if (updatedProduct.quantity === 0) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            isAvailable: false,
          }
        );
      }
    }

    // ===============================
    // CREATE ORDER
    // ===============================
    const order = new Order({
      customerId: req.user.id,

      products: orderProducts,

      totalAmount: calculatedTotal,

      distance: orderDistance,

      totalWeight: totalWeight,

      vehicleType: vehicleType,

      deliveryCharge: deliveryCharge,

      shippingAddress,

      paymentMethod: paymentMethod || "COD",
    });

    const savedOrder = await order.save();

    // ===============================
    // RESPONSE
    // ===============================
    res.status(201).json({
      message: "Order placed successfully",

      order: savedOrder,

      delivery: {
        distance: orderDistance,
        totalWeight: totalWeight,
        vehicleType: vehicleType,
        deliveryCharge: deliveryCharge,
      },
    });

  } catch (error) {
    console.error(
      "Create Order Error:",
      error
    );

    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// ===============================
// GET MY ORDERS
// ===============================
const getMyOrders = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message:
          "Only customers can access their orders",
      });
    }

    const orders = await Order.find({
      customerId: req.user.id,
    })
      .populate("products.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });

  } catch (error) {
    console.error(
      "Get Orders Error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// ===============================
// GET SINGLE ORDER
// ===============================
const getOrderById = async (req, res) => {
  try {

    const order = await Order.findById(
      req.params.id
    )
      .populate(
        "customerId",
        "name email"
      )
      .populate({
        path: "products.productId",
        populate: {
          path: "farmerId",
          select: "name email"
        }
      });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Customer can only view own order
    if (
      req.user.role === "customer" &&
      order.customerId._id.toString() !==
        req.user.id
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view this order",
      });
    }

    res.status(200).json({
      message:
        "Order fetched successfully",
      order,
    });

  } catch (error) {

    console.error(
      "Get Order Error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};
// ===============================
// UPDATE ORDER STATUS
// ===============================
const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role === "customer") {
      return res.status(403).json({
        message:
          "Customers cannot update order status",
      });
    }

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

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        message:
          "Cancelled order status cannot be changed",
      });
    }

    // ===============================
    // FARMER OWNERSHIP CHECK
    // ===============================
    if (req.user.role === "farmer") {
      let ownsProduct = false;

      for (const item of order.products) {
        const product =
          await Product.findById(
            item.productId
          );

        if (
          product &&
          product.farmerId.toString() ===
            req.user.id
        ) {
          ownsProduct = true;
          break;
        }
      }

      if (!ownsProduct) {
        return res.status(403).json({
          message:
            "You are not authorized to update this order",
        });
      }
    }

    order.status = status;

    const updatedOrder =
      await order.save();

    res.status(200).json({
      message:
        "Order status updated successfully",
      order: updatedOrder,
    });

  } catch (error) {
    console.error(
      "Update Order Status Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update order status",
      error: error.message,
    });
  }
};

// ===============================
// CANCEL ORDER
// ===============================
const cancelOrder = async (req, res) => {
  try {
    // Only customers can cancel orders
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message:
          "Only customers can cancel orders",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Customer can cancel only own order
    if (
      order.customerId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to cancel this order",
      });
    }

    // Cannot cancel at these stages
    if (
      order.status === "Shipped" ||
      order.status === "Out for Delivery" ||
      order.status === "Delivered" ||
      order.status === "Cancelled"
    ) {
      return res.status(400).json({
        message:
          "Order cannot be cancelled at this stage",
      });
    }

    // ===============================
    // RESTORE PRODUCT STOCK
    // ===============================
    for (const item of order.products) {
      const product =
        await Product.findById(
          item.productId
        );

      if (product) {
        product.quantity +=
          item.quantity;

        if (product.quantity > 0) {
          product.isAvailable = true;
        }

        await product.save();
      }
    }

    // ===============================
    // CANCEL ORDER
    // ===============================
    order.status = "Cancelled";

    const updatedOrder =
      await order.save();

    res.status(200).json({
      message:
        "Order cancelled successfully and stock restored",
      order: updatedOrder,
    });

  } catch (error) {
    console.error(
      "Cancel Order Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to cancel order",
      error: error.message,
    });
  }
};

// ===============================
// ADMIN - GET ALL ORDERS
// ===============================
const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "Only admin can access all orders",
      });
    }

    const orders = await Order.find()
      .populate(
        "customerId",
        "name email"
      )
      .populate(
        "products.productId"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message:
        "All orders fetched successfully",
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error(
      "Get All Orders Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch all orders",
      error: error.message,
    });
  }
};

// ===============================
// FARMER - GET MY PRODUCT ORDERS
// ===============================
const getFarmerOrders = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message:
          "Only farmers can access farmer orders",
      });
    }

    const orders = await Order.find()
      .populate({
        path: "products.productId",
        match: {
          farmerId: req.user.id,
        },
      })
      .populate(
        "customerId",
        "name email"
      )
      .sort({ createdAt: -1 });

    const farmerOrders =
      orders.filter((order) =>
        order.products.some(
          (item) =>
            item.productId !== null
        )
      );

    res.status(200).json({
      message:
        "Farmer orders fetched successfully",
      count: farmerOrders.length,
      orders: farmerOrders,
    });

  } catch (error) {
    console.error(
      "Get Farmer Orders Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch farmer orders",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE PAYMENT STATUS
// ===============================
const updatePaymentStatus = async (
  req,
  res
) => {
  try {
    const { paymentStatus } =
      req.body;

    const allowedPaymentStatuses = [
      "Paid",
      "Failed",
    ];

    if (
      !allowedPaymentStatuses.includes(
        paymentStatus
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid payment status",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Customer can update only own order
    if (
      req.user.role === "customer" &&
      order.customerId.toString() !==
        req.user.id
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this payment",
      });
    }

    // Cancelled order cannot be updated
    if (order.status === "Cancelled") {
      return res.status(400).json({
        message:
          "Cancelled order payment cannot be updated",
      });
    }

    // COD cannot be marked as Online Paid
    if (
      order.paymentMethod === "COD" &&
      paymentStatus === "Paid"
    ) {
      return res.status(400).json({
        message:
          "COD order cannot be marked as online paid",
      });
    }

    order.paymentStatus =
      paymentStatus;

    // Online payment successful
    if (
      order.paymentMethod === "Online" &&
      paymentStatus === "Paid" &&
      order.status === "Pending"
    ) {
      order.status = "Confirmed";
    }

    const updatedOrder =
      await order.save();

    res.status(200).json({
      message:
        "Payment status updated successfully",
      order: updatedOrder,
    });

  } catch (error) {
    console.error(
      "Update Payment Status Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update payment status",
      error: error.message,
    });
  }
};

const getDeliveryBoyOrders = async (req, res) => {
  try {
    if (req.user.role !== "deliveryBoy") {
      return res.status(403).json({
        message: "Only delivery boys can access assigned orders",
      });
    }

    const orders = await Order.find({
      deliveryBoyId: req.user.id,
    })
      .populate("customerId", "name email")
      .populate({
        path: "products.productId",
        populate: {
          path: "farmerId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Delivery boy orders fetched successfully",
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error("Delivery Boy Orders Error:", error);

    res.status(500).json({
      message: "Failed to fetch delivery boy orders",
      error: error.message,
    });
  }
};
// ===============================
// ADMIN - ASSIGN DELIVERY BOY
// ===============================
const assignDeliveryBoy = async (req, res) => {
  try {
    // Only admin can assign delivery boy
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can assign delivery boy",
      });
    }

    const { deliveryBoyId } = req.body;

    if (!deliveryBoyId) {
      return res.status(400).json({
        message: "Delivery Boy ID is required",
      });
    }

    // Check delivery boy
    const User = require("../models/User");

    const deliveryBoy = await User.findOne({
      _id: deliveryBoyId,
      role: "deliveryBoy",
    });

    if (!deliveryBoy) {
      return res.status(404).json({
        message: "Delivery boy not found",
      });
    }

    // Find order
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Assign delivery boy
    order.deliveryBoyId = deliveryBoyId;

    // If order is Pending, confirm it
    if (order.status === "Pending") {
      order.status = "Confirmed";
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      message: "Order assigned to delivery boy successfully",
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Assign Delivery Boy Error:", error);

    res.status(500).json({
      message: "Failed to assign delivery boy",
      error: error.message,
    });
  }
};
// ===============================
// EXPORT
// ===============================
module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getFarmerOrders,
  updatePaymentStatus,
  getDeliveryBoyOrders,
  assignDeliveryBoy,
};