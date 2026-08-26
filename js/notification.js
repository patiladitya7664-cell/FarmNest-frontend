/* =========================================
   FARMNEST - NOTIFICATION JAVASCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:5000/api/notifications";

  const token = localStorage.getItem("token");

  const notificationList = document.getElementById("notificationList");

  const emptyNotification = document.getElementById("emptyNotification");

  const totalNotifications = document.getElementById("totalNotifications");

  const unreadNotifications = document.getElementById("unreadNotifications");

  const readNotifications = document.getElementById("readNotifications");

  const headerUnreadCount = document.getElementById("headerUnreadCount");

  const sidebarNotificationCount = document.getElementById(
    "sidebarNotificationCount",
  );

  const markAllBtn = document.getElementById("markAllBtn");

  const clearAllBtn = document.getElementById("clearAllBtn");

  /* =========================================
       AUTH CHECK
       ========================================= */

  if (!token) {
    alert("Please login first.");
    window.location.href = "../login.html";
    return;
  }

  /* =========================================
       LOAD NOTIFICATIONS
       ========================================= */

  async function loadNotifications() {
    try {
      const response = await fetch(API_URL, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load notifications");
      }

      const notifications = data.notifications || [];

      renderNotifications(notifications);
    } catch (error) {
      console.error("Notification Error:", error);

      notificationList.innerHTML = `
          <div class="empty-notification">
            <i class="fa fa-triangle-exclamation"></i>
            <h3>Unable to Load Notifications</h3>
            <p>${error.message}</p>
          </div>
        `;
    }
  }

  /* =========================================
       RENDER NOTIFICATIONS
       ========================================= */

  function renderNotifications(notifications) {
    notificationList.innerHTML = "";

    if (notifications.length === 0) {
      emptyNotification.style.display = "block";

      updateCounts([]);

      return;
    }

    emptyNotification.style.display = "none";

    notifications.forEach(function (notification) {
      const item = document.createElement("div");

      item.className = "notification-item";

      if (!notification.isRead) {
        item.classList.add("unread");
      }

      const date = new Date(notification.createdAt);

      const formattedDate = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const formattedTime = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      let icon = "fa-bell";

      if (notification.type === "New Order") {
        icon = "fa-cart-shopping";
      } else if (notification.type === "Payment") {
        icon = "fa-money-bill";
      } else if (notification.type === "Order Status") {
        icon = "fa-truck";
      }

      item.innerHTML = `

            <div class="notification-icon">
              <i class="fa ${icon}"></i>
            </div>

            <div class="notification-content">

              <h3>
                ${notification.title}
              </h3>

              <p>
                ${notification.message}
              </p>

              <small>
                ${formattedDate}
                •
                ${formattedTime}
              </small>

            </div>

            <div class="notification-actions">

              ${
                notification.isRead
                  ? `<span class="read-label">
                       Read
                     </span>`
                  : `<button
                       class="read-btn"
                       data-id="${notification._id}">
                       <i class="fa fa-check"></i>
                       Mark Read
                     </button>`
              }

            </div>

          `;

      notificationList.appendChild(item);
    });

    updateCounts(notifications);

    attachReadEvents();
  }

  /* =========================================
       UPDATE COUNTS
       ========================================= */

  function updateCounts(notifications) {
    const total = notifications.length;

    const unread = notifications.filter(
      (notification) => !notification.isRead,
    ).length;

    const read = total - unread;

    totalNotifications.textContent = total;

    unreadNotifications.textContent = unread;

    readNotifications.textContent = read;

    headerUnreadCount.textContent = unread;

    sidebarNotificationCount.textContent = unread;

    if (unread === 0) {
      sidebarNotificationCount.style.display = "none";
    } else {
      sidebarNotificationCount.style.display = "inline-flex";
    }
  }

  /* =========================================
       MARK SINGLE AS READ
       ========================================= */

  function attachReadEvents() {
    const buttons = document.querySelectorAll(".read-btn");

    buttons.forEach(function (button) {
      button.addEventListener("click", async function () {
        const id = this.dataset.id;

        try {
          const response = await fetch(`${API_URL}/${id}/read`, {
            method: "PUT",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message);
          }

          loadNotifications();
        } catch (error) {
          console.error("Read Notification Error:", error);

          alert("Failed to mark notification as read.");
        }
      });
    });
  }

  /* =========================================
       MARK ALL AS READ
       ========================================= */

  if (markAllBtn) {
    markAllBtn.addEventListener("click", async function () {
      try {
        const response = await fetch(`${API_URL}/read-all`, {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        loadNotifications();
      } catch (error) {
        console.error("Mark All Error:", error);

        alert("Failed to mark notifications as read.");
      }
    });
  }

  /* =========================================
       CLEAR ALL
       ========================================= */

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", async function () {
      const confirmClear = confirm(
        "Are you sure you want to clear all notifications?",
      );

      if (!confirmClear) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/clear`, {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        loadNotifications();
      } catch (error) {
        console.error("Clear Notification Error:", error);

        alert("Failed to clear notifications.");
      }
    });
  }

  /* =========================================
       INITIAL LOAD
       ========================================= */

  loadNotifications();

  /* =========================================
       AUTO REFRESH
       ========================================= */

  setInterval(loadNotifications, 30000);
});
