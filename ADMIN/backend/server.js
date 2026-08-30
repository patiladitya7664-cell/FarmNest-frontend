require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const farmerAnalyticsRoutes = require("./routes/farmerAnalyticsRoutes");
const farmerProfileRoutes = require("./routes/farmerProfileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const deliveryBoyRoutes = require("./routes/deliveryBoyRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");

// =====================================================
// APP CONFIGURATION
// =====================================================

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/farmer", farmerAnalyticsRoutes);
app.use("/api/farmer", farmerProfileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/delivery-boy", deliveryBoyRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
// =====================================================
// PAYMENT ROUTES
// =====================================================

app.use("/api/payments", paymentRoutes);

// =====================================================
// ROOT ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.status(200).send("FarmNest Backend is Running Successfully! 🌱");
});

// =====================================================
// 404 API ROUTE
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`FarmNest Server running on http://localhost:${PORT}`);

      console.log(`💳 Payment API: http://localhost:${PORT}/api/payments`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);

    process.exit(1);
  }
};

startServer();
