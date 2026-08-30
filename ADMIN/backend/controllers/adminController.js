const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// =====================================================
// ADD FARMER
// =====================================================

const addFarmer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      location,
      address,
      farmName,
      farmSize,
      bio,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // =================================================
    // CLEAN DATA
    // =================================================

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();

    // =================================================
    // CHECK EMAIL
    // =================================================

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // =================================================
    // CREATE FARMER
    // =================================================

    const farmer = await User.create({
      name: cleanName,

      email: cleanEmail,

      password: hashedPassword,

      role: "farmer",

      phone: phone ? phone.trim() : "",

      location: location ? location.trim() : "",

      address: address ? address.trim() : "",

      farmName: farmName ? farmName.trim() : "",

      farmSize: farmSize ? farmSize.trim() : "",

      bio: bio ? bio.trim() : "",

      accountStatus: "Active",

      verificationStatus: "pending",
    });

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message: "Farmer created successfully",

      farmer: {
        _id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        location: farmer.location,
        address: farmer.address,
        farmName: farmer.farmName,
        farmSize: farmer.farmSize,
        bio: farmer.bio,
        role: farmer.role,
        accountStatus: farmer.accountStatus,
        verificationStatus: farmer.verificationStatus,
        createdAt: farmer.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Add Farmer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create farmer",
      error: error.message,
    });
  }
};

// =====================================================
// GET PENDING FARMERS
// =====================================================

const getPendingFarmers = async (req, res) => {
  try {
    const farmers = await User.find({
      role: "farmer",
      verificationStatus: "pending",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: farmers.length,
      farmers,
    });
  } catch (error) {
    console.error("❌ Get Pending Farmers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending farmers",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL FARMERS
// SEARCH + FILTER + PAGINATION
// =====================================================

const getAllFarmers = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const search = String(req.query.search || "").trim();

    const status = String(req.query.status || "all")
      .trim()
      .toLowerCase();

    const skip = (page - 1) * limit;

    // =================================================
    // FARMER FILTER
    // =================================================

    const match = {
      role: "farmer",
    };

    // =================================================
    // SEARCH
    // =================================================

    if (search) {
      match.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: search,
            $options: "i",
          },
        },

        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },

        {
          location: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // =================================================
    // STATUS FILTER
    // =================================================

    if (
      status === "pending" ||
      status === "approved" ||
      status === "rejected"
    ) {
      match.verificationStatus = status;
    }

    // =================================================
    // TOTAL FARMERS
    // =================================================

    const totalFarmers = await User.countDocuments(match);

    // =================================================
    // FARMERS
    // =================================================

    const farmers = await User.find(match)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // =================================================
    // PAGINATION
    // =================================================

    const totalPages = Math.ceil(totalFarmers / limit);

    return res.status(200).json({
      success: true,

      count: farmers.length,

      farmers,

      pagination: {
        currentPage: page,
        totalPages,
        totalFarmers,
        limit,

        hasNextPage: page < totalPages,

        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Get All Farmers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch farmers",
      error: error.message,
    });
  }
};

// =====================================================
// APPROVE FARMER
// =====================================================

const approveFarmer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farmer ID",
      });
    }

    const farmer = await User.findOne({
      _id: id,
      role: "farmer",
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    farmer.verificationStatus = "approved";

    await farmer.save();

    return res.status(200).json({
      success: true,
      message: "Farmer approved successfully",
      farmer: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        role: farmer.role,
        verificationStatus: farmer.verificationStatus,
      },
    });
  } catch (error) {
    console.error("❌ Approve Farmer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve farmer",
      error: error.message,
    });
  }
};

// =====================================================
// REJECT FARMER
// =====================================================

