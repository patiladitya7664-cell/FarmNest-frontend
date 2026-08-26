// =====================================
// FARMNEST FARMER DASHBOARD JS
// JWT + BACKEND INTEGRATION
// =====================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌱 FarmNest Farmer Dashboard Loaded");

  const API_BASE_URL = "http://localhost:5000/api";

  // =====================================
  // GET LOGGED-IN USER
  // =====================================

  let storedUser = localStorage.getItem("farmnestCurrentUser");

  // Backward compatibility
  if (!storedUser) {
    storedUser = localStorage.getItem("user");
  }

  // =====================================
  // CHECK LOGIN
  // =====================================

  if (!storedUser) {
    console.warn("No logged-in user found.");

    window.location.href = "../HOMEPAGE/auth.html";

    return;
  }

  // =====================================
  // PARSE USER
  // =====================================

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    console.error("Invalid user data:", error);

    localStorage.removeItem("farmnestCurrentUser");

    localStorage.removeItem("user");

    localStorage.removeItem("token");

    window.location.href = "../HOMEPAGE/auth.html";

    return;
  }

  console.log("👨‍🌾 Logged-in Farmer:", user);

  // =====================================
  // ROLE CHECK
  // =====================================

  if (user.role !== "farmer") {
    console.warn("This page is only for farmers.");

    window.location.href = "../HOMEPAGE/index.html";

    return;
  }

  // =====================================
  // FARMER NAME
  // =====================================

  const farmerName = user.name || "Farmer";

  localStorage.setItem("farmerName", farmerName);

  // =====================================
  // UPDATE PROFILE NAME
  // =====================================

  const profileName = document.querySelector(".profile span");

  if (profileName) {
    profileName.innerText = farmerName;
  }

  // =====================================
  // UPDATE WELCOME MESSAGE
  // =====================================

  const welcomeParagraph = document.querySelector(".main header p");

  if (welcomeParagraph) {
    welcomeParagraph.innerHTML = `Welcome back, ${farmerName} 👨‍🌾`;
  }

  // =====================================
  // ACTIVE SIDEBAR MENU
  // =====================================

  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".sidebar ul li a").forEach((link) => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.parentElement.classList.add("active");
    }
  });

  // =====================================
  // LOAD DASHBOARD DATA
  // =====================================

  loadDashboardData();

  // =====================================
  // QUICK ACTION BUTTONS
  // =====================================

  const buttons = document.querySelectorAll(".quick button");

  if (buttons[0]) {
    buttons[0].onclick = () => {
      window.location.href = "add-product.html";
    };
  }

  if (buttons[1]) {
    buttons[1].onclick = () => {
      window.location.href = "inventory.html";
    };
  }

  if (buttons[2]) {
    buttons[2].onclick = () => {
      window.location.href = "analytics.html";
    };
  }

  // =====================================
  // LOGOUT BUTTON
  // =====================================

  const logoutButton = document.getElementById("farmerLogoutBtn");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("token");

      localStorage.removeItem("farmnestCurrentUser");

      localStorage.removeItem("user");

      localStorage.removeItem("farmerName");

      localStorage.removeItem("farmnestRemember");

      window.location.href = "../HOMEPAGE/auth.html";
    });
  }

  // =====================================
  // WELCOME CONSOLE
  // =====================================

  console.log(`🌿 Welcome ${farmerName} to FarmNest Farmer Dashboard`);
});

// =====================================================
// LOAD FARMER DASHBOARD DATA
// =====================================================

