/* =========================================================
   FARMNEST - SMART STORAGE MANAGEMENT JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIG
    ===================================================== */

    const API_URL = "http://localhost:5000/api/warehouses";

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const totalStorageEl =
        document.getElementById("totalStorage");

    const usedStorageEl =
        document.getElementById("usedStorage");

    const availableStorageEl =
        document.getElementById("availableStorage");

    const totalWarehousesEl =
        document.getElementById("totalWarehouses");

    const capacityPercentEl =
        document.getElementById("capacityPercent");

    const capacityProgressEl =
        document.getElementById("capacityProgress");

    const capacityUsedEl =
        document.getElementById("capacityUsed");

    const capacityTotalEl =
        document.getElementById("capacityTotal");

    const warehouseGrid =
        document.getElementById("warehouseGrid");

    const emptyStorage =
        document.getElementById("emptyStorage");

    const addWarehouseBtn =
        document.getElementById("addWarehouseBtn");

    const emptyAddWarehouseBtn =
        document.getElementById("emptyAddWarehouseBtn");


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

            console.warn("Authentication token not found.");

            showLoginMessage();

            return;
        }


        try {

            const response = await fetch(API_URL, {

                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }

            });


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load warehouses."
                );

            }


            /*
             * Backend may return:
             *
             * [
             *   {...},
             *   {...}
             * ]
             *
             * OR
             *
             * {
             *   warehouses: [...]
             * }
             */

            const warehouses =
                Array.isArray(data)
                    ? data
                    : data.warehouses || data.data || [];


            displayWarehouses(warehouses);

            updateStorageSummary(warehouses);


        } catch (error) {

            console.error(
                "Warehouse loading error:",
                error
            );

            showErrorMessage(
                error.message ||
                "Unable to load storage data."
            );

        }

    }


    /* =====================================================
       DISPLAY WAREHOUSES
    ===================================================== */

    function displayWarehouses(warehouses) {

        if (!warehouseGrid) return;


        // Remove old warehouse cards
        const oldCards =
            warehouseGrid.querySelectorAll(
                ".warehouse-card"
            );

        oldCards.forEach(card => card.remove());


        if (!warehouses.length) {

            if (emptyStorage) {
                emptyStorage.style.display = "block";
            }

            return;

        }


        if (emptyStorage) {
            emptyStorage.style.display = "none";
        }


        warehouses.forEach(warehouse => {

            const card =
                createWarehouseCard(warehouse);

            warehouseGrid.appendChild(card);

        });

    }


    /* =====================================================
       CREATE WAREHOUSE CARD
    ===================================================== */

    function createWarehouseCard(warehouse) {

        const card =
            document.createElement("div");

        card.className = "warehouse-card";


        const name =
            warehouse.name ||
            warehouse.warehouseName ||
            "Unnamed Warehouse";


        const location =
            warehouse.location ||
            warehouse.address ||
            "Location not specified";


        /*
         * Support different backend field names.
         */

        const capacity =
            Number(
                warehouse.capacity ||
                warehouse.totalCapacity ||
                warehouse.storageCapacity ||
                0
            );


        const used =
            Number(
                warehouse.usedCapacity ||
                warehouse.usedStorage ||
                warehouse.currentStorage ||
                warehouse.used ||
                0
            );


        const available =
            Math.max(
                capacity - used,
                0
            );


        let percentage = 0;

        if (capacity > 0) {

            percentage =
                Math.round(
                    (used / capacity) * 100
                );

        }


        percentage =
            Math.min(
                Math.max(percentage, 0),
                100
            );


        let status = "Available";

        if (percentage >= 90) {

            status = "Almost Full";

        } else if (percentage >= 70) {

            status = "High Usage";

        }


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
                            ${escapeHTML(location)}
                        </p>

                    </div>

                </div>


                <span class="warehouse-status">

                    ${status}

                </span>

            </div>


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


            <div class="warehouse-details">

                <div class="warehouse-detail">

                    <span>
                        Total Capacity
                    </span>

                    <strong>
                        ${formatKg(capacity)}
                    </strong>

                </div>


                <div class="warehouse-detail">

                    <span>
                        Used
                    </span>

                    <strong>
                        ${formatKg(used)}
                    </strong>

                </div>


                <div class="warehouse-detail">

                    <span>
                        Available
                    </span>

                    <strong>
                        ${formatKg(available)}
                    </strong>

                </div>


                <div class="warehouse-detail">

                    <span>
                        Status
                    </span>

                    <strong>
                        ${status}
                    </strong>

                </div>

            </div>

        `;


        return card;

    }


    /* =====================================================
       UPDATE STORAGE SUMMARY
    ===================================================== */

    function updateStorageSummary(warehouses) {

        let totalCapacity = 0;

        let usedCapacity = 0;


        warehouses.forEach(warehouse => {

            totalCapacity += Number(
                warehouse.capacity ||
                warehouse.totalCapacity ||
                warehouse.storageCapacity ||
                0
            );


            usedCapacity += Number(
                warehouse.usedCapacity ||
                warehouse.usedStorage ||
                warehouse.currentStorage ||
                warehouse.used ||
                0
            );

        });


        const availableCapacity =
            Math.max(
                totalCapacity - usedCapacity,
                0
            );


        let percentage = 0;

        if (totalCapacity > 0) {

            percentage =
                Math.round(
                    (usedCapacity / totalCapacity) * 100
                );

        }


        percentage =
            Math.min(
                Math.max(percentage, 0),
                100
            );


        /* ===============================
           STAT CARDS
        =============================== */

        if (totalStorageEl) {

            totalStorageEl.textContent =
                formatKg(totalCapacity);

        }


        if (usedStorageEl) {

            usedStorageEl.textContent =
                formatKg(usedCapacity);

        }


        if (availableStorageEl) {

            availableStorageEl.textContent =
                formatKg(availableCapacity);

        }


        if (totalWarehousesEl) {

            totalWarehousesEl.textContent =
                warehouses.length;

        }


        /* ===============================
           CAPACITY
        =============================== */

        if (capacityPercentEl) {

            capacityPercentEl.textContent =
                `${percentage}%`;

        }


        if (capacityProgressEl) {

            capacityProgressEl.style.width =
                `${percentage}%`;

        }


        if (capacityUsedEl) {

            capacityUsedEl.textContent =
                formatKg(usedCapacity);

        }


        if (capacityTotalEl) {

            capacityTotalEl.textContent =
                formatKg(totalCapacity);

        }

    }


    /* =====================================================
       ADD WAREHOUSE
    ===================================================== */

    function openAddWarehouse() {

        /*
         * Temporary frontend form.
         *
         * Next step me isko proper modal +
         * POST /api/warehouses ke saath connect
         * kar sakte hain.
         */

        const name =
            prompt("Enter warehouse name:");

        if (!name) return;


        const location =
            prompt("Enter warehouse location:");

        if (!location) return;


        const capacityInput =
            prompt(
                "Enter storage capacity in kg:"
            );


        const capacity =
            Number(capacityInput);


        if (
            !capacity ||
            capacity <= 0
        ) {

            alert(
                "Please enter a valid storage capacity."
            );

            return;

        }


        createWarehouse({
            name,
            location,
            capacity
        });

    }


    /* =====================================================
       CREATE WAREHOUSE API
    ===================================================== */

    async function createWarehouse(warehouseData) {

        const token = getToken();


        if (!token) {

            alert(
                "Please login as a farmer first."
            );

            return;

        }


        try {

            const response =
                await fetch(API_URL, {

                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            warehouseData
                        )

                });


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to create warehouse."
                );

            }


            alert(
                "Warehouse added successfully! 🌾"
            );


            loadWarehouses();


        } catch (error) {

            console.error(
                "Create warehouse error:",
                error
            );


            alert(
                error.message ||
                "Unable to create warehouse."
            );

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
                    onclick="location.reload()"
                >

                    <i class="fa fa-refresh"></i>

                    Try Again

                </button>

            </div>

        `;

    }


    /* =====================================================
       FORMAT KG
    ===================================================== */

    function formatKg(value) {

        const number =
            Number(value) || 0;


        return `${number.toLocaleString("en-IN")} kg`;

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

        addWarehouseBtn.addEventListener(
            "click",
            openAddWarehouse
        );

    }


    if (emptyAddWarehouseBtn) {

        emptyAddWarehouseBtn.addEventListener(
            "click",
            openAddWarehouse
        );

    }


    /* =====================================================
       START
    ===================================================== */

    loadWarehouses();

});