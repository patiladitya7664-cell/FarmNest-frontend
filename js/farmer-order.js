/* ==========================================
   FARMNEST FARMER ORDERS JAVASCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       Search Orders
    ========================== */

    const searchInput = document.getElementById("searchOrders");

    if (searchInput) {

        searchInput.addEventListener("keyup", function () {

            const value = this.value.toLowerCase();

            document.querySelectorAll("#ordersTable tbody tr").forEach(row => {

                row.style.display = row.innerText.toLowerCase().includes(value)
                    ? ""
                    : "none";

            });

        });

    }

    /* ==========================
       View Order Details
    ========================== */

    const modal = document.getElementById("orderModal");

    const viewBtns = document.querySelectorAll(".view-btn");

    const closeBtn = document.querySelector(".close");

    viewBtns.forEach(btn => {

        btn.addEventListener("click", () => {

            modal.style.display = "flex";

        });

    });

    if (closeBtn) {

        closeBtn.addEventListener("click", () => {

            modal.style.display = "none";

        });

    }

    window.addEventListener("click", (e) => {

        if (e.target === modal) {

            modal.style.display = "none";

        }

    });

    /* ==========================
       Accept Order
    ========================== */

    document.querySelectorAll(".accept-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const row = btn.closest("tr");

            if (row) {

                const status = row.querySelector(".status");

                status.className = "status processing";

                status.textContent = "Processing";

            }

            alert("Order Accepted Successfully");

        });

    });

    /* ==========================
       Reject Order
    ========================== */

    document.querySelectorAll(".reject-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            if (!confirm("Reject this order?")) return;

            const row = btn.closest("tr");

            if (row) {

                const status = row.querySelector(".status");

                status.className = "status cancelled";

                status.textContent = "Cancelled";

            }

            alert("Order Rejected");

        });

    });

    /* ==========================
       Refresh Page
    ========================== */

    const refreshBtn = document.querySelector(".refresh-btn");

    if (refreshBtn) {

        refreshBtn.addEventListener("click", () => {

            location.reload();

        });

    }

    /* ==========================
       Pagination
    ========================== */

    document.querySelectorAll(".pagination button").forEach(btn => {

        btn.addEventListener("click", () => {

            document
                .querySelectorAll(".pagination button")
                .forEach(b => b.classList.remove("active"));

            if (!btn.querySelector("i")) {

                btn.classList.add("active");

            }

        });

    });

});