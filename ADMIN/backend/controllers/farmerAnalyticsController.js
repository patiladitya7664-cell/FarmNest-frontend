const Order = require("../models/Order");

// =====================================================
// HELPER: CHECK FARMER
// =====================================================
const checkFarmer = (req, res) => {
  if (!req.user || req.user.role !== "farmer") {
    res.status(403).json({
      message: "Only farmers can access this resource",
    });

    return false;
  }

  return true;
};

// =====================================================
// HELPER: GROWTH CALCULATOR
// =====================================================
const calculateGrowth = (current, previous) => {
  current = Number(current) || 0;
  previous = Number(previous) || 0;

  // Both months have no data
  if (current === 0 && previous === 0) {
    return 0;
  }

  // Current month has data but previous month has no data
  if (previous === 0) {
    return null;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

// =====================================================
// HELPER: FORMAT GROWTH
// =====================================================
const formatGrowth = (growth) => {
  if (growth === null) {
    return "New";
  }

  if (growth > 0) {
    return `+${growth}%`;
  }

  return `${growth}%`;
};

// =====================================================
// HELPER: GET FARMER ITEMS
// =====================================================
const getFarmerItems = (order, farmerId) => {
  if (!order.products || !Array.isArray(order.products)) {
    return [];
  }

  return order.products.filter((item) => {
    const product = item.productId;

    if (!product || !product.farmerId) {
      return false;
    }

    return product.farmerId.toString() === farmerId.toString();
  });
};

// =====================================================
// HELPER: GET FARMER ORDER AMOUNT
// =====================================================
const getFarmerOrderData = (order, farmerId) => {
  const farmerItems = getFarmerItems(order, farmerId);

  let amount = 0;
  let quantity = 0;

  for (const item of farmerItems) {
    const price = Number(item.price) || 0;
    const itemQuantity = Number(item.quantity) || 0;

    amount += price * itemQuantity;
    quantity += itemQuantity;
  }

  return {
    items: farmerItems,
    amount,
    quantity,
  };
};

// =====================================================
// FARMER EARNINGS
// =====================================================
const getFarmerEarnings = async (req, res) => {
  try {
    if (!checkFarmer(req, res)) {
      return;
    }

    const farmerId = req.user.id;

    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const orders = await Order.find()
      .populate("products.productId")
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    let totalEarnings = 0;
    let thisMonth = 0;

    let pendingPayment = 0;
    let completedPayments = 0;

    const categoryEarnings = {};
    const transactions = [];

    // =================================================
    // PROCESS ORDERS
    // =================================================
    for (const order of orders) {
      // Cancelled orders are not earnings
      if (String(order.status || "").toLowerCase() === "cancelled") {
        continue;
      }

      const farmerData = getFarmerOrderData(order, farmerId);

      if (farmerData.amount <= 0) {
        continue;
      }

      const farmerAmount = farmerData.amount;

      // =================================================
      // TOTAL EARNINGS
      // =================================================
      totalEarnings += farmerAmount;

      // =================================================
      // PAYMENT STATUS
      // =================================================
      const paymentStatus = String(
        order.paymentStatus || "Pending",
      ).toLowerCase();

      if (
        paymentStatus === "paid" ||
        paymentStatus === "completed" ||
        paymentStatus === "success"
      ) {
        completedPayments += farmerAmount;
      } else {
        pendingPayment += farmerAmount;
      }

      // =================================================
      // CURRENT MONTH
      // =================================================
      const orderDate = new Date(order.createdAt);

      if (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      ) {
        thisMonth += farmerAmount;
      }

      // =================================================
      // CATEGORY BREAKDOWN
      // =================================================
      for (const item of farmerData.items) {
        const product = item.productId;

        const category = product.category || "Other";

        const amount = (Number(item.price) || 0) * (Number(item.quantity) || 0);

        if (!categoryEarnings[category]) {
          categoryEarnings[category] = 0;
        }

        categoryEarnings[category] += amount;
      }

      // =================================================
      // TRANSACTION
      // =================================================
      const shortId = order._id.toString().slice(-6).toUpperCase();

      const productNames = farmerData.items
        .map((item) => item.productId?.name)
        .filter(Boolean)
        .join(", ");

      transactions.push({
        transactionId: `TXN${shortId}`,

        orderId: shortId,

        customer: order.customerId?.name || "Customer",

        product: productNames || "Farm Product",

        amount: farmerAmount,

        date: order.createdAt,

        status:
          paymentStatus === "paid" ||
          paymentStatus === "completed" ||
          paymentStatus === "success"
            ? "Paid"
            : "Pending",
      });
    }

    // =================================================
    // CATEGORY BREAKDOWN
    // =================================================
    const breakdown = Object.entries(categoryEarnings)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,

        amount,

        percentage:
          totalEarnings > 0
            ? Number(((amount / totalEarnings) * 100).toFixed(1))
            : 0,
      }));

    // =================================================
    // RESPONSE
    // =================================================
    return res.status(200).json({
      message: "Farmer earnings fetched successfully",

      summary: {
        totalEarnings,
        thisMonth,
        pendingPayment,
        completedPayments,
      },

      breakdown,

      transactions,
    });
  } catch (error) {
    console.error("Farmer Earnings Error:", error);

    return res.status(500).json({
      message: "Failed to fetch farmer earnings",

      error: error.message,
    });
  }
};

