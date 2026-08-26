const express = require("express");

const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

// GET ALL NOTIFICATIONS
router.get(
  "/",
  authMiddleware,
  getNotifications
);

// GET UNREAD COUNT
router.get(
  "/unread-count",
  authMiddleware,
  getUnreadCount
);

// MARK SINGLE READ
router.put(
  "/:id/read",
  authMiddleware,
  markAsRead
);

// MARK ALL READ
router.put(
  "/read-all",
  authMiddleware,
  markAllAsRead
);

// CLEAR ALL
router.delete(
  "/clear",
  authMiddleware,
  clearAllNotifications
);

module.exports = router;