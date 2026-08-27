/* =====================================================
   FARMNEST ADMIN DASHBOARD JS
   Backend Integrated Version
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌾 FarmNest Admin Dashboard Loaded");

  /* =====================================================
       CONFIGURATION
    ===================================================== */

  fetch("http://localhost:5000/api/admin/dashboard/stats")

  const token = localStorage.getItem("token");

  /* =====================================================
       DOM ELEMENTS
    ===================================================== */

  const totalRevenue = document.getElementById("totalRevenue");
  const totalOrders = document.getElementById("totalOrders");
  const totalFarmers = document.getElementById("totalFarmers");
  const totalCustomers = document.getElementById("totalCustomers");
  const totalProducts = document.getElementById("totalProducts");
  const completedOrders = document.getElementById("completedOrders");

  /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

  loadDashboard();

  async function loadDashboard() {
    try {
      console.log("📊 Fetching admin dashboard statistics...");

      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("📊 Dashboard API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch dashboard statistics");
      }

      if (!data.success) {
        throw new Error(data.message || "Dashboard statistics unavailable");
      }

      /* =================================================
               UPDATE STATISTICS
            ================================================= */

      updateDashboardStats(data.stats);

      /* =================================================
               LOAD RECENT ORDERS
            ================================================= */

      loadRecentOrders();

      /* =================================================
               LOAD FARMERS
            ================================================= */

      loadFarmers();

      /* =================================================
               LOAD CUSTOMERS
            ================================================= */

      loadCustomers();

      /* =================================================
               LOAD CHARTS
            ================================================= */

      createCharts(data.stats);
    } catch (error) {
      console.error("❌ Dashboard Error:", error);

      showDashboardError(error.message);
    }
  }

  /* =====================================================
       UPDATE DASHBOARD STATISTICS
    ===================================================== */

  function updateDashboardStats(stats) {
    if (!stats) return;

    /* ================= REVENUE ================= */

    const revenue = Number(stats.revenue?.total || 0);

    animateValue(totalRevenue, revenue, true);

    /* ================= ORDERS ================= */

    const orders = Number(stats.orders?.total || 0);

    animateValue(totalOrders, orders);

    /* ================= FARMERS ================= */

    const farmers = Number(stats.users?.farmers || 0);

    animateValue(totalFarmers, farmers);

    /* ================= CUSTOMERS ================= */

    const customers = Number(stats.users?.customers || 0);

    animateValue(totalCustomers, customers);

    /* ================= PRODUCTS ================= */

    const products = Number(stats.products?.total || 0);

    animateValue(totalProducts, products);

    /* ================= COMPLETED ORDERS ================= */

    const completed = Number(stats.orders?.completed || 0);

    animateValue(completedOrders, completed);

    console.log("✅ Dashboard statistics updated");
  }

  /* =====================================================
       ANIMATED COUNTER
    ===================================================== */

  function animateValue(element, target, isCurrency = false) {
    if (!element) return;

    target = Number(target) || 0;

    let current = 0;

    const duration = 1000;

    const startTime = performance.now();

    function update(timestamp) {
      const progress = Math.min((timestamp - startTime) / duration, 1);

      current = Math.floor(progress * target);

      if (isCurrency) {
        element.innerText = "₹" + current.toLocaleString("en-IN");
      } else {
        element.innerText = current.toLocaleString("en-IN");
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* =====================================================
       RECENT ORDERS
    ===================================================== */

  async function loadRecentOrders() {
    const table = document.getElementById("recentOrdersTable");

    if (!table) return;

    try {
      const response = await fetch(`${API_URL}/orders/admin/all`, {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("🛒 Admin Orders:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      const orders = data.orders || [];

      if (orders.length === 0) {
        table.innerHTML = `
                    <tr>
                        <td colspan="4">
                            No orders found
                        </td>
                    </tr>
                `;

        return;
      }

      /*
       * Show latest 5 orders
       */

      const recentOrders = orders.slice(0, 5);

      table.innerHTML = recentOrders
        .map((order) => {
          const customer = order.customerId?.name || "Guest Customer";

          const product = order.products?.[0]?.productId?.name || "Product";

          const status = order.status || "Pending";

          const statusClass = getStatusClass(status);

          return `
                            <tr>

                                <td>
                                    #${order._id.slice(-6)}
                                </td>

                                <td>
                                    ${escapeHTML(customer)}
                                </td>

                                <td>
                                    ${escapeHTML(product)}
                                </td>

                                <td>
                                    <span class="status ${statusClass}">
                                        ${escapeHTML(status)}
                                    </span>
                                </td>

                            </tr>
                        `;
        })
        .join("");
    } catch (error) {
      console.error("❌ Recent Orders Error:", error);

      table.innerHTML = `
                <tr>
                    <td colspan="4">
                        Unable to load orders
                    </td>
                </tr>
            `;
    }
  }

  /* =====================================================
       STATUS CLASS
    ===================================================== */

  function getStatusClass(status) {
    switch (String(status).toLowerCase()) {
      case "delivered":
        return "delivered";

      case "completed":
        return "delivered";

      case "pending":
        return "pending";

      case "processing":
        return "processing";

      case "confirmed":
        return "processing";

      case "shipped":
        return "processing";

      case "cancelled":
        return "cancelled";

      default:
        return "pending";
    }
  }

  /* =====================================================
       LOAD FARMERS
    ===================================================== */

  async function loadFarmers() {
    const container = document.getElementById("topFarmersList");

    if (!container) return;

    try {
      const response = await fetch(`${API_URL}/admin/farmers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("👨‍🌾 Farmers:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch farmers");
      }

      const farmers = data.farmers || data.users || [];

      if (farmers.length === 0) {
        container.innerHTML = `
                    <div class="user-item">
                        <div>
                            <h4>
                                No farmers found
                            </h4>
                        </div>
                    </div>
                `;

        return;
      }

      container.innerHTML = farmers
        .slice(0, 3)
        .map((farmer) => {
          return `
                            <div class="user-item">

                                <div>

                                    <h4>
                                        ${escapeHTML(farmer.name || "Farmer")}
                                    </h4>

                                    <p>
                                        ${escapeHTML(farmer.email || "Farmer")}
                                    </p>

                                </div>

                            </div>
                        `;
        })
        .join("");
    } catch (error) {
      console.warn("⚠️ Farmers API unavailable:", error.message);

      container.innerHTML = `
                <div class="user-item">

                    <div>

                        <h4>
                            Farmer data unavailable
                        </h4>

                        <p>
                            Check admin farmer API
                        </p>

                    </div>

                </div>
            `;
    }
  }

  /* =====================================================
       LOAD CUSTOMERS
    ===================================================== */

  async function loadCustomers() {
    const container = document.getElementById("latestCustomersList");

    if (!container) return;

    try {
      const response = await fetch(`${API_URL}/admin/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("👤 Customers:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch customers");
      }

      const customers = data.customers || data.users || [];

      if (customers.length === 0) {
        container.innerHTML = `
                    <div class="user-item">

                        <div>

                            <h4>
                                No customers found
                            </h4>

                        </div>

                    </div>
                `;

        return;
      }

      container.innerHTML = customers
        .slice(0, 3)
        .map((customer) => {
          return `
                            <div class="user-item">

                                <div>

                                    <h4>
                                        ${escapeHTML(
                                          customer.name || "Customer",
                                        )}
                                    </h4>

                                    <p>
                                        ${escapeHTML(
                                          customer.email || "Customer",
                                        )}
                                    </p>

                                </div>

                                <span class="online"></span>

                            </div>
                        `;
        })
        .join("");
    } catch (error) {
      console.warn("⚠️ Customers API unavailable:", error.message);

      container.innerHTML = `
                <div class="user-item">

                    <div>

                        <h4>
                            Customer data unavailable
                        </h4>

                        <p>
                            Check admin customer API
                        </p>

                    </div>

                </div>
            `;
    }
  }

  /* =====================================================
       CHARTS
    ===================================================== */

  function createCharts(stats) {
    if (typeof Chart === "undefined") {
      console.error("❌ Chart.js not loaded");

      return;
    }

    createRevenueChart(stats);

    createOrdersChart(stats);
  }

  /* =====================================================
       REVENUE CHART
    ===================================================== */

  function createRevenueChart(stats) {
    const canvas = document.getElementById("revenueChart");

    if (!canvas) return;

    const revenue = Number(stats?.revenue?.total || 0);

    new Chart(canvas, {
      type: "line",

      data: {
        labels: ["Total Revenue"],

        datasets: [
          {
            label: "Revenue",

            data: [revenue],

            borderColor: "#2E7D32",

            backgroundColor: "rgba(46,125,50,0.15)",

            fill: true,

            tension: 0.4,

            borderWidth: 3,
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  /* =====================================================
       ORDERS CHART
    ===================================================== */

  function createOrdersChart(stats) {
    const canvas = document.getElementById("ordersChart");

    if (!canvas) return;

    const pending = Number(stats?.orders?.pending || 0);

    const completed = Number(stats?.orders?.completed || 0);

    const cancelled = Number(stats?.orders?.cancelled || 0);

    new Chart(canvas, {
      type: "bar",

      data: {
        labels: ["Pending", "Completed", "Cancelled"],

        datasets: [
          {
            label: "Orders",

            data: [pending, completed, cancelled],

            backgroundColor: ["#66BB6A", "#2E7D32", "#A5D6A7"],

            borderRadius: 10,
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }

  /* =====================================================
       NOTIFICATION BUTTON
    ===================================================== */

  const notificationBtn = document.getElementById("notificationBtn");

  if (notificationBtn) {
    notificationBtn.addEventListener("click", () => {
      alert("🔔 Admin notifications will be available here.");
    });
  }

  /* =====================================================
       MESSAGE BUTTON
    ===================================================== */

  const messageBtn = document.getElementById("messageBtn");

  if (messageBtn) {
    messageBtn.addEventListener("click", () => {
      alert("📩 No new messages.");
    });
  }

  /* =====================================================
       ACTIVE SIDEBAR
    ===================================================== */

  const menuItems = document.querySelectorAll(".menu li");

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      menuItems.forEach((menuItem) => {
        menuItem.classList.remove("active");
      });

      this.classList.add("active");
    });
  });

  /* =====================================================
       QUICK ACTION HOVER
    ===================================================== */

  const quickButtons = document.querySelectorAll(".quick-actions button");

  quickButtons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.03)";
    });

    button.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
    });
  });

  /* =====================================================
       SEARCH
    ===================================================== */

  const searchInput = document.getElementById("dashboardSearch");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const value = this.value.toLowerCase().trim();

      const rows = document.querySelectorAll("#recentOrdersTable tr");

      rows.forEach((row) => {
        const text = row.innerText.toLowerCase();

        row.style.display = text.includes(value) ? "" : "none";
      });
    });
  }

  /* =====================================================
       HTML ESCAPE
    ===================================================== */

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =====================================================
       DASHBOARD ERROR
    ===================================================== */

  function showDashboardError(message) {
    console.error("❌ Dashboard failed:", message);

    if (totalRevenue) {
      totalRevenue.innerText = "₹0";
    }

    if (totalOrders) {
      totalOrders.innerText = "0";
    }

    if (totalFarmers) {
      totalFarmers.innerText = "0";
    }

    if (totalCustomers) {
      totalCustomers.innerText = "0";
    }

    if (totalProducts) {
      totalProducts.innerText = "0";
    }

    if (completedOrders) {
      completedOrders.innerText = "0";
    }
  }
});
