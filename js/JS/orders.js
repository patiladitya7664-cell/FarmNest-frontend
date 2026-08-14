/* ==========================================
   FARMNEST DELIVERY BOY - ORDERS.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // ===========================
    // Search Orders
    // ===========================

    const searchInput = document.querySelector(".search-box input");
    const rows = document.querySelectorAll("tbody tr");

    if (searchInput) {
        searchInput.addEventListener("keyup", () => {

            const value = searchInput.value.toLowerCase();

            rows.forEach(row => {

                const text = row.innerText.toLowerCase();

                row.style.display = text.includes(value)
                    ? ""
                    : "none";

            });

        });
    }

    // ===========================
    // Filter Buttons
    // ===========================

    const filterBtns = document.querySelectorAll(".filter-bar button");

    filterBtns.forEach(btn => {

        btn.addEventListener("click", () => {

            filterBtns.forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            const filter = btn.innerText.toLowerCase();

            rows.forEach(row => {

                const status = row.querySelector(".status")
                    .innerText
                    .toLowerCase();

                if (filter === "all") {

                    row.style.display = "";

                } else {

                    row.style.display =
                        status.includes(filter)
                            ? ""
                            : "none";

                }

            });

        });

    });

    // ===========================
    // View Button
    // ===========================

    document.querySelectorAll(".view-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const id = btn.dataset.order;

            alert("Opening Order : " + id);

        });

    });

    // ===========================
    // Accept Order
    // ===========================

    document.querySelectorAll(".accept-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            btn.innerHTML =
                '<i class="fas fa-check"></i> Accepted';

            btn.disabled = true;

            btn.style.opacity = "0.7";

            const row = btn.closest("tr");

            row.querySelector(".status").innerHTML = "Picked";

            row.querySelector(".status").className =
                "status progress";

        });

    });

    // ===========================
    // Start Delivery
    // ===========================

    document.querySelectorAll(".delivery-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            alert("Delivery Started 🚚");

        });

    });

});
/* ===========================
      ORDER MODAL
=========================== */

const modal = document.getElementById("orderModal");

const closeBtn = document.querySelector(".close-modal");

document.querySelectorAll(".view-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        modal.style.display = "flex";

    });

});

closeBtn.onclick = () => {

    modal.style.display = "none";

};

window.onclick = (e) => {

    if (e.target === modal) {

        modal.style.display = "none";

    }

};

/* ===========================
      GOOGLE MAP
=========================== */

document.querySelector(".map-btn").onclick = () => {

    window.open(
        "https://maps.google.com",
        "_blank"
    );

};

/* ===========================
      OTP VERIFY
=========================== */

document.querySelector(".verify-btn").onclick = () => {

    alert("OTP Verified Successfully ✅");

};

/* ===========================
      MARK DELIVERED
=========================== */

document.querySelector(".done-btn").onclick = () => {

    alert("Order Delivered Successfully 🎉");

    modal.style.display = "none";

};