/* ==========================================
   FARMNEST MY CROPS
   FRONTEND + BACKEND INTEGRATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  loadMyCrops();

  setupSearch();
  setupCategoryFilter();
  setupAddCrop();
  setupModalClose();
});

/* ==========================================
   API CONFIG
========================================== */

const API_URL = "http://localhost:5000/api/products";

/* ==========================================
   GET JWT TOKEN
========================================== */

function getToken() {
  return localStorage.getItem("token");
}

/* ==========================================
   LOAD FARMER PRODUCTS
========================================== */

async function loadMyCrops() {
  const token = getToken();

  if (!token) {
    alert("Please login first.");
    window.location.href = "../login.html";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load crops");
    }

    console.log("🌾 Farmer Crops:", data);

    const products = data.products || [];

    renderCrops(products);
    updateSummary(products);
  } catch (error) {
    console.error("❌ Load Crops Error:", error);

    showTableMessage("Unable to load crops. Please try again.");
  }
}

/* ==========================================
   RENDER CROPS
========================================== */

function renderCrops(products) {
  const tbody = document.querySelector("#cropTable tbody");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (products.length === 0) {
    showTableMessage("No crops found.");

    return;
  }

  products.forEach((product) => {
    const row = document.createElement("tr");

    const quantity = Number(product.quantity || 0);
    const price = Number(product.price || 0);

    const status = getCropStatus(quantity);

    row.innerHTML = `
            <td>#${product._id || "N/A"}</td>

            <td>${escapeHTML(product.name || "N/A")}</td>

            <td>${escapeHTML(product.category || "N/A")}</td>

            <td>${quantity} Kg</td>

            <td>₹${price} / Kg</td>

            <td>${formatDate(product.harvestDate)}</td>

            <td>
                <span class="status ${status.className}">
                    ${status.text}
                </span>
            </td>

            <td>

                <button
                    class="view-btn"
                    data-id="${product._id}">
                    <i class="fas fa-eye"></i>
                </button>

                <button
                    class="edit-btn"
                    data-id="${product._id}">
                    <i class="fas fa-pen"></i>
                </button>

                <button
                    class="delete-btn"
                    data-id="${product._id}">
                    <i class="fas fa-trash"></i>
                </button>

            </td>
        `;

    tbody.appendChild(row);
  });

  attachActionButtons(products);
}

/* ==========================================
   CROP STATUS
========================================== */

function getCropStatus(quantity) {
  if (quantity <= 0) {
    return {
      text: "Sold Out",
      className: "sold-out",
    };
  }

  if (quantity <= 50) {
    return {
      text: "Low Stock",
      className: "low-stock",
    };
  }

  return {
    text: "Available",
    className: "available",
  };
}

/* ==========================================
   SUMMARY CARDS
========================================== */

function updateSummary(products) {
  const totalCrops = products.length;

  const available = products.filter(
    (product) => Number(product.quantity || 0) > 50,
  ).length;

  const lowStock = products.filter((product) => {
    const quantity = Number(product.quantity || 0);

    return quantity > 0 && quantity <= 50;
  }).length;

  const soldOut = products.filter(
    (product) => Number(product.quantity || 0) <= 0,
  ).length;

  const cards = document.querySelectorAll(".cards .card h2");

  if (cards.length >= 4) {
    cards[0].textContent = totalCrops;
    cards[1].textContent = available;
    cards[2].textContent = lowStock;
    cards[3].textContent = soldOut;
  }
}

/* ==========================================
   SEARCH CROPS
========================================== */

function setupSearch() {
  const searchInput = document.getElementById("searchCrop");

  if (!searchInput) return;

  searchInput.addEventListener("input", filterCrops);
}

/* ==========================================
   CATEGORY FILTER
========================================== */

function setupCategoryFilter() {
  const categoryFilter = document.getElementById("categoryFilter");

  if (!categoryFilter) return;

  categoryFilter.addEventListener("change", filterCrops);
}

/* ==========================================
   SEARCH + CATEGORY FILTER
========================================== */

function filterCrops() {
  const searchInput = document.getElementById("searchCrop");

  const categoryFilter = document.getElementById("categoryFilter");

  const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";

  const categoryValue = categoryFilter
    ? categoryFilter.value.toLowerCase()
    : "";

  document.querySelectorAll("#cropTable tbody tr").forEach((row) => {
    const rowText = row.innerText.toLowerCase();

    const category = row.cells[2] ? row.cells[2].textContent.toLowerCase() : "";

    const matchesSearch = rowText.includes(searchValue);

    const matchesCategory = categoryValue === "" || category === categoryValue;

    row.style.display = matchesSearch && matchesCategory ? "" : "none";
  });
}

