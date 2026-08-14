/* ==========================================
   FARMNEST MY CROPS JAVASCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       SEARCH CROPS
    ========================== */

    const searchInput = document.getElementById("searchCrop");

    if (searchInput) {

        searchInput.addEventListener("keyup", function () {

            const value = this.value.toLowerCase();

            document.querySelectorAll("#cropTable tbody tr").forEach(row => {

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

            document.querySelectorAll("#cropTable tbody tr").forEach(row => {

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
       CROP DETAILS MODAL
    ========================== */

    const modal = document.getElementById("cropModal");

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
       ADD CROP
    ========================== */

    const addCropBtn = document.querySelector(".add-crop-btn");

    if (addCropBtn) {

        addCropBtn.addEventListener("click", () => {

            alert("Opening Add Crop Page...");

            // location.href = "add-product.html";

        });

    }

    /* ==========================
       EDIT CROP
    ========================== */

    document.querySelectorAll(".edit-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            alert("Edit Crop Feature Coming Soon.");

        });

    });

    /* ==========================
       DELETE CROP
    ========================== */

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const confirmDelete = confirm("Are you sure you want to delete this crop?");

            if (confirmDelete) {

                const row = btn.closest("tr");

                if (row) {

                    row.remove();

                }

                alert("Crop Deleted Successfully.");

            }

        });

    });

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