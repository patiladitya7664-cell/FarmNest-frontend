const Notification = require("../models/notification.js");

// =========================================
// GET FARMER NOTIFICATIONS
// =========================================

const getNotifications = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can access notifications",
      });
    }

    const notifications = await Notification.find({
      farmerId: req.user.id,
    })
      .populate("orderId")
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      farmerId: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      message: "Notifications fetched successfully",
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// =========================================
// GET UNREAD COUNT
// =========================================

const getUnreadCount = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can access notification count",
      });
    }

    const count = await Notification.countDocuments({
      farmerId: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      unreadCount: count,
    });
  } catch (error) {
    console.error("Unread Count Error:", error);

    res.status(500).json({
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};

// =========================================
// MARK SINGLE NOTIFICATION AS READ
// =========================================

const markAsRead = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can update notifications",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          farmerId: req.user.id,
        },
        {
          isRead: true,
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

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);

    res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// =========================================
// MARK ALL AS READ
// =========================================

const markAllAsRead = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can update notifications",
      });
    }

    await Notification.updateMany(
      {
        farmerId: req.user.id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);

    res.status(500).json({
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

// =========================================
// CLEAR ALL NOTIFICATIONS
// =========================================

const clearAllNotifications = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can clear notifications",
      });
    }

    await Notification.deleteMany({
      farmerId: req.user.id,
    });

    res.status(200).json({
      message: "All notifications cleared successfully",
    });
  } catch (error) {
    console.error("Clear Notifications Error:", error);

    res.status(500).json({
      message: "Failed to clear notifications",
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
};