/* ==========================================
   FARMNEST INVENTORY JAVASCRIPT
   BACKEND INTEGRATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 FarmNest Inventory Loaded");

  const API_URL = "http://localhost:5000/api/products";

  let inventoryProducts = [];

  const token = localStorage.getItem("token");

  // ==========================================
  // AUTH CHECK
  // ==========================================

  if (!token) {
    console.warn("⚠️ Farmer token not found");

    alert("Please login first.");

    window.location.href = "../login.html";

    return;
  }

  // ==========================================
  // DOM ELEMENTS
  // ==========================================

  const tableBody = document.querySelector("#inventoryTable tbody");

  const searchInput = document.getElementById("searchInventory");

  const categoryFilter = document.getElementById("categoryFilter");

  const modal = document.getElementById("productModal");

  const closeBtn = document.querySelector(".close");

  const addBtn = document.querySelector(".add-product-btn");

  // ==========================================
  // LOAD FARMER INVENTORY
  // ==========================================

  async function loadInventory() {
    try {
      console.log("📦 Loading Farmer Inventory...");

      const response = await fetch(`${API_URL}/my`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      console.log("📦 Inventory API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load inventory");
      }

      inventoryProducts = data.products || [];

      console.log(`🌾 Farmer Products Loaded: ${inventoryProducts.length}`);

      updateSummaryCards();

      renderInventory(inventoryProducts);

      populateCategories();
    } catch (error) {
      console.error("❌ Inventory Loading Error:", error);

      if (
        error.message.toLowerCase().includes("token") ||
        error.message.toLowerCase().includes("unauthorized")
      ) {
        localStorage.removeItem("token");

        alert("Session expired. Please login again.");

        window.location.href = "../login.html";

        return;
      }

      tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        Failed to load inventory.
                    </td>
                </tr>
            `;
    }
  }

  // ==========================================
  // UPDATE SUMMARY CARDS
  // ==========================================

  function updateSummaryCards() {
    const cards = document.querySelectorAll(".cards .card h2");

    if (cards.length < 4) {
      console.warn("⚠️ Summary cards not found");

      return;
    }

    const totalProducts = inventoryProducts.length;

    const inStock = inventoryProducts.filter((product) => {
      return Number(product.quantity) > 10;
    }).length;

    const lowStock = inventoryProducts.filter((product) => {
      const quantity = Number(product.quantity);

      return quantity > 0 && quantity <= 10;
    }).length;

    const outOfStock = inventoryProducts.filter((product) => {
      return Number(product.quantity) === 0;
    }).length;

    cards[0].textContent = totalProducts;

    cards[1].textContent = inStock;

    cards[2].textContent = lowStock;

    cards[3].textContent = outOfStock;

    console.log("📊 Inventory Summary:", {
      totalProducts,

      inStock,

      lowStock,

      outOfStock,
    });
  }

  // ==========================================
  // RENDER INVENTORY TABLE
  // ==========================================

  function renderInventory(products) {
    tableBody.innerHTML = "";

    if (!products.length) {
      tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        No products found.
                    </td>
                </tr>
            `;

      return;
    }

    products.forEach((product) => {
      const row = document.createElement("tr");

      const productId = product._id
        ? `#${product._id.slice(-6).toUpperCase()}`
        : "#N/A";

      const quantity = Number(product.quantity) || 0;

      const unit = product.unit || "kg";

      let statusText = "In Stock";

      let statusClass = "in-stock";

      if (quantity === 0) {
        statusText = "Out of Stock";

        statusClass = "out-stock";
      } else if (quantity <= 10) {
        statusText = "Low Stock";

        statusClass = "low-stock";
      }

      const price =
        product.price !== undefined ? `₹${product.price}/${unit}` : "N/A";

      const lastUpdated = product.updatedAt
        ? formatDate(product.updatedAt)
        : "N/A";

      row.innerHTML = `

                <td>${productId}</td>

                <td>${escapeHTML(product.name || "Unnamed Product")}</td>

                <td>${escapeHTML(product.category || "N/A")}</td>

                <td>${quantity} ${escapeHTML(unit)}</td>

                <td>${price}</td>

                <td>
                    <span class="status ${statusClass}">
                        ${statusText}
                    </span>
                </td>

                <td>${lastUpdated}</td>

                <td>

                    <button
                        class="view-btn"
                        data-id="${product._id}"
                        title="View Product"
                    >
                        <i class="fas fa-eye"></i>
                    </button>

                    <button
                        class="edit-btn"
                        data-id="${product._id}"
                        title="Edit Product"
                    >
                        <i class="fas fa-pen"></i>
                    </button>

                    <button
                        class="delete-btn"
                        data-id="${product._id}"
                        title="Delete Product"
                    >
                        <i class="fas fa-trash"></i>
                    </button>

                </td>

            `;

      tableBody.appendChild(row);
    });

    attachTableEvents();
  }

  // ==========================================
  // ESCAPE HTML
  // ==========================================

  function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",

      month: "short",

      year: "numeric",
    });
  }

  // ==========================================
  // CATEGORY DROPDOWN
  // ==========================================

  function populateCategories() {
    if (!categoryFilter) return;

    const categories = [
      ...new Set(
        inventoryProducts

          .map((product) => product.category)

          .filter(Boolean),
      ),
    ];

    const currentValue = categoryFilter.value;

    categoryFilter.innerHTML = `

            <option value="">
                All Categories
            </option>

        `;

    categories.forEach((category) => {
      const option = document.createElement("option");

      option.value = category;

      option.textContent = category;

      categoryFilter.appendChild(option);
    });

    categoryFilter.value = currentValue;
  }

  // ==========================================
  // FILTER INVENTORY
  // ==========================================

  function filterInventory() {
    const searchValue = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

    const categoryValue = categoryFilter
      ? categoryFilter.value.toLowerCase()
      : "";

    const filteredProducts = inventoryProducts.filter((product) => {
      const name = String(product.name || "").toLowerCase();

      const id = String(product._id || "").toLowerCase();

      const category = String(product.category || "").toLowerCase();

      const matchesSearch =
        !searchValue || name.includes(searchValue) || id.includes(searchValue);

      const matchesCategory = !categoryValue || category === categoryValue;

      return matchesSearch && matchesCategory;
    });

    renderInventory(filteredProducts);
  }

  // ==========================================
  // SEARCH
  // ==========================================

  if (searchInput) {
    searchInput.addEventListener("input", filterInventory);
  }

  // ==========================================
  // CATEGORY FILTER
  // ==========================================

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterInventory);
  }

  // ==========================================
  // TABLE BUTTON EVENTS
  // ==========================================

  function attachTableEvents() {
    // VIEW

    document.querySelectorAll(".view-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.id;

        openProductDetails(productId);
      });
    });

    // EDIT

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.id;

        editProduct(productId);
      });
    });

    // DELETE

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.id;

        deleteProduct(productId);
      });
    });
  }

  // ==========================================
  // VIEW PRODUCT
  // ==========================================

  function openProductDetails(productId) {
    const product = inventoryProducts.find((item) => item._id === productId);

    if (!product) {
      alert("Product details not found.");

      return;
    }

    const quantity = Number(product.quantity) || 0;

    const unit = product.unit || "kg";

    let statusText = "In Stock";

    let statusClass = "in-stock";

    if (quantity === 0) {
      statusText = "Out of Stock";

      statusClass = "out-stock";
    } else if (quantity <= 10) {
      statusText = "Low Stock";

      statusClass = "low-stock";
    }

    const productIdElement = modal.querySelector(
      ".detail-row:nth-child(1) span",
    );

    const nameElement = modal.querySelector(".detail-row:nth-child(2) span");

    const categoryElement = modal.querySelector(
      ".detail-row:nth-child(3) span",
    );

    const stockElement = modal.querySelector(".detail-row:nth-child(4) span");

    const priceElement = modal.querySelector(".detail-row:nth-child(5) span");

    const statusElement = modal.querySelector(".detail-row:nth-child(6) span");

    const warehouseElement = modal.querySelector(
      ".detail-row:nth-child(7) span",
    );

    const updatedElement = modal.querySelector(".detail-row:nth-child(8) span");

    const descriptionElement = modal.querySelector(
      ".detail-row:nth-child(9) span",
    );

    if (productIdElement)
      productIdElement.textContent = `#${product._id.slice(-6).toUpperCase()}`;

    if (nameElement) nameElement.textContent = product.name || "N/A";

    if (categoryElement)
      categoryElement.textContent = product.category || "N/A";

    if (stockElement) stockElement.textContent = `${quantity} ${unit}`;

    if (priceElement)
      priceElement.textContent = `₹${product.price || 0} / ${unit}`;

    if (statusElement) {
      statusElement.textContent = statusText;

      statusElement.className = `status ${statusClass}`;
    }

    // Warehouse is not stored in Product model

    // ==========================================
// WAREHOUSE
// ==========================================

if (warehouseElement) {
  if (product.warehouseId) {
    if (typeof product.warehouseId === "object") {
      warehouseElement.textContent =
        product.warehouseId.warehouseName ||
        product.warehouseId.name ||
        "Assigned";
    } else {
      warehouseElement.textContent =
        product.warehouseId;
    }
  } else {
    warehouseElement.textContent =
      "Not Assigned";
  }
}

    if (updatedElement)
      updatedElement.textContent = product.updatedAt
        ? formatDate(product.updatedAt)
        : "N/A";

    if (descriptionElement)
      descriptionElement.textContent =
        product.description || "No description available.";

    modal.style.display = "flex";
  }

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // ==========================================
  // EDIT PRODUCT
  // ==========================================

  function editProduct(productId) {
    const product = inventoryProducts.find((item) => item._id === productId);

    if (!product) {
      alert("Product not found.");

      return;
    }

    /*
          Existing Add Product page can be reused.

          Product data is stored temporarily so
          add-product.js can use it for editing.
        */

    localStorage.setItem("editProduct", JSON.stringify(product));

    window.location.href = "add-product.html?edit=" + productId;
  }

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  async function deleteProduct(productId) {
    const product = inventoryProducts.find((item) => item._id === productId);

    if (!product) {
      alert("Product not found.");

      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) return;

    try {
      console.log("🗑️ Deleting Product:", productId);

      const response = await fetch(`${API_URL}/${productId}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      console.log("🗑️ Delete Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      alert(data.message || "Product deleted successfully.");

      await loadInventory();
    } catch (error) {
      console.error("❌ Delete Product Error:", error);

      alert(error.message || "Unable to delete product.");
    }
  }

  // ==========================================
  // ADD PRODUCT
  // ==========================================

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      window.location.href = "add-product.html";
    });
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  loadInventory();
});
