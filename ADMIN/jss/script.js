/* ==========================================
   FARMNEST ADMIN COMMON SCRIPT
   File : script.js
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // Sidebar Active Menu
    // =========================
    const currentPage = window.location.pathname.split("/").pop();

    document.querySelectorAll(".menu a").forEach(link => {
        const file = link.getAttribute("href");

        if (file === currentPage) {
            link.parentElement.classList.add("active");
        }
    });

    // =========================
    // Search Box Focus Effect
    // =========================
    const search = document.querySelector(".search-box input");

    if (search) {

        search.addEventListener("focus", () => {
            search.parentElement.classList.add("active");
        });

        search.addEventListener("blur", () => {
            search.parentElement.classList.remove("active");
        });

    }

    // =========================
    // Confirm Logout
    // =========================
    const logoutBtn = document.querySelector(".logout a");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", function (e) {

            const ok = confirm("Are you sure you want to logout?");

            if (!ok) {
                e.preventDefault();
            }

        });

    }

    // =========================
    // Button Ripple Effect
    // =========================
    document.querySelectorAll("button").forEach(btn => {

        btn.addEventListener("click", function () {

            this.style.transform = "scale(.96)";

            setTimeout(() => {
                this.style.transform = "";
            }, 150);

        });

    });

    // =========================
    // Card Hover Animation
    // =========================
    document.querySelectorAll(".card").forEach(card => {

        card.addEventListener("mouseenter", () => {
            card.style.transition = ".3s";
        });

    });

});


// =========================
// Toast Message
// =========================
function showToast(message) {

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 100);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 2500);

}


// =========================
// Format Date
// =========================
function formatDate(date) {

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


// =========================
// Format Currency
// =========================
function formatCurrency(amount) {

    return "₹" + Number(amount).toLocaleString("en-IN");

}