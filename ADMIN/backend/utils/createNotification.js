const Notification = require("../models/notification.js");

const createNotification = async ({
  farmerId,
  orderId,
  type,
  title,
  message,
}) => {
  try {
    const notification = new Notification({
      farmerId,
      orderId,
      type,
      title,
      message,
    });

    await notification.save();

    return notification;
  } catch (error) {
    console.error("Create Notification Error:", error.message);

    return null;
  }
};

module.exports = createNotification;