async function loadDashboardData() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("JWT token not found.");

      return;
    }

    // =====================================
    // LOAD PRODUCTS
    // =====================================

    const productsResponse = await fetch(
      "http://localhost:5000/api/products/my",
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const productsData = await productsResponse.json();

    if (!productsResponse.ok) {
      throw new Error(productsData.message || "Failed to load products");
    }

    const products = productsData.products || [];

    console.log("📦 Farmer Products:", products);

    // =====================================
    // TOTAL PRODUCTS
    // =====================================

    updateCounter("totalProducts", products.length);

    // =====================================
    // TOTAL CROPS
    // =====================================

    // Current FarmNest product system
    // treats farmer products as crops/products.

    updateCounter("totalCrops", products.length);

    // =====================================
    // LOAD FARMER ORDERS
    // =====================================

    const ordersResponse = await fetch(
      "http://localhost:5000/api/orders/farmer",
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const ordersData = await ordersResponse.json();

    if (!ordersResponse.ok) {
      throw new Error(ordersData.message || "Failed to load farmer orders");
    }

    const orders = ordersData.orders || [];

    console.log("🛒 Farmer Orders:", orders);

    // =====================================
    // TOTAL ORDERS
    // =====================================

    updateCounter("totalOrders", orders.length);

    // =====================================
    // TOTAL EARNINGS
    // =====================================

    let totalEarnings = 0;

    orders.forEach((order) => {
      if (order.paymentStatus === "Paid" || order.status === "Delivered") {
        if (order.items) {
          order.items.forEach((item) => {
            if (item.farmerId && item.farmerId.toString() === getFarmerId()) {
              totalEarnings +=
                Number(item.price || 0) * Number(item.quantity || 0);
            }
          });
        }
      }
    });

    updateCurrency("totalEarnings", totalEarnings);

    // =====================================
    // RECENT ORDERS
    // =====================================

    renderRecentOrders(orders);

    console.log("✅ Farmer Dashboard data loaded successfully");
  } catch (error) {
    console.error("❌ Dashboard Data Error:", error);
  }
}

// =====================================================
// GET FARMER ID
// =====================================================

function getFarmerId() {
  let storedUser = localStorage.getItem("farmnestCurrentUser");

  if (!storedUser) {
    storedUser = localStorage.getItem("user");
  }

  if (!storedUser) {
    return "";
  }

  try {
    const user = JSON.parse(storedUser);

    return user._id || user.id || "";
  } catch (error) {
    return "";
  }
}

// =====================================================
// UPDATE NUMBER COUNTER
// =====================================================

function updateCounter(elementId, target) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  target = Number(target) || 0;

  let count = 0;

  const speed = Math.max(target / 50, 1);

  const update = () => {
    if (count < target) {
      count += speed;

      element.innerText = Math.ceil(count).toLocaleString("en-IN");

      setTimeout(update, 20);
    } else {
      element.innerText = target.toLocaleString("en-IN");
    }
  };

  update();
}

// =====================================================
// UPDATE CURRENCY
// =====================================================

function updateCurrency(elementId, amount) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.innerText = "₹" + Number(amount || 0).toLocaleString("en-IN");
}

// =====================================================
// RENDER RECENT ORDERS
// =====================================================

function renderRecentOrders(orders) {
  const tbody = document.getElementById("recentOrdersBody");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    No orders received yet.
                </td>
            </tr>
        `;

    return;
  }

  // Latest first

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  recentOrders.forEach((order) => {
    const orderId = order._id ? order._id.toString().slice(-6) : "N/A";

    let productName = "Product";

    let quantity = "N/A";

    if (order.items && order.items.length > 0) {
      const item = order.items[0];

      productName = item.product?.name || item.name || "Product";

      quantity = item.quantity ? item.quantity : "N/A";
    }

    const status = order.status || "Pending";

    let statusClass = "pending";

    if (status.toLowerCase() === "delivered") {
      statusClass = "success";
    }

    tbody.innerHTML += `
            <tr>

                <td>
                    #FN${orderId}
                </td>

                <td>
                    ${productName}
                </td>

                <td>
                    ${quantity}
                </td>

                <td>
                    <span class="status ${statusClass}">
                        ${status}
                    </span>
                </td>

            </tr>
        `;
  });
}
