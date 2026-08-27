/* =========================================================
   FARMNEST - SMART STORAGE MANAGEMENT
   FRONTEND + BACKEND INTEGRATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌱 FarmNest Smart Storage Loaded");

  /* =====================================================
     CONFIG
  ===================================================== */

  const API_URL = "http://localhost:5000/api/warehouses";

  /* =====================================================
     ELEMENTS
  ===================================================== */

  const totalStorageEl = document.getElementById("totalStorage");

  const usedStorageEl = document.getElementById("usedStorage");

  const availableStorageEl = document.getElementById("availableStorage");

  const totalWarehousesEl = document.getElementById("totalWarehouses");

  const capacityPercentEl = document.getElementById("capacityPercent");

  const capacityProgressEl = document.getElementById("capacityProgress");

  const capacityUsedEl = document.getElementById("capacityUsed");

  const capacityTotalEl = document.getElementById("capacityTotal");

  const warehouseGrid = document.getElementById("warehouseGrid");

  const emptyStorage = document.getElementById("emptyStorage");

  const addWarehouseBtn = document.getElementById("addWarehouseBtn");

  const emptyAddWarehouseBtn = document.getElementById("emptyAddWarehouseBtn");

  /* =====================================================
     GET TOKEN
  ===================================================== */

  function getToken() {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("farmerToken")
    );
  }

  /* =====================================================
     LOAD WAREHOUSES
  ===================================================== */

  async function loadWarehouses() {
    const token = getToken();

    if (!token) {
      console.warn("⚠️ Authentication token not found.");
      showLoginMessage();
      return;
    }

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
        throw new Error(data.message || "Unable to load warehouses.");
      }

      const warehouses = Array.isArray(data) ? data : data.warehouses || [];

      if (!warehouses.length) {
        displayWarehouses([]);
        updateStorageSummary([]);
        return;
      }

      /*
       * IMPORTANT:
       * Basic warehouse API only gives totalStorage.
       *
       * Actual usedStorage is calculated by:
       * quantity × weightPerUnit
       *
       * Therefore we call:
       * /:id/smart-storage
       * for every warehouse.
       */

      const smartWarehouses = await Promise.all(
        warehouses.map(async (warehouse) => {
          try {
            const smartResponse = await fetch(
              `${API_URL}/${warehouse._id}/smart-storage`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            );

            const smartData = await smartResponse.json();

            if (!smartResponse.ok) {
              console.warn(
                `⚠️ Smart storage failed for ${warehouse.warehouseName}`,
                smartData,
              );

              return {
                ...warehouse,
                usedStorage: 0,
                availableStorage: Number(warehouse.totalStorage) || 0,
              };
            }

            return {
              ...warehouse,
              ...(smartData.smartStorage || {}),
            };
          } catch (error) {
            console.error(
              `❌ Smart storage error for ${warehouse.warehouseName}:`,
              error,
            );

            return {
              ...warehouse,
              usedStorage: 0,
              availableStorage: Number(warehouse.totalStorage) || 0,
            };
          }
        }),
      );

      console.log("📊 Smart Warehouses:", smartWarehouses);

      displayWarehouses(smartWarehouses);

      updateStorageSummary(smartWarehouses);
    } catch (error) {
      console.error("❌ Warehouse loading error:", error);

      showErrorMessage(error.message || "Unable to load storage data.");
    }
  }

  /* =====================================================
     DISPLAY WAREHOUSES
  ===================================================== */

  function displayWarehouses(warehouses) {
    if (!warehouseGrid) return;

    // Remove old cards
    warehouseGrid
      .querySelectorAll(".warehouse-card")
      .forEach((card) => card.remove());

    if (!warehouses.length) {
      if (emptyStorage) {
        emptyStorage.style.display = "block";
      }

      return;
    }

    if (emptyStorage) {
      emptyStorage.style.display = "none";
    }

    warehouses.forEach((warehouse) => {
      const card = createWarehouseCard(warehouse);

      warehouseGrid.appendChild(card);
    });
  }

  /* =====================================================
     CREATE WAREHOUSE CARD
  ===================================================== */

  function createWarehouseCard(warehouse) {
    const card = document.createElement("div");

    card.className = "warehouse-card";

    /* ===================================================
       BASIC DETAILS
    =================================================== */

    const name = warehouse.warehouseName || "Unnamed Warehouse";

    const locationParts = [
      warehouse.location,
      warehouse.city,
      warehouse.state,
    ].filter(Boolean);

    const location =
      locationParts.length > 0
        ? locationParts.join(", ")
        : "Location not specified";

    /* ===================================================
       STORAGE DATA
    =================================================== */

    const totalStorage = Number(warehouse.totalStorage) || 0;

    const usedStorage = Number(warehouse.usedStorage) || 0;

    const availableStorage = Math.max(totalStorage - usedStorage, 0);

    /* ===================================================
       CAPACITY %
    =================================================== */

    let percentage = 0;

    if (totalStorage > 0) {
      percentage = Math.round((usedStorage / totalStorage) * 100);
    }

    percentage = Math.min(Math.max(percentage, 0), 100);

    /* ===================================================
       STATUS
    =================================================== */

    let status = "Available";

    if (percentage >= 90) {
      status = "Almost Full";
    } else if (percentage >= 70) {
      status = "High Usage";
    }

    /* ===================================================
       TOTAL PRODUCTS
    =================================================== */

    const totalProducts = Number(warehouse.totalProducts) || 0;

    /* ===================================================
       STORAGE VALUE
    =================================================== */

    const storageValue = Number(warehouse.storageValue) || 0;

    /* ===================================================
       LOCATION
    =================================================== */

    const fullAddress = [
      warehouse.address,
      warehouse.location,
      warehouse.city,
      warehouse.state,
      warehouse.pincode,
    ].filter(Boolean);

    const displayAddress =
      fullAddress.length > 0 ? fullAddress.join(", ") : location;

    /* ===================================================
       CARD HTML
    =================================================== */

    card.innerHTML = `

      <div class="warehouse-card-header">

        <div class="warehouse-name">

          <div class="warehouse-name-icon">
            <i class="fa fa-warehouse"></i>
          </div>

          <div>

            <h3>
              ${escapeHTML(name)}
            </h3>

            <p class="warehouse-location">
              <i class="fa fa-location-dot"></i>
              ${escapeHTML(displayAddress)}
            </p>

          </div>

        </div>


        <span class="warehouse-status">
          ${status}
        </span>

      </div>


      <!-- STORAGE CAPACITY -->

      <div class="warehouse-capacity">

        <div class="warehouse-capacity-top">

          <span>
            Storage Used
          </span>

          <strong>
            ${percentage}%
          </strong>

        </div>


        <div class="warehouse-progress">

          <div
            class="warehouse-progress-bar"
            style="width: ${percentage}%"
          ></div>

        </div>

      </div>


      <!-- STORAGE DETAILS -->

      <div class="warehouse-details">

        <div class="warehouse-detail">

          <span>
            Total Capacity
          </span>

          <strong>
            ${formatStorage(totalStorage, warehouse.storageUnit)}
          </strong>

        </div>


        <div class="warehouse-detail">

          <span>
            Used
          </span>

          <strong>
            ${formatStorage(usedStorage, warehouse.storageUnit)}
          </strong>

        </div>


        <div class="warehouse-detail">

          <span>
            Available
          </span>

          <strong>
            ${formatStorage(availableStorage, warehouse.storageUnit)}
          </strong>

        </div>


        <div class="warehouse-detail">

          <span>
            Products
          </span>

          <strong>
            ${totalProducts}
          </strong>

        </div>

      </div>


      <!-- STORAGE VALUE -->

      <div class="warehouse-storage-value">

        <span>
          <i class="fa fa-indian-rupee-sign"></i>
          Storage Value
        </span>

        <strong>
          ₹${formatNumber(storageValue)}
        </strong>

      </div>


      <!-- ALERTS -->

      ${
        warehouse.lowStockAlert
          ? `
            <div class="warehouse-alert low-stock-alert">

              <i class="fa fa-triangle-exclamation"></i>

              <span>
                Low stock products detected
              </span>

            </div>
          `
          : ""
      }


      ${
        warehouse.outOfStockAlert
          ? `
            <div class="warehouse-alert out-stock-alert">

              <i class="fa fa-circle-xmark"></i>

              <span>
                Out of stock products detected
              </span>

            </div>
          `
          : ""
      }

    `;

    return card;
  }

  /* =====================================================
     UPDATE STORAGE SUMMARY
  ===================================================== */

  function updateStorageSummary(warehouses) {
    let totalCapacity = 0;

    let usedCapacity = 0;

    warehouses.forEach((warehouse) => {
      totalCapacity += Number(warehouse.totalStorage) || 0;

      usedCapacity += Number(warehouse.usedStorage) || 0;
    });

    const availableCapacity = Math.max(totalCapacity - usedCapacity, 0);

    let percentage = 0;

    if (totalCapacity > 0) {
      percentage = Math.round((usedCapacity / totalCapacity) * 100);
    }

    percentage = Math.min(Math.max(percentage, 0), 100);

    /* ===================================================
       STAT CARDS
    =================================================== */

    if (totalStorageEl) {
      totalStorageEl.textContent = formatStorage(totalCapacity);
    }

    if (usedStorageEl) {
      usedStorageEl.textContent = formatStorage(usedCapacity);
    }

    if (availableStorageEl) {
      availableStorageEl.textContent = formatStorage(availableCapacity);
    }

    if (totalWarehousesEl) {
      totalWarehousesEl.textContent = warehouses.length;
    }

    /* ===================================================
       CAPACITY
    =================================================== */

    if (capacityPercentEl) {
      capacityPercentEl.textContent = `${percentage}%`;
    }

    if (capacityProgressEl) {
      capacityProgressEl.style.width = `${percentage}%`;
    }

    if (capacityUsedEl) {
      capacityUsedEl.textContent = formatStorage(usedCapacity);
    }

    if (capacityTotalEl) {
      capacityTotalEl.textContent = formatStorage(totalCapacity);
    }

    console.log("📊 Storage Summary:", {
      totalCapacity,
      usedCapacity,
      availableCapacity,
      percentage,
    });
  }

  /* =====================================================
     ADD WAREHOUSE
  ===================================================== */

  async function openAddWarehouse() {
    const warehouseName = prompt("Enter warehouse name:");

    if (!warehouseName) return;

    const location = prompt("Enter warehouse location:");

    if (!location) return;

    const address = prompt("Enter full warehouse address:");

    if (!address) return;

    const city = prompt("Enter city:");

    if (!city) return;

    const state = prompt("Enter state:");

    if (!state) return;

    const pincode = prompt("Enter pincode:");

    if (!pincode) return;

    const storageInput = prompt("Enter total storage capacity in kg:");

    const totalStorage = Number(storageInput);

    if (!Number.isFinite(totalStorage) || totalStorage <= 0) {
      alert("Please enter a valid storage capacity.");

      return;
    }

    await createWarehouse({
      warehouseName,
      location,
      address,
      city,
      state,
      pincode,
      totalStorage,
      storageUnit: "kg",
    });
  }

  /* =====================================================
     CREATE WAREHOUSE API
  ===================================================== */

  async function createWarehouse(warehouseData) {
    const token = getToken();

    if (!token) {
      alert("Please login as a farmer first.");

      return;
    }

    try {
      console.log("🏗️ Creating warehouse:", warehouseData);

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
        throw new Error(data.message || "Failed to create warehouse.");
      }

      alert(data.message || "Warehouse created successfully! 🌾");

      await loadWarehouses();
    } catch (error) {
      console.error("❌ Create Warehouse Error:", error);

      alert(error.message || "Unable to create warehouse.");
    }
  }

  /* =====================================================
     LOGIN MESSAGE
  ===================================================== */

  function showLoginMessage() {
    if (!warehouseGrid) return;

    warehouseGrid.innerHTML = `

      <div class="empty-storage">

        <div class="empty-icon">
          <i class="fa fa-lock"></i>
        </div>

        <h3>
          Farmer Login Required
        </h3>

        <p>
          Please login as a farmer to
          manage your warehouses.
        </p>

      </div>

    `;
  }

  /* =====================================================
     EMPTY STORAGE
  ===================================================== */

  function showEmptyStorage() {
    if (!warehouseGrid) return;

    warehouseGrid.innerHTML = `

      <div class="empty-storage">

        <div class="empty-icon">
          <i class="fa fa-warehouse"></i>
        </div>

        <h3>
          No Warehouses Found
        </h3>

        <p>
          Add your first warehouse to
          start managing storage.
        </p>

      </div>

    `;
  }

  /* =====================================================
     ERROR MESSAGE
  ===================================================== */

  function showErrorMessage(message) {
    if (!warehouseGrid) return;

    warehouseGrid.innerHTML = `

      <div class="empty-storage">

        <div class="empty-icon">
          <i class="fa fa-triangle-exclamation"></i>
        </div>

        <h3>
          Unable to Load Storage
        </h3>

        <p>
          ${escapeHTML(message)}
        </p>

        <button
          class="add-warehouse-btn"
          id="retryStorageBtn"
        >

          <i class="fa fa-refresh"></i>

          Try Again

        </button>

      </div>

    `;

    const retryBtn = document.getElementById("retryStorageBtn");

    if (retryBtn) {
      retryBtn.addEventListener("click", loadWarehouses);
    }
  }

  /* =====================================================
     FORMAT STORAGE
  ===================================================== */

  function formatStorage(value, unit = "kg") {
    const number = Number(value) || 0;

    const formatted = number.toLocaleString("en-IN");

    return `${formatted} ${unit || "kg"}`;
  }

  /* =====================================================
     FORMAT NUMBER
  ===================================================== */

  function formatNumber(value) {
    return (Number(value) || 0).toLocaleString("en-IN");
  }

  /* =====================================================
     SECURITY
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
     BUTTON EVENTS
  ===================================================== */

  if (addWarehouseBtn) {
    addWarehouseBtn.addEventListener("click", openAddWarehouse);
  }

  if (emptyAddWarehouseBtn) {
    emptyAddWarehouseBtn.addEventListener("click", openAddWarehouse);
  }

  /* =====================================================
     START
  ===================================================== */

  loadWarehouses();
});
