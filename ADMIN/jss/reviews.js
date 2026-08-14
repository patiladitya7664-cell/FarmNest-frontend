/* ==========================================
   FARMNEST ADMIN - REVIEWS.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // =============================
    // Elements
    // =============================

    const searchInput = document.getElementById("searchReview");
    const ratingFilter = document.getElementById("ratingFilter");

    const rows = document.querySelectorAll("#reviewsTable tbody tr");

    const modal = document.getElementById("reviewModal");
    const closeModal = document.querySelector(".close-modal");
    const closeBtn = document.querySelector(".close-btn");

    // Modal Data

    const customer = document.getElementById("reviewCustomer");
    const product = document.getElementById("reviewProduct");
    const farmer = document.getElementById("reviewFarmer");
    const rating = document.getElementById("reviewRating");
    const message = document.getElementById("reviewMessage");
    const date = document.getElementById("reviewDate");

    // =====================================
    // Search Reviews
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
    // Rating Filter
    // =====================================

    if (ratingFilter) {

        ratingFilter.addEventListener("change", () => {

            const selected = ratingFilter.value;

            rows.forEach(row => {

                const stars = row.cells[3].innerText;

                if (selected === "all") {

                    row.style.display = "";

                }

                else {

                    row.style.display =
                        stars.startsWith("⭐".repeat(selected))
                            ? ""
                            : "none";

                }

            });

        });

    }

    // =====================================
    // View Review
    // =====================================

    document.querySelectorAll(".view-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const row = btn.closest("tr");

            customer.textContent = row.cells[0].textContent;
            product.textContent = row.cells[1].textContent;
            farmer.textContent = row.cells[2].textContent;
            rating.textContent = row.cells[3].textContent;
            message.textContent = row.cells[4].textContent;
            date.textContent = row.cells[5].textContent;

            modal.style.display = "flex";

        });

    });

    // =====================================
    // Close Modal
    // =====================================

    function hideModal() {

        modal.style.display = "none";

    }

    closeModal.onclick = hideModal;

    if (closeBtn) {

        closeBtn.onclick = hideModal;

    }

    window.onclick = (e) => {

        if (e.target === modal) {

            hideModal();

        }

    };

    // =====================================
    // Delete Review
    // =====================================

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            if (confirm("Delete this review?")) {

                btn.closest("tr").remove();

            }

        });

    });

    // =====================================
    // Reply
    // =====================================

    const sendBtn = document.querySelector(".send-btn");

    if (sendBtn) {

        sendBtn.addEventListener("click", () => {

            const reply =
                document.getElementById("adminReply").value;

            if (reply.trim() === "") {

                alert("Please enter your reply.");

                return;

            }

            alert("Reply sent successfully.");

            document.getElementById("adminReply").value = "";

            hideModal();

        });

    }

});