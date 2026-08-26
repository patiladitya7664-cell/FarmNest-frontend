document.addEventListener("DOMContentLoaded", () => {
  loadFarmerEarnings();
});

const API_URL = "http://localhost:5000/api/farmer/earnings";

// =====================================================
// LOAD FARMER EARNINGS
// =====================================================
async function loadFarmerEarnings() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login as farmer");
      window.location.href = "../login.html";
      return;
    }

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch earnings");
    }

    console.log("Farmer Earnings:", data);

    // ===============================
    // SUMMARY
    // ===============================
    updateSummary(data.summary);

    // ===============================
    // BREAKDOWN
    // ===============================
    updateBreakdown(data.breakdown);

    // ===============================
    // TRANSACTIONS
    // ===============================
    updateTransactions(data.transactions);

    // ===============================
    // CHART
    // ===============================
    createEarningsChart(data.transactions);

  } catch (error) {
    console.error("Earnings Error:", error);

    alert("Unable to load farmer earnings");
  }
}

// =====================================================
// UPDATE SUMMARY CARDS
// =====================================================
function updateSummary(summary) {
  const cards = document.querySelectorAll(".earning-card");

  if (!cards.length) return;

  // Total Earnings
  cards[0].querySelector("h2").textContent =
    formatCurrency(summary.totalEarnings);

  // This Month
  cards[1].querySelector("h2").textContent =
    formatCurrency(summary.thisMonth);

  // Pending Payment
  cards[2].querySelector("h2").textContent =
    formatCurrency(summary.pendingPayment);

  // Completed Payments
  cards[3].querySelector("h2").textContent =
    formatCurrency(summary.completedPayments);

  // Remove dummy percentage text
  cards[0].querySelector("span").innerHTML =
    `<i class="fas fa-wallet"></i> Total farmer earnings`;

  cards[1].querySelector("span").innerHTML =
    `<i class="fas fa-calendar-days"></i> Current month`;

  cards[2].querySelector("span").innerHTML =
    `<i class="fas fa-hourglass-half"></i> Payment pending`;

  cards[3].querySelector("span").innerHTML =
    `<i class="fas fa-check"></i> Successfully paid`;
}

// =====================================================
// UPDATE BREAKDOWN
// =====================================================
function updateBreakdown(breakdown) {
  const container = document.querySelector(".earning-grid .earning-panel:nth-child(2)");

  if (!container) return;

  const items = container.querySelectorAll(".breakdown-item");

  // Remove existing dummy breakdown
  items.forEach((item) => item.remove());

  if (!breakdown || breakdown.length === 0) {
    container.insertAdjacentHTML(
      "beforeend",
      `<p>No earnings breakdown available.</p>`
    );
    return;
  }

  breakdown.forEach((item) => {
    const percentage = Number(item.percentage) || 0;

    const html = `
      <div class="breakdown-item">
        <div class="breakdown-info">
          <span>
            <i class="fas fa-seedling"></i>
            ${item.category}
          </span>

          <strong>${formatCurrency(item.amount)}</strong>
        </div>

        <div class="progress">
          <span style="width: ${percentage}%"></span>
        </div>

        <small>${percentage}% of total earnings</small>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", html);
  });
}

// =====================================================
// UPDATE TRANSACTIONS
// =====================================================
function updateTransactions(transactions) {
  const tbody = document.querySelector("#transactionsTable tbody");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!transactions || transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">
          No transactions found
        </td>
      </tr>
    `;
    return;
  }

  transactions.forEach((transaction) => {
    const statusClass =
      transaction.status === "Paid"
        ? "paid"
        : "pending";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>#${transaction.transactionId}</td>

      <td>#${transaction.orderId}</td>

      <td>${escapeHTML(transaction.customer)}</td>

      <td>${escapeHTML(transaction.product)}</td>

      <td>${formatCurrency(transaction.amount)}</td>

      <td>${formatDate(transaction.date)}</td>

      <td>
        <span class="payment-status ${statusClass}">
          ${transaction.status}
        </span>
      </td>
    `;

    tbody.appendChild(row);
  });
}

// =====================================================
// EARNINGS CHART
// =====================================================
function createEarningsChart(transactions) {
  const canvas = document.getElementById("earningChart");

  if (!canvas) return;

  if (window.earningChartInstance) {
    window.earningChartInstance.destroy();
  }

  const monthlyData = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);

    const month = date.toLocaleDateString("en-US", {
      month: "short",
    });

    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }

    monthlyData[month] += Number(transaction.amount) || 0;
  });

  const labels = Object.keys(monthlyData);

  const values = Object.values(monthlyData);

  window.earningChartInstance = new Chart(canvas, {
    type: "line",

    data: {
      labels,

      datasets: [
        {
          label: "Earnings",

          data: values,

          borderWidth: 3,

          tension: 0.4,

          fill: false,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

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
              return "₹" + value;
            },
          },
        },
      },
    },
  });
}

// =====================================================
// FORMAT CURRENCY
// =====================================================
function formatCurrency(amount) {
  return (
    "₹" +
    Number(amount || 0).toLocaleString("en-IN")
  );
}

// =====================================================
// FORMAT DATE
// =====================================================
function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// =====================================================
// SECURITY
// =====================================================
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