const Notification = require("../models/notification.js");

// =====================================================
// FARMER - GET NOTIFICATIONS
// =====================================================

const getNotifications = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can access notifications",
      });
    }

    const notifications = await Notification.find({
      recipientRole: "farmer",
      farmerId: req.user.id,
    })
      .populate("orderId")
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      recipientRole: "farmer",
      farmerId: req.user.id,
      isRead: false,
    });

    return res.status(200).json({
      message: "Notifications fetched successfully",
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("❌ Get Farmer Notifications Error:", error);

    return res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// =====================================================
// FARMER - GET UNREAD COUNT
// =====================================================

const getUnreadCount = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can access notification count",
      });
    }

    const unreadCount = await Notification.countDocuments({
      recipientRole: "farmer",
      farmerId: req.user.id,
      isRead: false,
    });

    return res.status(200).json({
      unreadCount,
    });
  } catch (error) {
    console.error("❌ Farmer Unread Count Error:", error);

    return res.status(500).json({
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};

// =====================================================
// FARMER - MARK SINGLE AS READ
// =====================================================

const markAsRead = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can update notifications",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientRole: "farmer",
        farmerId: req.user.id,
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("❌ Mark Farmer Notification Read Error:", error);

    return res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// =====================================================
// FARMER - MARK ALL AS READ
// =====================================================

const markAllAsRead = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can update notifications",
      });
    }

    const result = await Notification.updateMany(
      {
        recipientRole: "farmer",
        farmerId: req.user.id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Mark All Farmer Notifications Error:", error);

    return res.status(500).json({
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

// =====================================================
// FARMER - CLEAR ALL
// =====================================================

const clearAllNotifications = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can clear notifications",
      });
    }

    const result = await Notification.deleteMany({
      recipientRole: "farmer",
      farmerId: req.user.id,
    });

    return res.status(200).json({
      message: "All notifications cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Clear Farmer Notifications Error:", error);

    return res.status(500).json({
      message: "Failed to clear notifications",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - GET ALL NOTIFICATIONS
// =====================================================

const getAdminNotifications = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    console.log("🔔 Fetching admin notifications...");

    const notifications = await Notification.find({
      recipientRole: "admin",
    })
      .populate("orderId")
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      recipientRole: "admin",
      isRead: false,
    });

    console.log(
      `🔔 Admin notifications found: ${notifications.length}`
    );

    return res.status(200).json({
      message: "Admin notifications fetched successfully",
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("❌ Get Admin Notifications Error:", error);

    return res.status(500).json({
      message: "Failed to fetch admin notifications",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - GET UNREAD COUNT
// =====================================================

const getAdminUnreadCount = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const unreadCount = await Notification.countDocuments({
      recipientRole: "admin",
      isRead: false,
    });

    return res.status(200).json({
      unreadCount,
    });
  } catch (error) {
    console.error("❌ Admin Unread Count Error:", error);

    return res.status(500).json({
      message: "Failed to fetch admin unread count",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - MARK SINGLE AS READ
// =====================================================

const markAdminNotificationAsRead = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientRole: "admin",
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Admin notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("❌ Mark Admin Notification Read Error:", error);

    return res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - MARK ALL AS READ
// =====================================================

const markAllAdminNotificationsAsRead = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const result = await Notification.updateMany(
      {
        recipientRole: "admin",
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      message: "All admin notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Mark All Admin Notifications Error:", error);

    return res.status(500).json({
      message: "Failed to mark all admin notifications as read",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - CLEAR ALL
// =====================================================

const clearAllAdminNotifications = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const result = await Notification.deleteMany({
      recipientRole: "admin",
    });

    return res.status(200).json({
      message: "All admin notifications cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Clear Admin Notifications Error:", error);

    return res.status(500).json({
      message: "Failed to clear admin notifications",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  // Farmer
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,

  // Admin
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  clearAllAdminNotifications,
};
