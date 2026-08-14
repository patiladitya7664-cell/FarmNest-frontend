/* ==========================================
   FARMNEST ADMIN - SETTINGS.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // ===========================
    // Save Settings
    // ===========================

    const saveBtn = document.querySelector(".save-btn");

    if (saveBtn) {

        saveBtn.addEventListener("click", () => {

            const newPassword = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (newPassword !== confirmPassword) {

                alert("New Password and Confirm Password do not match.");

                return;

            }

            alert("Settings saved successfully.");

        });

    }

    // ===========================
    // Dark Mode
    // ===========================

    const darkMode = document.getElementById("darkMode");

    if (darkMode) {

        // Load saved preference
        const saved = localStorage.getItem("farmnest-admin-dark");

        if (saved === "true") {
            darkMode.checked = true;
            document.body.classList.add("dark-mode");
        }

        darkMode.addEventListener("change", () => {

            document.body.classList.toggle("dark-mode");

            localStorage.setItem(
                "farmnest-admin-dark",
                darkMode.checked
            );

        });

    }

    // ===========================
    // Logout
    // ===========================

    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", () => {

            if (confirm("Do you want to logout?")) {

                window.location.href = "../HOMEPAGE/index.html";

            }

        });

    }

});