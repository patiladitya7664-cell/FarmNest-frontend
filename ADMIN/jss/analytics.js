/* =========================================================
   FARMNEST FARMER ANALYTICS
   BACKEND INTEGRATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌱 FarmNest Analytics Loaded");

  loadAnalytics();

  const refreshBtn = document.getElementById("refreshAnalytics");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadAnalytics);
  }

  const exportBtn = document.getElementById("exportReport");

  if (exportBtn) {
    exportBtn.addEventListener("click", exportAnalytics);
  }
});

/* =========================================================
   API
========================================================= */

const API_BASE = "http://localhost:5000/api";

/* =========================================================
   LOAD ANALYTICS
========================================================= */

async function loadAnalytics() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login as farmer.");

    window.location.href = "../login.html";

    return;
  }

  try {
    console.log("📊 Loading Farmer Analytics...");

    const headers = {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",
    };

    /* ================================================
           FETCH ORDERS
        ================================================ */

    const ordersResponse = await fetch(`${API_BASE}/orders/farmer`, {
      method: "GET",
      headers,
    });

    const ordersData = await ordersResponse.json();

    if (!ordersResponse.ok) {
      throw new Error(ordersData.message || "Failed to load orders");
    }

    const orders = Array.isArray(ordersData)
      ? ordersData
      : ordersData.orders || [];

    /* ================================================
           FETCH PRODUCTS
        ================================================ */

    const productsResponse = await fetch(`${API_BASE}/products/my`, {
      method: "GET",
      headers,
    });

    const productsData = await productsResponse.json();

    if (!productsResponse.ok) {
      throw new Error(productsData.message || "Failed to load products");
    }

    const products = Array.isArray(productsData)
      ? productsData
      : productsData.products || [];

    /* ================================================
           FETCH EARNINGS
        ================================================ */

    const earningsResponse = await fetch(`${API_BASE}/farmer/earnings`, {
      method: "GET",
      headers,
    });

    const earningsData = await earningsResponse.json();

    if (!earningsResponse.ok) {
      throw new Error(earningsData.message || "Failed to load earnings");
    }

    console.log("📦 Farmer Orders:", orders);

    console.log("🌾 Farmer Products:", products);

    console.log("💰 Farmer Earnings:", earningsData);

    /* ================================================
           UPDATE CARDS
        ================================================ */

    updateAnalyticsCards(orders, products, earningsData);

    /* ================================================
           REVENUE CHART
        ================================================ */

    createRevenueChart(orders);

    /* ================================================
           ORDERS CHART
        ================================================ */

    createOrdersChart(orders);

    /* ================================================
           PRODUCT CHART
        ================================================ */

    createProductChart(products);

    /* ================================================
           ANALYTICS TABLE
        ================================================ */

    updateAnalyticsTable(orders, products);

    console.log("✅ Farmer Analytics loaded successfully");
  } catch (error) {
    console.error("❌ Analytics Error:", error);

    alert("Unable to load farmer analytics.\n\n" + error.message);
  }
}

/* =========================================================
   UPDATE ANALYTICS CARDS
========================================================= */

function updateAnalyticsCards(orders, products, earningsData) {
  const cards = document.querySelectorAll(".cards .count");

  if (cards.length < 4) return;

  const summary = earningsData.summary || {};

  const revenue = Number(summary.totalEarnings || 0);

  const totalOrders = orders.length;

  const customers = new Set(
    orders
      .map((order) => {
        return (
          order.customer?._id ||
          order.user?._id ||
          order.customerId ||
          order.customer?.email ||
          order.user?.email
        );
      })
      .filter(Boolean),
  ).size;

  cards[0].textContent = "₹" + revenue.toLocaleString("en-IN");

  cards[1].textContent = totalOrders.toLocaleString("en-IN");

  cards[2].textContent = customers.toLocaleString("en-IN");

  /*
       Positive Reviews API is not currently
       available in the verified farmer APIs.

       Therefore we do not use the dummy 98%.
    */

  cards[3].textContent = "N/A";
}

/* =========================================================
   REVENUE CHART
========================================================= */

