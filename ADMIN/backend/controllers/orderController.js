const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/notification");
const User = require("../models/User");

const {
  calculateDeliveryCharge,
} = require("../utils/deliveryChargeCalculator");

// =====================================================
// HELPER - CREATE NOTIFICATION
// =====================================================

const createNotification = async (data) => {
  try {
    await Notification.create(data);
    return true;
  } catch (error) {
    console.error(
      "❌ Notification Error:",
      error.message
    );
    return false;
  }
};

// =====================================================
// CREATE ORDER - CUSTOMER
// =====================================================

const createOrder = async (req, res) => {
  try {
    // -------------------------------------------------
    // CUSTOMER ONLY
    // -------------------------------------------------

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

    // -------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------

    if (
      !products ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return res.status(400).json({
        message:
          "Order must contain at least one product",
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
          message:
            `${field} is required in shipping address`,
        });
      }
    }

    // -------------------------------------------------
    // PAYMENT METHOD
    // -------------------------------------------------

    const finalPaymentMethod =
      paymentMethod || "COD";

    const allowedPaymentMethods = [
      "COD",
      "Online",
    ];

    if (
      !allowedPaymentMethods.includes(
        finalPaymentMethod
      )
    ) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // -------------------------------------------------
    // DELIVERY DISTANCE
    // -------------------------------------------------

    const orderDistance = Number(distance);

    if (
      !Number.isFinite(orderDistance) ||
      orderDistance < 0
    ) {
      return res.status(400).json({
        message:
          "Valid delivery distance is required",
      });
    }

    // -------------------------------------------------
    // CALCULATION VARIABLES
    // -------------------------------------------------

    let calculatedTotal = 0;
    let totalWeight = 0;

    const orderProducts = [];

    // Unique farmer IDs
    const farmerIds = new Set();

    // -------------------------------------------------
    // VERIFY PRODUCTS
    // -------------------------------------------------

    for (const item of products) {
      if (
        !item.productId ||
        !item.quantity ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          message:
            "Valid Product ID and quantity are required",
        });
      }

      const quantity = Number(item.quantity);

      // -------------------------------------------------
      // FIND PRODUCT
      // -------------------------------------------------

      const product = await Product.findOne({
        _id: item.productId,
        status: "approved",
        isAvailable: true,
      });

      if (!product) {
        return res.status(400).json({
          message:
            `Product ${item.productId} is not available`,
        });
      }

      // -------------------------------------------------
      // FARMER ID
      // -------------------------------------------------

      if (product.farmerId) {
        farmerIds.add(
          product.farmerId.toString()
        );
      }

      // -------------------------------------------------
      // CHECK STOCK
      // -------------------------------------------------

      if (
        Number(product.quantity) < quantity
      ) {
        return res.status(400).json({
          message:
            `Insufficient stock for ${product.name}`,
        });
      }

      // -------------------------------------------------
      // CHECK PRICE
      // -------------------------------------------------

      const productPrice =
        Number(product.price);

      if (
        !Number.isFinite(productPrice) ||
        productPrice < 0
      ) {
        return res.status(400).json({
          message:
            `Invalid price for product ${product.name}`,
        });
      }

      // -------------------------------------------------
      // PRODUCT TOTAL
      // -------------------------------------------------

      const itemTotal =
        productPrice * quantity;

      calculatedTotal += itemTotal;

      // -------------------------------------------------
      // CHECK WEIGHT
      // -------------------------------------------------

      const weightPerUnit =
        Number(product.weightPerUnit);

      if (
        !Number.isFinite(weightPerUnit) ||
        weightPerUnit <= 0
      ) {
        return res.status(400).json({
          message:
            `Invalid weight for product ${product.name}`,
        });
      }

      // -------------------------------------------------
      // PRODUCT WEIGHT
      // -------------------------------------------------

      const itemWeight =
        weightPerUnit * quantity;

      totalWeight += itemWeight;

      // -------------------------------------------------
      // ADD PRODUCT
      // -------------------------------------------------

      orderProducts.push({
        productId: product._id,
        quantity,
        price: productPrice,
      });
    }

    // -------------------------------------------------
    // DELIVERY CHARGE
    // -------------------------------------------------

    const deliveryDetails =
      calculateDeliveryCharge(
        orderDistance,
        totalWeight
      );

    if (!deliveryDetails) {
      return res.status(400).json({
        message:
          "Unable to calculate delivery charge",
      });
    }

    const deliveryCharge =
      Number(
        deliveryDetails.deliveryCharge
      );

    const vehicleType =
      deliveryDetails.vehicleType;

    if (
      !Number.isFinite(deliveryCharge) ||
      deliveryCharge < 0
    ) {
      return res.status(400).json({
        message:
          "Invalid delivery charge",
      });
    }

    // -------------------------------------------------
    // FINAL TOTAL
    // -------------------------------------------------

    calculatedTotal += deliveryCharge;

    // =================================================
    // DEDUCT PRODUCT STOCK
    // =================================================

    const deductedProducts = [];

    try {
      for (const item of orderProducts) {
        const quantity =
          Number(item.quantity);

        const updatedProduct =
          await Product.findOneAndUpdate(
            {
              _id: item.productId,
              status: "approved",
              isAvailable: true,
              quantity: {
                $gte: quantity,
              },
            },
            {
              $inc: {
                quantity: -quantity,
              },
            },
            {
              new: true,
            }
          );

        if (!updatedProduct) {
          throw new Error(
            "Stock changed. Please try ordering again."
          );
        }

        deductedProducts.push({
          productId: item.productId,
          quantity,
        });

        // -------------------------------------------------
        // STOCK ZERO
        // -------------------------------------------------

        if (
          Number(updatedProduct.quantity) === 0
        ) {
          await Product.findByIdAndUpdate(
            item.productId,
            {
              isAvailable: false,
            }
          );
        }
      }
    } catch (stockError) {
      // -------------------------------------------------
      // ROLLBACK STOCK
      // -------------------------------------------------

      for (const deducted of deductedProducts) {
        try {
          const product =
            await Product.findById(
              deducted.productId
            );

          if (product) {
            product.quantity +=
              deducted.quantity;

            if (product.quantity > 0) {
              product.isAvailable = true;
            }

            await product.save();
          }
        } catch (rollbackError) {
          console.error(
            "❌ Stock Rollback Error:",
            rollbackError.message
          );
        }
      }

      return res.status(400).json({
        message:
          stockError.message ||
          "Stock changed. Please try ordering again.",
      });
    }

    // =================================================
    // CREATE ORDER
    // =================================================

    try {
      const order = new Order({
        customerId: req.user.id,

        products: orderProducts,

        totalAmount: calculatedTotal,

        distance: orderDistance,

        totalWeight,

        vehicleType,

        deliveryCharge,

        shippingAddress,

        paymentMethod:
          finalPaymentMethod,
      });

      const savedOrder =
        await order.save();

      console.log(
        "✅ Order Created:",
        savedOrder._id.toString()
      );

      // =================================================
      // ADMIN NOTIFICATION
      // =================================================

      await createNotification({
        recipientRole: "admin",

        orderId: savedOrder._id,

        type: "New Order",

        title: "New Order Received",

        message:
          `A new order #${savedOrder._id
            .toString()
            .slice(-6)
            .toUpperCase()} has been placed.`,
      });

      // =================================================
      // FARMER NOTIFICATIONS
      // =================================================

      for (const farmerId of farmerIds) {
        await createNotification({
          recipientRole: "farmer",

          farmerId,

          orderId: savedOrder._id,

          type: "New Order",

          title: "New Order Received",

          message:
            `A new order #${savedOrder._id
              .toString()
              .slice(-6)
              .toUpperCase()} contains your product.`,
        });
      }

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(201).json({
        message:
          "Order placed successfully",

        order: savedOrder,

        delivery: {
          distance: orderDistance,

          totalWeight,

          vehicleType,

          deliveryCharge,
        },
      });
    } catch (orderError) {
      // -------------------------------------------------
      // ROLLBACK STOCK IF ORDER CREATION FAILS
      // -------------------------------------------------

      console.error(
        "❌ Order Save Error:",
        orderError
      );

      for (const deducted of deductedProducts) {
        try {
          const product =
            await Product.findById(
              deducted.productId
            );

          if (product) {
            product.quantity +=
              deducted.quantity;

            if (product.quantity > 0) {
              product.isAvailable = true;
            }

            await product.save();
          }
        } catch (rollbackError) {
          console.error(
            "❌ Order Rollback Error:",
            rollbackError.message
          );
        }
      }

      return res.status(500).json({
        message:
          "Failed to create order",
        error: orderError.message,
      });
    }
  } catch (error) {
    console.error(
      "❌ Create Order Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create order",
      error: error.message,
    });
  }
};

