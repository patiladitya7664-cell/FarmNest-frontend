/* ==========================================
   FARMNEST ADMIN - PRODUCTS.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // ===========================
    // Elements
    // ===========================

    const searchInput = document.getElementById("searchProduct");
    const categoryFilter = document.getElementById("categoryFilter");

    const rows = document.querySelectorAll("#productsTable tbody tr");

    const modal = document.getElementById("productModal");
    const closeModal = document.querySelector(".close-modal");

    // Modal Elements

    const modalImage = document.getElementById("modalProductImage");
    const modalId = document.getElementById("modalProductId");
    const modalName = document.getElementById("modalProductName");
    const modalCategory = document.getElementById("modalCategory");
    const modalFarmer = document.getElementById("modalFarmer");
    const modalPrice = document.getElementById("modalPrice");
    const modalStock = document.getElementById("modalStock");
    const modalStatus = document.getElementById("modalStatus");

    // ===========================
    // Live Search
    // ===========================

    if (searchInput) {

        searchInput.addEventListener("keyup", () => {

            const value = searchInput.value.toLowerCase();

            rows.forEach(row => {

                row.style.display =
                    row.innerText.toLowerCase().includes(value)
                        ? ""
                        : "none";

            });

        });

    }

    // ===========================
    // Category Filter
    // ===========================

    if (categoryFilter) {

        categoryFilter.addEventListener("change", () => {

            const filter = categoryFilter.value.toLowerCase();

            rows.forEach(row => {

                const category = row.cells[2].textContent.toLowerCase();

                if (filter === "all") {

                    row.style.display = "";

                } else {

                    row.style.display =
                        category === filter
                            ? ""
                            : "none";

                }

            });

        });

    }

    // ===========================
    // View Product
    // ===========================

    document.querySelectorAll(".view-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const row = btn.closest("tr");

            modalImage.src =
                row.querySelector("img").src;

            modalId.textContent =
                btn.dataset.id;

            modalName.textContent =
                row.cells[1].textContent;

            modalCategory.textContent =
                row.cells[2].textContent;

            modalFarmer.textContent =
                row.cells[3].textContent;

            modalPrice.textContent =
                row.cells[4].textContent;

            modalStock.textContent =
                row.cells[5].textContent;

            modalStatus.textContent =
                row.querySelector(".status").textContent;

            modalStatus.className =
                row.querySelector(".status").className;

            modal.style.display = "flex";

        });

    });

    // ===========================
    // Close Modal
    // ===========================

    closeModal.onclick = () => {

        modal.style.display = "none";

    };

    window.onclick = (e) => {

        if (e.target === modal) {

            modal.style.display = "none";

        }

    };

    // ===========================
    // Delete Product
    // ===========================

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            if (confirm("Delete this product?")) {

                btn.closest("tr").remove();

            }

        });

    });

    // ===========================
    // Edit Product
    // ===========================

    document.querySelectorAll(".edit-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            alert("Edit Product feature will be added.");

        });

    });

    // ===========================
    // Add Product
    // ===========================

    const addBtn = document.querySelector(".add-btn");

    if (addBtn) {

        addBtn.addEventListener("click", () => {

            alert("Add Product Form Coming Soon.");

        });

    }

    // ===========================
    // Print
    // ===========================

    document.querySelector(".print-btn")
        .addEventListener("click", () => {

            window.print();

        });

    // ===========================
    // Download
    // ===========================

    document.querySelector(".download-btn")
        .addEventListener("click", () => {

            alert("Downloading Product Report...");

        });

});