const rejectFarmer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farmer ID",
      });
    }

    const farmer = await User.findOne({
      _id: id,
      role: "farmer",
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    farmer.verificationStatus = "rejected";

    await farmer.save();

    return res.status(200).json({
      success: true,
      message: "Farmer rejected successfully",
      farmer: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        role: farmer.role,
        verificationStatus: farmer.verificationStatus,
      },
    });
  } catch (error) {
    console.error("❌ Reject Farmer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject farmer",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN DASHBOARD STATISTICS
// =====================================================

const getDashboardStats = async (req, res) => {
  try {
    // =================================================
    // USER STATISTICS
    // =================================================

    const [
      totalUsers,
      totalFarmers,
      pendingFarmers,
      approvedFarmers,
      rejectedFarmers,
      totalCustomers,
      totalDeliveryBoys,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "farmer",
      }),

      User.countDocuments({
        role: "farmer",
        verificationStatus: "pending",
      }),

      User.countDocuments({
        role: "farmer",
        verificationStatus: "approved",
      }),

      User.countDocuments({
        role: "farmer",
        verificationStatus: "rejected",
      }),

      User.countDocuments({
        role: "customer",
      }),

      User.countDocuments({
        role: "deliveryBoy",
      }),
    ]);

    // =================================================
    // PRODUCT STATISTICS
    // =================================================

    const [totalProducts, pendingProducts, approvedProducts, rejectedProducts] =
      await Promise.all([
        Product.countDocuments(),

        Product.countDocuments({
          status: "pending",
        }),

        Product.countDocuments({
          status: "approved",
        }),

        Product.countDocuments({
          status: "rejected",
        }),
      ]);

    // =================================================
    // ORDER STATISTICS
    // =================================================

    const [totalOrders, pendingOrders, completedOrders, cancelledOrders] =
      await Promise.all([
        Order.countDocuments(),

        Order.countDocuments({
          status: "Pending",
        }),

        Order.countDocuments({
          status: "Delivered",
        }),

        Order.countDocuments({
          status: "Cancelled",
        }),
      ]);

    // =================================================
    // REVENUE
    // =================================================

    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },

      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message: "Admin dashboard statistics fetched successfully",

      stats: {
        users: {
          total: totalUsers,
          farmers: totalFarmers,
          customers: totalCustomers,
          deliveryBoys: totalDeliveryBoys,
        },

        farmerVerification: {
          pending: pendingFarmers,
          approved: approvedFarmers,
          rejected: rejectedFarmers,
        },

        products: {
          total: totalProducts,
          pending: pendingProducts,
          approved: approvedProducts,
          rejected: rejectedProducts,
        },

        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
        },

        revenue: {
          total: totalRevenue,
        },
      },
    });
  } catch (error) {
    console.error("❌ Admin Dashboard Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard statistics",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN REVENUE & ORDERS ANALYTICS
// =====================================================

const getAdminAnalytics = async (req, res) => {
  try {
    const { filter = "thisMonth" } = req.query;

    const allowedFilters = ["thisMonth", "lastMonth", "thisYear"];

    if (!allowedFilters.includes(filter)) {
      return res.status(400).json({
        success: false,
        message: "Invalid filter. Use thisMonth, lastMonth or thisYear",
      });
    }

    const now = new Date();

    let startDate;
    let endDate;
    let groupFormat;

    // =================================================
    // THIS MONTH
    // =================================================

    if (filter === "thisMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      groupFormat = "%Y-%m-%d";
    }

    // =================================================
    // LAST MONTH
    // =================================================

    if (filter === "lastMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      endDate = new Date(now.getFullYear(), now.getMonth(), 1);

      groupFormat = "%Y-%m-%d";
    }

    // =================================================
    // THIS YEAR
    // =================================================

    if (filter === "thisYear") {
      startDate = new Date(now.getFullYear(), 0, 1);

      endDate = new Date(now.getFullYear() + 1, 0, 1);

      groupFormat = "%Y-%m";
    }

    // =================================================
    // REVENUE ANALYTICS
    // ONLY DELIVERED ORDERS
    // =================================================

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: "Delivered",

          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },

          revenue: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // =================================================
    // ORDER ANALYTICS
    // =================================================

    const orderData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      filter,

      period: {
        startDate,
        endDate,
      },

      revenue: revenueData,

      orders: orderData,
    });
  } catch (error) {
    console.error("❌ Admin Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin analytics",
      error: error.message,
    });
  }
};

// =====================================================
// ADD CUSTOMER
// =====================================================

const addCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, location, address, accountStatus } =
      req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // =================================================
    // CHECK EMAIL
    // =================================================

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // =================================================
    // CREATE CUSTOMER
    // =================================================

    const customer = await User.create({
      name: name.trim(),

      email: cleanEmail,

      password: hashedPassword,

      role: "customer",

      phone: phone ? phone.trim() : "",

      location: location ? location.trim() : "",

      address: address ? address.trim() : "",

      accountStatus: accountStatus === "Blocked" ? "Blocked" : "Active",
    });

    return res.status(201).json({
      success: true,

      message: "Customer created successfully",

      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        location: customer.location,
        address: customer.address,
        role: customer.role,
        accountStatus: customer.accountStatus,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Add Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL CUSTOMERS
// SEARCH + FILTER + PAGINATION + ORDER COUNT
// =====================================================

const getAllCustomers = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const search = String(req.query.search || "").trim();

    const status = String(req.query.status || "all").trim();

    const skip = (page - 1) * limit;

    // =================================================
    // CUSTOMER FILTER
    // =================================================

    const match = {
      role: "customer",
    };

    // =================================================
    // SEARCH
    // =================================================

    if (search) {
      match.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: search,
            $options: "i",
          },
        },

        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // =================================================
    // STATUS FILTER
    // =================================================

    if (status === "Active" || status === "Blocked") {
      match.accountStatus = status;
    }

    // =================================================
    // TOTAL
    // =================================================

    const totalCustomers = await User.countDocuments(match);

    // =================================================
    // CUSTOMERS + ORDER COUNT
    // =================================================

    const customers = await User.aggregate([
      {
        $match: match,
      },

      {
        $sort: {
          createdAt: -1,
        },
      },

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },

      {
        $lookup: {
          from: "orders",

          let: {
            customerId: "$_id",
          },

          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$customerId", "$$customerId"],
                },
              },
            },

            {
              $count: "totalOrders",
            },
          ],

          as: "orderStats",
        },
      },

      {
        $addFields: {
          totalOrders: {
            $ifNull: [
              {
                $arrayElemAt: ["$orderStats.totalOrders", 0],
              },

              0,
            ],
          },
        },
      },

      {
        $project: {
          password: 0,
          orderStats: 0,
        },
      },
    ]);

    // =================================================
    // PAGINATION
    // =================================================

    const totalPages = Math.ceil(totalCustomers / limit);

    return res.status(200).json({
      success: true,

      customers,

      pagination: {
        currentPage: page,
        totalPages,
        totalCustomers,
        limit,

        hasNextPage: page < totalPages,

        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Get All Customers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

// =====================================================
// GET CUSTOMER BY ID
// =====================================================

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // =================================================
    // VALIDATE ID
    // =================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // =================================================
    // FIND CUSTOMER
    // =================================================

    const customer = await User.findOne({
      _id: id,
      role: "customer",
    }).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // =================================================
    // ORDER COUNT
    // =================================================

    const totalOrders = await Order.countDocuments({
      customerId: customer._id,
    });

    return res.status(200).json({
      success: true,

      customer: {
        ...customer.toObject(),
        totalOrders,
      },
    });
  } catch (error) {
    console.error("❌ Get Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE CUSTOMER
// =====================================================

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // =================================================
    // VALIDATE ID
    // =================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // =================================================
    // FIND CUSTOMER
    // =================================================

    const customer = await User.findOne({
      _id: id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // =================================================
    // DELETE
    // =================================================

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};

// =====================================================
// GET PENDING PRODUCTS
// =====================================================

const getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "pending",
    })
      .populate("farmerId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Get Pending Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending products",
      error: error.message,
    });
  }
};

// =====================================================
// APPROVE PRODUCT
// =====================================================

const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // =================================================
    // VALIDATE ID
    // =================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // =================================================
    // FIND PENDING PRODUCT
    // =================================================

    const product = await Product.findOne({
      _id: id,
      status: "pending",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Pending product not found",
      });
    }

    // =================================================
    // APPROVE
    // =================================================

    product.status = "approved";

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product approved successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Approve Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve product",
      error: error.message,
    });
  }
};

// =====================================================
// REJECT PRODUCT
// =====================================================

const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // =================================================
    // VALIDATE ID
    // =================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // =================================================
    // FIND PENDING PRODUCT
    // =================================================

    const product = await Product.findOne({
      _id: id,
      status: "pending",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Pending product not found",
      });
    }

    // =================================================
    // REJECT
    // =================================================

    product.status = "rejected";

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product rejected successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Reject Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject product",
      error: error.message,
    });
  }
};
// =====================================================
// ADMIN PROFILE
// GET ADMIN PROFILE
// =====================================================

const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await User.findOne({
      _id: adminId,
      role: "admin",
    }).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("❌ Get Admin Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN PROFILE
// UPDATE ADMIN PROFILE
// =====================================================

const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const {
      name,
      email,
      phone,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // =================================================
    // CLEAN DATA
    // =================================================

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone
      ? phone.trim()
      : "";

    // =================================================
    // CHECK EMAIL
    // =================================================

    const existingAdmin = await User.findOne({
      email: cleanEmail,
      _id: { $ne: adminId },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // =================================================
    // FIND ADMIN
    // =================================================

    const admin = await User.findOne({
      _id: adminId,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }

    // =================================================
    // UPDATE
    // =================================================

    admin.name = cleanName;
    admin.email = cleanEmail;
    admin.phone = cleanPhone;

    await admin.save();

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",

      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        accountStatus: admin.accountStatus,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Update Admin Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update admin profile",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN
// CHANGE PASSWORD
// =====================================================

const changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.id;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    // =================================================
    // FIND ADMIN
    // =================================================

    const admin = await User.findOne({
      _id: adminId,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    // =================================================
    // VERIFY CURRENT PASSWORD
    // =================================================

    const isPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        admin.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // =================================================
    // HASH NEW PASSWORD
    // =================================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    admin.password = hashedPassword;

    await admin.save();

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "Admin password changed successfully",
    });
  } catch (error) {
    console.error(
      "❌ Change Admin Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to change admin password",
      error: error.message,
    });
  }
};
// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  // Dashboard
  getDashboardStats,
  getAdminAnalytics,

  // Admin Settings
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,

  // Farmer Management
  addFarmer,
  getAllFarmers,
  getPendingFarmers,
  approveFarmer,
  rejectFarmer,

  // Customer Management
  addCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer,

  // Product Management
  getPendingProducts,
  approveProduct,
  rejectProduct,
};