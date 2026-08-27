// =====================================
// FARMNEST WAREHOUSE MANAGEMENT
// BACKEND INTEGRATION
// =====================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🏭 FarmNest Warehouse Management Loaded");

  const API_URL = "http://localhost:5000/api/warehouses";

  const token = localStorage.getItem("token");

  // =====================================
  // AUTH CHECK
  // =====================================

  if (!token) {
    alert("Please login first.");
    window.location.href = "../login.html";
    return;
  }

  // =====================================
  // ELEMENTS
  // =====================================

  const addBtn = document.querySelector(".add-btn");

  const warehouseGrid = document.querySelector(".warehouse-grid");

  const statCards = document.querySelectorAll(".cards .card");

  // =====================================
  // LOAD WAREHOUSES
  // =====================================

  async function loadWarehouses() {
    try {
      console.log("📦 Loading farmer warehouses...");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      console.log("🏭 Warehouse Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Unable to load warehouses");
      }

      const warehouses = data.warehouses || [];

      renderWarehouses(warehouses);

      updateStats(warehouses);

      console.log(`✅ ${warehouses.length} warehouses loaded`);
    } catch (error) {
      console.error("❌ Load Warehouses Error:", error);

      alert(error.message || "Unable to load warehouses.");
    }
  }

  // =====================================
  // RENDER WAREHOUSES
  // =====================================

  function renderWarehouses(warehouses) {
    if (!warehouseGrid) return;

    warehouseGrid.innerHTML = "";

    if (warehouses.length === 0) {
      warehouseGrid.innerHTML = `
        <div class="warehouse-card">
          <div class="icon">
            <i class="fa fa-warehouse"></i>
          </div>

          <h3>No Warehouse Found</h3>

          <p>
            Create your first warehouse to start
            managing storage.
          </p>

          <button class="empty-add-btn">
            <i class="fa fa-plus"></i>
            Add Warehouse
          </button>
        </div>
      `;

      const emptyAddBtn = document.querySelector(".empty-add-btn");

      if (emptyAddBtn) {
        emptyAddBtn.addEventListener("click", openAddWarehouseForm);
      }

      return;
    }

    warehouses.forEach((warehouse) => {
      const totalStorage = Number(warehouse.totalStorage) || 0;

      const usedStorage = Number(warehouse.usedStorage) || 0;

      let percentage = 0;

      if (totalStorage > 0) {
        percentage = (usedStorage / totalStorage) * 100;
      }

      percentage = Math.min(Math.max(percentage, 0), 100);

      const card = document.createElement("div");

      card.className = "warehouse-card";

      card.innerHTML = `
        <div class="icon">
          <i class="fa fa-warehouse"></i>
        </div>

        <h3>
          ${escapeHTML(warehouse.warehouseName || "Warehouse")}
        </h3>

        <p>
          Location :
          ${escapeHTML(warehouse.location || "Not specified")}
        </p>

        <div class="capacity">

          <span>
            Capacity ${percentage.toFixed(0)}%
          </span>

          <div class="bar">
            <div style="width:${percentage}%"></div>
          </div>

          <small>
            ${usedStorage} /
            ${totalStorage}
            ${warehouse.storageUnit || "kg"}
          </small>

        </div>

        <button class="manage-btn">
          Manage
        </button>
      `;

      warehouseGrid.appendChild(card);

      const manageBtn = card.querySelector(".manage-btn");

      manageBtn.addEventListener("click", () => {
        manageWarehouse(warehouse);
      });

      // High capacity alert

      if (percentage >= 85) {
        const capacityText = card.querySelector(".capacity span");

        if (capacityText) {
          capacityText.style.color = "red";

          capacityText.innerHTML = `⚠ High Capacity ${percentage.toFixed(0)}%`;
        }
      }
    });
  }

  // =====================================
  // UPDATE STATS
  // =====================================

  function updateStats(warehouses) {
    if (!statCards.length) return;

    // Total warehouses

    const totalWarehouses = warehouses.length;

    // Total storage

    let totalStorage = 0;

    let totalUsedStorage = 0;

    warehouses.forEach((warehouse) => {
      totalStorage += Number(warehouse.totalStorage) || 0;

      totalUsedStorage += Number(warehouse.usedStorage) || 0;
    });

    let capacityUsed = 0;

    if (totalStorage > 0) {
      capacityUsed = (totalUsedStorage / totalStorage) * 100;
    }

    capacityUsed = Math.min(Math.max(capacityUsed, 0), 100);

    // =====================================
    // STAT CARD 1
    // =====================================

    const totalWarehouseElement = statCards[0]?.querySelector("h3");

    if (totalWarehouseElement) {
      totalWarehouseElement.textContent = totalWarehouses;
    }

    // =====================================
    // STAT CARD 2
    // =====================================

    const storedProductsElement = statCards[1]?.querySelector("h3");

    if (storedProductsElement) {
      storedProductsElement.textContent = `${totalUsedStorage} Kg`;
    }

    // =====================================
    // STAT CARD 3
    // =====================================

    const capacityElement = statCards[2]?.querySelector("h3");

    if (capacityElement) {
      capacityElement.textContent = `${capacityUsed.toFixed(0)}%`;
    }

    // =====================================
    // STAT CARD 4
    // =====================================

    const lowStockElement = statCards[3]?.querySelector("h3");

    if (lowStockElement) {
      lowStockElement.textContent = "0";
    }
  }

  // =====================================
  // ADD WAREHOUSE
  // =====================================

  function openAddWarehouseForm() {
    const warehouseName = prompt("Enter Warehouse Name");

    if (!warehouseName) return;

    const location = prompt("Enter Warehouse Location");

    if (!location) return;

    const address = prompt("Enter Warehouse Address");

    if (!address) return;

    const city = prompt("Enter City");

    if (!city) return;

    const state = prompt("Enter State");

    if (!state) return;

    const pincode = prompt("Enter Pincode");

    if (!pincode) return;

    const totalStorage = prompt("Enter Total Storage (in Kg)");

    if (!totalStorage) return;

    createWarehouse({
      warehouseName,
      location,
      address,
      city,
      state,
      pincode,
      totalStorage: Number(totalStorage),
      storageUnit: "kg",
    });
  }

  // =====================================
  // CREATE WAREHOUSE API
  // =====================================

  async function createWarehouse(warehouseData) {
    try {
      console.log("🏭 Creating warehouse...", warehouseData);

      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify(warehouseData),
      });

      const data = await response.json();

      console.log("🏭 Create Warehouse Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create warehouse");
      }

      alert(data.message || "Warehouse created successfully 🌱");

      await loadWarehouses();
    } catch (error) {
      console.error("❌ Create Warehouse Error:", error);

      alert(error.message || "Unable to create warehouse.");
    }
  }

  // =====================================
  // MANAGE WAREHOUSE
  // =====================================

  function manageWarehouse(warehouse) {
    const action = confirm(
      `Warehouse: ${warehouse.warehouseName}\n\n` +
        `Location: ${warehouse.location}\n` +
        `Storage: ${warehouse.usedStorage || 0} / ${
          warehouse.totalStorage
        } ${warehouse.storageUnit || "kg"}\n\n` +
        `Press OK to delete this warehouse.\n` +
        `Press Cancel to keep it.`,
    );

    if (action) {
      deleteWarehouse(warehouse._id);
    }
  }

  // =====================================
  // DELETE WAREHOUSE
  // =====================================

  async function deleteWarehouse(warehouseId) {
    try {
      const confirmDelete = confirm(
        "Are you sure you want to delete this warehouse?",
      );

      if (!confirmDelete) return;

      const response = await fetch(`${API_URL}/${warehouseId}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete warehouse");
      }

      alert(data.message || "Warehouse deleted successfully");

      await loadWarehouses();
    } catch (error) {
      console.error("❌ Delete Warehouse Error:", error);

      alert(error.message || "Unable to delete warehouse.");
    }
  }

  // =====================================
  // HTML ESCAPE
  // =====================================

  function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
  }

  // =====================================
  // ADD BUTTON
  // =====================================

  if (addBtn) {
    addBtn.addEventListener("click", openAddWarehouseForm);
  }

  // =====================================
  // INITIAL LOAD
  // =====================================

  await loadWarehouses();

  console.log("✅ Warehouse Management Ready");
});