/* ==========================================
   ACTION BUTTONS
========================================== */

function attachActionButtons(products) {
  /* VIEW */

  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.id;

      const product = products.find((item) => item._id === productId);

      if (product) {
        showCropDetails(product);
      }
    });
  });

  /* EDIT */

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.id;

      editCrop(productId);
    });
  });

  /* DELETE */

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const productId = button.dataset.id;

      await deleteCrop(productId);
    });
  });
}

/* ==========================================
   VIEW CROP DETAILS
========================================== */

function showCropDetails(product) {
  const modal = document.getElementById("cropModal");

  if (!modal) return;

  const rows = modal.querySelectorAll(".detail-row");

  if (rows.length >= 9) {
    rows[0].querySelector("span").textContent = `#${product._id || "N/A"}`;

    rows[1].querySelector("span").textContent = product.name || "N/A";

    rows[2].querySelector("span").textContent = product.category || "N/A";

    rows[3].querySelector("span").textContent = `${product.quantity || 0} Kg`;

    rows[4].querySelector("span").textContent = `₹${product.price || 0} / Kg`;

    rows[5].querySelector("span").textContent = formatDate(product.harvestDate);

    rows[6].querySelector("span").textContent =
      product.location || product.farmLocation || "Not specified";

    const status = getCropStatus(Number(product.quantity || 0));

    const statusElement = rows[7].querySelector("span");

    statusElement.textContent = status.text;

    statusElement.className = `status ${status.className}`;

    rows[8].querySelector("span").textContent =
      product.description || "No description available.";
  }

  /* Modal buttons */

  const modalEdit = modal.querySelector(".edit-btn");

  const modalDelete = modal.querySelector(".delete-btn");

  if (modalEdit) {
    modalEdit.onclick = () => {
      editCrop(product._id);
    };
  }

  if (modalDelete) {
    modalDelete.onclick = async () => {
      await deleteCrop(product._id);
    };
  }

  modal.style.display = "flex";
}

/* ==========================================
   EDIT CROP
========================================== */

function editCrop(productId) {
  if (!productId) return;

  /*
       Product edit form can receive the ID
       through URL query parameter.
    */

  window.location.href = `add-product.html?edit=${encodeURIComponent(productId)}`;
}

/* ==========================================
   DELETE CROP
========================================== */

async function deleteCrop(productId) {
  if (!productId) return;

  const confirmDelete = confirm("Are you sure you want to delete this crop?");

  if (!confirmDelete) return;

  const token = getToken();

  if (!token) {
    alert("Session expired. Please login again.");

    window.location.href = "../login.html";

    return;
  }

  try {
    const response = await fetch(`${API_URL}/${productId}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete crop");
    }

    alert(data.message || "Crop deleted successfully.");

    /* Reload actual database data */

    loadMyCrops();

    /* Close modal */

    const modal = document.getElementById("cropModal");

    if (modal) {
      modal.style.display = "none";
    }
  } catch (error) {
    console.error("❌ Delete Crop Error:", error);

    alert(error.message || "Failed to delete crop.");
  }
}

/* ==========================================
   ADD CROP
========================================== */

function setupAddCrop() {
  const addCropBtn = document.querySelector(".add-crop-btn");

  if (!addCropBtn) return;

  addCropBtn.addEventListener("click", () => {
    window.location.href = "add-product.html";
  });
}

/* ==========================================
   MODAL CLOSE
========================================== */

function setupModalClose() {
  const modal = document.getElementById("cropModal");

  if (!modal) return;

  const closeBtn = modal.querySelector(".close");

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
}

/* ==========================================
   DATE FORMAT
========================================== */

function formatDate(date) {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ==========================================
   EMPTY / ERROR TABLE MESSAGE
========================================== */

function showTableMessage(message) {
  const tbody = document.querySelector("#cropTable tbody");

  if (!tbody) return;

  tbody.innerHTML = `
        <tr>
            <td
                colspan="8"
                style="text-align:center; padding:30px;">
                ${escapeHTML(message)}
            </td>
        </tr>
    `;
}

/* ==========================================
   HTML SECURITY
========================================== */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