// =====================================================
// GET MY ORDERS - CUSTOMER
// =====================================================

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

    return res.status(200).json({
      message:
        "Orders fetched successfully",

      orders,
    });
  } catch (error) {
    console.error(
      "❌ Get My Orders Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch orders",

      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ORDER
// =====================================================

const getOrderById = async (req, res) => {
  try {
    const order =
      await Order.findById(
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
            select: "name email",
          },
        });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // -------------------------------------------------
    // CUSTOMER OWNERSHIP
    // -------------------------------------------------

    if (
      req.user.role === "customer" &&
      order.customerId &&
      order.customerId._id.toString() !==
        req.user.id
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view this order",
      });
    }

    // -------------------------------------------------
    // FARMER OWNERSHIP
    // -------------------------------------------------

    if (req.user.role === "farmer") {
      let ownsProduct = false;

      for (const item of order.products) {
        if (
          item.productId &&
          item.productId.farmerId &&
          item.productId.farmerId._id
            .toString() === req.user.id
        ) {
          ownsProduct = true;
          break;
        }
      }

      if (!ownsProduct) {
        return res.status(403).json({
          message:
            "You are not authorized to view this order",
        });
      }
    }

    // -------------------------------------------------
    // DELIVERY BOY OWNERSHIP
    // -------------------------------------------------

    if (req.user.role === "deliveryBoy") {
      if (
        !order.deliveryBoyId ||
        order.deliveryBoyId.toString() !==
          req.user.id
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view this delivery",
        });
      }
    }

    return res.status(200).json({
      message:
        "Order fetched successfully",

      order,
    });
  } catch (error) {
    console.error(
      "❌ Get Order Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch order",

      error: error.message,
    });
  }
};

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