function createRevenueChart(orders) {
  const canvas = document.getElementById("revenueChart");

  if (!canvas) return;

  if (window.revenueChartInstance) {
    window.revenueChartInstance.destroy();
  }

  const monthlyRevenue = {};

  orders.forEach((order) => {
    const date = new Date(order.createdAt);

    if (isNaN(date)) return;

    const month = date.toLocaleDateString("en-IN", {
      month: "short",
    });

    const amount = Number(order.totalAmount || order.amount || 0);

    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + amount;
  });

  const labels = Object.keys(monthlyRevenue);

  const values = Object.values(monthlyRevenue);

  window.revenueChartInstance = new Chart(canvas, {
    type: "line",

    data: {
      labels,

      datasets: [
        {
          label: "Revenue",

          data: values,

          borderWidth: 3,

          tension: 0.4,

          fill: false,
        },
      ],
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          display: true,
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            callback: function (value) {
              return "₹" + Number(value).toLocaleString("en-IN");
            },
          },
        },
      },
    },
  });
}

/* =========================================================
   ORDERS CHART
========================================================= */

function createOrdersChart(orders) {
  const canvas = document.getElementById("ordersChart");

  if (!canvas) return;

  if (window.ordersChartInstance) {
    window.ordersChartInstance.destroy();
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const counts = [0, 0, 0, 0, 0, 0, 0];

  orders.forEach((order) => {
    const date = new Date(order.createdAt);

    if (isNaN(date)) return;

    counts[date.getDay()]++;
  });

  window.ordersChartInstance = new Chart(canvas, {
    type: "bar",

    data: {
      labels: days,

      datasets: [
        {
          label: "Orders",

          data: counts,

          borderWidth: 1,
        },
      ],
    },

    options: {
      responsive: true,

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

/* =========================================================
   PRODUCT DISTRIBUTION
========================================================= */

function createProductChart(products) {
  const canvas = document.getElementById("productChart");

  if (!canvas) return;

  if (window.productChartInstance) {
    window.productChartInstance.destroy();
  }

  const categories = {};

  products.forEach((product) => {
    const category = product.category || "Other";

    categories[category] = (categories[category] || 0) + 1;
  });

  const labels = Object.keys(categories);

  const values = Object.values(categories);

  window.productChartInstance = new Chart(canvas, {
    type: "doughnut",

    data: {
      labels,

      datasets: [
        {
          label: "Products",

          data: values,
        },
      ],
    },

    options: {
      responsive: true,
    },
  });
}

/* =========================================================
   ANALYTICS TABLE
========================================================= */

function updateAnalyticsTable(orders, products) {
  const table = document.querySelector(".table-section table");

  if (!table) return;

  const tbody = table.querySelector("tbody");

  if (!tbody) return;

  tbody.innerHTML = "";

  products.forEach((product) => {
    const productId = product._id;

    const productName = product.name || "Farm Product";

    let productOrders = 0;

    let productRevenue = 0;

    orders.forEach((order) => {
      const items = order.items || [];

      items.forEach((item) => {
        const itemProduct = item.product;

        const itemProductId = itemProduct?._id || itemProduct;

        if (String(itemProductId) === String(productId)) {
          productOrders += Number(item.quantity || 0);

          productRevenue += Number(item.totalPrice || item.subtotal || 0);
        }
      });
    });

    let status = "Low";

    if (productOrders >= 20) {
      status = "High";
    } else if (productOrders >= 10) {
      status = "Medium";
    }

    const statusClass =
      status === "High"
        ? "success"
        : status === "Medium"
          ? "warning"
          : "danger";

    const row = document.createElement("tr");

    row.innerHTML = `

            <td>
                ${escapeHTML(productName)}
            </td>

            <td>
                ${productOrders}
            </td>

            <td>
                ₹${productRevenue.toLocaleString("en-IN")}
            </td>

            <td>
                -
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${status}
                </span>
            </td>

        `;

    tbody.appendChild(row);
  });

  if (!products.length) {
    tbody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;">
                    No product analytics available.
                </td>
            </tr>
        `;
  }
}

/* =========================================================
   SEARCH
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("searchAnalytics");

  if (!search) return;

  search.addEventListener("input", () => {
    const value = search.value.toLowerCase().trim();

    const rows = document.querySelectorAll(".table-section tbody tr");

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();

      row.style.display = text.includes(value) ? "" : "none";
    });
  });
});

/* =========================================================
   EXPORT REPORT
========================================================= */

function exportAnalytics() {
  const rows = document.querySelectorAll(".table-section tbody tr");

  if (!rows.length) {
    alert("No analytics data available.");

    return;
  }

  let csv = "Product,Orders,Revenue,Growth,Status\n";

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");

    if (cells.length < 5) return;

    const values = Array.from(cells).map(
      (cell) => `"${cell.innerText.replace(/"/g, '""')}"`,
    );

    csv += values.join(",") + "\n";
  });

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = "FarmNest-Farmer-Analytics.csv";

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);

  console.log("📥 Analytics report exported");
}

/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
