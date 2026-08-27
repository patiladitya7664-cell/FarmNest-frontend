const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
// =====================================================
// GET PENDING FARMERS
// =====================================================
const getPendingFarmers = async (req, res) => {
  try {
    const farmers = await User.find({
      role: "farmer",
      verificationStatus: "pending",
    }).select("-password");

    res.status(200).json({
      success: true,
      count: farmers.length,
      farmers,
    });
  } catch (error) {
    console.error("Get Pending Farmers Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending farmers",
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

    res.status(200).json({
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
    console.error("Approve Farmer Error:", error);

    res.status(500).json({
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

    res.status(200).json({
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
    console.error("Reject Farmer Error:", error);

    res.status(500).json({
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
    // ==========================================
    // USER STATISTICS
    // ==========================================

    const totalUsers = await User.countDocuments();

    const totalFarmers = await User.countDocuments({
      role: "farmer",
    });

    const pendingFarmers = await User.countDocuments({
      role: "farmer",
      verificationStatus: "pending",
    });

    const approvedFarmers = await User.countDocuments({
      role: "farmer",
      verificationStatus: "approved",
    });

    const rejectedFarmers = await User.countDocuments({
      role: "farmer",
      verificationStatus: "rejected",
    });

    const totalCustomers = await User.countDocuments({
      role: "customer",
    });

    const totalDeliveryBoys = await User.countDocuments({
      role: "deliveryBoy",
    });

    // ==========================================
    // PRODUCT STATISTICS
    // ==========================================

    const totalProducts = await Product.countDocuments();

    const pendingProducts = await Product.countDocuments({
      status: "pending",
    });

    const approvedProducts = await Product.countDocuments({
      status: "approved",
    });

    const rejectedProducts = await Product.countDocuments({
      status: "rejected",
    });

    // ==========================================
    // ORDER STATISTICS
    // ==========================================

    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({
      status: "Pending",
    });

    const completedOrders = await Order.countDocuments({
      status: "Delivered",
    });

    const cancelledOrders = await Order.countDocuments({
      status: "Cancelled",
    });

    // ==========================================
    // REVENUE
    // ==========================================

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

    // ==========================================
    // RESPONSE
    // ==========================================

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
// GET ALL CUSTOMERS
// =====================================================
const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get All Customers Error:", error);

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

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

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get Customer Error:", error);

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await User.findOneAndDelete({
      _id: id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};
module.exports = {
  getPendingFarmers,
  approveFarmer,
  rejectFarmer,
  getDashboardStats,
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
};