const updateOrderStatus = async (
  req,
  res
) => {
  try {
    // -------------------------------------------------
    // CUSTOMER CANNOT UPDATE
    // -------------------------------------------------

    if (req.user.role === "customer") {
      return res.status(403).json({
        message:
          "Customers cannot update order status",
      });
    }

    // -------------------------------------------------
    // ALLOWED STATUSES
    // -------------------------------------------------

    const {
      status,
    } = req.body;

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
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid order status",
      });
    }

    // -------------------------------------------------
    // FIND ORDER
    // -------------------------------------------------

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // -------------------------------------------------
    // CANCELLED ORDER
    // -------------------------------------------------

    if (order.status === "Cancelled") {
      return res.status(400).json({
        message:
          "Cancelled order status cannot be changed",
      });
    }

    // =================================================
    // FARMER OWNERSHIP CHECK
    // =================================================

    if (req.user.role === "farmer") {
      let ownsProduct = false;

      for (const item of order.products) {
        const product =
          await Product.findById(
            item.productId
          );

        if (
          product &&
          product.farmerId &&
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

    // =================================================
    // DELIVERY BOY OWNERSHIP CHECK
    // =================================================

    if (
      req.user.role === "deliveryBoy"
    ) {
      if (
        !order.deliveryBoyId ||
        order.deliveryBoyId.toString() !==
          req.user.id
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to update this delivery",
        });
      }
    }

    // -------------------------------------------------
    // UPDATE STATUS
    // -------------------------------------------------

    order.status = status;

    // -------------------------------------------------
    // COD → PAID WHEN DELIVERED
    // -------------------------------------------------

    if (
      status === "Delivered" &&
      order.paymentMethod === "COD"
    ) {
      order.paymentStatus = "Paid";
    }

    const updatedOrder =
      await order.save();

    console.log(
      `✅ Order ${updatedOrder._id} status → ${status}`
    );

    // =================================================
    // ADMIN NOTIFICATION
    // =================================================

    await createNotification({
      recipientRole: "admin",

      orderId: updatedOrder._id,

      type: "Order Status",

      title: "Order Status Updated",

      message:
        `Order #${updatedOrder._id
          .toString()
          .slice(-6)
          .toUpperCase()} status changed to ${status}.`,
    });

    return res.status(200).json({
      message:
        "Order status updated successfully",

      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "❌ Update Order Status Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update order status",

      error: error.message,
    });
  }
};

