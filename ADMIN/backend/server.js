require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const farmerAnalyticsRoutes = require("./routes/farmerAnalyticsRoutes");
const farmerProfileRoutes = require("./routes/farmerProfileRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/farmer", farmerAnalyticsRoutes);
app.use("/api/farmer", farmerProfileRoutes);

app.get("/", (req, res) => {
  res.send("FarmNest Backend is Running Successfully! 🌱");
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`FarmNest Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
};

startServer();
