/* ==========================================================
   FARMNEST - FARMER ORDERS
   BACKEND INTEGRATION
========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:5000/api";

  /* ======================================================
       ELEMENTS
    ====================================================== */

  const ordersTable = document.getElementById("ordersTable");

  const tableBody = ordersTable ? ordersTable.querySelector("tbody") : null;

  const searchInput = document.getElementById("searchOrders");

  const refreshBtn = document.querySelector(".refresh-btn");

  const modal = document.getElementById("orderModal");

  const closeModal = document.querySelector(".close");

  /* ======================================================
       GET TOKEN
    ====================================================== */

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Farmer login required.");

    window.location.href = "../login.html";

    return;
  }

  /* ======================================================
       LOAD FARMER ORDERS
    ====================================================== */

  async function loadFarmerOrders() {
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align:center;">
                Loading orders...
            </td>
        </tr>
    `;

    try {
      console.log("=================================");
      console.log("FARMER ORDERS API START");
      console.log("API:", `${API_URL}/orders/farmer`);
      console.log("TOKEN:", token ? "TOKEN FOUND" : "TOKEN NOT FOUND");
      console.log("=================================");

      const response = await fetch(`${API_URL}/orders/farmer`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("HTTP STATUS:", response.status);
      console.log("HTTP OK:", response.ok);

      const rawText = await response.text();

      console.log("RAW BACKEND RESPONSE:");
      console.log(rawText);

      let data = {};

      try {
        data = JSON.parse(rawText);
      } catch (jsonError) {
        console.error("JSON PARSE ERROR:", jsonError);

        throw new Error(
          "Backend did not return JSON. HTTP Status: " + response.status,
        );
      }

      console.log("PARSED RESPONSE:");
      console.log(data);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `Backend Error ${response.status}`,
        );
      }

      const orders = Array.isArray(data) ? data : data.orders || [];

      console.log("ORDERS RECEIVED:", orders);

      renderOrders(orders);
    } catch (error) {
      console.error("=================================");

      console.error("FARMER ORDERS BACKEND ERROR");

      console.error(error);

      console.error("=================================");

      tableBody.innerHTML = `
            <tr>
                <td colspan="8"
                    style="
                        text-align:center;
                        color:red;
                        padding:30px;
                    ">

                    <strong>
                        Unable to load orders
                    </strong>

                    <br><br>

                    ${escapeHTML(error.message)}

                </td>
            </tr>
        `;
    }
  }
  /* ======================================================
       RENDER ORDERS
    ====================================================== */

  function renderOrders(orders) {
    tableBody.innerHTML = "";

    if (!orders || orders.length === 0) {
      tableBody.innerHTML = `
                <tr>
                    <td colspan="8"
                        style="text-align:center;">
                        No orders received yet.
                    </td>
                </tr>
            `;

      updateSummary([]);

      return;
    }

    orders.forEach(function (order) {
      /*
              Some backends return:

              order.items[]

              Farmer endpoint may already return
              farmer-specific products.
            */

      const items = order.items || [];

      if (items.length > 0) {
        items.forEach(function (item) {
          createOrderRow(order, item);
        });
      } else {
        createOrderRow(order, order);
      }
    });

    updateSummary(orders);

    attachActionButtons();
  }

  /* ======================================================
       CREATE ORDER ROW
    ====================================================== */

  function createOrderRow(order, item) {
    const row = document.createElement("tr");

    /* ==============================
           ORDER ID
        ============================== */

    const orderId = order._id
      ? "#" + order._id.slice(-6).toUpperCase()
      : "#N/A";

    /* ==============================
           CUSTOMER
        ============================== */

    const customer =
      order.customer?.name ||
      order.user?.name ||
      order.customerName ||
      "Customer";

    /* ==============================
           PRODUCT
        ============================== */

    const product =
      item.product?.name ||
      item.name ||
      order.product?.name ||
      order.productName ||
      "Farm Product";

    /* ==============================
           QUANTITY
        ============================== */

    const quantity = item.quantity || order.quantity || 1;

    const unit = item.product?.unit || item.unit || "Kg";

    /* ==============================
           PRICE / AMOUNT
        ============================== */

    const amount =
      item.totalPrice ||
      item.subtotal ||
      item.price * quantity ||
      order.totalAmount ||
      order.amount ||
      0;

    /* ==============================
           DATE
        ============================== */

    const orderDate = order.createdAt ? formatDate(order.createdAt) : "N/A";

    /* ==============================
           STATUS
        ============================== */

    const status = order.status || "Pending";

    const statusClass = status.toLowerCase().replace(/\s+/g, "-");

    /* ==============================
           HTML
        ============================== */

    row.innerHTML = `

            <td>
                ${orderId}
            </td>

            <td>
                ${escapeHTML(customer)}
            </td>

            <td>
                ${escapeHTML(product)}
            </td>

            <td>
                ${quantity} ${unit}
            </td>

            <td>
                ₹${Number(amount).toLocaleString("en-IN")}
            </td>

            <td>
                ${orderDate}
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${escapeHTML(status)}
                </span>
            </td>

            <td>

                <button
                    class="view-btn"
                    data-order-id="${order._id}">
                    <i class="fas fa-eye"></i>
                </button>

                ${
                  status.toLowerCase() === "pending"
                    ? `
                    <button
                        class="accept-btn"
                        data-order-id="${order._id}">
                        <i class="fas fa-check"></i>
                    </button>

                    <button
                        class="reject-btn"
                        data-order-id="${order._id}">
                        <i class="fas fa-times"></i>
                    </button>
                    `
                    : ""
                }

            </td>
        `;

    tableBody.appendChild(row);
  }

  /* ======================================================
       SUMMARY CARDS
    ====================================================== */

  function updateSummary(orders) {
    const cards = document.querySelectorAll(".cards .card h2");

    if (cards.length < 4) return;

    const total = orders.length;

    const pending = orders.filter(
      (order) => (order.status || "").toLowerCase() === "pending",
    ).length;

    const shipped = orders.filter(
      (order) => (order.status || "").toLowerCase() === "shipped",
    ).length;

    const delivered = orders.filter(
      (order) => (order.status || "").toLowerCase() === "delivered",
    ).length;

    cards[0].textContent = total;
    cards[1].textContent = pending;
    cards[2].textContent = shipped;
    cards[3].textContent = delivered;
  }

  /* ======================================================
       ACCEPT / REJECT / VIEW BUTTONS
    ====================================================== */

  function attachActionButtons() {
    /* ==============================
           VIEW
        ============================== */

    document.querySelectorAll(".view-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        const orderId = button.dataset.orderId;

        openOrderDetails(orderId);
      });
    });

    /* ==============================
           ACCEPT
        ============================== */

    document.querySelectorAll(".accept-btn").forEach(function (button) {
      button.addEventListener("click", async function () {
        const orderId = button.dataset.orderId;

        await updateOrderStatus(orderId, "Confirmed");
      });
    });

    /* ==============================
           REJECT
        ============================== */

    document.querySelectorAll(".reject-btn").forEach(function (button) {
      button.addEventListener("click", async function () {
        const orderId = button.dataset.orderId;

        const confirmReject = confirm(
          "Are you sure you want to reject this order?",
        );

        if (!confirmReject) {
          return;
        }

        await updateOrderStatus(orderId, "Cancelled");
      });
    });
  }

  /* ======================================================
       UPDATE ORDER STATUS
    ====================================================== */

  async function updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: status,
        }),
      });

      const data = await response.json();

      console.log("Order Status Response:", data);

      if (!response.ok) {
        alert(data.message || "Unable to update order.");

        return;
      }

      alert(`Order ${status} successfully.`);

      loadFarmerOrders();
    } catch (error) {
      console.error("Update Order Error:", error);

      alert("Server connection failed.");
    }
  }

  /* ======================================================
       VIEW ORDER DETAILS
    ====================================================== */

  async function openOrderDetails(orderId) {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      console.log("Order Details:", data);

      if (!response.ok) {
        alert(data.message || "Unable to load order details.");

        return;
      }

      const order = data.order || data;

      const details = modal.querySelector(".details");

      if (!details) return;

      const customer = order.customer?.name || order.user?.name || "Customer";

      const status = order.status || "Pending";

      details.innerHTML = `

                <div class="detail-row">
                    <strong>Order ID :</strong>
                    <span>#${order._id}</span>
                </div>

                <div class="detail-row">
                    <strong>Customer :</strong>
                    <span>
                        ${escapeHTML(customer)}
                    </span>
                </div>

                <div class="detail-row">
                    <strong>Product :</strong>
                    <span>
                        ${escapeHTML(
                          order.items?.[0]?.product?.name ||
                            order.items?.[0]?.name ||
                            "Farm Product",
                        )}
                    </span>
                </div>

                <div class="detail-row">
                    <strong>Quantity :</strong>
                    <span>
                        ${order.items?.[0]?.quantity || order.quantity || 1}
                    </span>
                </div>

                <div class="detail-row">
                    <strong>Amount :</strong>
                    <span>
                        ₹${Number(
                          order.totalAmount || order.amount || 0,
                        ).toLocaleString("en-IN")}
                    </span>
                </div>

                <div class="detail-row">
                    <strong>Order Date :</strong>
                    <span>
                        ${order.createdAt ? formatDate(order.createdAt) : "N/A"}
                    </span>
                </div>

                <div class="detail-row">
                    <strong>Payment :</strong>
                    <span>
                        ${order.paymentStatus || "Pending"}
                    </span>
                </div>

                <div class="detail-row">
                    <strong>Status :</strong>
                    <span class="status ${status.toLowerCase()}">
                        ${escapeHTML(status)}
                    </span>
                </div>

            `;

      modal.style.display = "flex";
    } catch (error) {
      console.error("Order Details Error:", error);

      alert("Unable to connect to backend.");
    }
  }

  /* ======================================================
       CLOSE MODAL
    ====================================================== */

  if (closeModal) {
    closeModal.addEventListener("click", function () {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  /* ======================================================
       SEARCH ORDERS
    ====================================================== */

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const search = searchInput.value.toLowerCase().trim();

      const rows = tableBody.querySelectorAll("tr");

      rows.forEach(function (row) {
        const text = row.textContent.toLowerCase();

        row.style.display = text.includes(search) ? "" : "none";
      });
    });
  }

  /* ======================================================
       REFRESH
    ====================================================== */

  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      loadFarmerOrders();
    });
  }

  /* ======================================================
       FORMAT DATE
    ====================================================== */

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  /* ======================================================
       SECURITY
    ====================================================== */

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ======================================================
       START
    ====================================================== */

  loadFarmerOrders();
});