// =====================================================
// CANCEL ORDER - CUSTOMER
// =====================================================

const cancelOrder = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message:
          "Only customers can cancel orders",
      });
    }

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // -------------------------------------------------
    // CUSTOMER OWNERSHIP
    // -------------------------------------------------

    if (
      order.customerId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to cancel this order",
      });
    }

    // -------------------------------------------------
    // CANCELLATION RESTRICTIONS
    // -------------------------------------------------

    const nonCancellableStatuses = [
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (
      nonCancellableStatuses.includes(
        order.status
      )
    ) {
      return res.status(400).json({
        message:
          "Order cannot be cancelled at this stage",
      });
    }

    // -------------------------------------------------
    // RESTORE STOCK
    // -------------------------------------------------

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

    // -------------------------------------------------
    // CANCEL ORDER
    // -------------------------------------------------

    order.status = "Cancelled";

    const updatedOrder =
      await order.save();

    console.log(
      "❌ Order Cancelled:",
      updatedOrder._id.toString()
    );

    // =================================================
    // ADMIN NOTIFICATION
    // =================================================

    await createNotification({
      recipientRole: "admin",

      orderId: updatedOrder._id,

      type: "Order Status",

      title: "Order Cancelled",

      message:
        `Order #${updatedOrder._id
          .toString()
          .slice(-6)
          .toUpperCase()} has been cancelled by the customer.`,
    });

    return res.status(200).json({
      message:
        "Order cancelled successfully and stock restored",

      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "❌ Cancel Order Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to cancel order",

      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - GET ALL ORDERS
// =====================================================

const getAllOrders = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "Only admin can access all orders",
      });
    }

    const orders =
      await Order.find()
        .populate(
          "customerId",
          "name email"
        )
        .populate({
          path: "products.productId",
          populate: {
            path: "farmerId",
            select: "name email",
          },
        })
        .populate(
          "deliveryBoyId",
          "name email phone"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      message:
        "All orders fetched successfully",

      count: orders.length,

      orders,
    });
  } catch (error) {
    console.error(
      "❌ Get All Orders Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch all orders",

      error: error.message,
    });
  }
};

// =====================================================
// FARMER - GET MY PRODUCT ORDERS
// =====================================================

const getFarmerOrders = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message:
          "Only farmers can access farmer orders",
      });
    }

    const orders =
      await Order.find()
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
        .sort({
          createdAt: -1,
        });

    // -------------------------------------------------
    // ONLY ORDERS CONTAINING FARMER PRODUCTS
    // -------------------------------------------------

    const farmerOrders =
      orders.filter((order) =>
        order.products.some(
          (item) =>
            item.productId !== null
        )
      );

    return res.status(200).json({
      message:
        "Farmer orders fetched successfully",

      count: farmerOrders.length,

      orders: farmerOrders,
    });
  } catch (error) {
    console.error(
      "❌ Get Farmer Orders Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch farmer orders",

      error: error.message,
    });
  }
};

// =====================================================
// UPDATE PAYMENT STATUS
// =====================================================

const updatePaymentStatus = async (
  req,
  res
) => {
  try {
    const {
      paymentStatus,
    } = req.body;

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

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // =================================================
    // ONLY CUSTOMER OWNER OR ADMIN
    // =================================================

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

    if (
      req.user.role !== "customer" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update payment status",
      });
    }

    // -------------------------------------------------
    // CANCELLED ORDER
    // -------------------------------------------------

    if (order.status === "Cancelled") {
      return res.status(400).json({
        message:
          "Cancelled order payment cannot be updated",
      });
    }

    // -------------------------------------------------
    // COD RESTRICTION
    // -------------------------------------------------

    if (
      order.paymentMethod === "COD" &&
      paymentStatus === "Paid" &&
      req.user.role !== "admin"
    ) {
      return res.status(400).json({
        message:
          "COD order cannot be marked as online paid",
      });
    }

    // -------------------------------------------------
    // UPDATE PAYMENT
    // -------------------------------------------------

    order.paymentStatus =
      paymentStatus;

    // -------------------------------------------------
    // ONLINE PAYMENT SUCCESS
    // -------------------------------------------------

    if (
      order.paymentMethod === "Online" &&
      paymentStatus === "Paid" &&
      order.status === "Pending"
    ) {
      order.status = "Confirmed";
    }

    const updatedOrder =
      await order.save();

    console.log(
      `💳 Payment ${updatedOrder._id} → ${paymentStatus}`
    );

    // =================================================
    // ADMIN NOTIFICATION
    // =================================================

    await createNotification({
      recipientRole: "admin",

      orderId: updatedOrder._id,

      type: "Payment",

      title: "Payment Status Updated",

      message:
        `Payment for order #${updatedOrder._id
          .toString()
          .slice(-6)
          .toUpperCase()} is now ${paymentStatus}.`,
    });

    return res.status(200).json({
      message:
        "Payment status updated successfully",

      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "❌ Update Payment Status Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update payment status",

      error: error.message,
    });
  }
};

