/* ==========================================
   FARMNEST INVENTORY JAVASCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       SEARCH INVENTORY
    ========================== */

    const searchInput = document.getElementById("searchInventory");

    if (searchInput) {

        searchInput.addEventListener("keyup", function () {

            const value = this.value.toLowerCase();

            document.querySelectorAll("#inventoryTable tbody tr").forEach(row => {

                row.style.display = row.innerText.toLowerCase().includes(value)
                    ? ""
                    : "none";

            });

        });

    }

    /* ==========================
       CATEGORY FILTER
    ========================== */

    const categoryFilter = document.getElementById("categoryFilter");

    if (categoryFilter) {

        categoryFilter.addEventListener("change", function () {

            const value = this.value.toLowerCase();

            document.querySelectorAll("#inventoryTable tbody tr").forEach(row => {

                const category = row.cells[2].textContent.toLowerCase();

                if (value === "" || category === value) {

                    row.style.display = "";

                } else {

                    row.style.display = "none";

                }

            });

        });

    }

    /* ==========================
       PRODUCT DETAILS MODAL
    ========================== */

    const modal = document.getElementById("productModal");

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

    window.addEventListener("click", e => {

        if (e.target === modal) {

            modal.style.display = "none";

        }

    });

    /* ==========================
       EDIT PRODUCT
    ========================== */

    document.querySelectorAll(".edit-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            alert("Edit Product Feature Coming Soon.");

        });

    });

    /* ==========================
       DELETE PRODUCT
    ========================== */

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            if (confirm("Delete this product?")) {

                const row = btn.closest("tr");

                if (row) {

                    row.remove();

                }

                alert("Product Deleted Successfully.");

            }

        });

    });

    /* ==========================
       ADD PRODUCT
    ========================== */

    const addBtn = document.querySelector(".add-product-btn");

    if (addBtn) {

        addBtn.addEventListener("click", () => {

            alert("Add Product Page Opening...");

            // location.href = "add-product.html";

        });

    }

    /* ==========================
       PAGINATION
    ========================== */

    document.querySelectorAll(".pagination button").forEach(btn => {

        btn.addEventListener("click", () => {

            document.querySelectorAll(".pagination button")
                .forEach(b => b.classList.remove("active"));

            if (!btn.querySelector("i")) {

                btn.classList.add("active");

            }

        });

    });

});