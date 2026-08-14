/* ==========================================
   FARMNEST ADMIN - PAYMENTS.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // ==========================
    // Elements
    // ==========================

    const searchInput = document.getElementById("searchPayment");
    const filter = document.getElementById("paymentFilter");
    const rows = document.querySelectorAll("#paymentsTable tbody tr");

    const modal = document.getElementById("paymentModal");
    const closeModal = document.querySelector(".close-modal");

    // Receipt Fields
    const receiptTxn = document.getElementById("receiptTxn");
    const receiptCustomer = document.getElementById("receiptCustomer");
    const receiptFarmer = document.getElementById("receiptFarmer");
    const receiptMethod = document.getElementById("receiptMethod");
    const receiptAmount = document.getElementById("receiptAmount");
    const receiptDate = document.getElementById("receiptDate");

    // =====================================
    // Search Payments
    // =====================================

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

    // =====================================
    // Filter
    // =====================================

    if (filter) {

        filter.addEventListener("change", () => {

            const statusFilter = filter.value;

            rows.forEach(row => {

                const status = row.querySelector(".status")
                    .innerText
                    .toLowerCase();

                if (statusFilter === "all") {

                    row.style.display = "";

                } else {

                    row.style.display =
                        status.includes(statusFilter)
                            ? ""
                            : "none";

                }

            });

        });

    }

    // =====================================
    // View Receipt
    // =====================================

    document.querySelectorAll(".view-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const row = btn.closest("tr");

            receiptTxn.textContent = row.cells[0].textContent;
            receiptCustomer.textContent = row.cells[1].textContent;
            receiptFarmer.textContent = row.cells[2].textContent;
            receiptMethod.textContent = row.cells[3].innerText;
            receiptAmount.textContent = row.cells[4].textContent;
            receiptDate.textContent = row.cells[5].textContent;

            modal.style.display = "flex";

        });

    });

    // =====================================
    // Close Modal
    // =====================================

    closeModal.onclick = () => {

        modal.style.display = "none";

    };

    window.onclick = (e) => {

        if (e.target === modal) {

            modal.style.display = "none";

        }

    };

    // =====================================
    // Delete Payment
    // =====================================

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            if (confirm("Delete this payment record?")) {

                btn.closest("tr").remove();

            }

        });

    });

    // =====================================
    // Edit Payment
    // =====================================

    document.querySelectorAll(".edit-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            alert("Edit Payment Feature Coming Soon.");

        });

    });

    // =====================================
    // Print Receipt
    // =====================================

    document.querySelector(".print-btn").addEventListener("click", () => {

        window.print();

    });

    // =====================================
    // Download Invoice
    // =====================================

    document.querySelector(".download-btn").addEventListener("click", () => {

        alert("Invoice Download Started...");

    });

});