// =====================================================
// DELIVERY BOY - GET ASSIGNED ORDERS
// =====================================================

const getDeliveryBoyOrders = async (
  req,
  res
) => {
  try {
    if (
      req.user.role !== "deliveryBoy"
    ) {
      return res.status(403).json({
        message:
          "Only delivery boys can access assigned orders",
      });
    }

    const orders =
      await Order.find({
        deliveryBoyId: req.user.id,
      })
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
        })
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      message:
        "Delivery boy orders fetched successfully",

      count: orders.length,

      orders,
    });
  } catch (error) {
    console.error(
      "❌ Delivery Boy Orders Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch delivery boy orders",

      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - ASSIGN DELIVERY BOY
// =====================================================

const assignDeliveryBoy = async (
  req,
  res
) => {
  try {
    // -------------------------------------------------
    // ADMIN ONLY
    // -------------------------------------------------

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "Only admin can assign delivery boy",
      });
    }

    const {
      deliveryBoyId,
    } = req.body;

    if (!deliveryBoyId) {
      return res.status(400).json({
        message:
          "Delivery Boy ID is required",
      });
    }

    // -------------------------------------------------
    // CHECK DELIVERY BOY
    // -------------------------------------------------

    const deliveryBoy =
      await User.findOne({
        _id: deliveryBoyId,
        role: "deliveryBoy",
      });

    if (!deliveryBoy) {
      return res.status(404).json({
        message:
          "Delivery boy not found",
      });
    }

    // -------------------------------------------------
    // FIND ORDER
    // -------------------------------------------------

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // -------------------------------------------------
    // PREVENT ASSIGNMENT OF COMPLETED ORDER
    // -------------------------------------------------

    if (
      order.status === "Delivered" ||
      order.status === "Cancelled"
    ) {
      return res.status(400).json({
        message:
          "Delivery boy cannot be assigned to this order",
      });
    }

    // -------------------------------------------------
    // ASSIGN DELIVERY BOY
    // -------------------------------------------------

    order.deliveryBoyId =
      deliveryBoyId;

    if (order.status === "Pending") {
      order.status = "Confirmed";
    }

    const updatedOrder =
      await order.save();

    console.log(
      `🚚 Delivery Boy ${deliveryBoyId} assigned to ${updatedOrder._id}`
    );

    // =================================================
    // DELIVERY BOY NOTIFICATION
    // =================================================

    await createNotification({
      recipientRole: "deliveryBoy",

      deliveryBoyId,

      orderId: updatedOrder._id,

      type: "Delivery Assigned",

      title:
        "New Delivery Assigned",

      message:
        `You have been assigned order #${updatedOrder._id
          .toString()
          .slice(-6)
          .toUpperCase()}.`,
    });

    // =================================================
    // ADMIN NOTIFICATION
    // =================================================

    await createNotification({
      recipientRole: "admin",

      orderId: updatedOrder._id,

      type: "Order Status",

      title:
        "Delivery Boy Assigned",

      message:
        `Delivery boy has been assigned to order #${updatedOrder._id
          .toString()
          .slice(-6)
          .toUpperCase()}.`,
    });

    return res.status(200).json({
      message:
        "Order assigned to delivery boy successfully",

      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "❌ Assign Delivery Boy Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to assign delivery boy",

      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

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