// =====================================================
// FARMER ANALYTICS
// =====================================================
const getFarmerAnalytics = async (req, res) => {
  try {
    if (!checkFarmer(req, res)) {
      return;
    }

    const farmerId = req.user.id;

    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const previousMonthYear =
      currentMonth === 0 ? currentYear - 1 : currentYear;

    const orders = await Order.find()
      .populate("products.productId")
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    // =================================================
    // TOTAL ANALYTICS
    // =================================================
    let totalRevenue = 0;
    let totalOrders = 0;

    const customerIds = new Set();

    // =================================================
    // CURRENT MONTH
    // =================================================
    let currentMonthRevenue = 0;
    let currentMonthOrders = 0;
    let currentMonthProductSales = 0;

    const currentMonthCustomers = new Set();

    // =================================================
    // PREVIOUS MONTH
    // =================================================
    let previousMonthRevenue = 0;
    let previousMonthOrders = 0;
    let previousMonthProductSales = 0;

    const previousMonthCustomers = new Set();

    // =================================================
    // PRODUCT STATS
    // =================================================
    const productStats = {};

    const currentProductSales = {};
    const previousProductSales = {};

    // =================================================
    // WEEKLY ORDERS
    // =================================================
    const weeklyOrders = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    // =================================================
    // MONTHLY REVENUE
    // =================================================
    const monthlyRevenue = {};

    // =================================================
    // PROCESS ORDERS
    // =================================================
    for (const order of orders) {
      // Cancelled orders should not affect analytics
      if (String(order.status || "").toLowerCase() === "cancelled") {
        continue;
      }

      const farmerData = getFarmerOrderData(order, farmerId);

      if (farmerData.amount <= 0) {
        continue;
      }

      const farmerAmount = farmerData.amount;
      const productQuantity = farmerData.quantity;

      const orderDate = new Date(order.createdAt);

      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();

      // =================================================
      // TOTAL
      // =================================================
      totalOrders++;
      totalRevenue += farmerAmount;

      // =================================================
      // CUSTOMER
      // =================================================
      if (order.customerId?._id) {
        const customerId = order.customerId._id.toString();

        customerIds.add(customerId);

        if (orderMonth === currentMonth && orderYear === currentYear) {
          currentMonthCustomers.add(customerId);
        }

        if (orderMonth === previousMonth && orderYear === previousMonthYear) {
          previousMonthCustomers.add(customerId);
        }
      }

      // =================================================
      // CURRENT MONTH
      // =================================================
      if (orderMonth === currentMonth && orderYear === currentYear) {
        currentMonthRevenue += farmerAmount;

        currentMonthOrders++;

        currentMonthProductSales += productQuantity;
      }

      // =================================================
      // PREVIOUS MONTH
      // =================================================
      if (orderMonth === previousMonth && orderYear === previousMonthYear) {
        previousMonthRevenue += farmerAmount;

        previousMonthOrders++;

        previousMonthProductSales += productQuantity;
      }

      // =================================================
      // WEEKLY ORDERS
      // =================================================
      const day = orderDate.toLocaleDateString("en-US", {
        weekday: "short",
      });

      if (weeklyOrders[day] !== undefined) {
        weeklyOrders[day]++;
      }

      // =================================================
      // MONTHLY REVENUE
      // =================================================
      const monthKey = `${orderYear}-${String(orderMonth + 1).padStart(
        2,
        "0",
      )}`;

      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }

      monthlyRevenue[monthKey] += farmerAmount;

      // =================================================
      // PRODUCT ANALYTICS
      // =================================================
      for (const item of farmerData.items) {
        const product = item.productId;

        if (!product) {
          continue;
        }

        const productId = product._id.toString();

        const quantity = Number(item.quantity) || 0;

        const amount = (Number(item.price) || 0) * quantity;

        if (!productStats[productId]) {
          productStats[productId] = {
            product: product.name,

            orders: 0,

            revenue: 0,
          };
        }

        productStats[productId].orders += quantity;

        productStats[productId].revenue += amount;

        // Current month product sales
        if (orderMonth === currentMonth && orderYear === currentYear) {
          if (!currentProductSales[productId]) {
            currentProductSales[productId] = 0;
          }

          currentProductSales[productId] += quantity;
        }

        // Previous month product sales
        if (orderMonth === previousMonth && orderYear === previousMonthYear) {
          if (!previousProductSales[productId]) {
            previousProductSales[productId] = 0;
          }

          previousProductSales[productId] += quantity;
        }
      }
    }

    // =================================================
    // GROWTH
    // =================================================
    const revenueGrowth = calculateGrowth(
      currentMonthRevenue,
      previousMonthRevenue,
    );

    const ordersGrowth = calculateGrowth(
      currentMonthOrders,
      previousMonthOrders,
    );

    const customerGrowth = calculateGrowth(
      currentMonthCustomers.size,
      previousMonthCustomers.size,
    );

    const productSalesGrowth = calculateGrowth(
      currentMonthProductSales,
      previousMonthProductSales,
    );

    // =================================================
    // PRODUCT TABLE
    // =================================================
    const products = Object.entries(productStats)
      .map(([productId, item]) => {
        const currentSales = currentProductSales[productId] || 0;

        const previousSales = previousProductSales[productId] || 0;

        const growth = calculateGrowth(currentSales, previousSales);

        return {
          product: item.product,

          orders: item.orders,

          revenue: item.revenue,

          growth: formatGrowth(growth),

          status:
            item.orders >= 100 ? "High" : item.orders >= 50 ? "Medium" : "Low",
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    // =================================================
    // TOP PRODUCTS
    // =================================================
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)
      .map((item) => ({
        product: item.product,

        orders: item.orders,
      }));

    // =================================================
    // FORMAT MONTHLY REVENUE
    // =================================================
    const revenueAnalytics = {};

    Object.entries(monthlyRevenue)
      .sort()
      .forEach(([key, amount]) => {
        const [year, month] = key.split("-");

        const date = new Date(Number(year), Number(month) - 1, 1);

        const label = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        revenueAnalytics[label] = amount;
      });

    // =================================================
    // RESPONSE
    // =================================================
    return res.status(200).json({
      message: "Farmer analytics fetched successfully",

      summary: {
        totalRevenue,

        totalOrders,

        customers: customerIds.size,

        /*
          Reviews module is not connected yet.
          This remains 0 until Review model/API
          is connected.
        */
        positiveReviews: 0,
      },

      revenueAnalytics,

      weeklyOrders,

      products,

      topProducts,

      monthlyPerformance: {
        revenueGrowth: revenueGrowth === null ? 0 : revenueGrowth,

        ordersGrowth: ordersGrowth === null ? 0 : ordersGrowth,

        customerGrowth: customerGrowth === null ? 0 : customerGrowth,

        productSales: productSalesGrowth === null ? 0 : productSalesGrowth,
      },
    });
  } catch (error) {
    console.error("Farmer Analytics Error:", error);

    return res.status(500).json({
      message: "Failed to fetch farmer analytics",

      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================
module.exports = {
  getFarmerEarnings,
  getFarmerAnalytics,
};
