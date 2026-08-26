/* =========================================================
FARMNEST FARMER REPORTS
BACKEND INTEGRATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌱 FarmNest Reports Loaded");

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login as farmer.");
    window.location.href = "../login.html";
    return;
  }

  const reportButtons = document.querySelectorAll(".report-card button");

  reportButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".report-card");

      if (!card) return;

      const reportName =
        card.querySelector("h2")?.textContent.trim() || "Report";

      openReport(reportName);
    });
  });
});

/* =========================================================
API CONFIG
========================================================= */

const API_BASE = "http://localhost:5000/api";

/* =========================================================
OPEN REPORT
========================================================= */

async function openReport(reportName) {
  console.log("📊 Opening:", reportName);

  switch (reportName) {
    case "Sales Report":
      await loadSalesReport();
      break;

    case "Product Report":
      await loadProductReport();
      break;

    case "Storage Report":
      await loadStorageReport();
      break;

    case "Earnings Report":
      await loadEarningsReport();
      break;

    default:
      alert("Report details are not available.");
  }
}

/* =========================================================
GET TOKEN
========================================================= */

function getToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login as farmer.");
    window.location.href = "../login.html";
    return null;
  }

  return token;
}

/* =========================================================
SALES REPORT
========================================================= */

async function loadSalesReport() {
  const token = getToken();

  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/orders/farmer`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load sales report");
    }

    const orders = Array.isArray(data) ? data : data.orders || [];

    let totalOrders = orders.length;

    let totalSales = 0;

    orders.forEach((order) => {
      totalSales += Number(order.totalAmount || order.amount || 0);
    });

    showReportMessage(
      "Sales Report",
      `


Total Orders: ${totalOrders}

Total Sales: ₹${totalSales.toLocaleString("en-IN")}

Report generated from your actual farmer orders.
`,
    );

    console.log("📦 Sales Report:", orders);
  } catch (error) {
    console.error("Sales Report Error:", error);

    showError("Unable to load Sales Report.\n\n" + error.message);
  }
}

/* =========================================================
PRODUCT REPORT
========================================================= */

async function loadProductReport() {
  const token = getToken();

  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/products/my`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load product report");
    }

    const products = Array.isArray(data) ? data : data.products || [];

    const totalProducts = products.length;

    let totalStock = 0;

    products.forEach((product) => {
      totalStock += Number(product.quantity || 0);
    });

    showReportMessage(
      "Product Report",
      `

Total Products: ${totalProducts}

Total Stock: ${totalStock}

Report generated from your actual products.
`,
    );

    console.log("📦 Product Report:", products);
  } catch (error) {
    console.error("Product Report Error:", error);

    showError("Unable to load Product Report.\n\n" + error.message);
  }
}
/* =========================================================
STORAGE REPORT
========================================================= */

async function loadStorageReport() {
  const token = getToken();

  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/warehouses`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load storage report");
    }

    const warehouses = Array.isArray(data) ? data : data.warehouses || [];

    showReportMessage(
      "Storage Report",
      `


Total Warehouses: ${warehouses.length}

Your warehouse and storage data was successfully fetched.
`,
    );

    console.log("🏭 Storage Report:", warehouses);
  } catch (error) {
    console.error("Storage Report Error:", error);

    showError("Unable to load Storage Report.\n\n" + error.message);
  }
}

/* =========================================================
EARNINGS REPORT
========================================================= */

async function loadEarningsReport() {
  const token = getToken();

  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/farmer/earnings`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load earnings report");
    }

    const summary = data.summary || {};

    const totalEarnings = Number(summary.totalEarnings || 0);

    const thisMonth = Number(summary.thisMonth || 0);

    const pendingPayment = Number(summary.pendingPayment || 0);

    const completedPayments = Number(summary.completedPayments || 0);

    showReportMessage(
      "Earnings Report",
      `


Total Earnings:
₹${totalEarnings.toLocaleString("en-IN")}

This Month:
₹${thisMonth.toLocaleString("en-IN")}

Pending Payment:
₹${pendingPayment.toLocaleString("en-IN")}

Completed Payments:
₹${completedPayments.toLocaleString("en-IN")}
`,
    );

    console.log("💰 Earnings Report:", data);
  } catch (error) {
    console.error("Earnings Report Error:", error);

    showError("Unable to load Earnings Report.\n\n" + error.message);
  }
}

/* =========================================================
SHOW REPORT
========================================================= */

function showReportMessage(title, message) {
  alert(title + "\n\n" + message);
}

/* =========================================================
ERROR
========================================================= */

function showError(message) {
  alert(message);
}
