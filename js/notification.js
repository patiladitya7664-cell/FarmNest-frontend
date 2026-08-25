/* ==========================================================
   FARMNEST - FARMER NOTIFICATION JS
   DEMO VERSION
   Backend integration later
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const notificationList =
    document.getElementById("notificationList");

  const emptyNotification =
    document.getElementById("emptyNotification");

  const totalNotifications =
    document.getElementById("totalNotifications");

  const unreadNotifications =
    document.getElementById("unreadNotifications");

  const readNotifications =
    document.getElementById("readNotifications");

  const headerUnreadCount =
    document.getElementById("headerUnreadCount");

  const sidebarNotificationCount =
    document.getElementById("sidebarNotificationCount");

  const markAllBtn =
    document.getElementById("markAllBtn");

  const clearAllBtn =
    document.getElementById("clearAllBtn");


  /* ==========================================================
     DEMO NOTIFICATIONS
  ========================================================== */

  let notifications = JSON.parse(
    localStorage.getItem("farmerNotifications")
  );


  /* ==========================================================
     CREATE DEMO DATA FIRST TIME
  ========================================================== */

  if (!notifications) {

    notifications = [

      {
        id: 1,
        type: "order",
        title: "New Order Received",
        message:
          "You received a new order for Premium Wheat.",
        time: "Just now",
        read: false
      },

      {
        id: 2,
        type: "product",
        title: "Product Approved",
        message:
          "Your Premium Wheat product has been approved by admin.",
        time: "10 minutes ago",
        read: false
      },

      {
        id: 3,
        type: "stock",
        title: "Low Stock Alert",
        message:
          "Your Premium Wheat stock is running low.",
        time: "30 minutes ago",
        read: false
      },

      {
        id: 4,
        type: "payment",
        title: "Payment Received",
        message:
          "Payment for Order #FN102 has been received successfully.",
        time: "1 hour ago",
        read: true
      },

      {
        id: 5,
        type: "delivery",
        title: "Order Shipped",
        message:
          "Order #FN101 has been shipped to the customer.",
        time: "2 hours ago",
        read: true
      }

    ];

    saveNotifications();
  }


  /* ==========================================================
     SAVE NOTIFICATIONS
  ========================================================== */

  function saveNotifications() {

    localStorage.setItem(
      "farmerNotifications",
      JSON.stringify(notifications)
    );

  }


  /* ==========================================================
     GET NOTIFICATION ICON
  ========================================================== */

  function getIcon(type) {

    const icons = {

      order: "fa-shopping-cart",

      product: "fa-seedling",

      stock: "fa-box",

      payment: "fa-indian-rupee-sign",

      delivery: "fa-truck",

      system: "fa-circle-info"

    };

    return icons[type] || "fa-bell";
  }


  /* ==========================================================
     DISPLAY NOTIFICATIONS
  ========================================================== */

  function renderNotifications() {

    notificationList.innerHTML = "";


    /* EMPTY STATE */

    if (notifications.length === 0) {

      emptyNotification.style.display = "block";

    } else {

      emptyNotification.style.display = "none";

    }


    /* CREATE NOTIFICATION CARDS */

    notifications.forEach((notification) => {

      const notificationElement =
        document.createElement("div");


      notificationElement.className =
        "notification " +
        (notification.read
          ? "read"
          : "unread");


      notificationElement.innerHTML = `

        <div class="notification-icon">

          <i class="fa ${getIcon(notification.type)}"></i>

        </div>


        <div class="notification-content">

          <h3>
            ${notification.title}
          </h3>

          <p>
            ${notification.message}
          </p>

          <div class="notification-time">

            <i class="fa fa-clock"></i>

            ${notification.time}

          </div>

        </div>


        <div class="notification-buttons">


          ${
            !notification.read
              ? `
                <button
                  class="read-btn"
                  data-id="${notification.id}"
                  title="Mark as Read"
                >

                  <i class="fa fa-check"></i>

                </button>
              `
              : ""
          }


          <button
            class="delete-btn"
            data-id="${notification.id}"
            title="Delete"
          >

            <i class="fa fa-trash"></i>

          </button>


        </div>

      `;


      notificationList.appendChild(
        notificationElement
      );

    });


    updateCounters();

  }


  /* ==========================================================
     UPDATE COUNTERS
  ========================================================== */

  function updateCounters() {

    const total =
      notifications.length;


    const unread =
      notifications.filter(
        (notification) =>
          notification.read === false
      ).length;


    const read =
      notifications.filter(
        (notification) =>
          notification.read === true
      ).length;


    if (totalNotifications) {

      totalNotifications.textContent =
        total;

    }


    if (unreadNotifications) {

      unreadNotifications.textContent =
        unread;

    }


    if (readNotifications) {

      readNotifications.textContent =
        read;

    }


    if (headerUnreadCount) {

      headerUnreadCount.textContent =
        unread;

    }


    if (sidebarNotificationCount) {

      sidebarNotificationCount.textContent =
        unread;


      if (unread === 0) {

        sidebarNotificationCount.style.display =
          "none";

      } else {

        sidebarNotificationCount.style.display =
          "inline-block";

      }

    }

  }


  /* ==========================================================
     NOTIFICATION BUTTON ACTIONS
  ========================================================== */

  notificationList.addEventListener(
    "click",
    (event) => {


      /* ======================================================
         MARK AS READ
      ====================================================== */

      const readButton =
        event.target.closest(".read-btn");


      if (readButton) {

        const id =
          Number(readButton.dataset.id);


        notifications =
          notifications.map(
            (notification) => {

              if (notification.id === id) {

                notification.read = true;

              }

              return notification;

            }
          );


        saveNotifications();

        renderNotifications();

      }


      /* ======================================================
         DELETE NOTIFICATION
      ====================================================== */

      const deleteButton =
        event.target.closest(".delete-btn");


      if (deleteButton) {

        const id =
          Number(deleteButton.dataset.id);


        notifications =
          notifications.filter(
            (notification) =>
              notification.id !== id
          );


        saveNotifications();

        renderNotifications();

      }

    }
  );


  /* ==========================================================
     MARK ALL AS READ
  ========================================================== */

  if (markAllBtn) {

    markAllBtn.addEventListener(
      "click",
      () => {

        notifications =
          notifications.map(
            (notification) => ({

              ...notification,

              read: true

            })
          );


        saveNotifications();

        renderNotifications();

      }
    );

  }


  /* ==========================================================
     CLEAR ALL NOTIFICATIONS
  ========================================================== */

  if (clearAllBtn) {

    clearAllBtn.addEventListener(
      "click",
      () => {


        if (notifications.length === 0) {

          return;

        }


        const confirmDelete =
          confirm(
            "Are you sure you want to delete all notifications?"
          );


        if (!confirmDelete) {

          return;

        }


        notifications = [];


        saveNotifications();

        renderNotifications();

      }
    );

  }


  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  renderNotifications();

});