const express = require("express");

const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,

  getAdminNotifications,
  getAdminUnreadCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  clearAllAdminNotifications,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// =====================================================
// FARMER NOTIFICATIONS
// =====================================================

router.get(
  "/farmer",
  authMiddleware,
  getNotifications
);

router.get(
  "/farmer/unread-count",
  authMiddleware,
  getUnreadCount
);

router.put(
  "/farmer/:id/read",
  authMiddleware,
  markAsRead
);

router.put(
  "/farmer/read-all",
  authMiddleware,
  markAllAsRead
);

router.delete(
  "/farmer/clear",
  authMiddleware,
  clearAllNotifications
);

// =====================================================
// ADMIN NOTIFICATIONS
// =====================================================

router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  getAdminNotifications
);

router.get(
  "/admin/unread-count",
  authMiddleware,
  adminMiddleware,
  getAdminUnreadCount
);

router.put(
  "/admin/:id/read",
  authMiddleware,
  adminMiddleware,
  markAdminNotificationAsRead
);

router.put(
  "/admin/read-all",
  authMiddleware,
  adminMiddleware,
  markAllAdminNotificationsAsRead
);

router.delete(
  "/admin/clear",
  authMiddleware,
  adminMiddleware,
  clearAllAdminNotifications
);

module.exports = router;